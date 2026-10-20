import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import type { Repository } from "./repository.js";
import type {
  BatchSummary,
  AttachmentSummary,
  ClientSummary,
  CreateDigitalBatchInput,
  CreatePhysicalBatchInput,
  LocationSummary,
  PeriodSummary,
  Principal
} from "../models/domain.js";
import { fromProjectRoot } from "../config/paths.js";

type Row = Record<string, unknown>;

const batchSelect = `
  SELECT b.*, c.name AS client_name, p.label AS period_label,
         receiver.display_name AS receiver_name, l.name AS location_name
         ,(SELECT count(*) FROM attachments a WHERE a.batch_id = b.id) AS attachment_count
  FROM document_batches b
  JOIN clients c ON c.id = b.client_id
  JOIN reporting_periods p ON p.id = b.reporting_period_id
  JOIN users receiver ON receiver.id = b.receiver_user_id
  LEFT JOIN storage_locations l ON l.id = b.current_location_id
`;

function asPrincipal(row: Row): Principal {
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    role: row.role as Principal["role"],
    broadClientAccess: Boolean(row.broad_client_access),
    clientId: row.client_id ? String(row.client_id) : null
  };
}

function asBatch(row: Row): BatchSummary {
  return {
    id: String(row.id),
    referenceNumber: String(row.reference_number),
    clientId: String(row.client_id),
    clientName: String(row.client_name),
    reportingPeriodId: String(row.reporting_period_id),
    reportingPeriodLabel: String(row.period_label),
    receivedAt: String(row.received_at),
    channel: String(row.channel),
    senderName: String(row.sender_name),
    receiverName: String(row.receiver_name),
    categories: JSON.parse(String(row.categories_json)) as string[],
    approximateCount:
      row.approximate_count === null ? null : Number(row.approximate_count),
    countUnit: row.count_unit as BatchSummary["countUnit"],
    notes: String(row.notes),
    physical: Boolean(row.physical),
    currentLocation: row.location_name ? String(row.location_name) : null,
    status: String(row.status),
    attachmentCount: Number(row.attachment_count),
    createdAt: String(row.created_at)
  };
}

export class SqliteRepository implements Repository {
  private readonly db: DatabaseSync;

  constructor(databasePath: string) {
    this.db = new DatabaseSync(databasePath);
    this.db.exec(fs.readFileSync(fromProjectRoot("database", "schema.sql"), "utf8"));
  }

  close(): void {
    this.db.close();
  }

  findUserByEmail(email: string): (Principal & { passwordHash: string }) | null {
    const row = this.db
      .prepare("SELECT * FROM users WHERE lower(email) = lower(?) AND active = 1")
      .get(email) as Row | undefined;
    return row ? { ...asPrincipal(row), passwordHash: String(row.password_hash) } : null;
  }

  createSession(userId: string, tokenHash: string, expiresAt: string): void {
    const now = new Date().toISOString();
    this.db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
    this.db
      .prepare(
        "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(randomUUID(), userId, tokenHash, expiresAt, now);
  }

  findPrincipalBySession(tokenHash: string, now: string): Principal | null {
    const row = this.db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`
      )
      .get(tokenHash, now) as Row | undefined;
    return row ? asPrincipal(row) : null;
  }

  deleteSession(tokenHash: string): void {
    this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  }

  listClientsFor(principal: Principal): ClientSummary[] {
    let sql = `SELECT DISTINCT c.* FROM clients c`;
    const args: string[] = [];
    if (principal.role === "client") {
      sql += " WHERE c.id = ? AND c.archived_at IS NULL";
      args.push(principal.clientId ?? "");
    } else if (principal.role === "staff" && !principal.broadClientAccess) {
      sql +=
        " JOIN client_assignments a ON a.client_id = c.id WHERE a.user_id = ? AND c.archived_at IS NULL";
      args.push(principal.id);
    } else {
      sql += " WHERE c.archived_at IS NULL";
    }
    sql += " ORDER BY c.name";
    return (this.db.prepare(sql).all(...args) as Row[]).map((row) => ({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      reportingFrequency: row.reporting_frequency as ClientSummary["reportingFrequency"]
    }));
  }

  listPeriodsFor(principal: Principal, clientId?: string): PeriodSummary[] {
    const clients = new Set(this.listClientsFor(principal).map((client) => client.id));
    const rows = this.db
      .prepare(
        `SELECT * FROM reporting_periods
         WHERE status = 'open' ${clientId ? "AND client_id = ?" : ""}
         ORDER BY starts_on DESC`
      )
      .all(...(clientId ? [clientId] : [])) as Row[];
    return rows
      .filter((row) => clients.has(String(row.client_id)))
      .map((row) => ({
        id: String(row.id),
        clientId: String(row.client_id),
        label: String(row.label),
        startsOn: String(row.starts_on),
        endsOn: String(row.ends_on)
      }));
  }

  listLocations(): LocationSummary[] {
    return (
      this.db
        .prepare("SELECT * FROM storage_locations WHERE active = 1 ORDER BY name")
        .all() as Row[]
    ).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      locationType: String(row.location_type)
    }));
  }

  canAccessClient(principal: Principal, clientId: string): boolean {
    if (principal.role === "owner" || principal.broadClientAccess) return true;
    if (principal.role === "client") return principal.clientId === clientId;
    const row = this.db
      .prepare(
        "SELECT 1 FROM client_assignments WHERE user_id = ? AND client_id = ?"
      )
      .get(principal.id, clientId);
    return Boolean(row);
  }

  createPhysicalBatch(
    principal: Principal,
    input: CreatePhysicalBatchInput
  ): BatchSummary {
    const duplicate = this.db
      .prepare("SELECT id FROM document_batches WHERE client_request_id = ?")
      .get(input.clientRequestId) as Row | undefined;
    if (duplicate) {
      const existing = this.findBatchFor(principal, String(duplicate.id));
      if (!existing) throw new Error("FORBIDDEN");
      return existing;
    }

    const period = this.db
      .prepare(
        "SELECT * FROM reporting_periods WHERE id = ? AND client_id = ? AND status = 'open'"
      )
      .get(input.reportingPeriodId, input.clientId);
    if (!period) throw new Error("INVALID_PERIOD");

    const location = this.db
      .prepare("SELECT 1 FROM storage_locations WHERE id = ? AND active = 1")
      .get(input.locationId);
    if (!location) throw new Error("INVALID_LOCATION");

    const id = randomUUID();
    const now = new Date().toISOString();
    const month = input.receivedAt.slice(0, 7).replace("-", "");

    this.db.exec("BEGIN IMMEDIATE");
    try {
      const sequence = this.db
        .prepare("SELECT last_value FROM monthly_sequences WHERE sequence_month = ?")
        .get(month) as Row | undefined;
      const next = sequence ? Number(sequence.last_value) + 1 : 1;
      this.db
        .prepare(
          `INSERT INTO monthly_sequences (sequence_month, last_value) VALUES (?, ?)
           ON CONFLICT(sequence_month) DO UPDATE SET last_value = excluded.last_value`
        )
        .run(month, next);
      const reference = `AP-${month}-${String(next).padStart(4, "0")}`;

      this.db
        .prepare(
          `INSERT INTO document_batches (
            id, reference_number, client_request_id, client_id,
            reporting_period_id, received_at, channel, sender_name,
            receiver_user_id, categories_json, approximate_count, count_unit,
            notes, physical, current_location_id, current_custodian_user_id,
            status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'awaiting_scan', ?)`
        )
        .run(
          id,
          reference,
          input.clientRequestId,
          input.clientId,
          input.reportingPeriodId,
          input.receivedAt,
          input.channel,
          input.senderName,
          principal.id,
          JSON.stringify(input.categories),
          input.approximateCount,
          input.countUnit,
          input.notes,
          input.locationId,
          principal.id,
          now
        );
      this.db
        .prepare(
          `INSERT INTO audit_events (
            id, actor_user_id, action, target_type, target_id, client_id,
            metadata_json, occurred_at
          ) VALUES (?, ?, 'batch.received', 'document_batch', ?, ?, ?, ?)`
        )
        .run(
          randomUUID(),
          principal.id,
          id,
          input.clientId,
          JSON.stringify({ channel: input.channel, physical: true }),
          now
        );
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    const result = this.findBatchFor(principal, id);
    if (!result) throw new Error("BATCH_NOT_FOUND_AFTER_CREATE");
    return result;
  }

  createDigitalBatch(
    principal: Principal,
    input: CreateDigitalBatchInput
  ): BatchSummary {
    const duplicate = this.db
      .prepare("SELECT id FROM document_batches WHERE client_request_id = ?")
      .get(input.clientRequestId) as Row | undefined;
    if (duplicate) {
      const existing = this.findBatchFor(principal, String(duplicate.id));
      if (!existing) throw new Error("FORBIDDEN");
      return existing;
    }
    const period = this.db
      .prepare(
        "SELECT * FROM reporting_periods WHERE id = ? AND client_id = ? AND status = 'open'"
      )
      .get(input.reportingPeriodId, input.clientId);
    if (!period) throw new Error("INVALID_PERIOD");

    const id = randomUUID();
    const now = new Date().toISOString();
    const month = input.receivedAt.slice(0, 7).replace("-", "");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const sequence = this.db
        .prepare("SELECT last_value FROM monthly_sequences WHERE sequence_month = ?")
        .get(month) as Row | undefined;
      const next = sequence ? Number(sequence.last_value) + 1 : 1;
      this.db
        .prepare(
          `INSERT INTO monthly_sequences (sequence_month, last_value) VALUES (?, ?)
           ON CONFLICT(sequence_month) DO UPDATE SET last_value = excluded.last_value`
        )
        .run(month, next);
      const reference = `AP-${month}-${String(next).padStart(4, "0")}`;
      this.db
        .prepare(
          `INSERT INTO document_batches (
            id, reference_number, client_request_id, client_id,
            reporting_period_id, received_at, channel, sender_name,
            receiver_user_id, categories_json, approximate_count, count_unit,
            notes, physical, current_location_id, current_custodian_user_id,
            status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'portal_upload', ?, ?, ?, NULL, NULL, ?, 0, NULL, NULL, 'received', ?)`
        )
        .run(
          id,
          reference,
          input.clientRequestId,
          input.clientId,
          input.reportingPeriodId,
          input.receivedAt,
          input.senderName,
          principal.id,
          JSON.stringify(input.categories),
          input.notes,
          now
        );
      const insertAttachment = this.db.prepare(
        `INSERT INTO attachments (
          id, batch_id, original_filename, storage_key, mime_type, size_bytes,
          uploaded_by_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const attachment of input.attachments) {
        insertAttachment.run(
          attachment.id,
          id,
          attachment.originalFilename,
          attachment.storageKey,
          attachment.mimeType,
          attachment.sizeBytes,
          principal.id,
          now
        );
      }
      this.db
        .prepare(
          `INSERT INTO audit_events (
            id, actor_user_id, action, target_type, target_id, client_id,
            metadata_json, occurred_at
          ) VALUES (?, ?, 'batch.uploaded', 'document_batch', ?, ?, ?, ?)`
        )
        .run(
          randomUUID(),
          principal.id,
          id,
          input.clientId,
          JSON.stringify({ fileCount: input.attachments.length, physical: false }),
          now
        );
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    const result = this.findBatchFor(principal, id);
    if (!result) throw new Error("BATCH_NOT_FOUND_AFTER_CREATE");
    return result;
  }

  listBatchesFor(principal: Principal): BatchSummary[] {
    let sql = batchSelect;
    const args: string[] = [];
    if (principal.role === "client") {
      sql += " WHERE b.client_id = ?";
      args.push(principal.clientId ?? "");
    } else if (principal.role === "staff" && !principal.broadClientAccess) {
      sql +=
        " WHERE EXISTS (SELECT 1 FROM client_assignments a WHERE a.client_id = b.client_id AND a.user_id = ?)";
      args.push(principal.id);
    }
    sql += " ORDER BY b.created_at DESC LIMIT 100";
    return (this.db.prepare(sql).all(...args) as Row[]).map(asBatch);
  }

  findBatchFor(principal: Principal, id: string): BatchSummary | null {
    const row = this.db.prepare(`${batchSelect} WHERE b.id = ?`).get(id) as
      | Row
      | undefined;
    if (!row || !this.canAccessClient(principal, String(row.client_id))) return null;
    return asBatch(row);
  }

  listAttachmentsFor(
    principal: Principal,
    batchId: string
  ): AttachmentSummary[] {
    if (!this.findBatchFor(principal, batchId)) return [];
    return (
      this.db
        .prepare("SELECT * FROM attachments WHERE batch_id = ? ORDER BY created_at")
        .all(batchId) as Row[]
    ).map((row) => ({
      id: String(row.id),
      batchId: String(row.batch_id),
      originalFilename: String(row.original_filename),
      storageKey: String(row.storage_key),
      mimeType: String(row.mime_type),
      sizeBytes: Number(row.size_bytes),
      createdAt: String(row.created_at)
    }));
  }

  findAttachmentFor(
    principal: Principal,
    attachmentId: string
  ): AttachmentSummary | null {
    const row = this.db
      .prepare("SELECT * FROM attachments WHERE id = ?")
      .get(attachmentId) as Row | undefined;
    if (!row || !this.findBatchFor(principal, String(row.batch_id))) return null;
    return {
      id: String(row.id),
      batchId: String(row.batch_id),
      originalFilename: String(row.original_filename),
      storageKey: String(row.storage_key),
      mimeType: String(row.mime_type),
      sizeBytes: Number(row.size_bytes),
      createdAt: String(row.created_at)
    };
  }
}

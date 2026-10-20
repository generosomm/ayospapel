import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "../utils/password.js";

const now = new Date().toISOString();

export function seedSyntheticData(db: DatabaseSync): void {
  const insertClient = db.prepare(
    `INSERT INTO clients (id, code, name, reporting_frequency, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  insertClient.run("client-sunrise", "SUN", "Sunrise Mini Mart", "monthly", now);
  insertClient.run("client-harbor", "HBR", "Harbor View Café", "quarterly", now);

  const insertUser = db.prepare(
    `INSERT INTO users (
      id, email, display_name, password_hash, role, broad_client_access,
      client_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const password = hashPassword("DemoOnly!2026");
  insertUser.run(
    "user-owner",
    "owner@demo.ayospapel.test",
    "Maya Santos",
    password,
    "owner",
    1,
    null,
    now
  );
  insertUser.run(
    "user-staff",
    "staff@demo.ayospapel.test",
    "Paolo Reyes",
    password,
    "staff",
    0,
    null,
    now
  );
  insertUser.run(
    "user-unassigned",
    "unassigned@demo.ayospapel.test",
    "Lina Cruz",
    password,
    "staff",
    0,
    null,
    now
  );
  insertUser.run(
    "user-client",
    "client@demo.ayospapel.test",
    "Ana Dela Cruz",
    password,
    "client",
    0,
    "client-sunrise",
    now
  );

  db.prepare(
    `INSERT INTO client_assignments (user_id, client_id, assigned_at)
     VALUES ('user-staff', 'client-sunrise', ?)`
  ).run(now);

  const insertPeriod = db.prepare(
    `INSERT INTO reporting_periods (
      id, client_id, label, starts_on, ends_on, status
    ) VALUES (?, ?, ?, ?, ?, 'open')`
  );
  insertPeriod.run(
    "period-sunrise-2026-07",
    "client-sunrise",
    "July 2026",
    "2026-07-01",
    "2026-07-31"
  );
  insertPeriod.run(
    "period-harbor-2026-q3",
    "client-harbor",
    "Q3 2026",
    "2026-07-01",
    "2026-09-30"
  );

  const insertLocation = db.prepare(
    `INSERT INTO storage_locations (id, name, location_type)
     VALUES (?, ?, ?)`
  );
  insertLocation.run("location-receiving", "Receiving Desk – Tray A", "receiving_area");
  insertLocation.run("location-cabinet", "Cabinet 1 – Shelf 2", "cabinet");
  insertLocation.run("location-return", "Return Area – Locked Cabinet", "return_area");

  const insertBatch = db.prepare(
    `INSERT INTO document_batches (
      id, reference_number, client_request_id, client_id,
      reporting_period_id, received_at, channel, sender_name,
      receiver_user_id, categories_json, approximate_count, count_unit,
      notes, physical, current_location_id, current_custodian_user_id,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const sampleBatches = [
    {
      id: "batch-sunrise-scan",
      reference: "AP-202607-0001",
      clientId: "client-sunrise",
      periodId: "period-sunrise-2026-07",
      receivedAt: "2026-07-22T02:15:00.000Z",
      channel: "physical_handover",
      sender: "Ana Dela Cruz",
      categories: ["Purchase receipts", "Expense documents"],
      count: 38,
      unit: "items",
      note: "Synthetic blue envelope for demonstration",
      physical: 1,
      location: "location-receiving",
      status: "awaiting_scan"
    },
    {
      id: "batch-sunrise-review",
      reference: "AP-202607-0002",
      clientId: "client-sunrise",
      periodId: "period-sunrise-2026-07",
      receivedAt: "2026-07-20T06:40:00.000Z",
      channel: "messenger",
      sender: "Ana Dela Cruz",
      categories: ["Sales reports"],
      count: 6,
      unit: "pages",
      note: "Synthetic digital submission",
      physical: 0,
      location: null,
      status: "incomplete"
    },
    {
      id: "batch-sunrise-processing",
      reference: "AP-202607-0003",
      clientId: "client-sunrise",
      periodId: "period-sunrise-2026-07",
      receivedAt: "2026-07-15T01:25:00.000Z",
      channel: "pickup",
      sender: "Synthetic Store Assistant",
      categories: ["Bank statements", "Tax forms"],
      count: 21,
      unit: "pages",
      note: "Synthetic folder",
      physical: 1,
      location: "location-cabinet",
      status: "processing"
    },
    {
      id: "batch-sunrise-return",
      reference: "AP-202607-0004",
      clientId: "client-sunrise",
      periodId: "period-sunrise-2026-07",
      receivedAt: "2026-07-08T03:10:00.000Z",
      channel: "physical_handover",
      sender: "Ana Dela Cruz",
      categories: ["Payroll documents"],
      count: 14,
      unit: "pages",
      note: "Synthetic sealed folder",
      physical: 1,
      location: "location-return",
      status: "ready_for_return"
    },
    {
      id: "batch-harbor-review",
      reference: "AP-202607-0005",
      clientId: "client-harbor",
      periodId: "period-harbor-2026-q3",
      receivedAt: "2026-07-23T07:30:00.000Z",
      channel: "google_drive",
      sender: "Synthetic Harbor Contact",
      categories: ["Sales reports", "Expense documents"],
      count: 12,
      unit: "pages",
      note: "Synthetic owner-only sample",
      physical: 0,
      location: null,
      status: "under_review"
    }
  ] as const;

  for (const sample of sampleBatches) {
    insertBatch.run(
      sample.id,
      sample.reference,
      `seed-${sample.id}`,
      sample.clientId,
      sample.periodId,
      sample.receivedAt,
      sample.channel,
      sample.sender,
      sample.clientId === "client-harbor" ? "user-owner" : "user-staff",
      JSON.stringify(sample.categories),
      sample.count,
      sample.unit,
      sample.note,
      sample.physical,
      sample.location,
      sample.physical ? "user-staff" : null,
      sample.status,
      sample.receivedAt
    );
  }
  db.prepare(
    "INSERT INTO monthly_sequences (sequence_month, last_value) VALUES ('202607', 5)"
  ).run();
}

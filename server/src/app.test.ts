import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { fromProjectRoot } from "./config/paths.js";
import { seedSyntheticData } from "./scripts/seed.js";

let tempDirectory = "";
let databasePath = "";
let app: Awaited<ReturnType<typeof createApp>>;

beforeEach(async () => {
  tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ayospapel-test-"));
  databasePath = path.join(tempDirectory, "test.sqlite");
  const db = new DatabaseSync(databasePath);
  db.exec(fs.readFileSync(fromProjectRoot("database", "schema.sql"), "utf8"));
  seedSyntheticData(db);
  db.close();
  app = await createApp({
    databasePath,
    uploadPath: path.join(tempDirectory, "uploads"),
    logger: false
  });
});

afterEach(async () => {
  await app.close();
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

async function login(email: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password: "DemoOnly!2026" }
  });
  expect(response.statusCode).toBe(200);
  const cookie = response.headers["set-cookie"];
  const value = Array.isArray(cookie) ? cookie[0] : cookie;
  return value?.split(";")[0] ?? "";
}

function physicalBatchPayload() {
  return {
    clientRequestId: "54e3db3e-0138-411d-bba0-f3c584af907c",
    clientId: "client-sunrise",
    reportingPeriodId: "period-sunrise-2026-07",
    receivedAt: "2026-07-25T08:00:00.000Z",
    channel: "physical_handover",
    senderName: "Synthetic Representative",
    categories: ["Purchase receipts", "Bank statements"],
    approximateCount: 42,
    countUnit: "items",
    notes: "Synthetic brown envelope",
    locationId: "location-receiving"
  };
}

describe("AyosPapel physical receiving slice", () => {
  it("rejects an invalid password without exposing account details", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "owner@demo.ayospapel.test",
        password: "NotThePassword"
      }
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error).toMatchObject({
      code: "INVALID_CREDENTIALS",
      message: "Email or password is incorrect."
    });
  });

  it("allows assigned staff to receive once and records an audit event", async () => {
    const cookie = await login("staff@demo.ayospapel.test");
    const first = await app.inject({
      method: "POST",
      url: "/api/batches/physical",
      headers: { cookie },
      payload: physicalBatchPayload()
    });
    expect(first.statusCode).toBe(201);
    expect(first.json().batch).toMatchObject({
      referenceNumber: "AP-202607-0006",
      clientName: "Sunrise Mini Mart",
      currentLocation: "Receiving Desk – Tray A",
      status: "awaiting_scan"
    });

    const repeated = await app.inject({
      method: "POST",
      url: "/api/batches/physical",
      headers: { cookie },
      payload: physicalBatchPayload()
    });
    expect(repeated.statusCode).toBe(201);
    expect(repeated.json().batch.id).toBe(first.json().batch.id);

    const db = new DatabaseSync(databasePath, { readOnly: true });
    expect(
      (db.prepare("SELECT count(*) AS count FROM document_batches").get() as { count: number })
        .count
    ).toBe(6);
    expect(
      (db.prepare("SELECT count(*) AS count FROM audit_events").get() as { count: number })
        .count
    ).toBe(1);
    db.close();
  });

  it("denies unassigned staff even when a client id is guessed", async () => {
    const cookie = await login("unassigned@demo.ayospapel.test");
    const references = await app.inject({
      method: "GET",
      url: "/api/reference-data",
      headers: { cookie }
    });
    expect(references.statusCode).toBe(200);
    expect(references.json().clients).toEqual([]);

    const response = await app.inject({
      method: "POST",
      url: "/api/batches/physical",
      headers: { cookie },
      payload: physicalBatchPayload()
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("FORBIDDEN");
  });

  it("denies physical receiving to a client account", async () => {
    const cookie = await login("client@demo.ayospapel.test");
    const response = await app.inject({
      method: "POST",
      url: "/api/batches/physical",
      headers: { cookie },
      payload: physicalBatchPayload()
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("FORBIDDEN");
  });

  it("lets the linked client view its acknowledgement after staff receiving", async () => {
    const staffCookie = await login("staff@demo.ayospapel.test");
    const created = await app.inject({
      method: "POST",
      url: "/api/batches/physical",
      headers: { cookie: staffCookie },
      payload: physicalBatchPayload()
    });
    const clientCookie = await login("client@demo.ayospapel.test");
    const response = await app.inject({
      method: "GET",
      url: `/api/batches/${created.json().batch.id}/acknowledgement`,
      headers: { cookie: clientCookie }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().acknowledgement).toMatchObject({
      referenceNumber: "AP-202607-0006",
      clientName: "Sunrise Mini Mart"
    });
    expect(response.body).not.toContain("Synthetic brown envelope");
  });

  it("accepts a synthetic client PDF and protects its download", async () => {
    const clientCookie = await login("client@demo.ayospapel.test");
    const boundary = "----AyosPapelSyntheticBoundary";
    const fields: Record<string, string> = {
      clientRequestId: "c4f5f64f-b0d7-4c51-a5b1-6bb7bf00f2c7",
      clientId: "client-sunrise",
      reportingPeriodId: "period-sunrise-2026-07",
      receivedAt: "2026-07-25T09:00:00.000Z",
      senderName: "Ana Dela Cruz",
      categories: JSON.stringify(["Sales reports"]),
      notes: "Synthetic upload test"
    };
    const chunks: Buffer[] = [];
    for (const [name, value] of Object.entries(fields)) {
      chunks.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
        )
      );
    }
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="dummy-report.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
      ),
      Buffer.from("%PDF-1.4\nSynthetic test only\n%%EOF"),
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );

    const upload = await app.inject({
      method: "POST",
      url: "/api/batches/digital",
      headers: {
        cookie: clientCookie,
        "content-type": `multipart/form-data; boundary=${boundary}`
      },
      payload: Buffer.concat(chunks)
    });
    expect(upload.statusCode).toBe(201);
    expect(upload.json().batch).toMatchObject({
      referenceNumber: "AP-202607-0006",
      clientName: "Sunrise Mini Mart",
      physical: false,
      attachmentCount: 1,
      status: "received"
    });

    const attachments = await app.inject({
      method: "GET",
      url: `/api/batches/${upload.json().batch.id}/attachments`,
      headers: { cookie: clientCookie }
    });
    expect(attachments.statusCode).toBe(200);
    expect(attachments.json().attachments[0]).toMatchObject({
      originalFilename: "dummy-report.pdf",
      mimeType: "application/pdf"
    });

    const attachmentId = attachments.json().attachments[0].id;
    const download = await app.inject({
      method: "GET",
      url: `/api/attachments/${attachmentId}/download`,
      headers: { cookie: clientCookie }
    });
    expect(download.statusCode).toBe(200);
    expect(download.headers["x-content-type-options"]).toBe("nosniff");

    const unassignedCookie = await login("unassigned@demo.ayospapel.test");
    const forbidden = await app.inject({
      method: "GET",
      url: `/api/attachments/${attachmentId}/download`,
      headers: { cookie: unassignedCookie }
    });
    expect(forbidden.statusCode).toBe(404);
  });
});

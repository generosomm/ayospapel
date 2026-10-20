import Fastify, { type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { ZodError, z } from "zod";
import { env } from "./config/env.js";
import { documentCategories, receivingChannels } from "./constants/domain.js";
import type { Principal } from "./models/domain.js";
import { SqliteRepository } from "./repositories/sqlite-repository.js";
import { AuthService } from "./services/auth-service.js";
import { BatchService } from "./services/batch-service.js";
import { HttpError } from "./utils/http-error.js";
import { LocalStorage } from "./services/local-storage.js";

interface AppOptions {
  databasePath?: string;
  uploadPath?: string;
  logger?: boolean;
}

export async function createApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? env.NODE_ENV !== "test",
    bodyLimit: 105 * 1024 * 1024
  });
  const repository = new SqliteRepository(options.databasePath ?? env.DATABASE_PATH);
  const auth = new AuthService(repository, env.SESSION_TTL_HOURS);
  const batches = new BatchService(repository);
  const storage = new LocalStorage(options.uploadPath ?? env.UPLOAD_PATH);

  await app.register(cookie);
  await app.register(cors, {
    origin: env.CLIENT_ORIGIN,
    credentials: true
  });
  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: "1 minute"
  });
  await app.register(multipart, {
    limits: {
      files: 20,
      fileSize: 15 * 1024 * 1024,
      fields: 20,
      parts: 40
    }
  });

  app.addHook("onRequest", async (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.origin;
      if (origin && origin !== env.CLIENT_ORIGIN) {
        throw new HttpError(403, "Request origin is not allowed.", "INVALID_ORIGIN");
      }
    }
  });

  function principalFor(request: FastifyRequest): Principal {
    const principal = auth.authenticate(request.cookies[env.SESSION_COOKIE_NAME]);
    if (!principal) {
      throw new HttpError(401, "Please sign in to continue.", "UNAUTHENTICATED");
    }
    return principal;
  }

  app.get("/api/health", async () => ({ status: "ok" }));

  app.post(
    "/api/auth/login",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const input = z
        .object({
          email: z.email(),
          password: z.string().min(8).max(200)
        })
        .parse(request.body);
      const session = auth.signIn(input.email, input.password);
      reply.setCookie(env.SESSION_COOKIE_NAME, session.token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: env.NODE_ENV === "production",
        expires: new Date(session.expiresAt)
      });
      return { user: session.principal };
    }
  );

  app.post("/api/auth/logout", async (request, reply) => {
    auth.signOut(request.cookies[env.SESSION_COOKIE_NAME]);
    reply.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
    return reply.code(204).send();
  });

  app.get("/api/auth/me", async (request) => ({ user: principalFor(request) }));

  app.get("/api/reference-data", async (request) => {
    const principal = principalFor(request);
    return {
      clients: repository.listClientsFor(principal),
      periods: repository.listPeriodsFor(principal),
      locations: principal.role === "client" ? [] : repository.listLocations(),
      categories: documentCategories,
      physicalChannels: receivingChannels.slice(0, 2)
    };
  });

  app.get("/api/batches", async (request) => {
    const principal = principalFor(request);
    return { batches: repository.listBatchesFor(principal) };
  });

  app.post("/api/batches/physical", async (request, reply) => {
    const principal = principalFor(request);
    const batch = batches.createPhysical(principal, request.body);
    return reply.code(201).send({ batch });
  });

  app.post("/api/batches/digital", async (request, reply) => {
    const principal = principalFor(request);
    const fields: Record<string, string> = {};
    const saved = [];
    let totalBytes = 0;
    try {
      for await (const part of request.parts()) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();
          if (part.file.truncated) {
            throw new HttpError(400, "A file exceeded the 15 MB limit.", "FILE_TOO_LARGE");
          }
          totalBytes += buffer.length;
          if (totalBytes > 100 * 1024 * 1024) {
            throw new HttpError(
              400,
              "A batch cannot exceed 100 MB.",
              "BATCH_TOO_LARGE"
            );
          }
          saved.push(await storage.save(part.filename, part.mimetype, buffer));
        } else {
          fields[part.fieldname] = String(part.value);
        }
      }
      let categories: unknown;
      try {
        categories = JSON.parse(fields.categories ?? "[]");
      } catch {
        throw new HttpError(400, "Document categories are invalid.", "INVALID_CATEGORIES");
      }
      const batch = batches.createDigital(principal, {
        clientRequestId: fields.clientRequestId,
        clientId: fields.clientId,
        reportingPeriodId: fields.reportingPeriodId,
        receivedAt: fields.receivedAt,
        senderName: fields.senderName,
        categories,
        notes: fields.notes ?? "",
        attachments: saved
      });
      return reply.code(201).send({ batch });
    } catch (error) {
      await Promise.all(saved.map((item) => storage.remove(item.storageKey)));
      throw error;
    }
  });

  app.get("/api/batches/:id/acknowledgement", async (request) => {
    const principal = principalFor(request);
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const batch = repository.findBatchFor(principal, params.id);
    if (!batch) throw new HttpError(404, "Batch was not found.", "NOT_FOUND");
    return {
      acknowledgement: {
        referenceNumber: batch.referenceNumber,
        clientName: batch.clientName,
        reportingPeriod: batch.reportingPeriodLabel,
        receivedAt: batch.receivedAt,
        channel: batch.channel,
        senderName: batch.senderName,
        receiverName: batch.receiverName,
        categories: batch.categories,
        approximateCount: batch.approximateCount,
        countUnit: batch.countUnit,
        currentLocation: batch.currentLocation,
        status: batch.status,
        confidentialityNotice:
          "This confirms receipt of a document batch. It does not confirm document completeness, accuracy, or the value of any receipt."
      }
    };
  });

  app.get("/api/batches/:id/attachments", async (request) => {
    const principal = principalFor(request);
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const batch = repository.findBatchFor(principal, params.id);
    if (!batch) throw new HttpError(404, "Batch was not found.", "NOT_FOUND");
    return {
      attachments: repository.listAttachmentsFor(principal, params.id).map((item) => ({
        id: item.id,
        batchId: item.batchId,
        originalFilename: item.originalFilename,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        createdAt: item.createdAt
      }))
    };
  });

  app.get("/api/attachments/:id/download", async (request, reply) => {
    const principal = principalFor(request);
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const attachment = repository.findAttachmentFor(principal, params.id);
    if (!attachment) {
      throw new HttpError(404, "Attachment was not found.", "NOT_FOUND");
    }
    const encodedFilename = encodeURIComponent(attachment.originalFilename);
    reply.header("Content-Type", attachment.mimeType);
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header(
      "Content-Disposition",
      `attachment; filename="document"; filename*=UTF-8''${encodedFilename}`
    );
    return reply.send(storage.open(attachment.storageKey));
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the highlighted information and try again.",
          fields: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        }
      });
    }
    if (error instanceof HttpError) {
      return reply
        .code(error.statusCode)
        .send({ error: { code: error.code, message: error.message } });
    }
    app.log.error({ err: error }, "Unhandled request error");
    return reply.code(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again."
      }
    });
  });

  app.addHook("onClose", async () => repository.close());
  return app;
}

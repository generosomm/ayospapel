import { z } from "zod";
import {
  documentCategories,
  receivingChannels
} from "../constants/domain.js";
import type { Principal } from "../models/domain.js";
import type { Repository } from "../repositories/repository.js";
import { HttpError } from "../utils/http-error.js";

export const createPhysicalBatchSchema = z
  .object({
    clientRequestId: z.uuid(),
    clientId: z.string().min(1),
    reportingPeriodId: z.string().min(1),
    receivedAt: z.iso.datetime(),
    channel: z.enum([receivingChannels[0], receivingChannels[1]]),
    senderName: z.string().trim().min(2).max(120),
    categories: z
      .array(z.enum(documentCategories))
      .min(1)
      .max(documentCategories.length),
    approximateCount: z.number().int().min(0).max(100000).nullable(),
    countUnit: z.enum(["items", "pages"]).nullable(),
    notes: z.string().trim().max(1000),
    locationId: z.string().min(1)
  })
  .refine(
    (value) =>
      (value.approximateCount === null && value.countUnit === null) ||
      (value.approximateCount !== null && value.countUnit !== null),
    {
      message: "Count and count unit must be provided together.",
      path: ["approximateCount"]
    }
  );

export class BatchService {
  constructor(private readonly repository: Repository) {}

  createPhysical(principal: Principal, rawInput: unknown) {
    if (principal.role === "client") {
      throw new HttpError(
        403,
        "Client accounts cannot record physical receiving.",
        "FORBIDDEN"
      );
    }
    const input = createPhysicalBatchSchema.parse(rawInput);
    if (!this.repository.canAccessClient(principal, input.clientId)) {
      throw new HttpError(403, "You do not have access to this client.", "FORBIDDEN");
    }
    try {
      return this.repository.createPhysicalBatch(principal, input);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_PERIOD") {
        throw new HttpError(400, "Choose an open period for this client.", "INVALID_PERIOD");
      }
      if (error instanceof Error && error.message === "INVALID_LOCATION") {
        throw new HttpError(400, "Choose an active storage location.", "INVALID_LOCATION");
      }
      throw error;
    }
  }

  createDigital(principal: Principal, rawInput: unknown) {
    const input = z
      .object({
        clientRequestId: z.uuid(),
        clientId: z.string().min(1),
        reportingPeriodId: z.string().min(1),
        receivedAt: z.iso.datetime(),
        senderName: z.string().trim().min(2).max(120),
        categories: z
          .array(z.enum(documentCategories))
          .min(1)
          .max(documentCategories.length),
        notes: z.string().trim().max(1000),
        attachments: z
          .array(
            z.object({
              id: z.string().min(1),
              originalFilename: z.string().min(1).max(180),
              storageKey: z.string().min(1),
              mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
              sizeBytes: z.number().int().min(1).max(15 * 1024 * 1024)
            })
          )
          .min(1)
          .max(20)
      })
      .parse(rawInput);
    const effectiveClientId =
      principal.role === "client" ? principal.clientId : input.clientId;
    if (!effectiveClientId || effectiveClientId !== input.clientId) {
      throw new HttpError(403, "You cannot upload for this client.", "FORBIDDEN");
    }
    if (!this.repository.canAccessClient(principal, input.clientId)) {
      throw new HttpError(403, "You do not have access to this client.", "FORBIDDEN");
    }
    try {
      return this.repository.createDigitalBatch(principal, input);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_PERIOD") {
        throw new HttpError(400, "Choose an open period for this client.", "INVALID_PERIOD");
      }
      throw error;
    }
  }
}

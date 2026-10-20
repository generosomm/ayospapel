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

export interface Repository {
  close(): void;
  findUserByEmail(email: string): (Principal & { passwordHash: string }) | null;
  createSession(userId: string, tokenHash: string, expiresAt: string): void;
  findPrincipalBySession(tokenHash: string, now: string): Principal | null;
  deleteSession(tokenHash: string): void;
  listClientsFor(principal: Principal): ClientSummary[];
  listPeriodsFor(principal: Principal, clientId?: string): PeriodSummary[];
  listLocations(): LocationSummary[];
  canAccessClient(principal: Principal, clientId: string): boolean;
  createPhysicalBatch(
    principal: Principal,
    input: CreatePhysicalBatchInput
  ): BatchSummary;
  createDigitalBatch(
    principal: Principal,
    input: CreateDigitalBatchInput
  ): BatchSummary;
  listBatchesFor(principal: Principal): BatchSummary[];
  findBatchFor(principal: Principal, id: string): BatchSummary | null;
  listAttachmentsFor(
    principal: Principal,
    batchId: string
  ): AttachmentSummary[];
  findAttachmentFor(
    principal: Principal,
    attachmentId: string
  ): AttachmentSummary | null;
}

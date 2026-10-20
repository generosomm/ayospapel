import type { Role } from "../constants/domain.js";

export interface Principal {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  broadClientAccess: boolean;
  clientId: string | null;
}

export interface ClientSummary {
  id: string;
  code: string;
  name: string;
  reportingFrequency: "monthly" | "quarterly";
}

export interface PeriodSummary {
  id: string;
  clientId: string;
  label: string;
  startsOn: string;
  endsOn: string;
}

export interface LocationSummary {
  id: string;
  name: string;
  locationType: string;
}

export interface BatchSummary {
  id: string;
  referenceNumber: string;
  clientId: string;
  clientName: string;
  reportingPeriodId: string;
  reportingPeriodLabel: string;
  receivedAt: string;
  channel: string;
  senderName: string;
  receiverName: string;
  categories: string[];
  approximateCount: number | null;
  countUnit: "items" | "pages" | null;
  notes: string;
  physical: boolean;
  currentLocation: string | null;
  status: string;
  attachmentCount: number;
  createdAt: string;
}

export interface CreatePhysicalBatchInput {
  clientRequestId: string;
  clientId: string;
  reportingPeriodId: string;
  receivedAt: string;
  channel: "physical_handover" | "pickup";
  senderName: string;
  categories: string[];
  approximateCount: number | null;
  countUnit: "items" | "pages" | null;
  notes: string;
  locationId: string;
}

export interface PendingAttachment {
  id: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
}

export interface AttachmentSummary extends PendingAttachment {
  batchId: string;
  createdAt: string;
}

export interface CreateDigitalBatchInput {
  clientRequestId: string;
  clientId: string;
  reportingPeriodId: string;
  receivedAt: string;
  senderName: string;
  categories: string[];
  notes: string;
  attachments: PendingAttachment[];
}

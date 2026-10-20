export const roles = ["owner", "staff", "client"] as const;
export type Role = (typeof roles)[number];

export const receivingChannels = [
  "physical_handover",
  "pickup",
  "messenger",
  "email",
  "google_drive",
  "portal_upload"
] as const;

export const batchStatuses = [
  "received",
  "awaiting_scan",
  "scanned",
  "under_review",
  "incomplete",
  "ready_for_processing",
  "processing",
  "ready_for_return",
  "released",
  "archived"
] as const;

export const documentCategories = [
  "Purchase receipts",
  "Sales reports",
  "Bank statements",
  "Expense documents",
  "Payroll documents",
  "Tax forms",
  "Other supporting documents"
] as const;

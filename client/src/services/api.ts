export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "staff" | "client";
  broadClientAccess: boolean;
  clientId: string | null;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  reportingFrequency: "monthly" | "quarterly";
}

export interface Period {
  id: string;
  clientId: string;
  label: string;
  startsOn: string;
  endsOn: string;
}

export interface Location {
  id: string;
  name: string;
  locationType: string;
}

export interface Batch {
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

export interface Attachment {
  id: string;
  batchId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ReferenceData {
  clients: Client[];
  periods: Period[];
  locations: Location[];
  categories: string[];
  physicalChannels: string[];
}

export interface Acknowledgement {
  referenceNumber: string;
  clientName: string;
  reportingPeriod: string;
  receivedAt: string;
  channel: string;
  senderName: string;
  receiverName: string;
  categories: string[];
  approximateCount: number | null;
  countUnit: string | null;
  currentLocation: string | null;
  status: string;
  confidentialityNotice: string;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Array<{ path: string; message: string }>;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: Array<{ path: string; message: string }>
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      body.error?.message ?? "The request could not be completed.",
      response.status,
      body.error?.fields
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<{ user: User }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  referenceData: () => request<ReferenceData>("/api/reference-data"),
  batches: () => request<{ batches: Batch[] }>("/api/batches"),
  createPhysicalBatch: (input: Record<string, unknown>) =>
    request<{ batch: Batch }>("/api/batches/physical", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  createDigitalBatch: (form: FormData) =>
    request<{ batch: Batch }>("/api/batches/digital", {
      method: "POST",
      body: form
    }),
  attachments: (batchId: string) =>
    request<{ attachments: Attachment[] }>(
      `/api/batches/${encodeURIComponent(batchId)}/attachments`
    ),
  acknowledgement: (id: string) =>
    request<{ acknowledgement: Acknowledgement }>(
      `/api/batches/${encodeURIComponent(id)}/acknowledgement`
    )
};

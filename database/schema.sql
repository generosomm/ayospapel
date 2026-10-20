PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff', 'client')),
  broad_client_access INTEGER NOT NULL DEFAULT 0 CHECK (broad_client_access IN (0, 1)),
  client_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  reporting_frequency TEXT NOT NULL CHECK (reporting_frequency IN ('monthly', 'quarterly')),
  archived_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS client_assignments (
  user_id TEXT NOT NULL REFERENCES users(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  assigned_at TEXT NOT NULL,
  PRIMARY KEY (user_id, client_id)
);

CREATE TABLE IF NOT EXISTS reporting_periods (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  label TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'finalized', 'archived')),
  UNIQUE (client_id, starts_on, ends_on)
);

CREATE TABLE IF NOT EXISTS storage_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location_type TEXT NOT NULL CHECK (location_type IN ('receiving_area', 'cabinet', 'shelf', 'box', 'staff', 'return_area')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS monthly_sequences (
  sequence_month TEXT PRIMARY KEY,
  last_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_batches (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  client_request_id TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL REFERENCES clients(id),
  reporting_period_id TEXT NOT NULL REFERENCES reporting_periods(id),
  received_at TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('physical_handover', 'pickup', 'messenger', 'email', 'google_drive', 'portal_upload')),
  sender_name TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL REFERENCES users(id),
  categories_json TEXT NOT NULL,
  approximate_count INTEGER CHECK (approximate_count IS NULL OR approximate_count >= 0),
  count_unit TEXT CHECK (count_unit IS NULL OR count_unit IN ('items', 'pages')),
  notes TEXT NOT NULL DEFAULT '',
  physical INTEGER NOT NULL CHECK (physical IN (0, 1)),
  current_location_id TEXT REFERENCES storage_locations(id),
  current_custodian_user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_batches_client_created
  ON document_batches(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batches_status
  ON document_batches(status);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES document_batches(id),
  original_filename TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_batch
  ON attachments(batch_id, created_at);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_client_time
  ON audit_events(client_id, occurred_at DESC);

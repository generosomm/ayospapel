# ADR 0004: Supabase as server-side infrastructure

- Status: Proposed (awaiting approval)
- Date: 2026-10-20
- Supersedes: the "PostgreSQL and private object storage" placeholder in ADR 0001

## Context

The pilot runs on local SQLite and a local file adapter. ADR 0001 requires a
PostgreSQL repository and private object storage before production, without
changing API contracts or domain services. The owner chose Supabase for both,
while keeping the existing Fastify API, session authentication, and server-side
authorization.

## Decision

- Supabase is infrastructure only: managed PostgreSQL plus private Storage.
- Fastify remains the only entry point. The browser never receives a Supabase
  key and never queries Supabase directly.
- The server connects with a Postgres connection string and a service-role key
  read from validated environment variables. Neither may be logged or shipped
  to the client bundle.
- Existing invite-only sessions, password hashing, and role/client
  authorization stay in Fastify. Supabase Auth is not used.
- Application tables live in a dedicated `app` schema that is not exposed
  through the Supabase Data API. Row-level security is also enabled on every
  table with no policies, so an accidentally exposed table denies by default.
- Files go to one private Storage bucket using opaque keys. Downloads stay
  server-authorized and are streamed through Fastify (or a signed URL valid for
  at most 60 seconds, issued only after authorization).
- Schema changes are versioned SQL files in `database/migrations/`;
  `database/schema.sql` remains the current snapshot.
- Automated tests run against in-process PostgreSQL (PGlite) so `npm run check`
  needs no Docker, network, or paid service. The SQLite adapter is removed once
  the Postgres adapter passes the existing suite.
- The repository interface becomes asynchronous (Promise-returning). This is a
  prerequisite for any Postgres driver.

## Region, cost, and data

- Region: Singapore (`ap-southeast-1`).
- The free tier pauses idle projects and has no managed backups, so it is
  acceptable for synthetic development only. Production needs a paid plan with
  backups; the owner must approve that recurring cost first.
- No Supabase project is created, and no remote migration is applied, without
  explicit approval for that action.
- Synthetic data only until the privacy/legal review in
  `docs/SECURITY_AND_DATA_POLICY_DRAFT.md` is complete. MFA for owner and staff
  remains a production gate.

## Consequences

The API, domain rules, and tests are preserved. Supabase lock-in is limited to
two adapters (repository and storage). Auth-related features (password reset,
MFA) remain custom work in Fastify.

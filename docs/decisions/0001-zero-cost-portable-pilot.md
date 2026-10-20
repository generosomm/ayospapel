# ADR 0001: Zero-cost portable pilot

- Status: Accepted for development
- Date: 2026-07-25

## Context

The pilot must run without paid infrastructure and must use synthetic data. The
production system may later move to managed PostgreSQL and private object
storage after the owner approves recurring costs and privacy requirements.

## Decision

- Use an npm-workspace TypeScript project with separate `client/` and `server/`
  applications.
- Use React and Vite for the responsive client.
- Use Fastify for the API and keep authorization in server/domain services.
- Use Node's built-in SQLite driver for local development and automated tests.
- Access data only through repository interfaces. Do not call SQLite from
  controllers or UI code.
- Keep uploaded development files outside the public web root. File storage
  will use a storage-provider interface when uploads are implemented.
- Use synthetic fixtures only. Real client documents and personal information
  are prohibited in development.

## Portability requirements

Before production, add a PostgreSQL repository implementation and a managed
private-object-storage implementation without changing API response contracts
or domain services. Export/import scripts must preserve stable IDs, timestamps,
audit events, reference numbers, and original filenames. Production migration
must be rehearsed with synthetic data and verified by record counts and hashes.

SQLite is a development database, not the approved production database.

## Consequences

The pilot has no infrastructure cost and is easy to run on Windows. Some
database features and concurrency behavior must be retested against PostgreSQL
before staging. Production deployment remains blocked on privacy review,
approved accounts, backup/restore evidence, and a recurring-cost decision.

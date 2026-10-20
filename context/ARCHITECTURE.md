# Architecture - AyosPapel Accounting Document Tracker

## Architecture status
This document defines constraints, not permission to invent requirements. Record major choices in `docs/decisions/`.

## Proposed shape
- Product type: Client portal
- Technology direction: Let the AI recommend the simplest maintainable stack
- Deployment target: Recommend based on the project and budget
- Client platforms: Responsive web application for office laptops and desktop computers, plus Android and iPhone browsers for clients photographing or uploading documents.
- Authentication: Invite-only accounts. The Business Owner creates staff accounts and invites authorized client contacts. Use email and password, secure password reset, session expiration, rate limiting, server-side authorization, and optional multi-factor authentication for owner and staff. Do not allow public self-registration. Recheck authorization on every file view, preview, download, upload, replacement, and export.
- Expected usage: Initial pilot with one business owner, up to five accounting staff, 20 to 50 accounting clients, one or two authorized contacts per client, and several thousand document uploads per year. Design the data model so more clients and storage can be added without changing the client-isolation rules.
- External integrations: No integration is required for the MVP. Existing Messenger, email, and Google Drive files will not automatically sync. Staff can manually add active files to a receiving batch and record the original source. Future integrations may include a business email inbox or managed scanning workflow only after security, ownership, privacy, duplicate handling, and recurring costs are approved.
- Existing data migration: Start with one pilot client, the current reporting period, and only physical batches still held by the accounting service. Label each active envelope or folder with a generated reference and record its current location. Staff will manually add only necessary current files from existing computers, Messenger downloads, email, and Google Drive. Do not migrate every historical paper or digital file until duplicates, readability, retention, storage cost, ownership, and client authorization are reviewed. Preserve original filenames and record the original source.
- Browser support: Latest stable Chrome, Edge, Firefox, and Safari. Prioritize Chrome and Edge on the accounting office computers and Chrome or Safari on client phones.
- Domain and email readiness: No production domain or sender email is confirmed. The accounting business must own the domain, DNS, hosting, file-storage, database, repository, billing, multi-factor authentication, and recovery contacts. Do not write credentials in this questionnaire.
- Backup and recovery target: Use encrypted automated database and protected-file backups. Define backup frequency and retention after estimating data volume and legal requirements. Keep backups separate from the primary production environment. Test restoration before launch and at scheduled intervals. Document who may restore data, the target recovery time, acceptable data loss, incident contacts, and client communication steps.

## Required layers
1. **Presentation** - pages/screens composed from reusable components.
2. **Application** - use cases and orchestration; no UI concerns.
3. **Domain** - business rules and permission decisions.
4. **Data/integration** - database repositories and external services.

## Request flow
`UI -> client service -> API route -> validation -> controller -> domain service -> repository -> database`

## Universal directory contract
- `client/`: user interface, assets, components, pages, services, state, constants.
- `server/`: routes, controllers, services, models, validation, middleware, configuration.
- `database/`: migrations, seed data, schema snapshot, and ERD source.
- `context/`: stable AI briefing documents.
- `prompts/`: portable AI startup, focused-task, debugging, review, and handoff prompts.
- `docs/`: setup, API, deployment, decisions, changelog, and handoffs.
- `tests/`: unit, integration, end-to-end, fixtures.
- `scripts/`: safe repeatable setup, validation, backup, and deployment helpers.

Keep every top-level folder in this contract for every project. If a layer is not active yet, retain its folder with a short README explaining that it is intentionally inactive. Do not rename or remove contract folders.

## Cross-cutting rules
- Validate at every trust boundary.
- Deny unauthorized access by default and enforce it on the server.
- Use structured errors and logs without secrets or personal data.
- Keep environment-specific values outside source code.
- Make database changes with versioned migrations and update the schema snapshot.
- Add tests at the lowest useful level plus one end-to-end path for critical workflows.

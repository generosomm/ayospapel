# Data and API Schema - AyosPapel Accounting Document Tracker

## Known domain records
- Business users
- Staff profiles
- Accounting clients
- Client contacts
- Client assignments
- Reporting periods
- Document requirement templates
- Client requirements
- Document categories
- Document batches
- Receiving records
- Receiving acknowledgements
- Physical storage locations
- Custody and location transfers
- Uploaded files and scans
- File versions
- Review decisions
- Missing-item or unclear-image requests
- Release and return records
- Release acknowledgements
- Deadlines
- Notifications
- Internal notes
- Audit events
- Export and archive records

## Access and sensitivity
- Data classification: Payments or financial data
- Authentication and access: Invite-only accounts. The Business Owner creates staff accounts and invites authorized client contacts. Use email and password, secure password reset, session expiration, rate limiting, server-side authorization, and optional multi-factor authentication for owner and staff. Do not allow public self-registration. Recheck authorization on every file view, preview, download, upload, replacement, and export.
- Role boundaries: The Business Owner can access all client workspaces, manage users, assign staff, configure document requirements, view activity history, and archive records.
Accounting Staff can access only clients assigned to them unless the owner grants wider access.
Accounting Staff can review documents, add internal notes, request replacements, and update processing status, but cannot permanently delete audit history.
Clients can access only their own business workspace and cannot view other clients, internal staff notes, or system-wide reports.
Clients can upload, replace when requested, download their own files, and view submission status.
Only the Business Owner can archive a client, finalize a period, restore archived records, or approve permanent deletion based on the agreed retention policy.
- Privacy, audit, or retention: The portal may contain confidential business, identity, payroll, banking, sales, and tax-related documents. Obtain professional Philippine privacy and legal review before production. Document the lawful purpose, client authorization, privacy notice, data retention, deletion, breach response, account ownership, access review, and data-subject request process. Collect only necessary information. Never place real client documents in development, demonstrations, AI prompts, screenshots, logs, source control, or test fixtures.
- Existing data to import: Start with one pilot client, the current reporting period, and only physical batches still held by the accounting service. Label each active envelope or folder with a generated reference and record its current location. Staff will manually add only necessary current files from existing computers, Messenger downloads, email, and Google Drive. Do not migrate every historical paper or digital file until duplicates, readability, retention, storage cost, ownership, and client authorization are reviewed. Preserve original filenames and record the original source.
- Baseline: least privilege, server-side authorization, audited important mutations, and no secrets or personal data in logs.

## Schema workflow
Before implementation:
1. Convert each approved entity into fields, types, constraints, ownership, and retention rules.
2. Draw relationships and confirm cardinality with the client.
3. Define role permissions for create, read, update, delete, export, and approval.
4. Create a versioned migration and update `database/schema.sql`.
5. Add safe seed data containing no real client information.

## API contract rules
- Group routes by domain and version public APIs.
- Document method, path, permission, validation, success response, and error responses.
- Use pagination and bounded filters for lists.
- Make write operations safe against duplicate submission where needed.
- Do not expose database rows directly; return intentional response objects.

## Candidate workflows to translate into contracts
- Owner creates a client workspace → chooses the reporting frequency and document checklist → assigns staff → optionally invites the client's authorized representative.
- Physical handover: client brings an envelope or document batch → staff selects the client and period → records general categories and approximate count → assigns a reference number → records the storage location → gives the client an acknowledgement.
- Digitization: staff opens the batch → photographs or scans papers → uploads the digital copies → confirms readability → system stores them under the correct client and period → staff marks the batch scanned.
- Online submission: client selects the correct period → uploads multiple photos or PDFs together → adds a short note → confirms the batch → receives a reference number; the client does not encode every receipt value.
- Review: staff checks the batch and checklist → marks missing papers or unclear images → client receives one organized request → client adds the missing or clearer files to the same batch history.
- Custody transfer: staff moves the envelope from receiving area to cabinet
- assigned accountant
- or return area → records the new location and custodian → system keeps the previous location in the audit trail.
- Release: staff marks originals ready for return → creates a release record → confirms the receiving person's identity according to business policy → records pickup
- delivery
- or other method → obtains acknowledgement → batch becomes released.
- Owner reviews the completed period → exports the receiving and release history → downloads the organized digital archive → archives the period without erasing the audit trail.

## External integrations
- No integration is required for the MVP. Existing Messenger
- email
- and Google Drive files will not automatically sync. Staff can manually add active files to a receiving batch and record the original source. Future integrations may include a business email inbox or managed scanning workflow only after security
- ownership
- privacy
- duplicate handling
- and recurring costs are approved.

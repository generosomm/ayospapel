# Build Plan - AyosPapel Accounting Document Tracker

## Phase 0 - Confirm
- Review the PRD with the client and replace every "to be confirmed."
- Approve wireframes, role permissions, MVP boundaries, stack, hosting, budget, and deadline.
- Define acceptance criteria for every MVP feature.

## Phase 1 - Foundation
- Create the exact universal directory structure and version control. Keep every contract folder, even when a layer is intentionally inactive.
- Lock runtime versions, environment validation, linting, formatting, and test commands.
- Establish design tokens, application shell, error handling, logging, and health checks.
- Draft the schema, migrations, safe seed data, and authentication boundary.

## Phase 2 - Vertical slices
- Owner and staff can sign in securely with role-based access.
- The owner can create a private workspace for every accounting client and assign staff.
- Staff can create one receiving record for an envelope
- box
- folder
- or digital upload batch instead of encoding every receipt transaction.
- Every batch receives a unique reference number and records the client
- reporting period
- date received
- channel
- sender
- receiver
- general document categories
- approximate item or page count
- and notes.
- Receiving channels include physical handover
- pickup
- Messenger
- email
- Google Drive
- and direct portal upload.
- Staff can print or share a simple acknowledgement showing what batch was received
- without listing confidential receipt values.
- Staff can photograph or scan physical papers and attach digital copies to the receiving batch.
- Clients can upload multiple photos or PDFs as a batch using a phone
- without filling an Excel sheet or entering each transaction.
- The system organizes records by client
- year
- month or quarter
- batch
- and document category while preserving original filenames.
- Staff can record the physical storage location such as cabinet
- shelf
- box
- envelope
- or assigned staff member.
- The system tracks batch status: received
- awaiting scan
- scanned
- under review
- incomplete
- ready for processing
- processing
- ready for return
- released
- or archived.
- Staff can record missing papers or unclear images and send one clear request to the client.
- The dashboard shows newly received batches
- papers awaiting scanning
- missing requirements
- documents currently held by staff
- and batches ready for return.
- Users can search by client
- reference number
- period
- document category
- receiving channel
- physical location
- custodian
- and status.
- Staff can create a release or return record listing the batch
- date
- releasing staff
- receiving person
- release method
- and acknowledgement.
- The system records an audit trail for receiving
- file upload
- scan
- download
- location transfer
- status change
- missing-item request
- and release.
- The owner can export receiving and release logs and download an organized digital archive for an approved period.

For each slice: plan -> implement -> test success and failure paths -> review permissions -> demo -> commit.

## Phase 3 - Integration and hardening
- Test complete workflows across roles and devices.
- Review validation, authorization, rate limits, uploads, secrets, logs, dependencies, and backups.
- Test database migration and rollback on a disposable environment.
- Resolve accessibility, performance, empty-state, and error-state issues.

## Phase 4 - Launch
- Run a clean-clone setup and production-like smoke test.
- Deploy a staging build for client acceptance.
- Prepare monitoring, backup/restore, admin guide, user guide, and rollback steps.
- Deploy production only after written acceptance and a recovery plan.

Launch inputs:
- Target dates: Build a focused pilot in six to eight weeks: discovery and file policy, approved prototype, secure authentication and client separation, document checklist and uploads, staff review workflow, testing, pilot migration, client acceptance, and production preparation.
- Domain/email: No production domain or sender email is confirmed. The accounting business must own the domain, DNS, hosting, file-storage, database, repository, billing, multi-factor authentication, and recovery contacts. Do not write credentials in this questionnaire.
- Backup/recovery: Use encrypted automated database and protected-file backups. Define backup frequency and retention after estimating data volume and legal requirements. Keep backups separate from the primary production environment. Test restoration before launch and at scheduled intervals. Document who may restore data, the target recovery time, acceptable data loss, incident contacts, and client communication steps.
- Ownership/handover: The accounting business owns the domain, production accounts, repository, database, protected file storage, backups, application data, and client documents it is authorized to process. Each accounting client retains rights over its submitted business documents. The developer receives least-privilege access only for the agreed development and support period. Record who can recover every production account.
- Support: Provide an agreed warranty period after launch, then define a separate maintenance arrangement covering security updates, dependency updates, storage monitoring, backup verification, incident response, account changes, bug handling, and support response times. New accounting features, integrations, and automated extraction are separate approved work.

## Phase 5 - Handover
- Record version, known limitations, credentials ownership, support window, and future backlog.
- Start future features from a fresh AI session using the handoff prompt and only relevant context.

# Product Requirements Document - AyosPapel Accounting Document Tracker

## Executive summary
A secure and beginner-friendly document receiving and releasing tracker for an accounting service. Clients can hand over physical papers or upload photos and files without encoding every receipt, while staff records each batch, preserves a digital copy, organizes it, tracks its location and status, and documents when papers are returned or released.

## Client context
- Organization: Family Accounting Services
- Industry or service: Accounting, bookkeeping, and tax document preparation services

## Problem statement
The accounting service handles many clients and receives receipts, sales reports, and other papers through physical handover, Messenger, email, and Google Drive. Physical documents create clutter, can be mixed with another client's papers, and may become difficult to read when receipt ink fades. Digital files are also scattered across laptops and inconsistent folders. The business cannot quickly confirm exactly what was received, where the physical batch is stored, whether it was scanned, what is missing, who currently holds it, or when original papers were returned to the client.

## Current process
Clients personally deliver envelopes or loose papers, or send photos and files through Messenger, email, or Google Drive. Staff manually checks the papers, stores them in available folders or containers, and downloads online files to different computers. Some clients have tried encoding information in Excel, but this consumes their time and is difficult when their own staff is limited. Receiving and returning papers are usually confirmed through chat or memory, without one searchable record or complete handover history.

## Target users and permissions
- Business Owner / Senior Accountant — manages all clients
- staff
- document requirements
- storage locations
- receiving and release records
- and reports
- Accounting Staff — receives physical or digital document batches
- scans or uploads copies
- records storage location
- reviews completeness
- and releases papers
- Client Owner / Authorized Representative — uploads document batches without transaction-by-transaction encoding and views only their own receiving
- missing-item
- and release records

### Permission boundaries
- The Business Owner can access all client workspaces
- manage users
- assign staff
- configure document requirements
- view activity history
- and archive records.
- Accounting Staff can access only clients assigned to them unless the owner grants wider access.
- Accounting Staff can review documents
- add internal notes
- request replacements
- and update processing status
- but cannot permanently delete audit history.
- Clients can access only their own business workspace and cannot view other clients
- internal staff notes
- or system-wide reports.
- Clients can upload
- replace when requested
- download their own files
- and view submission status.
- Only the Business Owner can archive a client
- finalize a period
- restore archived records
- or approve permanent deletion based on the agreed retention policy.

## MVP features
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

## Non-goals for the first release
- Requiring clients to encode every receipt or transaction in Excel
- Automatic bookkeeping or journal-entry generation
- Tax computation and tax-return filing
- Direct BIR submission or integration
- Payroll computation
- Issuing official receipts or invoices
- Online client payments
- Optical character recognition or automatic receipt data extraction
- Guaranteeing that a digital image legally replaces an original paper document
- Native Android or iOS application
- Public client registration
- AI financial advice
- Replacing the accounting software already used by the business

## Main pages or screens
- Sign in
- Forgot and reset password
- Owner dashboard
- Staff dashboard
- Client dashboard
- Clients list
- Create or edit client
- Client workspace overview
- New physical receiving record
- New digital batch upload
- Receiving acknowledgement
- Received batches
- Batch details and attachments
- Scan or photo upload
- Physical storage locations
- Document custody and location transfers
- Review queue
- Missing or unclear document requests
- Ready-for-return list
- New release or return record
- Release acknowledgement
- Receiving and release history
- Staff assignments
- Activity and audit history
- Reports and exports
- User and access management
- Document categories and checklist templates
- Business settings
- Privacy notice and upload rules
- Access denied
- expired link
- upload error
- and not-found pages

## Key workflows
1. Owner creates a client workspace → chooses the reporting frequency and document checklist → assigns staff → optionally invites the client's authorized representative.
2. Physical handover: client brings an envelope or document batch → staff selects the client and period → records general categories and approximate count → assigns a reference number → records the storage location → gives the client an acknowledgement.
3. Digitization: staff opens the batch → photographs or scans papers → uploads the digital copies → confirms readability → system stores them under the correct client and period → staff marks the batch scanned.
4. Online submission: client selects the correct period → uploads multiple photos or PDFs together → adds a short note → confirms the batch → receives a reference number; the client does not encode every receipt value.
5. Review: staff checks the batch and checklist → marks missing papers or unclear images → client receives one organized request → client adds the missing or clearer files to the same batch history.
6. Custody transfer: staff moves the envelope from receiving area to cabinet
7. assigned accountant
8. or return area → records the new location and custodian → system keeps the previous location in the audit trail.
9. Release: staff marks originals ready for return → creates a release record → confirms the receiving person's identity according to business policy → records pickup
10. delivery
11. or other method → obtains acknowledgement → batch becomes released.
12. Owner reviews the completed period → exports the receiving and release history → downloads the organized digital archive → archives the period without erasing the audit trail.

## Notifications and reports
### Notifications
- Physical or digital batch received → show an acknowledgement and notify assigned staff.
- Batch awaiting scan → show it in the receiving team's work queue.
- Scan or upload is unclear → notify the client or responsible staff with a clear replacement request.
- Documents are missing → send one organized checklist instead of separate chat messages.
- Physical batch changes location or custodian → record it in the activity history and show the current location to authorized staff.
- Original papers ready for return → notify the authorized client contact.
- Batch released → provide a release acknowledgement and update the client history.
- Requirement approaching deadline or overdue → show a reminder to the client and assigned staff.
- For the MVP
- notifications remain inside the portal and can also be printed or copied into an approved business message. Email can be added later after approval.

### Reports, search, and exports
- Document batches received by client
- period
- date
- and channel
- Physical documents currently held by the accounting service
- Current cabinet
- shelf
- box
- envelope
- or staff custodian for every active physical batch
- Batches waiting to be scanned
- Batches with missing papers or unclear digital copies
- Original papers ready for client return
- Released batches with receiver and acknowledgement
- Unreleased or long-held physical documents
- Workload by assigned staff member
- Document upload
- download
- custody-transfer
- and release activity
- Receiving and release log export to CSV
- Organized ZIP archive by client
- period
- batch
- and category
- Digital storage usage by client and document category

## Success metrics
- Every physical batch currently held for the pilot client has a reference number
- receiving record
- current location
- and status.
- Staff can determine in less than 30 seconds whether a batch was received
- scanned
- assigned
- ready for return
- or released.
- Clients can submit photos or PDFs without encoding every receipt transaction.
- Important fading receipts can be photographed or scanned promptly and linked to the correct batch
- while original-retention rules remain separate.
- The requirements checklist accurately shows submitted
- missing
- unclear
- and accepted document groups.
- No client can access another client's records or files.
- Every physical-location transfer and release has an audit record.
- The business reduces undocumented exchanges through personal Messenger accounts and scattered folders.
- The owner can export a complete receiving and release history for the pilot period.

## Constraints
- The first release must solve receiving
- digitization
- organization
- physical custody
- and release tracking
- not become a complete accounting platform.
- Do not require clients to encode each receipt or transaction into Excel.
- Clients should be able to submit one batch using photos or PDFs with only client
- period
- category
- and a short note.
- A digital scan is for preservation
- organization
- and work reference; the business must separately confirm which original papers must still be retained.
- The interface must be usable by non-technical clients on a phone.
- Use one canonical naming and folder policy while preserving original filenames.
- Client files must never be publicly accessible by predictable URLs.
- Authorization must be enforced by the server for every document action.
- Use private managed object storage or an equivalently protected file service in production; do not depend on a public uploads folder.
- Validate file type
- size
- ownership
- period
- and category.
- Scan or quarantine risky uploads when the selected infrastructure supports it.
- Do not log document contents
- secrets
- or unnecessary personal data.
- Do not use real client files for testing or AI prompting.
- Keep recurring costs understandable and approved by the business owner.
- Start with one pilot client and one active physical batch before migrating other clients.

## Delivery target
- Platforms: Responsive web application for office laptops and desktop computers, plus Android and iPhone browsers for clients photographing or uploading documents.
- Browsers: Latest stable Chrome, Edge, Firefox, and Safari. Prioritize Chrome and Edge on the accounting office computers and Chrome or Safari on client phones.
- Deployment: Recommend based on the project and budget
- Initial technology direction: Let the AI recommend the simplest maintainable stack
- Expected usage: Initial pilot with one business owner, up to five accounting staff, 20 to 50 accounting clients, one or two authorized contacts per client, and several thousand document uploads per year. Design the data model so more clients and storage can be added without changing the client-isolation rules.
- Build budget: Begin with a low-cost pilot using free or affordable development tools. Before production, estimate managed database, protected file storage, backups, email, domain, monitoring, and ongoing maintenance separately. The client must approve recurring costs.
- Target dates: Build a focused pilot in six to eight weeks: discovery and file policy, approved prototype, secure authentication and client separation, document checklist and uploads, staff review workflow, testing, pilot migration, client acceptance, and production preparation.
- Domain and business email: No production domain or sender email is confirmed. The accounting business must own the domain, DNS, hosting, file-storage, database, repository, billing, multi-factor authentication, and recovery contacts. Do not write credentials in this questionnaire.

## Commercial ownership and support
- Content owner: The Business Owner or Senior Accountant approves client names, document categories, monthly requirement templates, deadlines, upload instructions, rejection reasons, privacy notices, retention rules, and client-facing terminology. Staff may suggest changes but cannot silently redefine requirements.
- Production accounts and source ownership: The accounting business owns the domain, production accounts, repository, database, protected file storage, backups, application data, and client documents it is authorized to process. Each accounting client retains rights over its submitted business documents. The developer receives least-privilege access only for the agreed development and support period. Record who can recover every production account.
- Post-launch support: Provide an agreed warranty period after launch, then define a separate maintenance arrangement covering security updates, dependency updates, storage monitoring, backup verification, incident response, account changes, bug handling, and support response times. New accounting features, integrations, and automated extraction are separate approved work.

## Definition of done
- Every approved MVP feature has acceptance criteria and a passing verification.
- Role permissions are tested for allowed and forbidden actions.
- Setup, environment variables, database migration, backup, and deployment are documented.
- The system passes accessibility, security, error-state, and responsive-layout checks.

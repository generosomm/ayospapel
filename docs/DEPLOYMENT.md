# Deployment and Handover - AyosPapel Accounting Document Tracker

## Environments
Maintain separate local, test, staging, and production configuration. Never copy production secrets or personal data into development.

## Current targets
- Hosting direction: Recommend based on the project and budget
- Domain and email: No production domain or sender email is confirmed. The accounting business must own the domain, DNS, hosting, file-storage, database, repository, billing, multi-factor authentication, and recovery contacts. Do not write credentials in this questionnaire.
- Expected scale: Initial pilot with one business owner, up to five accounting staff, 20 to 50 accounting clients, one or two authorized contacts per client, and several thousand document uploads per year. Design the data model so more clients and storage can be added without changing the client-isolation rules.
- Browser/device support: Latest stable Chrome, Edge, Firefox, and Safari. Prioritize Chrome and Edge on the accounting office computers and Chrome or Safari on client phones.; Responsive web application for office laptops and desktop computers, plus Android and iPhone browsers for clients photographing or uploading documents.
- Backup and recovery: Use encrypted automated database and protected-file backups. Define backup frequency and retention after estimating data volume and legal requirements. Keep backups separate from the primary production environment. Test restoration before launch and at scheduled intervals. Document who may restore data, the target recovery time, acceptable data loss, incident contacts, and client communication steps.

## Before staging
- [ ] Clean-clone setup works using the documented runtime and commands.
- [ ] Environment variables are validated and listed in `.env.example` without values.
- [ ] Migrations and safe seed data run on an empty database.
- [ ] Lint, type, unit, integration, build, and critical end-to-end checks pass.
- [ ] Error, empty, loading, permission-denied, offline, and retry states are reviewed.
- [ ] Dependency, secret, authorization, validation, upload, and logging reviews are complete.

## Before production
- [ ] Client signed off on staging and final content.
- [ ] Production accounts are client-owned and MFA/recovery contacts are configured.
- [ ] DNS changes, TLS, sender authentication, analytics, and consent are ready.
- [ ] Database backup is captured and a restore was tested.
- [ ] Migration, rollback, monitoring, alerting, and smoke-test commands are documented.
- [ ] Maintenance window, support contacts, and incident communication are agreed.

## Handover package
- Source repository and release tag.
- Admin and user guides.
- Architecture, schema, API, deployment, and decision records.
- Account inventory with ownership and recovery contacts (never passwords in Git).
- Backup/restore instructions and most recent restore-test evidence.
- Known limitations, backlog, warranty, maintenance agreement, and support response targets.

## Post-launch
Monitor errors, performance, security events, email delivery, backups, and the highest-value workflows. Schedule a client review after the first week and again before the warranty period ends.

# Security and Data Policy Draft

Status: Authorized draft for pilot implementation. Professional Philippine
privacy and legal review is required before real client data or production use.

## Development-data rule

Use synthetic names, documents, email addresses, and identifiers only. Never
place real client data in source control, fixtures, screenshots, logs, issue
trackers, demonstrations, or AI prompts. The local pilot database and
development uploads are disposable.

## File policy

- Initially allow PDF, JPEG, and PNG.
- Default limits: 15 MB per file, 20 files per batch, and 100 MB per batch.
- Verify declared type, extension, file signature, size, authenticated owner,
  client, period, and category on the server.
- Generate opaque storage keys; preserve the original filename as metadata.
- Store files in a private location outside the public web root.
- Production downloads use short-lived authorized access, never predictable
  public URLs.
- Production uploads require malware scanning or quarantine before staff
  download. Until this exists, real-file upload is not production-ready.
- Do not render active PDF content inline unless it is served with restrictive
  headers and reviewed for browser safety.

## Authentication and MFA

- Invite-only accounts; no public registration.
- Passwords are salted and hashed using an approved memory-hard or
  platform-reviewed password function.
- Sessions use random, server-stored, hashed tokens in `HttpOnly`, `Secure` in
  production, `SameSite=Strict` cookies with idle and absolute expiration.
- Rate-limit sign-in and password-reset endpoints without revealing whether an
  account exists.
- MFA is mandatory for owner and staff before production. It may be simulated
  or disabled only for the synthetic local pilot.
- Recovery codes and production-account recovery contacts must be documented
  and kept outside the repository.

## Retention, archive, and deletion

- Pilot synthetic records may be reset at any time.
- For real data, default to retaining active-period records and immutable audit
  metadata until the owner approves a legally reviewed schedule.
- Archiving hides records from active queues but does not erase them.
- Permanent deletion requires owner approval, a recorded reason, confirmation
  that no legal or contractual hold applies, and an auditable deletion job.
- Backups expire according to the approved schedule; deletion from backups is
  not promised before normal backup expiry.
- Audit events are append-only for application users and retain actor, action,
  target, timestamp, and non-sensitive change metadata.

## Release identification and acknowledgement

- Staff records release method, receiving person's full name, relationship or
  authority, releasing staff, date/time, and acknowledgement method.
- Do not store government-ID images in the MVP. If business policy requires an
  ID check, record only the approved ID type and a masked last-four reference.
- Accepted acknowledgement methods for the pilot draft are signed paper,
  portal confirmation, or staff-recorded handover witnessed by a second staff
  member.
- Delivery to a third party requires prior authorization recorded against the
  client contact.
- A release is immutable after confirmation; corrections are separate,
  owner-authored audit entries.

## Operational baseline

Production requires encrypted managed storage, encrypted backups, tested
restore instructions, least-privilege accounts, monitoring, incident contacts,
breach-response steps, and periodic access review. Logs must exclude document
contents, passwords, session tokens, storage URLs, and unnecessary personal
data.

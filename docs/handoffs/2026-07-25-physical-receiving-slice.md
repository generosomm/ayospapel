# Handoff: Physical Receiving Slice

## Completed

- Zero-cost local architecture and migration boundary recorded.
- Draft security, file, retention, MFA, and release policy recorded.
- Synthetic SQLite schema and reset/seed command.
- Invite-only synthetic sign-in with server-side sessions.
- Owner, assigned staff, unassigned staff, and client access boundaries.
- Physical batch receiving with open-period validation, approved categories,
  monthly reference generation, current location, audit event, and idempotency.
- Role-aware responsive workspace and printable acknowledgement.

## Current behavior

Run `npm.cmd run db:reset`, then `npm.cmd run dev`. Use the synthetic accounts
shown on the sign-in screen. Assigned staff can receive a Sunrise Mini Mart
physical batch. The unassigned staff account sees no clients. The linked client
can see its own batch and acknowledgement but cannot create physical receiving
records.

## Decisions

- Local SQLite is development-only.
- Real files and real client data remain prohibited.
- PostgreSQL and private object storage adapters are required before production.
- MFA is mandatory for owner and staff before production.

## Known limitations

- No real file upload, custody transfer, review, missing-item request, release,
  export, notification, owner administration, or password reset yet.
- Local sessions are suitable for the synthetic pilot, not production.
- Privacy/legal review and production retention schedule remain external
  approvals.

## Verification

- `npm.cmd run check` passed on 2026-07-25.
- Five server integration tests passed.
- Client and server production builds completed.

## Next smallest task

Implement the synthetic digitization/upload slice using a local private-storage
adapter, server-side file validation, attachment metadata, and authorized
download tests. Keep real-file use explicitly blocked.

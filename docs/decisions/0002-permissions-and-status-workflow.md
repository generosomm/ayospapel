# ADR 0002: Permissions and batch status workflow

- Status: Accepted
- Date: 2026-07-25

## Access rules

- Owner: access all clients and administrative functions.
- Staff: access assigned clients only.
- Staff-wide access is an explicit per-user permission granted or revoked by
  the owner. It is never inferred from job title.
- Client contact: access only the client workspace linked to the account.
- Only owner and authorized staff can create a physical receiving record.
- Client contacts may create portal-upload batches only when that feature is
  implemented.
- Authorization is rechecked by the server for every record and file action.

## Batch workflow

Allowed forward transitions:

`received -> awaiting_scan -> scanned -> under_review`

From `under_review`, a batch may become `incomplete` or
`ready_for_processing`. An incomplete batch returns to `under_review` after a
replacement is submitted.

`ready_for_processing -> processing -> ready_for_return -> released -> archived`

Rules:

- A physical batch starts as `received` or `awaiting_scan`.
- A digital-only batch starts as `received` and skips physical-custody fields.
- Only the owner may archive a batch or reopen a finalized reporting period.
- A status may not move backward except through a documented owner correction.
- Corrections create an audit event and never overwrite prior custody history.
- Released batches cannot be edited except for an owner-authored correction.

## Reference numbers

References use `AP-YYYYMM-NNNN`, based on the receiving month and a
database-controlled monthly sequence. References are immutable and unique.
Duplicate form submissions use a client-generated request ID and return the
original result instead of creating a second batch.

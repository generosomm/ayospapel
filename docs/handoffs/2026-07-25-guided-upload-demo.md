# Handoff: Guided Portal and Digital Upload

## Completed

- Replaced the empty single-purpose dashboard with role-based navigation.
- Added five populated synthetic batches across operational statuses.
- Added summary cards, recent activity, searchable/filterable history, batch
  detail drawer, status journey, client overview, and storage-location overview.
- Added an in-product beginner guide with role-specific steps.
- Added client/staff synthetic PDF, JPEG, and PNG batch upload.
- Added private local storage, signature/type/size checks, attachment metadata,
  authorized listing, and authorized download.

## How to demonstrate

1. Run `npm.cmd run db:reset`, then `npm.cmd run dev`.
2. Sign in as Owner to explore the complete staff navigation.
3. Open **How to use**, then **Batch history** and a populated sample batch.
4. Sign in as Client to test **Upload documents** with a dummy PDF/image.
5. Sign in as Unassigned staff to demonstrate client-isolation denial.

All accounts use `DemoOnly!2026`. Real client files remain prohibited.

## Checks

`npm.cmd run check` passes with six server integration tests and successful
client/server production builds.

## Remaining MVP workflows

Custody transfers, editable review decisions, missing/unclear requests, release
acknowledgements, notification inbox, owner user/assignment management,
exports, archive, password reset, and production MFA are not implemented yet.

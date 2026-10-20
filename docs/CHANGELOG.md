# Changelog

## 0.3.1 - 2026-07-25

- Corrected fixed-height shadcn Button composition that compressed dashboard
  summary cards and activity rows.
- Rebuilt dashboard queues to match the PRD: newly received, awaiting scan,
  missing or unclear, physical batches held, and ready for return.
- Added current physical location to dashboard activity rows.
- Enforced 16px body/form text, readable heading weight, large tap targets, and
  responsive no-overflow layouts.
- Verified owner desktop and client mobile layouts in headless Microsoft Edge.
- Removed the shadcn CLI from runtime dependencies after generation, resolving
  its transitive audit findings.

## 0.3.0 - 2026-07-25

- Adopted the official shadcn/ui Vite component foundation.
- Added Tailwind CSS v4, Radix Nova components, Lucide, Geist, and semantic
  CSS-variable theming.
- Migrated portal buttons, inputs, native selects, checkboxes, textareas,
  labels, cards, alerts, badges, detail sheets, tooltips, and notifications to
  reusable shadcn components.
- Preserved AyosPapel's blue/indigo and warm-neutral interface identity.

## 0.2.0 - 2026-07-25

- Replaced the single empty workspace with a guided role-based portal.
- Added populated synthetic batches across attention, review, processing, and
  return statuses.
- Added dashboard summaries, searchable/filterable history, batch details,
  status journey, client list, and physical storage views.
- Added an in-product beginner guide with English and Filipino-friendly upload
  help.
- Added secure synthetic PDF/JPEG/PNG batch uploads and authorized downloads.
- Added attachment metadata and a portable local-storage adapter.
- Expanded access and upload integration coverage.

## 0.1.0 - 2026-07-25

- Recorded the approved zero-cost, migration-ready pilot architecture.
- Drafted file, authentication/MFA, retention, deletion, and release policies.
- Added synthetic SQLite fixtures and four test roles.
- Added secure cookie sessions and role/client authorization.
- Added physical receiving, monthly reference generation, initial custody
  location, append-only audit creation, and idempotent submission.
- Added a responsive, accessible pilot UI and printable receiving
  acknowledgement.
- Added integration checks for authentication and cross-client permissions.

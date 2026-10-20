# AyosPapel Accounting Document Tracker

## Purpose

A secure, beginner-friendly receiving and release tracker for physical and
digital accounting document batches. The current implementation is a
zero-cost local pilot that uses synthetic data only.

The React frontend uses official shadcn/ui components generated into
`client/src/components/ui/`. Reuse those components for new screens instead of
creating parallel UI primitives.

This repository follows the Zero to Deploy project contract. Start with `START_HERE.md`, approve all files in `context/`, and follow `docs/BUILD_PLAN.md`.

## Quick start
1. Install Node.js 24.
2. Run `npm.cmd install`.
3. Copy `.env.example` to `.env`.
4. Run `npm.cmd run db:reset` to create synthetic pilot data.
5. Run `npm.cmd run dev`.

The local pilot uses SQLite. It is deliberately isolated behind repositories so
PostgreSQL and managed private storage can replace local adapters before
production. See `docs/decisions/0001-zero-cost-portable-pilot.md`.

## Source-of-truth order
1. Signed client scope and change requests.
2. `context/PRD.md` for product scope and acceptance.
3. `context/ARCHITECTURE.md` and `context/SCHEMA.md` for technical contracts.
4. `context/DESIGN.md` for interface behavior and accessibility.
5. `context/RULES.md` for implementation and AI collaboration.

## Safety
Never commit secrets or real client data. Never deploy without authorization, backup/restore evidence, client acceptance, monitoring, and rollback instructions.

The local database, development uploads, and all supplied accounts are
synthetic and must not be reused for production.

## How to explore the pilot

All synthetic accounts use `DemoOnly!2026`.

- `owner@demo.ayospapel.test`: see both clients, dashboard summaries, clients,
  storage locations, physical receiving, and digital uploads.
- `staff@demo.ayospapel.test`: test the assigned-staff workflow for Sunrise Mini
  Mart.
- `client@demo.ayospapel.test`: test the phone-friendly dummy PDF/photo upload
  and client-only batch history.
- `unassigned@demo.ayospapel.test`: verify that staff without an assignment
  cannot see or create client records.

After signing in, open **How to use** in the left navigation. The Overview page
contains sample batches in several statuses so the workflow is understandable
before creating a new record.

Only synthetic PDF, JPEG, and PNG files may be uploaded to the local pilot.

# Project Rules - AyosPapel Accounting Document Tracker

## Non-negotiable implementation rules
- Follow the approved PRD; do not silently add scope or invent business rules.
- Keep the universal directory contract and explain any necessary deviation.
- Build one vertical slice at a time: UI, validation, business rule, persistence, and test.
- Reuse a component when a pattern appears twice; keep pages focused on composition.
- Put API access in client services and business logic in server/domain services.
- Put roles, statuses, routes, and other fixed values in typed constants or enums.
- Read configuration from validated environment variables; keep `.env.example` current.
- Never commit credentials, tokens, real client data, build output, or uploaded files.
- Keep files cohesive; split files that contain unrelated responsibilities.
- Update tests and documentation in the same change as behavior.

## AI collaboration contract
- Tool: Any AI coding assistant
- User experience: Beginner / vibe coder
- Change policy: Plan first, then wait for my approval before coding
- Inspect existing files before editing. Preserve unrelated user changes.
- State assumptions and blockers. Ask only questions that materially change the solution.
- For normal feature work, show only changed files or a concise diff summary.
- After each task, report changed files, verification performed, result, and next smallest task.
- Never claim a test, command, migration, or deployment succeeded unless it was actually run.

## Security threshold
Data classification is **Payments or financial data**. Authentication, payments, personal data, regulated data, destructive actions, and production deployment require explicit threat review and human verification.

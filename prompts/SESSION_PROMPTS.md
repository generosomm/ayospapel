# Token-Efficient AI Session Prompts - AyosPapel Accounting Document Tracker

## Start a feature session
Read only `context/RULES.md`, the relevant sections of `context/PRD.md`, `context/SCHEMA.md`, and the files directly involved in [FEATURE].

Task: [ONE CONCRETE OUTCOME]
Acceptance checks:
- [CHECK 1]
- [CHECK 2]

Inspect first. State a short plan, then implement the smallest complete vertical slice. Preserve unrelated code. Update tests and docs. At the end list changed files and checks actually run. Keep the response concise.

## Debug a failure
Expected: [EXPECTED BEHAVIOR]
Actual: [ACTUAL BEHAVIOR]
Exact error/log: [PASTE EXACT OUTPUT]
Reproduction: [MINIMAL STEPS]
Relevant files: [PATHS]

Diagnose the root cause before editing. Do not hide the error, weaken validation, or add dummy data. Change only necessary files, add a regression test when practical, run the narrowest relevant checks, and report evidence.

## Security and production review
Review [FEATURE OR FLOW] against `context/RULES.md` and `context/SCHEMA.md`. Trace authentication, authorization, validation, data exposure, logging, uploads, rate limits, secrets, and failure behavior. Rank findings by impact and likelihood. Fix only issues I explicitly approve, then add tests.

## Fresh-session handoff
Project: AyosPapel Accounting Document Tracker
Current milestone: [MILESTONE]
Completed: [SHORT BULLETS]
Current behavior: [WHAT WORKS]
Next task: [ONE OUTCOME]
Decisions: [ONLY RELEVANT DECISIONS]
Known issues: [SHORT BULLETS]
Checks last run: [COMMAND + RESULT]
Relevant files: [PATHS]

Read the listed files and only the relevant context docs. Verify repository state, then continue with the next task. Do not recap unrelated history.

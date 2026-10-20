# Handoff: Context-aligned UI repair

## Root cause

Complex dashboard cards and activity rows were composed directly as shadcn
Buttons. The Nova Button's fixed height compressed multi-line content.

## Repair

- Re-read all five `context/` source-of-truth documents.
- Use Card for dashboard containers and height-auto Button actions inside them.
- Map dashboard queues directly to the PRD.
- Show current physical location in recent activity.
- Restore 16px body/form text and large desktop/mobile targets.
- Preserve shadcn primitives and AyosPapel semantic theme tokens.

## Evidence

- Desktop Edge viewport: five 104px dashboard cards and 96-97px activity rows.
- Mobile Edge viewport: 16px body text and 44px visible action targets.
- No horizontal overflow at 1440px or 390px.
- `npm.cmd run check` passes.
- Production dependency audit reports zero vulnerabilities.

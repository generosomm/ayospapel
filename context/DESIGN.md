# Design System - AyosPapel Accounting Document Tracker

## Product direction
Friendly, calm, and non-technical. The main client action should be Upload a document batch, not Encode receipts. Use large readable text, plain English with Filipino-friendly explanations, one primary action per screen, familiar camera and file upload controls, a clear monthly checklist, visible upload progress, receiving and release acknowledgements, and status labels that use words and color. Staff screens should make the current physical location and custodian easy to see. Use progressive disclosure so detailed rules appear only when relevant.

## Brand and content
- Brand references: Use a temporary trustworthy blue, indigo, and warm neutral visual identity with a simple organized-folder or document-check icon. The business owner will provide the final business name, logo, colors, contact information, and approved privacy content before client testing.
- Languages: English first, with Filipino helper text for client-facing upload instructions and error explanations. Final terminology must be approved by the accounting business.
- Accessibility: Readable text of at least 16 pixels for normal content, strong contrast in light and dark modes, keyboard navigation, visible focus, descriptive form labels, large mobile tap targets, understandable errors, upload progress, screen-reader status announcements, reduced-motion support, and no status communicated by color alone.

## Supported experiences
Responsive web application for office laptops and desktop computers, plus Android and iPhone browsers for clients photographing or uploading documents.

## Foundation tokens
Define semantic tokens before styling screens:
- Color: background, surface, text, muted text, border, primary, success, warning, danger.
- Type: display, heading, body, label, code; minimum readable mobile sizes.
- Space: a consistent 4px or 8px scale.
- Shape: radius, border, shadow, and focus-ring tokens.
- Motion: purposeful, brief, and disabled when reduced motion is requested.

## Interaction rules
- Every screen covers loading, empty, error, success, disabled, and permission-denied states.
- All controls need labels, keyboard access, visible focus, and sufficient contrast.
- Never rely only on color to communicate status.
- Confirm destructive or irreversible actions.
- Prefer progressive disclosure for complex forms and dashboards.

## Design approval
Create low-fidelity flows first. Obtain client approval for navigation and required information before polishing visual design.

## Component strategy
- Use shadcn/ui with Radix primitives as the approved primary component
  foundation. Generate components from the official registry into
  `client/src/components/ui/` and reuse them across screens.
- Do not create competing general-purpose buttons, inputs, selects, checkboxes,
  cards, alerts, sheets, dialogs, tables, tabs, tooltips, or toast systems.
- AyosPapel-specific composition and semantic variants are allowed, but must be
  built from the shared shadcn components.
- Keep copied or generated components inside `client/src/components/ui/`; use semantic design tokens so the project can be rebranded.
- Verify licensing, maintenance activity, bundle impact, keyboard behavior, and screen-reader behavior before adoption.

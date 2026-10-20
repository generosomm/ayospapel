# ADR 0003: shadcn/ui component foundation

- Status: Accepted
- Date: 2026-07-25

## Decision

Use shadcn/ui as the frontend component foundation through the official shadcn
CLI and registry. The selected configuration is:

- Vite and React 19
- Tailwind CSS v4
- Radix-based Nova style
- CSS-variable theming
- Lucide icon library
- Geist variable font

Generated components live in `client/src/components/ui/`. Application screens
must import and compose these components instead of creating competing Button,
Input, Select, Checkbox, Card, Alert, Badge, Sheet, Dialog, Table, Tabs,
Tooltip, or toast primitives.

AyosPapel-specific code may add semantic variants, layouts, and theme tokens,
but should not fork a second general-purpose component system. Updates from the
shadcn registry must be reviewed rather than blindly overwritten because the
generated source is owned by this repository.

## Initial component set

Button, Input, Native Select, Select, Checkbox, Textarea, Label, Field, Card,
Alert, Badge, Sheet, Dialog, Table, Tabs, Empty, Progress, Separator, Avatar,
Dropdown Menu, Tooltip, and Sonner.

## Consequences

The frontend gains consistent accessible primitives and source-level control.
Tailwind, Radix, Lucide, and supporting class utilities are intentional runtime
dependencies. The shadcn CLI is used through `npx shadcn@latest` when components
are generated or reviewed; it is not kept as a production dependency.
AyosPapel's blue/indigo and warm-neutral identity continues through semantic
CSS variables.

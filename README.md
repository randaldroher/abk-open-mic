# ABK Open Mic Night

A public, read-only Next.js site for an open mic night. The current application
uses clearly marked synthetic content; it does not connect to a spreadsheet or
contain real performer information.

## Run locally

```bash
npm ci
npm run dev
```

The site is built with Next.js App Router, TypeScript, Cache Components, and
MUI. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
to verify changes.

## Before publishing real event data

Review the [architecture](docs/ARCHITECTURE.md) and
[scaffold plan](docs/SCAFFOLD_PLAN.md). Organizers must agree on public fields,
performer consent, the event time zone, spreadsheet access, preview data, and
acceptable cache freshness first. Replace the synthetic server-side adapter
with a read-only Google Sheets adapter only after those decisions are resolved.
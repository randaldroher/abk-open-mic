# ABK Open Mic Night architecture

## Purpose and scope

A publicly accessible, read-only site for an Open Mic Night featuring colleagues from Activision, Blizzard, and King. Visitors can view event details, participating acts, and the running order. Organizers plan and edit the event directly in one Google Sheets spreadsheet; the site never writes to the sheet and has no accounts, authentication, authorization, or in-app submission flow.

This is a proposed architecture, not an implemented application. Assume that everything rendered on the site can be seen by anyone on the internet. Get permission before publishing names or other personal details.

## Product flows

- Visitors see the date, venue, guidelines, performers/acts, and published schedule without signing in.
- Visitors browse or filter the lineup and can see when the published information was last updated.
- Organizers edit the spreadsheet outside the site; rows marked as published appear on the site after cache refresh. Draft rows remain unpublished.
- Coordination, performer applications, and changes to the running order happen outside this read-only site, using channels chosen by organizers.

## System boundaries

```text
Public browser (MUI presentation and optional client-side filters)
  -> Next.js App Router on Vercel (Server Components and layouts)
    -> server-only read adapter (Google Sheets API, read-only scope)
      -> organizer-managed Google Sheets spreadsheet
```

- Use TypeScript, the Next.js App Router, and Cache Components (`cacheComponents: true` in `next.config.ts`). Server Components own sheet reads; Client Components are limited to filters and other presentation interactions. Follow MUI's App Router integration for the installed Next.js major version, including its style-insertion/cache provider, theme, and baseline in the root layout.
- Keep the spreadsheet private and grant a dedicated service account **viewer** access. The server uses a read-only Google Sheets API scope and credentials stored only in Vercel environment variables (locally in `.env.local`). No API keys, sheet credentials, unpublished rows, or raw sheet responses go to the browser. A private sheet protects drafts at the source; the published site itself is unrestricted.
- Access the Sheets API from a `server-only` adapter that reads named tabs/ranges, validates rows, projects only approved public fields, and returns typed view models. Do not add Server Actions, write API routes, a database, or any app-level identity system for this scope. Spreadsheet editors are managed in Google Workspace, outside the website.
- Deploy preview environments from pull requests and production from the main branch on Vercel. Use separate spreadsheet IDs or synthetic data for previews; never expose unpublished production rows in a preview.

## Spreadsheet contract and publication

Use a single spreadsheet with a stable `event_id` (even if the initial release covers only one night) and these tabs. Agree on exact column names before implementation, and treat missing or malformed fields as validation errors rather than silently inventing data.

| Tab | Public fields | Publication rule |
| --- | --- | --- |
| Events | event_id, title, starts_at, time_zone, venue, guidelines, updated_at, published | Show published event only |
| Acts | act_id, event_id, display_name, description, instruments, duration_minutes, published | Show published acts linked to a published event |
| Schedule | event_id, act_id, starts_at, order, published | Show published slots referencing published acts |

Keep drafts and planning-only columns out of the returned view models. Do not put private contact details or sensitive workplace information in public fields; ideally keep those in a different spreadsheet entirely. Agree on consent for public performer names/photos and a retention policy with organizers. Validate IDs, dates, time zone, order, external links (if added), and references between rows. Display times in the event's specified time zone, not the visitor's implicit browser zone.

The server filters `published` rows before rendering, but this is an editorial visibility rule, not user authorization. Sheet editors are responsible for approving content before marking it published. A direct sheet edit is the only publishing mechanism; the site never offers an edit form.

## Rendering and cache policy

- Prerender the site shell and cache the public, validated view models with `use cache` and an explicit `cacheLife` suited to the event's update cadence. All cached output is safe to share with every visitor; do not cache raw draft-containing sheet responses as public view models.
- Refresh on the configured lifetime rather than promising immediate publication: spreadsheet edits cannot automatically call a Next.js invalidation API. Agree on an acceptable delay with organizers and show the sheet's `updated_at` or a clearly labeled last-refreshed time.
- Handle Google API quota errors, invalid rows, and temporary unavailability with an accessible error state; never fall back to exposing unfiltered sheet data. Keep server logs free of credentials and unpublished content.

## Routes and UI

- `/`: public event overview and essential details.
- `/acts`: public published acts, with optional browser-side filters.
- `/schedule`: public running order with event-local times.

Use MUI components and theme tokens for accessible navigation, responsive layouts, loading/empty/error states, and keyboard-friendly filtering. Do not show sign-in, account, registration, or editor controls.

## Verification and operations

- Test parsing and filtering with synthetic sheets: missing columns, malformed timestamps, draft rows, unpublished events, and broken act references must not leak or corrupt the public page.
- Verify cache refresh behavior after a simulated sheet edit, Google API failure handling, mobile and keyboard use, and that only projected public fields reach rendered HTML or client bundles.
- Run lint, typecheck, tests, and a production build before deployment. Monitor API errors and quota use without logging private spreadsheet content.

## Open decisions before launch

1. What are the final public fields, and have performers consented to publishing their names and any links or photos?
2. What time zone, spreadsheet owner/editors, and preview-data source should be used?
3. What cache lifetime and maximum publication delay are acceptable near the event?

Check framework details against the installed Next.js documentation before implementation: [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components) and [AI coding agents](https://nextjs.org/docs/app/guides/ai-agents).
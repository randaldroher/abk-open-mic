# Site scaffolding plan

The repository currently contains planning documents, not an application. Follow [the architecture](ARCHITECTURE.md) and resolve its open decisions before launching to real participants. Do not replace the repository's existing README, AGENTS.md, or docs with generator output.

## 1. Generate the App Router baseline

Use a supported Node.js release (Next.js currently requires at least Node 20.9) and npm. Run the generator from the workspace's parent directory so it creates a disposable sibling, not files on top of this repository:

```bash
cd ..
npx create-next-app@latest abk-open-mic-scaffold --ts --eslint --app --src-dir --no-tailwind --use-npm --no-agents-md --disable-git
```

Review the output and copy the generated app files (`src/`, `public/`, `package.json`, lockfile, TypeScript/ESLint/Next config, and other generated build config) into this repository. Preserve this repository's README, AGENTS.md, and `docs/`; do not copy generated agent files or `.git`. Install dependencies here with `npm ci`, then run `npm run dev` to verify the starter renders. Remove the disposable sibling only after comparing the copied files.

## 2. Add MUI and Cache Components

- Install `@mui/material`, `@emotion/react`, `@emotion/styled`, and `@mui/material-nextjs` using npm. Add MUI icons only when needed. Follow the [MUI Next.js integration guide](https://mui.com/material-ui/integrations/nextjs/) for the App Router provider matching the installed Next.js major version; configure theme, baseline, and CSS-insertion integration in `src/app/layout.tsx`.
- Enable `cacheComponents: true` in `next.config.ts`. Read the installed Next.js docs in `node_modules/next/dist/docs/` before using caching APIs. Build a static site shell first, then cache published sheet data with an agreed refresh lifetime.
- Create `src/app/` routes for the public overview, published acts, and schedule in the architecture. Use a responsive MUI layout and accessible navigation, with Server Components by default.

## 3. Connect the read-only spreadsheet

- Agree on the public columns, event time zone, consent policy, spreadsheet editor, and acceptable cache delay with organizers. Create the Events, Acts, and Schedule tabs described in the architecture. Use synthetic rows during development.
- Create a dedicated Google service account, grant it viewer access to the private spreadsheet, and use the Sheets API with the `spreadsheets.readonly` scope. Keep credentials and spreadsheet ID in `.env.local` for local use and Vercel environment settings for deployment; commit only an `.env.example` listing variable names, never secret values. Give previews a separate sheet or synthetic data.
- Add a `server-only` sheet adapter using a supported Google Sheets client. Fetch the named ranges, validate row shapes and references, filter `published` rows, and project only public fields into typed view models. Handle API failures without exposing raw rows. Do not add authentication, a database, Server Actions, or website write endpoints.

## 4. Ship workflows and verify

- Build the public overview, acts listing with optional filters, and schedule with event-local times. Show loading, empty, and unavailable states; there are no login or edit controls.
- Cache only the validated, public sheet view models. Verify that drafts and unpublished events stay hidden, edits appear within the agreed cache lifetime, and sheet errors cannot leak private fields.
- Add parsing/filtering tests and browser coverage for public views, failed sheet reads, mobile, and keyboard use. Run `npm run lint`, a TypeScript check (`npx tsc --noEmit`), tests once configured, and `npm run build`.
- Connect the repository to Vercel. Configure preview and production sheet access and secrets; test build-time access where caching requires it, published schedule freshness, and error reporting on a preview deployment before promoting production.

## Documentation while building

Follow the current [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components), and [AI agent](https://nextjs.org/docs/app/guides/ai-agents) guides, plus the version-matched docs shipped with the installed `next` package. Recheck commands and integration APIs when dependencies change.
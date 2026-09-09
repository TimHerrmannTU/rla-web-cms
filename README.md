# rla-web-cms

Payload CMS 3 / Next.js app that is becoming the single, unified content-management platform for
Rehwaldt Landschaftsarchitekten (RLA), consolidating data that today lives scattered across
several disjointed legacy systems (a WordPress intranet, a PHP public website, and a separate
time-tracking API). It is early-stage: most collections exist and an ETL pipeline pulls in real
legacy data, but this is not yet the system of record for anything — it's being built up
collection by collection.

See [CLAUDE.md](./CLAUDE.md) for the full architecture, consolidation plan, and the legacy systems
this project is absorbing data from.

## Stack

- [Payload CMS 3](https://payloadcms.com/) on [Next.js 16](https://nextjs.org/)
- **Postgres** via `@payloadcms/db-postgres` (not Mongo)
- Localization: `de` (default) / `en`, with fallback
- [Leaflet](https://leafletjs.com/) for the custom map/location field

## Local development

1. Copy the example environment file and fill in real values:

   ```sh
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string
   - `PAYLOAD_SECRET` — any random string
   - `WP_BASE_URL`, `LEGACY_DB_*` — only needed to run the ETL scripts (see below), not for
     general development

2. Install dependencies and start the dev server:

   ```sh
   pnpm install
   pnpm dev
   ```

3. Open `http://localhost:3000/admin` and follow the on-screen instructions to create your first
   admin user.

### Docker (optional)

`docker-compose.yml` spins up a local Postgres instance alongside the app for local development
(not the same thing as the standalone `Dockerfile`, which is a separate production-image build not
wired into this compose file):

```sh
docker compose up
```

Point `DATABASE_URL` in `.env` at `postgresql://payload:payload@postgres:5432/payload` (or
whatever `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` you set in `docker-compose.yml`) to use
it.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Standard Next.js dev/build/start |
| `pnpm generate:types` | Regenerates `src/payload-types.ts` from the collection configs — run after any collection/field change |
| `pnpm generate:importmap` | Regenerates Payload's admin import map |
| `pnpm lint` | ESLint |
| `pnpm test` | Runs both `test:int` (Vitest) and `test:e2e` (Playwright) |

## ETL pipeline

Legacy data (WordPress, MySQL) is migrated into Payload via scripts in `src/scripts/`, one folder
per source:

| Command | Source |
|---|---|
| `pnpm etl:employees` | WordPress `mitarbeiter` CPT + legacy WerkX MySQL HR data → `Employee` |
| `pnpm etl:news` | WordPress `news` CPT → `News` |
| `pnpm etl:werkx:projects` / `pnpm etl:werkx:contracts` | `rla-werkx-api`'s own exported project/contract data → `Projects` / Employee WerkX contracts |

See CLAUDE.md's "ETL pipeline" section for the full extract/transform/load shape these follow, and
issue tracking in this repo's GitHub issues for which collections still lack an ETL entirely.

## Collections

Users, Media, News, Awards, Publications (+ Publication Categories), Jobs, Employee, Office
Location, Mines (+ Mine Features), Themes, and Projects (+ Project Phases / Partials / Services /
Flags / Categories) — see CLAUDE.md for what each one models and the legacy system it's replacing.

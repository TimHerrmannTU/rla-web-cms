# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`rla-web-cms` (package name `minescapes`) is a **Payload CMS 3.85 / Next.js 16** app whose end
goal is to become the single, unified content-management platform for Rehwaldt
Landschaftsarchitekten (RLA), consolidating data that today lives scattered across at least five
disjointed systems (see "The systems being consolidated" below). It is early-stage: most
collections exist and an ETL pipeline pulls in real legacy data, but this is not yet the system of
record for anything — it's being built up collection by collection.

**Target end-state**: one Payload instance, internally organized into platform-facing sections —
an *intranet* section, a *werkx* section, and a *website* section — rather than three separately
maintained systems. Concretely, each existing/legacy platform becomes a **consumer** reading from
this CMS instead of owning its own data:
- **Intranet** (today: WordPress `rla-core`/`rlaintra24`) — reads its content (projects, employees,
  competitions, building components, etc.) from Payload instead of WP CPTs/ACF.
- **WerkX** (today: `rla-werkx-api` + `werkx_dev`) — keeps owning hours/time-tracking data only (see
  "Three places project data lives today" below), but sources general project/employee metadata
  from Payload instead of duplicating it.
- **Website** (today: `website_rla/1_php_tim`) — reads a sanitized/filtered view of the same Payload
  records (already anticipated by the `active_in.web` flag on `Projects`) instead of its own `web`/
  `mine_data` MySQL databases.

The `active_in.{intranet,werkx,web}` flags already on `Projects` are early scaffolding for exactly
this — marking which of the three target sections a given record should surface in. Expect more
collections to grow similar per-section gating as they're absorbed. This consolidation is the whole
point of the project: replacing three platforms' worth of duplicated maintenance with one.

- Postgres via `@payloadcms/db-postgres` (not Mongo, despite the template's default README).
- Localization is on: `de` (default) / `en`, with fallback.
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- Custom admin group labels: `Minescapes` (Mines/MineFeatures) and `Projects` (Project* collections).
- A `point`-type location field (`src/fields/location.ts`, `src/fields/color.ts`) is rendered via
  a custom Leaflet map component (`src/components/cms/MapFieldLoader.tsx` → `MapField.tsx`,
  wrapped to avoid Next.js SSR issues — see `src/components/map/BaseMapLoader.tsx`).

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start` — standard Next.js scripts, all wrapped with
  `cross-env NODE_OPTIONS=--no-deprecation`.
- `pnpm generate:types` — regenerates `src/payload-types.ts` from the collection configs. Run this
  after any collection/field change; don't hand-edit `payload-types.ts`.
- `pnpm test:int` (Vitest) / `pnpm test:e2e` (Playwright) / `pnpm test` (both).
- `pnpm lint`.

## Collections (current state)

- **Users** — Payload auth.
- **Media** — uploads.
- **News** — bilingual name/content, thumbnail, array of external links. Has a `// TODO add
  relationship to project` — not yet wired.
- **Employee** (slug `employee`) — tabbed: General / Education / Contact / **WerkX** (HR/time-
  tracking fields: `slug` = legacy `kuerzel`, `color`, `entry`/`exit` dates, `sollHistory` array
  with weekday-weighted target-hour distribution, `vacationClaims`). List view hides former
  employees (`werkx.formerEmployee`) by default. This collection is the merge target for WordPress
  `mitarbeiter` CPT data + legacy WerkX MySQL HR data (see ETL below).
- **OfficeLocation** — name, `leader` (relationship → employee), localized content, address
  (`locationField`), contact group. Dresden/Berlin/Prag are the three known offices.
- **Mines** / **MineFeatures** (group "Minescapes") — post-mining landscape data (site type,
  status, extracted materials, surface-area breakdown, recreational features). Maps to the public
  site's `mine_data` MySQL DB (see `models/maps/mine.php` in the public-site repo) — not yet
  wired into the ETL pipeline (no `mine`-related script in `src/scripts`).
- **Projects** (`project`) + **ProjectPhases** / **ProjectPartials** / **ProjectServices** /
  **ProjectFlags** — deliberately modeled 1:1 on `rla-werkx-api`'s SQLAlchemy models (see commit
  `9ed6d38`), including the unresolved `ProjectService` vs `ProjectPartial` domain question that
  exists in that repo too (`ProjectFlags.linkedPartial`/`linkedService` both exist as relationships
  pending that decision). `Projects.id` is the legacy short code (`kuerzel`, e.g. `"AAC"`), kept as
  the primary key across every system for stability. `active_in.{intranet,werkx,web}` checkboxes
  track which downstream platform(s) a project should surface on — this is CMS-side gating, not
  present in the werkx-api source model.

Fields intentionally shared across collections: `src/fields/color.ts` (hex text field, used by
Employee/Project/ProjectFlags — mirrors legacy `farben` table), `src/fields/location.ts` (point +
address group with the map field, used by OfficeLocation/Projects).

## ETL pipeline (`src/scripts/`)

One folder per source, all built on shared `src/scripts/lib/` utilities (Payload client,
migration JSON read/write, a generic WordPress REST paginator, date parsing, a generic
upsert-by-query helper, office-relationship resolution, HTML→lexical conversion, remote-image→
Media creation). Run via `pnpm etl:*` scripts (see `package.json`) rather than invoking `tsx`
directly. Each source follows the same shape: `extract-*.ts` (standalone, network/DB → verbatim
`migration/<source>_raw.json`, run manually since it needs network access not every machine has)
→ `transform.ts` (pure, `*_raw.json` → `*_processed.json`) → optional `hydrate.ts` (enrich from a
second source) → `load.ts` (writes to Payload, takes the shared `payload` client as a param) →
optional `wipe.ts` → `run.ts` (orchestrates transform→[hydrate]→load; never calls `extract-*`).

- **`employee/`** — `pnpm etl:employees`. `extract-wp.ts` (`WP_BASE_URL` + `mitarbeiter` CPT) and
  `extract-sql.ts` (legacy `mitarbeiter` MySQL table, `LEGACY_DB_*`) populate `wp_raw.json`/
  `sql1_raw.json`. `run.ts` wipes all employees, then `transform.ts` → `wp_processed.json`,
  `hydrate.ts` enriches with the SQL data → `wp_hydrated.json`, `load.ts` upserts into `employee`.
  `migration/*.json` are real extracted snapshots (not fixtures, gitignored) — e.g.
  `wp_processed.json` carries `_migrationMetadata.legacyWpId`/`legacyKuerzel`/`legacyStandort` per
  employee for traceability, though that key isn't a real `Employee.ts` field so Payload silently
  drops it on write (pre-existing, not fixed).
- **`werkx/`** — `load-projects.ts` (`pnpm etl:werkx:projects`) and `load-contracts.ts`
  (`pnpm etl:werkx:contracts`) load `migration/werkx_projects.json` / `werkx_contracts.json` —
  project records keyed by legacy short code (`color`/`creationDate` from `projektgruppen`/
  `farben`) and per-employee WerkX contract data, respectively. Both are standalone (no shared
  `extract-*`/`run.ts` — the source JSON is produced by `rla-werkx-api`'s own ETL, not this repo's).
- **`news/`** — `pnpm etl:news`. Sourced **only** from the WordPress `news` CPT (`WP_BASE_URL` +
  `/news`) — never the `1_php_tim` sibling repo's `web` MySQL `aktuell` table. `extract.ts` →
  `news_raw.json`, `transform.ts` maps WP's ACF `bilder` (image gallery — only the first entry is
  used, News has just one `thumbnail` field today) and `externe_links` (→ `News.externalLinks`) →
  `news_processed.json`, `load.ts` resolves the thumbnail via WP's media endpoint, converts
  `content.rendered` HTML to lexical (`@payloadcms/richtext-lexical`'s `convertHTMLToLexical`),
  and upserts by the `News.wpId` field (added specifically for idempotent re-imports). No wipe
  step — re-running re-syncs WP-owned fields in place rather than wipe-and-reload.

Env vars: `DATABASE_URL` (Postgres), `PAYLOAD_SECRET`, `WP_BASE_URL` (e.g.
`http://webserver/intranet/wp-json/wp/v2`), `LEGACY_DB_HOST/USER/PASSWORD/NAME`.

### Diagnostic/audit scripts (`src/scripts/audit/`)

Not part of the extract/transform/load pattern above — one-off scripts that report on data-shape
problems without fixing anything, written against the shared `lib/` helpers. `compare-project-slugs.ts`
(`pnpm audit:project-slugs`) addresses [rla-intranet#76](https://github.com/TimHerrmannTU/rla-intranet/issues/76):
werkx's legacy `projektgruppen.kuerzel` and the WordPress intranet's `projekt` CPT `kurzel` ACF
field are two independently maintained project-code lists that have drifted apart. It fetches both
live (legacy MySQL + WP REST, excluding `WB*` Wettbewerbe codes from both sides) and writes a diff
report to `migration/project-slug-audit.json` — codes missing on either side, a `_SUFFIX`/trailing-
digit heuristic that flags likely werkx-side phase/Bauabschnitt splits (e.g. `GHB3`→`GHB`) rather
than genuine mismatches, and intranet posts whose WP slug disagrees with their own `kurzel` field
(mostly umlaut transliteration). A real run found 662 WP `projekt` posts vs. 562 werkx rows, 314
WP-only codes, 215 werkx-only codes (17 explained by the suffix heuristic), 16 internal slug
mismatches — confirming in concrete numbers what "Three places project data lives today" below
describes abstractly. Doesn't cover the issue's third source (local per-project documentation
folders on a network share) — no accessible path/convention was available when this was written.

## The systems being consolidated

This CMS's job is to become the one place these currently-separate systems all read from/write to.
Understand *why* a field or collection looks the way it does by knowing which legacy system it's
absorbing:

### Three places project data lives today — and their target end-state roles

There isn't one legacy "project" source to absorb — there are three, each scoped to a different
audience, and they should **not** converge into one undifferentiated blob:

1. **Legacy WerkX DB → sanitized/cleaned → served by `rla-werkx-api`'s FastAPI.** Scope is
   narrowly **hour-tracking/project-management**: phases, time budgets, logged hours — not general
   project metadata. **`rla-werkx-api` is not going away** — unlike the other legacy systems, it
   will keep existing specifically because storing/serving hours data is easier to manage within
   that ecosystem (SQLAlchemy + purpose-built time-tracking schema). What *is* changing: `rla-werkx-api`
   currently also owns general project data (name, color, location, status, etc., duplicated from
   elsewhere) — going forward, that non-hours project data should be **sourced from this Payload
   CMS** instead of independently owned there. Target shape: Payload is upstream/authoritative for
   project metadata, `rla-werkx-api` is downstream and stays authoritative only for hours/time data,
   referencing Payload's project records (by `kuerzel`) rather than duplicating their fields.
2. **WordPress intranet (`rla-core`/`rlaintra24`, see below).** The **richest, most in-depth**
   project data — implementation details, timelines, monetary values — for internal/employee
   consumption. This is the closest thing to a "full" project record today and the most likely
   candidate for what this CMS's `Projects` collection should grow to cover.
3. **Public website (`website_rla/1_php_tim`, see below).** A deliberately **sanitized subset**
   of project data, used to generate the public rehwaldt.de site — only what's safe/appropriate for
   public consumption. This maps naturally to the `active_in.web` gating already present on
   `Projects` here: the public site should end up reading a filtered view of the same Payload
   records, not a separately maintained dataset.

### 1. `rla-werkx-api` (sibling repo, `C:\Users\Tim Herrmann\Documents\github\rla-werkx-api`)
FastAPI + SQLAlchemy 2.0 + MySQL backend for time-tracking / project-management (projects,
employees, teams, logged hours, calendars/holidays) — this **is** the FastAPI service `werkx_dev`
proxies `/api/...` calls to (see #2), not a separate/parallel system. Owns its own ETL that migrates
a legacy MySQL schema ("werkx") into its new schema. This is the **direct model source** for this
CMS's Project* collections (see `9ed6d38`) and much of Employee's WerkX tab — but per the scoping
above, that's a starting point to converge *from*, not the long-term source of truth for anything
except hours. Key facts worth remembering:
- Legacy DB uses German names (`projektgruppen`, `stundentags`, `farben`, `teilobjekte`,
  `bes_leistungen`); several tables use legacy string codes as PKs directly (not surrogate IDs) —
  this CMS follows the same convention (`Projects.id`, `ProjectFlags.id` as text).
  `standort` → `location_id`, `kuerzel` → project `id`.
- `ProjectService` vs `ProjectPartial` is an open, unresolved domain question there too — don't
  "fix" it here independently; it needs one decision applied consistently across both repos.
- Its own ETL orchestrator (`migrate_all.py`) order: reset → seed locations/calendar → migrate
  holidays/employees/contracts → migrate projects → migrate logs → calc targets. Triggered via
  `POST /jobs/run-werkx-etl`, no scheduler wired up yet (intended to be an external daily cron).

### 2. `werkx_dev` intranet app (`Z:\website\intranet_rla\werkx_dev`)
The live-in-production controlling dashboard & time tracker (server-rendered PHP + Svelte 5
frontend, subdirectory-mounted behind Apache) — its `/api/...` calls hit `rla-werkx-api` (#1)
directly; they are the frontend/backend halves of the same system, not two separate ones. This app
runs a **dual-backend pattern mid-migration**:
- Legacy path (still used by most pages): PHP → `exec()`s a Python CLI
  (`server/py/web_db_routing.py`) that talks to a legacy MySQL DB selected by office/location
  (Dresden/Berlin/Prag — same three as this CMS's OfficeLocation seed data).
- New path: direct `/api/...` calls reverse-proxied to `rla-werkx-api` (external FastAPI service).
- **Both DBs are kept in sync by a nightly 04:00 ETL cron, legacy → new** — the legacy DB is also
  shared with a separate Tkinter desktop app not yet retired. Don't assume `rla-werkx-api`/this CMS
  can be a write-target for anything werkx-related until that's decommissioned.
- Auth is OIDC via Nextcloud; the authenticated user's `kuerzel` (matches `Employee.werkx.slug`
  here) is the cross-system identity key.

### 3. `intranet` — WordPress (`Z:\website\intranet`, theme `rlaintra24`, plugin `rla-core`)
The current internal knowledge-base/intranet CMS, built on custom post types defined via ACF Pro
(exported as Local JSON in the **theme** repo's `acf-json/`, not in `wp-content`). Its CPTs are a
map of what this Payload CMS eventually needs to absorb, one collection at a time:

| WP CPT slug | German label | Likely CMS destination |
|---|---|---|
| `mitarbeiter` | Mitarbeiter (employee) | `Employee` — already the primary ETL source (see `extract-wp.ts`) |
| `projekt` | Projekte | `Projects` — parallel source to werkx-api projects; `kuerzel` is the same key |
| `bauteil` | Bauteile (building components) | not yet modeled — sub-object of a project |
| `wettbewerb` | Wettbewerbe (competitions) | not yet modeled — overlaps `Project.status` competition states |
| `dokumentation` | Dokumente | not yet modeled |
| `materialien` | Materialien | not yet modeled |
| `pflanzung` | Pflanzungen (plantings) | not yet modeled |
| `planungsthema` | Planungsthemen | not yet modeled |
| `bauinfo` | Bauinfos | not yet modeled |
| `standort` | Standorte | overlaps `OfficeLocation`, needs reconciling (WP has its own, separate from werkx `standort`/office code) |
| `firma` | Firmen (companies) | not yet modeled — clients/partners |
| `news` | News | `News` collection, not yet linked to WP as a source |

Notable architectural facts from that stack (in case any of it needs replicating or reading from):
- A shared `category` taxonomy is overloaded per-CPT via a name-based (not ID-based) config —
  renaming a top-level term silently breaks the mapping. Not this repo's concern directly, but a
  sign of how brittle the current system is and part of the motivation for consolidating.
- `rla-core`'s REST endpoints (`custom/v1/projects`, `rla/v1/search`, etc.) are all
  `permission_callback => __return_true` — fully public/unauthenticated by design on that system.
  Don't assume that's an acceptable pattern to carry over here.
- A **second, legacy, non-WordPress** `web` MySQL database is bridged in read-only via
  `ProjectImageFetcher` (`data-interface/website-db-access.php`) for project images keyed by
  `kuerzel` — this is the *same* `web` DB the public website reads from (see #4).

### 4. `website_rla/1_php_tim` public website (`Z:\website\website_rla\1_php_tim`)
The public-facing rehwaldt.de site: plain PHP, models in `/models`, SQL isolated to
`db_queries.php` (never inline in views), reusable partials in `/components`. Its own
`models/project.php` `Project` class is a **third independent shape** for project data (German
column names: `kuerzel`, `fertigstellung`, `flaeche`, `auftraggeber`, `als_wettbewerb`,
`als_projekt`, `objektplanung`, `kategorie`, etc.) — reconciling this with `rla-werkx-api`'s and
WordPress's project shapes is exactly the kind of decision this CMS needs to make once it starts
serving the public site. Per that repo's own README, its data currently comes from **three
separate places**:
- `web` MySQL DB — project data (same DB WordPress's `rla-core` bridges into, see #3).
- `mine_data` MySQL DB — mine/post-mining-landscape data → this is the **direct source** this
  CMS's `Mines`/`MineFeatures` collections are modeled on (`models/maps/mine.php`'s `Mine` class
  fields line up closely: `surface_total_ha`/`surface_forest_ha`/etc. → `Mines.surface.*`,
  `operation_type` → `siteType`, `current_state` → `status`, `product_type` → `extractedMaterials`).
  Not yet wired into this CMS's ETL scripts.
- WordPress REST API of a *different* WP subdomain (`wien.rehwaldt.de/wp-json/wp/v2/station`) —
  trip/excursion data, not yet represented anywhere in this CMS.
- Also has its own `models/employee.php` (`EmployeeViewModel`) and `models/news.php` (`News`) —
  further independent shapes for data this CMS already models, useful as a field-naming cross-
  reference (e.g. its `vorname`/`nachname`/`beruf`/`kammer`/`quali`/`uni`/`bueroeintritt` vs. this
  CMS's `Employee` fields).

## Working across repos

When a collection here is meant to eventually replace or feed one of the systems above, check the
corresponding legacy model/schema for field names and constraints before inventing new ones —
three to four independently-evolved shapes already exist for "project" and "employee" data, and
the goal is to converge on one **Payload-authoritative** shape, not add a fifth. `kuerzel`/short-code
fields are the one identifier that's consistently stable across every system and worth preserving
as-is (already done for `Projects.id`, `Employee.werkx.slug`).

The one deliberate, permanent exception to "Payload becomes authoritative for everything": hours/
time-tracking data stays owned by `rla-werkx-api`'s purpose-built schema — don't design a
`Projects` field or collection here to duplicate or replace logged-hours/time-budget data, only to
reference it (e.g. by `kuerzel`). Everything else project-related (general metadata, WordPress's
implementation/timeline/monetary detail, the public site's sanitized subset) is fair game to
converge into this CMS.

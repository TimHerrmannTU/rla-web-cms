# TODO

Working order for the open GitHub issues (`TimHerrmannTU/rla-web-cms`), sorted by preferred
implementation sequence. Each entry keeps the original issue as a starting point but corrects it
against what's actually in the legacy repos (`1_php_tim`, `rla-core`/`rlaintra24`, `rla-werkx-api`)
where the issue's author (an external agent, per Tim) had less context than a full read of those
repos gives. Don't treat the original issue bodies as ground truth — the corrections below are.

## Phase 1 — Finish the `Projects` collection (the backbone everything else hangs off)

### 1. #9 chore: confirm standorte & projektkategorien coverage
**Mostly resolved by investigation — narrow the scope.** Legacy `website_rla/1_php_tim` queries
(`utils/global/db.php`) confirm two distinct tables:
- `standorte` (office locations, `position`-ordered, small list) — **already covered**, this is
  the existing `OfficeLocation` collection (Dresden/Berlin/Prag). No new collection needed.
- `projektkategorien` (project categories, fetched via `getProjectCats()`) — **not yet covered**.
  `Projects` currently has no category/taxonomy field at all. This is real, small, remaining work —
  fold it into #2 below rather than treating it as its own issue.

### 2. #7 feat: implement flow/gallery field for projects, themes, and news
**Confirmed accurate, well-scoped already — build this first**, since Projects/Themen/News all
need it and it's cheaper to build once as a shared field than bolt onto each collection
separately. Read `1_php_tim/models/flow.php` myself: the pipe-delimited column parses each entry's
last token by a one-letter type prefix — `a` = news ref, `t` = text block, `f` = topic/thema ref,
no prefix = image — plus a leading size/css token (`one2`/`two3`/`full`/etc.) per entry. Matches
the issue's proposed Blocks design (Image/Text/NewsRef/TopicRef + `size` select) exactly.

### 3. #8 feat: add similar-projects relationship
**Confirmed accurate, trivial.** Legacy table is `aehnliche_projekte` with two columns
(`projekt1`, `projekt2`) — a plain many-to-many junction, symmetric (queried both directions in
`getSimilarProjects()`). A self-relationship field on `Projects` is a direct fit.

### 4. #2 feat: create projects post type
**Confirmed accurate and still the biggest single item.** "Already partially migrated, missing
ACF fields from intranet + fields from website" is correct — concretely, from `1_php_tim/models/project.php`:
`motto`, `desc_short`, derived `type` (competition/object/concept from three legacy booleans
`als_wettbewerb`/`als_projekt`/`objektplanung`), `cats` (→ `projektkategorien`, see #9), competition
results (`place`/`purchased`/`wip`/year), `client`, `architect`, `planningPartners`, `area`,
external `links`. The **intranet (WordPress) side is the deepest one** — `rla-core`'s
`ProjectViewModel` (theme repo `rlaintra24/includes/models/projekt/`, not yet read in detail —
that's the theme repo, a separate checkout from `rla-core`) composes `ProjectLocation`,
`ProjectFinance`, `ProjectHistory`, `ProjectClient`, `ProjectTeam`, `ProjectDocumentation`,
`ProjectSections` — implementation details, timelines, monetary values per the consolidation notes
in `CLAUDE.md`. Worth a follow-up read of that theme repo before finalizing field names. Depends on
#7 (flow field) and #8 (similar projects) being done first so this issue can absorb them rather than
duplicate the work.

## Phase 2 — Round out the other content collections (same News/Projects pattern)

### 5. #1 feat: create news post type
**Correction: this already exists**, not a from-scratch build. `src/collections/News.ts` is fully
implemented (bilingual name/content, thumbnail, external links array) and registered in
`payload.config.ts`. Real remaining scope: wire an ETL source (WordPress `news` CPT is one
candidate, the public site's `aktuell` table — via `getNews()` in `1_php_tim/utils/global/db.php`
— is another and looks like the more direct legacy source given `models/news.php` already models
`index`/`name`/`content`/`datum`/`links`/`bild` closely matching the Payload fields) and resolve
the code's own `// TODO add relationship to project`.

### 6. #5 feat: add themes / themen post type
**Confirmed real and distinct — but flag a possible duplicate.** Legacy `themen` table confirmed
(`getTopics()` in `db.php`), consumed by the Flow field's `f`-prefixed topic references (see #7).
Before modeling: check whether this is the *same* concept as WordPress intranet's `planungsthema`
CPT (`rla-core`, "Planungsthemen") or a genuinely separate one — the naming is suspiciously close
and modeling it twice would work against the whole point of consolidating. Depends on #7 (flow
field, since `themen.php` itself renders as a Flow of its own).

### 7. #3 feat: add awards / auszeichnungen post type
**Confirmed accurate.** Legacy table `auszeichnungen`, model already reverse-engineered in
`1_php_tim/models/award.php`: `name`, `inhalt` (content), `auslober` (issuer), `links`, `bild`,
`jahr` (sort key). Independent of everything else — safe to do any time, ordered here mainly
because it's simple.

### 8. #4 feat: add publications / publikationen post type
**Confirmed accurate.** Legacy `publikationen` + `publikationskategorien` taxonomy, model in
`1_php_tim/models/publication.php`: `name`/`buch`, `untertitel`, `zeitschrift`, `autor`, `hrsg`
(editor), `verlag` (publisher), `jahr`, `seiten`, `bild`, `datei` (PDF link), `projekte`
(relationship, pipe-delimited legacy side), `url`. Slightly more work than Awards because of the
taxonomy + project relationship.

### 9. #6 feat: add jobs / stellen post type
**Confirmed accurate, and the simplest item on this list.** Legacy `jobs` table, consumed by
`karriere.php` — just localized `name`/`inhalt`, ordered by `datum`. No relationships, no media.
Good quick win, but sequenced last in this phase since it's fully independent and low-value to
front-load.

## Phase 3 — Cross-cutting platform decisions (need real content to reason about first)

### 10. #11 chore: decide public-site rendering approach
**Confirmed accurate, still open.** One data point worth surfacing for whoever decides: `1_php_tim`
already has extensively reverse-engineered, working view-model logic for nearly every content type
this CMS models (`project.php`, `news.php`, `award.php`, `publication.php`, `flow.php`, ...) — that's
a real head start if the decision leans toward pointing `1_php_tim` at Payload's API rather than
building a new Next.js frontend from scratch. Not overriding the "decide" framing of the issue,
just flagging the evidence.

### 11. #10 chore: decide search strategy
**Confirmed accurate.** Deliberately last-but-one — not worth deciding Postgres full-text vs.
Algolia/Meilisearch vs. a Payload plugin until there's enough real content across the Phase 1/2
collections to evaluate against.

## Phase 4 — Go-live

### 12. #12 chore: plan production cutover
**Confirmed accurate, with one correction.** The issue's "legacy MySQL/PHP stack (`3_frontend_tim`,
`1_php`)" is actually **two separate legacy apps**, not one: `1_php` (`Z:\website\website_rla\1_php`)
is the currently-live **public site**; `3_frontend_tim`/`3_frontend` (`eingabe.php` = "data entry")
is a separate **admin/data-entry backend** with its own git repo and `CLAUDE.md` — both read/write
the same `web`/`mine_data` MySQL databases. Cutover planning needs to account for retiring both
apps, not just the public-facing one. Last on purpose — everything above needs to exist and be
stable in Payload before a cutover plan is actionable.

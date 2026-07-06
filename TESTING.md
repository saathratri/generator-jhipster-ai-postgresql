# Testing & Debugging Guide — generator-jhipster-ai-postgresql

How to test and debug this blueprint at every layer: the generator's own unit tests, and the
**generated application's** backend (unit + PostgreSQL/pgvector-Testcontainer integration tests) and
frontend (ESLint + Vitest).

This is the **SQL / pgvector** blueprint (human-readable foreign keys + AI semantic search). It uses
standard JHipster single (non-composite) primary keys, so its generated tests mostly match base
JHipster — debugging here is usually about the blueprint's _additions_ (extra display FKs, vector
search, the entity-client writing it replaces).

> **Companion doc:** `generator-jhipster-cassandra/TESTING.md` — the Cassandra blueprint. Identical
> workflow, but it has composite primary keys + a heavily customized Angular client, so its guide has a
> much deeper catalogue of backend/frontend bug patterns. **Read it too** — most techniques transfer.

---

## 0. The one rule: **fix templates, not generated code**

The generated sample app is **disposable** — every regeneration overwrites it. Find the bug by running
the generated app's tests; fix the **`.ejs` template** (or `generator.js`) that produced the bad code;
regenerate; repeat. Never hand-edit (or `eslint --fix`) the generated `*.ts`/`*.java` as a "fix" — it
reverts on the next regen. (`eslint --fix` on the generated app is fine as a **diagnostic** to discover
what to change, then port to the template — see the cassandra guide §6.4.)

Templates live under `generators/*/templates/**` and `generators/*/entity-templates/**`; which files get
written is decided in each `generators/*/generator.js` `writeFiles({ templates: [...] })` block. Key
sub-generators: `sql-spring-boot` (backend pom/server), `sql-angular` (Angular client + the
`entity-navbar-items.ts` write), `angular` (overrides base).

---

## 1. Environment (once)

Behind a TLS-intercepting proxy, point the toolchains at the OS trust store (Node 22+):

```bash
export NODE_OPTIONS=--use-system-ca                              # npm / ng / eslint / vitest
export MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"  # Windows; macOS: KeychainStore
```

Integration tests need **Docker** (Testcontainers starts a real PostgreSQL with the pgvector extension).
Embedding generation/AI search need `OPENAI_API_KEY` at _runtime_ — **not** for tests (the app runs and
tests pass without it; AI search is simply disabled).

---

## 2. Generate a throwaway sample app

```bash
mkdir -p /tmp/aipg-sample && cd /tmp/aipg-sample
NODE_OPTIONS=--use-system-ca node "$REPO/cli/cli.cjs" \
  generate-sample sample --skip-jhipster-dependencies --skip-install --force
```

`$REPO` = this repo's path. The bundled sample (`.blueprint/generate-sample/templates/samples/sample.jdl`)
generates `Blog`, `Post`, `Tag` (monolith) with the blueprint's human-readable-FK and vector fields.

**The tight loop:**

```bash
cd /tmp/aipg-sample && git checkout -- . && git clean -fdq src
node "$REPO/cli/cli.cjs" generate-sample sample --skip-jhipster-dependencies --skip-install --force
# ...run the relevant test layer and grep.
```

---

## 3. Layer 1 — generator unit tests (run in `$REPO`)

```bash
NODE_OPTIONS=--use-system-ca npm test     # prettier-check + eslint + vitest
```

Expected: `0 problems`, **9 test files / 9 tests passed**. These are Vitest snapshot specs
(`generators/*/generator.spec.js` + `__snapshots__/`). If you add/remove a generated file, update with
`npx vitest run -u` and inspect `git diff generators/*/__snapshots__/` (e.g. adding
`entity-navbar-items.ts` legitimately added one line to the `sql-angular`/`app`/`angular` snapshots).
Prettier-check covers `.js/.md/.json/.yml` (not `.ejs`); fix with `npx prettier --write <file>`.

---

## 4. Layer 2 — generated **backend** (Java)

From the sample dir:

```bash
./mvnw -ntp -DskipTests -Dskip.npm package    # compile only (no DB/Docker)
./mvnw -ntp -Dskip.npm verify                 # unit + IT (Docker; PostgreSQL/pgvector Testcontainer)
```

A green run is **163 tests** (Account/User/Authority + Blog/Post/Tag `*ResourceIT` + service/security ITs).

> Grep, don't dump: `grep -iE "Tests run:.*Failures|<<< (FAILURE|ERROR)|expected:|but was:|BUILD"`.
> Note: `MailServiceIT` logs `MessagingException: ... SMTP ... 421` — that's an **expected** logged failure
> path; those tests still pass. Don't chase it.

Because PKs are standard single keys, backend ITs here generally behave like base JHipster. If one fails,
check the blueprint's _additions_ (extra display-FK columns, pgvector column type, the `@Lob`→`vector`
Liquibase patch) rather than core CRUD routing.

---

## 5. Layer 3 — generated **frontend** (Angular)

```bash
NODE_OPTIONS=--use-system-ca npm install     # once (slow; needs proxy CA)
NODE_OPTIONS=--use-system-ca npm test        # = pretest (eslint .) THEN ng test (Vitest)
```

A green run is `eslint` → 0 problems and Vitest → **~81 files / 404 tests passed**.

Two facts (same as cassandra): `npm test` runs **`eslint .` first** (lint failure ⇒ Vitest never runs),
and the lint gate **fails only on errors, not warnings** (`lint` = `eslint .`, no `--max-warnings`).

Sub-commands: `npx ng test --coverage` (Vitest only, bypass lint), `npx eslint .`, `npx eslint . --fix`.

### 5.1 Frontend bugs we hit here

**`TS2307: Cannot find module 'app/entities/entity-navbar-items'`** (imported by `navbar.ts`). Cause: this
blueprint **replaces base JHipster's entity-client writing**, which is what normally emits
`app/entities/entity-navbar-items.ts`. Fix: have `sql-angular`'s `WRITING_ENTITIES` emit the aggregate
file from the filtered client entities (base shape:
`{ name: entityNameHumanized, route: entityPage, translationKey: entityTranslationKeyMenuPath }`). Once it
exists, `EntityNavbarItems` is correctly typed and the lone `navbar.ts` lint error (`no-unsafe-return`)
also disappears.

**`@typescript-eslint/member-ordering: Member loadMicrofrontendsEntities should be declared before all
private instance method definitions`** (gateway with microfrontends only). Cause: `sql-angular/generator.js`'s
gateway-side `editFile` was inserting the `sortNavbarItemsAlphabetically` helper _immediately before_ the
public `loadMicrofrontendsEntities` method, placing a private method between two public ones. Fix: insert
AFTER `loadMicrofrontendsEntities` — anchor on the class's closing `\n}` at end-of-file and prepend the
helper there. TypeScript method lookup is `this`-relative so the declaration order doesn't matter at
runtime; only the lint rule cares. The same fix lives in the cassandra blueprint's
`cassandra-angular/generator.js` for the same reason.

**`TS2345: Argument of type 'Observable<{ id: number }[]>' is not assignable to … 'Observable<ITag[]>'`**
(any entity with a **UUID/String** primary key). The whole webapp bundle build fails (so `npm test` never
reaches Vitest) — first seen on `Tag` in the psqlblog remote. Cause: the AI-search component/service spec
patches in `sql-angular/generator.js` hardcoded a **numeric** mock result row (`const aiResults = [{ id: 19931 }]`
/ `{ id: 123 }`). For a UUID/String PK `I<Entity>.id` is `string`, so `{ id: number }` isn't assignable. Fix:
derive an `idLiteral` from the entity primary-key type — `19931` for Long/Integer, a quoted UUID
(`'9fec3727-…'`) for UUID/String — and interpolate it into both the list-spec (`should perform AI search`)
and service-spec (`should perform an AI search`) mocks. Numeric-PK samples (the bundled `sample.jdl`) are
unchanged, so Layer-1 snapshots stay green.

If you hit a _larger_ frontend cleanup (lint modernization, spec rewrites), the cassandra guide §5–6 has
the full playbook (`prefer-inject`, `@if`/`@for` control-flow, `inject()` + member-ordering ordering,
mapping generated-line→template, the `eslint --fix` discovery trick, etc.).

### 5.2 Generated E2E (Cypress)

Generated apps ship the upstream JHipster Cypress suite under `src/test/javascript/cypress/`. This
blueprint does **not** fork those templates — `generators/cypress/generator.js` post-processes them
via `editFile`. Passes:

| Phase                   | Patch                                                                                                                                                                                              | Purpose                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST_WRITING`          | Rewrite `entityItemSelector` in `cypress/support/commands.ts` from `'[data-cy="entity"]'` to `'[data-cy="<baseName>Menu"]'`.                                                                       | The `sql-angular` navbar restructures the upstream single flat dropdown into one per microfrontend. Upstream's `clickOnEntityMenuItem` would otherwise miss the dropdown.                         |
| `POST_WRITING`          | Rewrite `cy.get(navbarSelector).find(entityItemSelector).find(\`.dropdown-item[…]\`)…`in`cypress/support/navbar.ts`to drop the intermediate`.find(entityItemSelector)`and add`{ timeout: 30000 }`. | sql-angular renders dropdown items in a sibling `<ul ngbDropdownMenu>` (not as children of the toggle). The 30s timeout accommodates module-federation cold load.                                 |
| `POST_WRITING_ENTITIES` | Append `cy.get(\`[data-cy="<rel>"]\`).find('option:selected').invoke('text').should('match', /\S/)`after each`.select(1)` on a required relationship.                                              | Exercises the blueprint's headline feature — foreign keys rendered as human-readable labels (related entity's name, etc.) rather than raw UUIDs. A regression that blanks the FK label is caught. |
| `POST_WRITING_ENTITIES` | Bump `cy.wait('@entitiesRequest')` to `{ timeout: 30000 }` and widen the intercept glob.                                                                                                           | Lazy-loaded microfrontend routes only fire their list GET after module-federation registers the remote; the upstream glob also misses the pagination endpoint.                                    |

Upstream already fills FK `<select>`s (single `data-cy`, normal single-`id` PK), so single-key entities
need no further patches — no composite keys, no delete-URL surprises. The no-op `template-file-cypress`
stub the scaffold used to emit was removed.

**No widget components.** This blueprint does not ship the custom MAP/SET/date-time Angular widgets the
Cassandra blueprint does, so there is no widget-level test harness here. For the per-widget data-cy hook
catalogue (Add row / per-row / dialog), per-widget round-trip tests, edit-dialog and delete-row test
generation, see [`generator-jhipster-cassandra/TESTING.md §5.2`](https://github.com/amarpatel-xx/generator-jhipster-cassandra/blob/main/TESTING.md#52-generated-e2e-cypress).

**Run the generated Cypress tests** from a generated app dir. Cypress drives a **running** app, so Postgres
and Keycloak must be up first (e.g. `docker compose` the app's `src/main/docker` services):

```bash
NODE_OPTIONS=--use-system-ca npm install        # once
npm run e2e:devserver   # self-contained: starts backend + frontend, waits, runs cypress
npm run e2e             # cypress run (headed) against an already-running app
npm run cypress         # interactive runner (cypress open)
```

**Verify after a regen:** the entity-bearing app must enable Cypress (`testFrameworks [cypress]` in its JDL
`config` block — by default the gateway/sample may be the only app that does). In an entity with a required
relationship, `<entity>.cy.ts`'s create test has the `option:selected … should('match', /\S/)` line right
after the `.select(1)`.

---

## 5.3 Vector / AI-search test coverage (Saathratri)

The blueprint generates an embedding stack (pgvector columns, `EmbeddingService`, `findSimilarBy*`
repository queries, `/api/<entities>/ai-search` + `/vector-search/<field>[/threshold]` endpoints, and an
AI-search bar on the list page). That code is now exercised by generated tests, so the bundled
`sample.jdl` gives `Tag` a vector field (`@customAnnotation("VECTOR") @customAnnotation("1536")
nameEmbedding Blob`) and turns on `dto * with mapstruct` + `service * with serviceImpl` (the
vector-search endpoints + forked `ResourceIT` are only emitted for dto-mapstruct + serviceImpl entities —
without that, base JHipster writes plain CRUD that cannot handle the `float[]` vector field).

| Layer             | What's covered                                                                                                                                                                                                                                                                                                                                                                    | Where (template)                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Backend unit      | `EmbeddingService`: generate / null-guards / disabled-model / byte + pgvector-string round-trips. `EmbeddingModel` is **mocked** (deterministic vector) so it runs with no `OPENAI_API_KEY`.                                                                                                                                                                                      | `sql-spring-boot/.../service/embedding/EmbeddingServiceTest.java.ejs` (written in the `hasVectorFieldsSaathratri` block) |
| Backend IT        | Per vector field: `POST /vector-search/<field>` returns the identical row (cosine distance 0) and `/threshold` includes (maxDistance 1.0) / excludes (maxDistance 0.0) it. Plus `/ai-search` (with a `@MockitoBean EmbeddingModel`) returns the semantic match, and blank-query → empty. Vector fields are excluded from `fieldsToTest` so the standard CRUD asserts ignore them. | `sql-spring-boot/.../web/rest/_entityClass_ResourceIT.java.ejs`                                                          |
| Frontend (Vitest) | `performAiSearch` populates results + sets the active/loading signals; `toggleAiSearchField`; `clearAiSearch` reloads; service `aiSearch()` issues the GET with `query`/`limit`/`fields`. `faSearch` is registered in the spec's icon library so the load/sort tests don't trip on the AI-search bar.                                                                             | `sql-angular/generator.js` `POST_WRITING_ENTITIES` (`editFile` on the base list + service specs)                         |
| E2E (Cypress)     | `should run an AI semantic search` — types in `[data-cy="aiSearchInput"]`, clicks `[data-cy="aiSearchButton"]`, asserts the `/ai-search` request returns 200. Needs the running stack (backend + Postgres + Keycloak); returns an empty 200 without `OPENAI_API_KEY`, which still verifies the wiring.                                                                            | `cypress/generator.js` `POST_WRITING_ENTITIES` (vector-gated) + `data-cy` hooks in the `sql-angular` list HTML           |

A green `./mvnw -ntp -Dskip.npm -Dtest=EmbeddingServiceTest -Dit.test=TagResourceIT verify` is the fast
inner loop for the backend additions; `npx ng test` covers the frontend ones.

**Two gotchas the AI-search E2E hit (both fixed in `cypress/generator.js`):**

- **Microfrontend nav.** The injected `should run an AI semantic search` test navigates via
  `cy.clickOnEntityMenuItem(...)`. On a microfrontend **remote** the entity route is prefixed with the
  microservice name (`psqlblog/tag`), so passing the bare `entityFileName` (`tag`) makes Cypress hunt for
  `.dropdown-item[href="/tag"]`, which never exists — the test times out at 30s while the standard CRUD
  tests (which use the prefixed arg) pass. Fix: reuse the argument already present in the spec —
  `content.match(/cy\.clickOnEntityMenuItem\('([^']+)'\)/)` — so the AI test navigates identically to the
  CRUD tests (MF prefix on a remote, bare name on a monolith).
- **Infra ordering (example harness, not the generator).** The AI-search E2E only passes once the gateway
  has a live route to the remote, which requires the JHipster Registry to be up — and the Registry does
  eager OIDC discovery against Keycloak at boot, so it **exits(1)** if Keycloak isn't serving yet. The
  `jhipster-ai-postgresql-example` `saathratri-run-all-tests.sh` therefore gates Keycloak's OIDC endpoint → starts the
  Registry → gates `:8761` **before** launching backends. A dead Registry surfaces as every entity request
  returning `404 "No static resource services/<app>/api/<entities>"` — that string means "no gateway route",
  not "missing controller".

### 5.4 `@Type(PgVectorType.class)` on entities — patched in saathratri's prepare phase, NOT here

Hibernate 7's built-in `float[]` mapping (`FloatPrimitiveArrayJavaType` + `ArrayJdbcType`) reads
pgvector columns as PostgreSQL arrays, which fails at runtime with
`PSQLException: No results were returned by the query` — but only once rows contain **non-null**
vectors, so a freshly generated app boots fine and blows up on the first restart after embeddings
are populated. The fix is `@Type(PgVectorType.class)` on every vector entity field.

**This blueprint cannot emit that annotation itself.** The entity `@Column` block is rendered by the
base `generator-jhipster` `jakarta_persistence` fragment template, and fragment templates / SBS
overrides don't reach composed generators (the saathratri regen runs this blueprint composed under
`generator-jhipster-orchestrator`). The `.jhi.pgvector_type.ejs` and `.jhi.jakarta_persistence.ejs`
copies under `sql-spring-boot/**/templates/` are **reference-only** — they are never merged.

The **authoritative** fix lives in the saathratri repo:
`saathratri-generator-patch-jakarta-persistence.js`, invoked by **both**
`saathratri-generator-code-prepare.sh` and `saathratri-generator-code-prepare.bat`, patches the base
JHipster template in the global npm install before generation (idempotent; exits 1 if the upstream
markers move). History: the 2026-06-27 regen ran the `.bat` before it had the patch, silently
dropped `@Type` from all 15 maintenance-service entities, and prod crash-looped on 2026-07-05.
If regenerated entities ever lack `@Type(PgVectorType.class)` on `float[]` fields, check that
prepare script ran — don't hunt in this repo's templates.

## 6. Quick reference

```bash
# ----- in the generator repo ($REPO) -----
NODE_OPTIONS=--use-system-ca npm test                      # generator unit tests
NODE_OPTIONS=--use-system-ca npx vitest run -u             # update snapshots after intended changes

# ----- generate the sample (loop after each template edit) -----
cd /tmp/aipg-sample && git checkout -- . && git clean -fdq src
NODE_OPTIONS=--use-system-ca node "$REPO/cli/cli.cjs" generate-sample sample --skip-jhipster-dependencies --skip-install --force

# ----- generated backend (from /tmp/aipg-sample) -----
MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT" ./mvnw -ntp -DskipTests -Dskip.npm package
MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT" ./mvnw -ntp -Dskip.npm verify   # +pgvector Testcontainer

# ----- generated frontend (from /tmp/aipg-sample) -----
NODE_OPTIONS=--use-system-ca npm install                   # once
NODE_OPTIONS=--use-system-ca npm test                      # eslint pretest + vitest (the real gate)
NODE_OPTIONS=--use-system-ca npx ng test --coverage        # vitest only

# ----- generated E2E (Cypress; from a generated app — needs the full stack running) -----
NODE_OPTIONS=--use-system-ca npm run e2e:devserver         # starts backend + frontend, waits, runs cypress
NODE_OPTIONS=--use-system-ca npm run e2e                   # cypress run against an already-running app
```

CI: `.github/workflows/generator.yml` runs Layer 1; `.github/workflows/samples.yml` generates a sample and
runs `./mvnw -Dskip.npm verify` (Layer 2) on a Docker-enabled runner.

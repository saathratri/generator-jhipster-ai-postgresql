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

### 5.1 The one frontend bug we hit here

`ng test` / `ng build` failed to compile: **`TS2307: Cannot find module 'app/entities/entity-navbar-items'`**
(imported by `navbar.ts`). Cause: this blueprint **replaces base JHipster's entity-client writing**, which
is what normally emits `app/entities/entity-navbar-items.ts`. Fix: have `sql-angular`'s `WRITING_ENTITIES`
emit the aggregate file from the filtered client entities (base shape:
`{ name: entityNameHumanized, route: entityPage, translationKey: entityTranslationKeyMenuPath }`). Once it
exists, `EntityNavbarItems` is correctly typed and the lone `navbar.ts` lint error (`no-unsafe-return`)
also disappears. That single missing file was the whole frontend gap — after it, `npm test` was green.

If you hit a _larger_ frontend cleanup (lint modernization, spec rewrites), the cassandra guide §5–6 has
the full playbook (`prefer-inject`, `@if`/`@for` control-flow, `inject()` + member-ordering ordering,
mapping generated-line→template, the `eslint --fix` discovery trick, etc.).

---

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
```

CI: `.github/workflows/generator.yml` runs Layer 1; `.github/workflows/samples.yml` generates a sample and
runs `./mvnw -Dskip.npm verify` (Layer 2) on a Docker-enabled runner.

# Contributing to generator-jhipster-ai-postgresql

Thanks for your interest in improving this JHipster blueprint! It adds **human-readable
foreign-key display fields** and **AI semantic search** (PostgreSQL `pgvector` + Spring AI
embeddings) to JHipster 9.

## The golden rule: fix templates, not generated code

This is a code generator. The app it produces is **disposable** — every regeneration
overwrites it. So never "fix" a bug by editing the generated `*.java` / `*.ts`; find the
bug by running the generated app's tests, then fix the **`.ejs` template** (or
`generator.js`) that produced the bad code, and regenerate. Templates live under
`generators/*/templates/**` and `generators/*/entity-templates/**`.

## Testing

**Before opening a PR, please read [`TESTING.md`](TESTING.md).** It is the full runbook for
testing and debugging this blueprint at every layer:

- **Generator unit tests** (`npm test` in this repo) — Prettier check, ESLint, and Vitest
  snapshot specs.
- **Generated backend** — `./mvnw -Dskip.npm verify` in a generated sample, with a
  **PostgreSQL + pgvector Testcontainer** (Docker required); includes the entity REST CRUD
  `*IT` suite. `OPENAI_API_KEY` is **not** needed for tests (only at runtime for embedding
  generation / AI search).
- **Generated frontend** — `npm test` in a generated sample (`eslint .` pretest, then
  Vitest).

`TESTING.md` also documents the **generate-sample tight loop** and the blueprint-specific
bug patterns (extra display-FK columns, pgvector columns, the entity-client writing). For a
deeper backend/frontend bug catalogue, see the companion
[`generator-jhipster-cassandra/TESTING.md`](https://github.com/amarpatel-xx/generator-jhipster-cassandra/blob/main/TESTING.md)
— most techniques transfer.

## Prerequisites

- Node.js 22+
- Java 21 and Docker Desktop (for the generated-app backend/integration tests)
- JHipster 9.1.0

Behind a TLS-intercepting proxy, point the toolchains at the OS trust store:
`export NODE_OPTIONS=--use-system-ca` and
`export MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"` (macOS: `KeychainStore`).

## Workflow

1. Fork the repo and create a topic branch.
2. Make your change **in the templates / generator code**.
3. Run `npm test` (generator unit tests). If you intentionally changed generated output,
   update snapshots with `npx vitest run -u` and review the diff.
4. Generate a sample app and run the affected layer (backend `verify` and/or frontend
   `npm test`) per [`TESTING.md`](TESTING.md) to confirm the generated code is green.
5. Open a PR describing the change and how you verified it.

CI mirrors this: `.github/workflows/generator.yml` runs the generator unit tests, and
`.github/workflows/samples.yml` generates a sample and runs `./mvnw -Dskip.npm verify`.

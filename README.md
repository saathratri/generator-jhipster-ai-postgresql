# generator-jhipster-multiple-human-readable-foreign-key-fields

> JHipster blueprint, multiple-human-readable-foreign-key-fields blueprint for JHipster.

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

Imagine an application where an Order entity references a Product. Instead of displaying only the productId in the Order interface, you can use this generator to display productName and productCategory, making it more user-friendly.

The generator-jhipster-multiple-human-readable-foreign-key-fields is an open-source JHipster blueprint designed to enhance the default behavior of JHipster entities by allowing multiple human-readable foreign key fields to be used when referencing related entities.

This generator addresses the need to display meaningful and descriptive fields from related entities, rather than just relying on technical IDs (primary keys), which are often not user-friendly.

Key Features:

- Human-Readable Foreign Keys:
  Allows you to specify which fields from related entities should be displayed as part of foreign key references (e.g., instead of showing just userId, you can display firstName and lastName).
- Multiple Fields Support:
  Enables combining multiple fields (e.g., name and description) into a single foreign key reference for better readability.
- Seamless Integration:
  Works seamlessly with JHipster’s entity generation system without requiring extensive manual configurations.

Benefits:

- Improves UX by displaying meaningful information for foreign key relationships.
- Reduces manual effort in customizing relationships for better readability.
- Provides a reusable solution for handling multiple descriptive fields across entities.

## Improvements Since v2.0.12

The following improvements have been made since the last open-source tagged release (v2.0.12):

### pgvector / AI Semantic Search
- Added full **PostgreSQL pgvector** support for AI-powered semantic search on entity fields.
- **Automatic embedding generation** on create and update -- when an entity with vector fields is saved, embeddings are generated from source text fields (e.g., `name` -> `nameEmbedding`) using the OpenAI Embedding API.
- **AI semantic search bar** on list pages for entities with vector fields -- users can type natural language queries and find semantically similar records.
- Vector embedding fields are automatically excluded from DTOs to keep payloads clean, while remaining in JPA entities for database operations.
- **Cosine similarity search** with distance threshold (0.8) filters out unrelated results -- only semantically relevant matches are returned.
- **HNSW indexes** are automatically created on vector columns for fast approximate nearest neighbor search.
- Generates `EmbeddingConfiguration` with Spring AI 2.0.0-M3 and OpenAI embeddings (text-embedding-3-small, 1536 dimensions).
- `PgVectorConverter` with `autoApply=true` handles `float[]` <-> PostgreSQL `vector` serialization transparently.
- **Liquibase changelogs** are automatically patched to use `vector(1536)` column type instead of blob.
- JDBC URL includes `stringtype=unspecified` for seamless varchar-to-vector casting.
- **Automatic embedding migration on startup** -- similar to how Liquibase runs, embeddings are generated for any rows missing them.
- Angular UI shows vector fields as **readonly** on update forms and **truncates** long vector arrays (first 4 values + "...") on list and detail pages.
- Embedding fields are hidden from the create/update form input (readonly) since they are auto-generated.

#### AI Semantic Search Screenshots

Searching for **"camry"** returns Toyota (a car brand) and Cat (less relevant, ranked lower):

![Semantic Search - Camry](screenshots/Semantic%20Search%20-%20Camry.png)

Searching for **"cheetah"** returns Cat first (both are felines), then Dog and Toyota ranked by similarity:

![Semantic Search - Cheetah](screenshots/Semantic%20Search%20-%20Cheetah.png)

Searching for **"german shepherd"** returns Dog first (a dog breed), then Cat (also an animal), then Toyota (least similar):

![Semantic Search - German Shepherd](screenshots/Semantic%20Search%20-%20German%20Shepherd.png)

### PDF Blob Support
- Added **PDF thumbnail and download** support for `blobContentTypeAny` fields in list, detail, and update page templates.
- PDF icon styling matches across list and detail views with shadow and download link.
- Added null-safe `openFile()` for blob fields.

### Performance Optimizations
- Added **Entity Graph** backend repository support for eager-loading related entities in a single query, avoiding N+1 problems.
- Added a feature to ignore massive entity relationship lists on view and update pages, keeping the UI responsive and performant.
- Fixed `toDTO` mapping performance issues by preventing MapStruct infinite recursion on bidirectional relationships.
- Added a **non-paginated criteria endpoint** for cases where full result sets are needed without pagination overhead.

### UI and Template Improvements
- Added **navbar menu grouping and alphabetical sorting** for microfrontend entity menus.
- Simplified entity graph handling and REST resource templates.
- Added `ExceptionTranslator` patching to log full stack traces at ERROR level for better debugging.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

### AI Semantic Search (Optional)

For entities with vector fields (`@customAnnotation("VECTOR")`), the blueprint generates AI-powered semantic search. To enable it, set your OpenAI API key as an environment variable before running the application:

```console
export OPENAI_API_KEY=sk-your-key-here
```

Or add it to your microservice's `application-dev.yml`:

```yaml
openai:
  api-key: sk-your-key-here
```

Without the API key, the application runs normally but embedding generation and AI search are disabled.

# Installation

To install or update this blueprint:

```console
npm install -g generator-jhipster-multiple-human-readable-foreign-key-fields
```

# Usage

To use this blueprint, run the below command

```console
jhipster --blueprints multiple-human-readable-foreign-key-fields
```

You can look for updated multiple-human-readable-foreign-key-fields blueprint specific options by running

```console
jhipster app --blueprints multiple-human-readable-foreign-key-fields --help
```

And looking for `(blueprint option: multiple-human-readable-foreign-key-fields)` like

# Open Source Software - See the Code

☕️ Find the example code to run this blueprint/generator on GitHub:
[https://github.com/amarpatel-xx/jhipster-multiple-human-readable-foreign-key-fields-example](https://github.com/amarpatel-xx/jhipster-multiple-human-readable-foreign-key-fields-example)

☕️ Find the JHipster blueprint/generator code on GitHub:
[https://github.com/amarpatel-xx/generator-jhipster-multiple-human-readable-foreign-key-fields](https://github.com/amarpatel-xx/generator-jhipster-multiple-human-readable-foreign-key-fields)

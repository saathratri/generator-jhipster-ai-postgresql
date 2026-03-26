# generator-jhipster-ai-postgresql

> JHipster blueprint, ai-postgresql blueprint for JHipster.

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

Imagine an application where an Order entity references a Product. Instead of displaying only the productId in the Order interface, you can use this generator to display productName and productCategory, making it more user-friendly.

The generator-jhipster-ai-postgresql is an open-source JHipster blueprint designed to enhance the default behavior of JHipster entities by allowing multiple human-readable foreign key fields to be used when referencing related entities.

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
- Vector embedding fields are included in DTOs as `List<Float>` for frontend display, while stored as `float[]` in JPA entities.
- **Cosine similarity search** with distance threshold (0.8) filters out unrelated results -- only semantically relevant matches are returned.
- **HNSW indexes** are automatically created on vector columns for fast approximate nearest neighbor search.
- Generates `EmbeddingConfiguration` with Spring AI 2.0.0-M3 and OpenAI embeddings (text-embedding-3-small, 1536 dimensions).
- `PgVectorConverter` with `autoApply=true` handles `float[]` <-> PostgreSQL `vector` serialization transparently.
- **Liquibase changelogs** are automatically patched to use `vector(1536)` column type instead of blob.
- JDBC URL includes `stringtype=unspecified` for seamless varchar-to-vector casting.
- **Automatic embedding migration on startup** -- similar to how Liquibase runs, embeddings are generated for any rows missing them.
- Angular UI shows the first 3 embedding values with 5 decimal places on list and detail pages: `[0.01234, -0.06789, 0.12345, ...]`
- Update page shows the full vector with brackets in a readonly textarea.
- "Not generated" is displayed when embeddings have not been computed yet.
- **Checkbox field selection** on the AI search bar lets users choose which embedding fields to search (all checked by default).

#### JDL Configuration for Vector Fields

To enable AI semantic search on an entity, declare embedding fields as `Blob` with `@customAnnotation("VECTOR")` and `@customAnnotation("<dimensions>")` in your JDL:

```jdl
entity Tag {
  id UUID
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation("") name String maxlength(100) required
  description String maxlength(255)
  @customAnnotation("VECTOR") @customAnnotation("1536") nameEmbedding Blob
  @customAnnotation("VECTOR") @customAnnotation("1536") descriptionEmbedding Blob
}
```

**How the annotations work:**

- `@customAnnotation("VECTOR")` -- Marks the field as a pgvector embedding field. The blueprint converts it from `Blob` to `float[]`, generates the `vector(N)` column type in Liquibase, and adds the AI search infrastructure.
- `@customAnnotation("1536")` -- Specifies the vector dimension (1536 for OpenAI's `text-embedding-3-small` model).
- The embedding field name must follow the pattern `<sourceField>Embedding` (e.g., `nameEmbedding` derives from `name`, `descriptionEmbedding` derives from `description`). The blueprint auto-generates embeddings from the source field's text value on every create and update.
- The AI search bar queries **all** embedding fields in the entity, merges results, and deduplicates by ID -- so a match on either `name` or `description` will surface the entity.

#### Screenshots

**Blog Entity List View**

A saved Blog entity with Name, Handle, and human-readable Taj User foreign key reference.

![Blog Save](screenshots/Blog%20Save.png)

**Product Entity with Image Blob**

Product list showing inline image thumbnail preview for blob fields.

![Image Save](screenshots/Image%20Save.png)

**Post with Human-Friendly Foreign Key**

The Blog column displays "Elljay March 2026-@funvacay" instead of a raw UUID, combining multiple fields into a readable reference.

![Post Save - Human-friendly Foreign Key](screenshots/Post%20Save%20-%20Human-friendly%20Foreign%20Key.png)

**AI Semantic Search for "leopard" (name only)**

Searching name embeddings for "leopard" returns Cats, Dogs, Car, and Hiking ranked by semantic similarity. Embedding previews are shown in the table.

![Semantic Search - 1](screenshots/Semantic%20Search%20-%201.png)

**AI Semantic Search for "Boat" (description only)**

With only the "description" checkbox selected, the search is narrowed to description embeddings only, returning 3 results: Cats, Dogs, and Car.

![Semantic Search - 2](screenshots/Semantic%20Search%20-%202.png)

**AI Semantic Search for "Boat" (name only)**

The same query with only the "name" checkbox selected returns 4 results in a different relevance order, demonstrating how field selection impacts ranking.

![Semantic Search - 3](screenshots/Semantic%20Search%20-%203.png)

**AI Semantic Search for "Ferry" (name only)**

A more specific query searching name embeddings returns only 2 semantically relevant matches: Car and Hiking.

![Semantic Search - 4](screenshots/Semantic%20Search%20-%204.png)

**AI Semantic Search for "Meow" (name only)**

Searching name embeddings for "Meow" returns Cats, Dogs, and Car based on semantic associations.

![Semantic Search - 5](screenshots/Semantic%20Search%20-%205.png)

**AI Semantic Search for "Box" (description only)**

Searching only description embeddings returns a single precise match: Dogs ("All shapes and sizes").

![Semantic Search - 6](screenshots/Semantic%20Search%20-%206.png)

**AI Semantic Search for "Box" (name only)**

The same query searching name embeddings returns 3 matches: Car, Cats, and Dogs, showing how field selection impacts search breadth and ranking.

![Semantic Search - 7](screenshots/Semantic%20Search%20-%207.png)

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
npm install -g generator-jhipster-ai-postgresql
```

# Usage

To use this blueprint, run the below command

```console
jhipster --blueprints ai-postgresql
```

You can look for updated ai-postgresql blueprint specific options by running

```console
jhipster app --blueprints ai-postgresql --help
```

And looking for `(blueprint option: ai-postgresql)` like

# Open Source Software - See the Code

☕️ Find the example code to run this blueprint/generator on GitHub:
[https://github.com/amarpatel-xx/jhipster-ai-postgresql-example](https://github.com/amarpatel-xx/jhipster-ai-postgresql-example)

☕️ Find the JHipster blueprint/generator code on GitHub:
[https://github.com/amarpatel-xx/generator-jhipster-ai-postgresql](https://github.com/amarpatel-xx/generator-jhipster-ai-postgresql)

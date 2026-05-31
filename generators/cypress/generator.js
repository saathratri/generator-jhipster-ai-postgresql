import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configuringTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      async preparingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.asConfiguringEachEntityTaskGroup({
      async configuringEachEntityTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.asLoadingEntitiesTaskGroup({
      async loadingEntitiesTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      async preparingEachEntityTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      async preparingEachEntityFieldTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      async preparingEachEntityRelationshipTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.asPostPreparingEachEntityTaskGroup({
      async postPreparingEachEntityTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      async defaultTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async writingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingEntitiesTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask({ application }) {
        // sql-angular restructures the navbar from upstream JHipster's single
        // [data-cy="entity"] flat dropdown into per-microfrontend dropdowns
        // (e.g. [data-cy="psqlblogMenu"], [data-cy="psqlstoreMenu"]). The upstream
        // Cypress support/commands.ts still declares
        // `entityItemSelector = '[data-cy="entity"]'`, so every entity spec's
        // `clickOnEntityMenuItem(...)` fails with
        // "Expected to find element: [data-cy=\"entity\"], but never found it."
        //
        // Patch this microservice's commands.ts to point entityItemSelector at its own
        // microfrontend dropdown. Each microservice's Cypress suite runs against the
        // gateway and opens *its own* named dropdown to see its entities.
        // (Parallel to the cassandra blueprint's cypress/generator.js fix.)
        const cypressDir = application.cypressDir;
        if (!cypressDir) return;
        if (!application.applicationTypeMicroservice) return;

        const commandsPath = `${cypressDir}support/commands.ts`;
        if (!this.existsDestination(commandsPath)) return;

        this.editFile(commandsPath, content => {
          if (content.includes(`"${application.baseName}Menu"`)) return content;
          return content.replace(
            `export const entityItemSelector = '[data-cy="entity"]';`,
            `export const entityItemSelector = '[data-cy="${application.baseName}Menu"]';`,
          );
        });

        // Patch clickOnEntityMenuItem in support/navbar.ts. Two issues to fix
        // (parallel to the cassandra blueprint's cypress/generator.js fix):
        //
        // 1. Selector chain: upstream chains `.find(entityItemSelector).find('.dropdown-item[href=...]')`
        //    expecting items to be CHILDREN of the data-cy="entity" toggle. sql-angular's
        //    per-microfrontend navbar puts data-cy on the `<a ngbDropdownToggle>` while items
        //    live in a SIBLING `<ul ngbDropdownMenu>`. Drop the intermediate `.find(entityItemSelector)`.
        //
        // 2. Timeout: per-microfrontend dropdowns populate async via module federation. The
        //    default 4s retry isn't enough on cold load. Extend to 30s.
        const navbarPath = `${cypressDir}support/navbar.ts`;
        if (this.existsDestination(navbarPath)) {
          this.editFile(navbarPath, content => {
            if (content.includes('/* SAATHRATRI mf nav */')) return content;
            return content.replace(
              /cy\s*\.get\(navbarSelector\)\s*\.find\(entityItemSelector\)\s*\.find\(`\.dropdown-item\[href="\/\$\{entityName\}"\]`\)\s*\.click\(\)/,
              'cy\n    .get(navbarSelector)\n    .find(`.dropdown-item[href="/${entityName}"]`, /* SAATHRATRI mf nav */ { timeout: 30000 })\n    .click()',
            );
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask({ application, entities }) {
        // Blueprint feature: foreign keys render as human-readable labels (e.g. the related
        // entity's name) instead of raw UUIDs. Upstream's generated create test already
        // selects each required relationship via its data-cy <select>; append an assertion
        // that the selected option renders non-empty human-readable text, so a regression
        // that blanks the FK label is caught. The assertion lives inside upstream's
        // already-gated create test and references no external vars, so it is safe
        // regardless of skipCreateTest.
        const cypressDir = application.cypressDir;
        if (!cypressDir) return;

        // Matches: <indent>cy.get(`[data-cy="<rel>"]`).select(1);  (required single relations)
        const selectRe = /( *)cy\.get\(`\[data-cy="([^"]+)"\]`\)\.select\(1\);/g;

        for (const entity of entities) {
          const specPath = `${cypressDir}e2e/entity/${entity.entityFileName}.cy.ts`;
          if (!this.existsDestination(specPath)) continue;

          this.editFile(specPath, content => {
            if (content.includes('option:selected')) return content; // idempotent
            return content.replace(
              selectRe,
              (match, indent, rel) =>
                `${match}\n${indent}cy.get(\`[data-cy="${rel}"]\`).find('option:selected').invoke('text').should('match', /\\S/);`,
            );
          });

          // Bump cy.wait timeouts and widen intercept glob (parallel to cassandra
          // cypress/generator.js fixes). Both are micro-frontend cold-load workarounds:
          // - The lazy-loaded psqlblog/psqlstore route fires its GET only after module
          //   federation registers the remote, which can exceed the default 5s wait.
          // - Upstream's `+(?*|)` intercept glob only matches base path + optional
          //   `?...` — `**` is more permissive and harmless even on standard JPA paths.
          this.editFile(specPath, content => {
            content = content.replace(/cy\.wait\('@entitiesRequest'\)/g, "cy.wait('@entitiesRequest', { timeout: 30000 })");
            content = content.replace(/cy\.wait\('@entitiesRequestInternal'\)/g, "cy.wait('@entitiesRequestInternal', { timeout: 30000 })");
            // Convert string glob intercept URL to regex literal. Upstream's `+(?*|)`
            // only matches base path + optional `?...`; the cassandra pagination overhaul
            // (`/<entity>/slice?...`) and any future suffix segments need a more permissive
            // matcher. `**` in minimatch only crosses path separators when standalone, so
            // `<entity>**` still doesn't match `/slice...`. Use a regex with `\b` (word
            // boundary) which catches `/<entity>`, `/<entity>?...`, `/<entity>/X`,
            // `/<entity>/X?...`. Harmless for ai-postgresql even though it doesn't
            // currently use /slice (kept symmetric with the cassandra blueprint).
            content = content.replace(/'((?:\/services\/)?[^']*)(?:\+\(\?\*\|\)|\*\*)'/g, (_, urlPath) => {
              const escaped = urlPath.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
              return `/^${escaped}\\b/`;
            });
            return content;
          });

          // Blueprint feature: entities with vector fields expose an AI semantic-search bar.
          // Append an e2e smoke test that drives that bar and asserts the /ai-search request
          // succeeds (200). Without OPENAI_API_KEY the backend returns an empty list, which is
          // still a 200 — the test verifies the UI wiring end-to-end, not the ranking.
          const hasVectorFields = (entity.fields ?? []).some(
            f => f.fieldTypeVectorSaathratri || f.options?.customAnnotation?.[0] === 'VECTOR',
          );
          if (hasVectorFields) {
            this.editFile(specPath, content => {
              if (typeof content !== 'string' || content.includes('should run an AI semantic search')) return content;
              // Navigate exactly like the spec's standard CRUD tests do. On a microfrontend remote
              // the entity route is prefixed with the microservice name (e.g. 'psqlblog/tag'), so a
              // bare entityFileName ('tag') makes clickOnEntityMenuItem look for
              // `.dropdown-item[href="/tag"]` which never exists → the AI-search test times out while
              // the CRUD tests pass. Reuse the argument already present in this file so we match
              // whatever JHipster computed (MF prefix vs monolith bare name).
              const menuMatch = content.match(/cy\.clickOnEntityMenuItem\('([^']+)'\)/);
              const menuArg = menuMatch ? menuMatch[1] : entity.entityFileName;
              const aiTest = `
  it('should run an AI semantic search', () => {
    cy.intercept('GET', /\\/api\\/${entity.entityApiUrl}\\/ai-search/).as('aiSearchRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('${menuArg}');
    cy.wait('@entitiesRequest', { timeout: 30000 });
    cy.get('[data-cy="aiSearchInput"]').type('semantic query');
    cy.get('[data-cy="aiSearchButton"]').click();
    cy.wait('@aiSearchRequest', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
  });
`;
              const idx = content.lastIndexOf('});');
              if (idx === -1) return content;
              return content.slice(0, idx) + aiTest + content.slice(idx);
            });
            this.log.info(`[cypress] Added AI-search e2e smoke test to ${specPath}`);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_TRANSLATIONS]() {
    return this.asLoadingTranslationsTaskGroup({
      async loadingTranslationsTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.INSTALL]() {
    return this.asInstallTaskGroup({
      async installTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_INSTALL]() {
    return this.asPostInstallTaskGroup({
      async postInstallTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup({
      async endTemplateTask() {},
    });
  }
}

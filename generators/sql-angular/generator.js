import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { generateEntityClientEnumImports } from 'generator-jhipster/generators/client/support';
import { filterEntitiesAndPropertiesForClient } from 'generator-jhipster/generators/client/support';
import { angularSaathratriUtils } from './sql-angular-utils.js';
import { angularFilesFromSaathratri, entityModelFiles } from './entity-files.js';

// Navbar modifications are applied in POST_WRITING via editFile
// to avoid needing upstream Angular variables (microfrontend, clientSrcDir, etc.)

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  async beforeQueue() {
    await this.dependsOnBootstrapApplication();
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
      async preparingTemplateTask({ application }) {
        // Ensure clientSrcDir is set for clientApplicationTemplatesBlock() path resolution
        // (may not be available when composed from blueprint's client generator)
        if (!application.clientSrcDir) {
          application.clientSrcDir = 'src/main/webapp/';
        }
      },
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
      async preparingEachEntityFieldTemplateTask({ field }) {
        // Detect vector fields independently (in case sql-spring-boot hasn't set the property yet)
        if (!field.fieldTypeVectorSaathratri) {
          const vectorAnnotation = field.options?.customAnnotation?.[0];
          if (vectorAnnotation === 'VECTOR') {
            field.fieldTypeVectorSaathratri = true;
            field.vectorDimensionSaathratri = field.options?.customAnnotation?.[1] || '1536';
            const sourceFieldName = field.fieldName.replace(/Embedding$/, '');
            field.sourceFieldNameSaathratri = sourceFieldName;
            field.sourceFieldNameCapitalizedSaathratri = sourceFieldName.charAt(0).toUpperCase() + sourceFieldName.slice(1);
          }
        }
      },
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
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: {
            files: [
              {
                templates: ['template-file-sql-angular'],
              },
            ],
          },
          context: application,
        });

        // Navbar modifications are applied in POST_WRITING via editFile
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingEntitiesTemplateTask({ application, entities }) {
        // Use the same entity filtering as the upstream angular generator
        const entitiesWithFields = entities.map(e => ({
          ...e,
          fields: e.fields ?? [],
          relationships: e.relationships ?? [],
        }));
        const filteredEntities = (application.filterEntitiesAndPropertiesForClient ?? filterEntitiesAndPropertiesForClient)(
          entitiesWithFields,
        );

        // Diagnostic logging to understand entity structure
        this.log.info(`[sql-angular] WRITING_ENTITIES: ${entities.length} total entities, ${filteredEntities.length} after filtering`);
        this.log.info(`[sql-angular] destinationRoot: ${this.destinationRoot()}`);
        if (filteredEntities.length > 0) {
          const firstEntity = filteredEntities[0];
          this.log.info(`[sql-angular] First entity name: ${firstEntity.name}`);
          this.log.info(`[sql-angular] First entity entityFolderName: ${firstEntity.entityFolderName}`);
          this.log.info(`[sql-angular] First entity entityFileName: ${firstEntity.entityFileName}`);
          this.log.info(`[sql-angular] First entity has fields: ${!!firstEntity.fields}, count: ${firstEntity.fields?.length}`);
          this.log.info(
            `[sql-angular] First entity has relationships: ${!!firstEntity.relationships}, count: ${firstEntity.relationships?.length}`,
          );
          this.log.info(`[sql-angular] First entity keys: ${Object.keys(firstEntity).sort().join(', ')}`);
        }

        for (const entity of filteredEntities.filter(e => !e.builtIn)) {
          // Guard: skip entities that don't have required client properties
          if (!entity.entityFolderName || !entity.entityFileName) {
            this.log.warn(
              `[sql-angular] Skipping entity ${entity.name}: missing entityFolderName (${entity.entityFolderName}) or entityFileName (${entity.entityFileName})`,
            );
            continue;
          }
          if (!entity.fields) {
            this.log.warn(`[sql-angular] Skipping entity ${entity.name}: missing fields property`);
            continue;
          }

          await this.writeFiles({
            sections: entity.entityClientModelOnly ? { model: [entityModelFiles] } : angularFilesFromSaathratri,
            context: { ...application, ...entity, ...angularSaathratriUtils, generateEntityClientEnumImports },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask({ application }) {
        // Only patch navbar for applications that have a client
        if (application.skipClient) return;

        const clientSrcDir = application.clientSrcDir || 'src/main/webapp/';
        const navbarTsFile = `${clientSrcDir}app/layouts/navbar/navbar.ts`;
        const navbarHtmlFile = `${clientSrcDir}app/layouts/navbar/navbar.html`;

        // === Patch navbar.ts ===
        const isMicrofrontendGateway = application.microfrontend && application.applicationTypeGateway;
        this.editFile(navbarTsFile, content => {
          if (!isMicrofrontendGateway) {
            // For non-gateway apps: add EntityNavbarItems import, property, and sorting
            // 1. Add EntityNavbarItems import
            if (!content.includes('EntityNavbarItems')) {
              content = content.replace(
                "import NavbarItem from './navbar-item.model';",
                "import { EntityNavbarItems } from 'app/entities/entity-navbar-items';\nimport NavbarItem from './navbar-item.model';",
              );
            }

            // 2. Add entitiesNavbarItems property
            if (!content.includes('entitiesNavbarItems')) {
              content = content.replace(
                'readonly account = inject(AccountService).account;',
                'readonly account = inject(AccountService).account;\n  entitiesNavbarItems: NavbarItem[] = [];',
              );
            }

            // 3. Add sorting in ngOnInit (insert before profileService.getProfileInfo)
            if (!content.includes('EntityNavbarItems].sort')) {
              content = content.replace(
                '    this.profileService.getProfileInfo().subscribe(profileInfo => {',
                '    // Saathratri modification - sort entity navbar items alphabetically\n' +
                  '    this.entitiesNavbarItems = [...EntityNavbarItems].sort((a, b) => a.name.localeCompare(b.name));\n' +
                  '    this.profileService.getProfileInfo().subscribe(profileInfo => {',
              );
            }
          }

          // For gateways with microfrontends: add sorting helper and wrap .set() calls
          if (isMicrofrontendGateway) {
            // 4. Add sortNavbarItemsAlphabetically helper method (before loadMicrofrontendsEntities if it exists)
            if (!content.includes('sortNavbarItemsAlphabetically') && content.includes('loadMicrofrontendsEntities')) {
              content = content.replace(
                '  loadMicrofrontendsEntities(): void {',
                '  // Saathratri modification - alphabetical sorting helper\n' +
                  '  private sortNavbarItemsAlphabetically(items: NavbarItem[]): NavbarItem[] {\n' +
                  '    return [...items].sort((a, b) => a.name.localeCompare(b.name));\n' +
                  '  }\n\n' +
                  '  loadMicrofrontendsEntities(): void {',
              );
            }

            // 5. Wrap microfrontend item .set(items) with sorting helper
            if (content.includes('sortNavbarItemsAlphabetically')) {
              content = content.replace(/\.set\(items\)/g, '.set(this.sortNavbarItemsAlphabetically(items))');
            }
          }

          return content;
        });

        // === Patch navbar.html - restructure entity menu into per-microfrontend grouped dropdowns ===
        if (application.microfrontend && application.applicationTypeGateway && application.microfrontends) {
          this.editFile(navbarHtmlFile, content => {
            // Sort microfrontends alphabetically
            const sortedMicrofrontends = [...application.microfrontends].sort((a, b) => a.baseName.localeCompare(b.baseName));

            // Build per-microfrontend dropdown HTML
            const jhiPrefix = application.jhiPrefix || 'jhi';
            const enableTranslation = application.enableTranslation;
            let microfrontendMenus = '';
            for (const remote of sortedMicrofrontends) {
              const translationAttr = enableTranslation
                ? `\n                  [${jhiPrefix}Translate]="entityNavbarItem.translationKey"`
                : '';
              microfrontendMenus += `
      <!-- ${remote.baseName} Service Menu -->
      @if (account() !== null && ${remote.lowercaseBaseName}EntityNavbarItems().length > 0) {
        <li
          ngbDropdown
          class="nav-item dropdown pointer"
          display="dynamic"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <a class="nav-link dropdown-toggle" ngbDropdownToggle href="javascript:void(0);" id="${remote.lowercaseBaseName}-menu" data-cy="${remote.lowercaseBaseName}Menu">
            <span>
              <fa-icon icon="th-list" />
              <span>${remote.baseName}</span>
            </span>
          </a>
          <ul class="dropdown-menu" ngbDropdownMenu aria-labelledby="${remote.lowercaseBaseName}-menu">
            @for (entityNavbarItem of ${remote.lowercaseBaseName}EntityNavbarItems(); track $index) {
              <li>
                <a
                  class="dropdown-item"
                  [routerLink]="entityNavbarItem.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="collapseNavbar()"
                >
                  <fa-icon icon="asterisk" [fixedWidth]="true" />${translationAttr ? `\n                  <span${translationAttr}\n                  >{{entityNavbarItem.name}}</span>` : '\n                  <span>{{entityNavbarItem.name}}</span>'}
                </a>
              </li>
            }
          </ul>
        </li>
      }`;
            }

            // Find and replace the upstream single entity dropdown with per-microfrontend dropdowns
            // The upstream entity dropdown: @if (account() !== null) { <li...data-cy="entity">...<ul>...</ul></li> }
            // Use greedy match up to </ul> then match the outer </li> and closing }
            const entityDropdownRegex = /\s*@if \(account\(\) !== null\) \{\s*<li[\s\S]*?data-cy="entity"[\s\S]*?<\/ul>\s*<\/li>\s*\}/;
            if (entityDropdownRegex.test(content)) {
              content = content.replace(
                entityDropdownRegex,
                '\n      <!-- jhipster-needle-add-element-to-menu - JHipster will add new menu items here -->' +
                  microfrontendMenus +
                  '\n      <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->',
              );
            }

            return content;
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask({ application, entities }) {
        const clientSrcDir = application.clientSrcDir || 'src/main/webapp/';

        for (const entity of entities.filter(e => !e.builtIn)) {
          // Detect vector fields using BOTH the prepared property AND the raw JDL annotation
          // This ensures detection works regardless of generator execution order
          const vectorFields = (entity.fields ?? []).filter(f =>
            f.fieldTypeVectorSaathratri || f.options?.customAnnotation?.[0] === 'VECTOR'
          );
          if (vectorFields.length === 0) continue;

          // Ensure vector field metadata is set (in case PREPARING phase didn't run yet)
          for (const vf of vectorFields) {
            if (!vf.fieldTypeVectorSaathratri) {
              vf.fieldTypeVectorSaathratri = true;
            }
            if (!vf.sourceFieldNameSaathratri) {
              const src = vf.fieldName.replace(/Embedding$/, '');
              vf.sourceFieldNameSaathratri = src;
              vf.sourceFieldNameCapitalizedSaathratri = src.charAt(0).toUpperCase() + src.slice(1);
            }
          }

          // Guard: skip entities that don't have required client properties
          if (!entity.entityFolderName || !entity.entityFileName) continue;

          const listTsFile = `${clientSrcDir}app/entities/${entity.entityFolderName}/list/${entity.entityFileName}.ts`;
          const listHtmlFile = `${clientSrcDir}app/entities/${entity.entityFolderName}/list/${entity.entityFileName}.html`;
          const detailTsFile = `${clientSrcDir}app/entities/${entity.entityFolderName}/detail/${entity.entityFileName}-detail.ts`;
          const entityApiUrl = entity.entityApiUrl || entity.entityUrl;
          const entityInstancePlural = entity.entityInstancePlural;
          const entityAngularName = entity.entityAngularName || entity.entityClass || entity.name;

          // --- Patch list component ---
          this.editFile(listTsFile, content => {
            // Skip if already fully patched (check for field selection which is the latest addition)
            if (content.includes('aiSearchSelectedFields')) return content;

            // Remove old AI search patch if present (missing field selection support)
            if (content.includes('performAiSearch')) {
              content = content.replace(
                /\n\s*\/\/ Saathratri modification - AI search properties[\s\S]*?\/\/ End Saathratri modification - AI search\n/,
                '\n',
              );
            }

            // 1. Add signal import if not present
            if (!content.includes('signal')) {
              content = content.replace(
                /import \{ (.*?) \} from '@angular\/core';/,
                (match, imports) => `import { ${imports}, signal } from '@angular/core';`,
              );
            }

            // 3. Add FormsModule import for ngModel binding if not present
            if (!content.includes('FormsModule')) {
              content = content.replace(/import \{ (.*?) \} from '@angular\/forms';/, (match, imports) => {
                if (imports.includes('FormsModule')) return match;
                return `import { ${imports}, FormsModule } from '@angular/forms';`;
              });
              // If no @angular/forms import exists, add it
              if (!content.includes('FormsModule')) {
                content = content.replace('import { Component', "import { FormsModule } from '@angular/forms';\nimport { Component");
              }
            }

            // 4. Add FormsModule to component imports array if not present
            if (!content.includes('FormsModule') || !content.match(/imports:\s*\[[\s\S]*?FormsModule/)) {
              content = content.replace(/imports:\s*\[/, 'imports: [FormsModule, ');
            }

            // 5. Add SlicePipe import and component registration
            content = this._addSlicePipeImport(content);

            // 6. Add HttpClient inject and AI search properties/methods
            // Find the class body to inject properties (match both "export class" and "export default class")
            const classBodyRegex = /export\s+(?:default\s+)?class\s+\w+[^{]*\{/;
            const classMatch = content.match(classBodyRegex);
            if (classMatch) {
              const insertPos = classMatch.index + classMatch[0].length;

              const entityServiceInstance = entity.entityInstance + 'Service';

              // Build the default selected fields object
              const fieldEntries = vectorFields.map(vf => `'${vf.fieldName}': true`).join(', ');
              const fieldNamesArray = vectorFields.map(vf => `'${vf.fieldName}'`).join(', ');

              const aiSearchCode = `

  // Saathratri modification - AI search properties
  aiSearchQuery = '';
  aiSearchLoading = signal(false);
  isAiSearchActive = signal(false);
  aiSearchSelectedFields: { [key: string]: boolean } = { ${fieldEntries} };

  toggleAiSearchField(fieldName: string): void {
    this.aiSearchSelectedFields[fieldName] = !this.aiSearchSelectedFields[fieldName];
  }

  private getSelectedAiSearchFields(): string[] {
    const allFields = [${fieldNamesArray}];
    const selected = allFields.filter(f => this.aiSearchSelectedFields[f]);
    return selected.length > 0 ? selected : allFields;
  }

  performAiSearch(query: string): void {
    if (!query || !query.trim()) {
      this.clearAiSearch();
      return;
    }
    this.aiSearchLoading.set(true);
    const fields = this.getSelectedAiSearchFields();
    this.${entityServiceInstance}.aiSearch(query.trim(), 20, fields).subscribe({
      next: results => {
        this.${entityInstancePlural}.set(results);
        this.isAiSearchActive.set(true);
        this.aiSearchLoading.set(false);
      },
      error: () => {
        this.aiSearchLoading.set(false);
      },
    });
  }

  clearAiSearch(): void {
    this.aiSearchQuery = '';
    this.isAiSearchActive.set(false);
    this.load();
  }
  // End Saathratri modification - AI search`;

              content = content.slice(0, insertPos) + aiSearchCode + content.slice(insertPos);
            }

            // 7. Add inject import if not present
            if (!content.match(/import\s*\{[^}]*inject[^}]*\}\s*from\s*'@angular\/core'/)) {
              content = content.replace(/import \{ (.*?) \} from '@angular\/core';/, (match, imports) => {
                if (imports.includes('inject')) return match;
                return `import { ${imports}, inject } from '@angular/core';`;
              });
            }

            return content;
          });

          this.log.info(`[sql-angular] Patched ${listTsFile} with AI search and SlicePipe`);

          // --- Patch list HTML to add vector field checkboxes ---
          if (vectorFields.length > 1) {
            this.editFile(listHtmlFile, content => {
              // Skip if checkboxes already present
              if (content.includes('toggleAiSearchField')) return content;

              // Build checkboxes HTML
              let checkboxesHtml = '\n      <div class="mt-2 d-flex flex-wrap gap-3">';
              checkboxesHtml += '\n        <small class="text-muted me-1">Search in:</small>';
              for (const vf of vectorFields) {
                const label = vf.sourceFieldNameSaathratri || vf.fieldName.replace(/Embedding$/, '');
                checkboxesHtml += `\n        <div class="form-check form-check-inline">`;
                checkboxesHtml += `\n          <input class="form-check-input" type="checkbox" id="aiField_${vf.fieldName}"`;
                checkboxesHtml += `\n                 [checked]="aiSearchSelectedFields['${vf.fieldName}']"`;
                checkboxesHtml += `\n                 (change)="toggleAiSearchField('${vf.fieldName}')">`;
                checkboxesHtml += `\n          <label class="form-check-label" for="aiField_${vf.fieldName}">${label}</label>`;
                checkboxesHtml += `\n        </div>`;
              }
              checkboxesHtml += '\n      </div>';

              // Strategy: find the aiSearchForm's closing </div></form> pair.
              // The pattern is: </div> (closes col-sm-12) followed by </form>.
              // We inject BEFORE that </div> so checkboxes sit inside col-sm-12.
              const formEndRegex = /(<form\s+name="aiSearchForm"[\s\S]*?)(\s*<\/div>\s*<\/form>)/;
              content = content.replace(formEndRegex, `$1${checkboxesHtml}$2`);

              return content;
            });

            this.log.info(`[sql-angular] Patched ${listHtmlFile} with vector field checkboxes`);
          }

          // --- Patch entity service to add aiSearch method ---
          const serviceTsFile = `${clientSrcDir}app/entities/${entity.entityFolderName}/service/${entity.entityFileName}.service.ts`;
          this.editFile(serviceTsFile, content => {
            // Remove old aiSearch method if it lacks fields parameter support
            if (content.includes('aiSearch') && !content.includes('fields?: string[]')) {
              content = content.replace(
                /\n\s*aiSearch\(query: string, limit: number\)[^}]*\{[\s\S]*?\n\s*\}\n/,
                '\n',
              );
            }
            if (content.includes('aiSearch')) return content;

            // Add aiSearch method before the closing brace
            const lastBrace = content.lastIndexOf('}');
            if (lastBrace !== -1) {
              const aiSearchMethod = `
  aiSearch(query: string, limit: number, fields?: string[]): Observable<I${entityAngularName}[]> {
    let params: { [key: string]: string | string[] } = { query, limit: String(limit) };
    if (fields && fields.length > 0) {
      params['fields'] = fields.join(',');
    }
    return this.http.get<I${entityAngularName}[]>(\`\${this.resourceUrl}/ai-search\`, {
      params,
    });
  }
`;
              content = content.slice(0, lastBrace) + aiSearchMethod + content.slice(lastBrace);

              // Add Observable import if not present
              if (!content.includes("import { Observable }") && !content.match(/import\s*\{[^}]*Observable[^}]*\}/)) {
                content = content.replace(
                  /import \{ HttpClient/,
                  "import { Observable } from 'rxjs';\nimport { HttpClient"
                );
              }
            }
            return content;
          });

          this.log.info(`[sql-angular] Patched ${serviceTsFile} with aiSearch method`);

          // --- Patch detail component for SlicePipe ---
          this.editFile(detailTsFile, content => {
            return this._addSlicePipeImport(content);
          });

          this.log.info(`[sql-angular] Patched ${detailTsFile} with SlicePipe`);
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

  /**
   * Adds SlicePipe import from @angular/common and registers it in the component's imports array.
   * Used for vector field display truncation in list and detail templates.
   */
  _addSlicePipeImport(content) {
    if (content.includes('SlicePipe')) return content;

    // Add SlicePipe to the @angular/common import statement, or create one
    if (content.match(/import\s*\{[^}]*\}\s*from\s*'@angular\/common';/)) {
      content = content.replace(/import \{ (.*?) \} from '@angular\/common';/, (match, imports) => {
        return `import { ${imports}, SlicePipe } from '@angular/common';`;
      });
    } else {
      // Add a new import for @angular/common with SlicePipe
      content = content.replace(/import \{ Component/, "import { SlicePipe } from '@angular/common';\nimport { Component");
    }

    // Add SlicePipe to the component imports array
    content = content.replace(/imports:\s*\[/, 'imports: [SlicePipe, ');

    return content;
  }
}

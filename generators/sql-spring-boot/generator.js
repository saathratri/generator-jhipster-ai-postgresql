import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import command from './command.js';
import { javaMainPackageTemplatesBlock, javaTestPackageTemplatesBlock } from 'generator-jhipster/generators/java/support';
import { sqlSpringBootUtils } from './sql-spring-boot-utils.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
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

  get [BaseApplicationGenerator.COMPOSING_COMPONENT]() {
    return this.asComposingComponentTaskGroup({
      async composingComponentTemplateTask() {},
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
      async preparingEachEntityFieldTemplateTask({ application, entity, field }) {
        // Check for VECTOR custom annotation to exclude from DTOs
        const vectorAnnotation = field.options?.customAnnotation?.[0];
        if (vectorAnnotation === 'VECTOR') {
          // Get the vector dimension from the second annotation (e.g., "1536")
          const vectorDimension = field.options?.customAnnotation?.[1] || '1536';

          // Mark field as vector type for exclusion from DTO
          field.fieldTypeVectorSaathratri = true;
          field.vectorDimensionSaathratri = vectorDimension;

          // Determine the source field name (the field this embedding is derived from)
          // Convention: nameEmbedding -> name, descriptionEmbedding -> description
          const sourceFieldName = field.fieldName.replace(/Embedding$/, '');
          field.sourceFieldNameSaathratri = sourceFieldName;
          field.sourceFieldNameCapitalizedSaathratri = sourceFieldName.charAt(0).toUpperCase() + sourceFieldName.slice(1);

          // IMPORTANT: Vector fields should be in the JPA entity (for database access)
          // but excluded from DTOs (they are large - 1536 floats = ~6KB each)
          // The DTO template filters out fields with fieldTypeVectorSaathratri = true
          // Do NOT set field.transient = true as that removes the field from the entity entirely

          // Track vector entities at application level for embedding service generation
          application.hasVectorFieldsSaathratri = true;
          application.vectorEntitiesSaathratri = application.vectorEntitiesSaathratri || [];

          // Find or create entity entry in vectorEntitiesSaathratri
          let vectorEntity = application.vectorEntitiesSaathratri.find(e => e.entityClass === entity.entityClass);
          if (!vectorEntity) {
            vectorEntity = {
              entityClass: entity.entityClass,
              entityInstance: entity.entityInstance,
              entityInstancePlural: entity.entityInstancePlural,
              vectorFields: []
            };
            application.vectorEntitiesSaathratri.push(vectorEntity);
          }

          // Add this field to the entity's vector fields
          vectorEntity.vectorFields.push({
            fieldName: field.fieldName,
            fieldNameCapitalized: field.fieldNameCapitalized,
            sourceFieldName: sourceFieldName,
            sourceFieldNameCapitalized: field.sourceFieldNameCapitalizedSaathratri,
            vectorDimension: vectorDimension
          });

          this.log.info(`Field '${field.fieldName}' in entity '${entity.entityClass}' marked as vector(${vectorDimension}) type (source: ${sourceFieldName}, excluded from DTO)`);
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

        if (application.applicationTypeMicroservice) {
          sqlSpringBootUtils.getApplicationPortData(this.destinationPath(), this.appname);
          const portData = sqlSpringBootUtils.incrementAndSetLastUsedPort(this.destinationPath(), this.appname);
          this.log(`The server port is: ${portData[this.appname].port}`);
          application.devJdbcUrlSaathratri = `jdbc:postgresql://localhost:${portData[this.appname].port}/${application.devDatabaseName}`;
          await this.writeFiles({
            sections: {
              files: [
                {
                  templates: [
                    'src/main/resources/config/application-dev.yml',
                  ]
                },
              ],
            },
            context: application,
          });
        }

        // Write embedding service files if any entity has vector fields
        if (application.hasVectorFieldsSaathratri && application.vectorEntitiesSaathratri?.length > 0) {
          this.log.info(`Generating embedding services for ${application.vectorEntitiesSaathratri.length} entities with vector fields`);
          await this.writeFiles({
            sections: {
              files: [
                {
                  templates: [
                    {
                      sourceFile: 'src/main/java/_package_/config/EmbeddingConfiguration.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/config/EmbeddingConfiguration.java`,
                    },
                    {
                      sourceFile: 'src/main/java/_package_/service/embedding/EmbeddingService.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/service/embedding/EmbeddingService.java`,
                    },
                    {
                      sourceFile: 'src/main/java/_package_/service/embedding/EmbeddingMigrationService.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/service/embedding/EmbeddingMigrationService.java`,
                    },
                    {
                      sourceFile: 'src/main/java/_package_/service/embedding/EmbeddingStartupMigrationRunner.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/service/embedding/EmbeddingStartupMigrationRunner.java`,
                    },
                    {
                      sourceFile: 'src/main/java/_package_/web/rest/EmbeddingMigrationResource.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/web/rest/EmbeddingMigrationResource.java`,
                    },
                  ]
                },
              ],
            },
            context: application,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingEntitiesTemplateTask({ application, entities }) {

        for (const entity of entities.filter(e => !e.builtIn)) {

          entity.serviceImpl = true;

          await this.writeFiles({
            sections: {
              files: [
                {
                  condition: generator => generator.databaseTypeSql && !entity.skipServer,
                  ...javaMainPackageTemplatesBlock('_entityPackage_/'),
                  templates: [
                    'web/rest/_entityClass_Resource.java',
                    'service/_entityClass_QueryService.java',
                    'service/_entityClass_Service.java',
                    'service/impl/_entityClass_ServiceImpl.java',
                    /* saathratri-needle-sql-copy-dto-class */
                    'service/mapper/_entityClass_Mapper.java',
                  ]
                },
                {
                  condition: generator => generator.databaseTypeSql && !entity.skipServer,
                  ...javaTestPackageTemplatesBlock('_entityPackage_/'),
                  templates: [
                    'web/rest/_entityClass_ResourceIT.java',
                  ]
                },
              ]
            },
            context: { ...application, ...entity, ...sqlSpringBootUtils },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask() {},
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

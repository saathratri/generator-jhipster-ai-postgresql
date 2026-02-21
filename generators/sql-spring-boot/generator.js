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
          field.propertyDtoJavaType = 'float[]';

          // CRITICAL FIX: Change field type from byte[] to String for pgvector compatibility
          field.javaFieldType = 'float[]';
          field.fieldTypeBytes = false;
          field.fieldWithContentType = false;
          field.fieldTypeBinary = false;
          field.blobContentTypeText = false;
          field.fieldDefaultValue = '"[0.1, 0.2]"';
          field.fieldUpdatedValue = '"[0.3, 0.4]"';

          // Determine the source field name (the field this embedding is derived from)
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
      async postPreparingEachEntityTemplateTask({ entity }) {
        // Deduplicate entityJavaFilterableProperties to prevent compilation errors
        // This can happen when multiple relationships generate the same filter name
        // (e.g., two relationships both named "workOrder" would both generate "workOrderId" filter)
        if (entity.entityJavaFilterableProperties && entity.entityJavaFilterableProperties.length > 0) {
          const seen = new Set();
          const duplicates = [];
          const uniqueProperties = [];

          for (const prop of entity.entityJavaFilterableProperties) {
            const filterName = prop.propertyJavaFilterName;
            if (seen.has(filterName)) {
              duplicates.push(filterName);
            } else {
              seen.add(filterName);
              uniqueProperties.push(prop);
            }
          }

          if (duplicates.length > 0) {
            this.log.warn(
              `Entity '${entity.entityClass}' has duplicate filter names in Criteria class: [${duplicates.join(', ')}]. ` +
              `This is likely caused by multiple relationships with the same name. ` +
              `Consider renaming one of the relationships in your JDL to avoid conflicts. ` +
              `Duplicates have been removed to prevent compilation errors.`
            );
            entity.entityJavaFilterableProperties = uniqueProperties;
          }
        }

        // Also deduplicate relationships array for QueryService specification building
        // to ensure consistency with the deduplicated Criteria filters
        if (entity.relationships && entity.relationships.length > 0) {
          const seenRelationships = new Set();
          const duplicateRelationships = [];
          const uniqueRelationships = [];

          for (const rel of entity.relationships) {
            // The filter name is based on relationshipNameCapitalized + "Id"
            const filterKey = rel.relationshipNameCapitalized;
            if (seenRelationships.has(filterKey)) {
              duplicateRelationships.push(rel.relationshipName);
            } else {
              seenRelationships.add(filterKey);
              uniqueRelationships.push(rel);
            }
          }

          if (duplicateRelationships.length > 0) {
            this.log.warn(
              `Entity '${entity.entityClass}' has duplicate relationship names: [${duplicateRelationships.join(', ')}]. ` +
              `Only the first occurrence will be used in QueryService specifications.`
            );
            entity.relationships = uniqueRelationships;
          }
        }
      },
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
                    {
                      sourceFile: 'src/main/java/_package_/domain/converter/PgVectorConverter.java.ejs',
                      destinationFile: ctx => `src/main/java/${ctx.packageFolder}/domain/converter/PgVectorConverter.java`,
                    },
                  ]
                },
              ],
            },
            context: application,
          });
        }

        // Write pom.xml with enhanced maven-compiler-plugin configuration
        // (fork mode with increased memory for MapStruct annotation processing)
        await this.writeFiles({
          sections: {
            files: [
              {
                templates: ['pom.xml'],
              },
            ],
          },
          context: application,
        });
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
      async postWritingEntitiesTemplateTask({ entities, application }) {
        for (const entity of entities.filter(e => !e.builtIn && !e.skipServer)) {
          const vectorFields = entity.fields.filter(f => f.fieldTypeVectorSaathratri);
          if (vectorFields.length > 0) {
            const entityFile = `src/main/java/${application.packageFolder}/domain/${entity.persistClass}.java`;
            this.editFile(entityFile, content => {
              // Add import if missing
              if (!content.includes('import org.hibernate.annotations.ColumnTransformer;')) {
                content = content.replace('import jakarta.persistence.*;', 'import jakarta.persistence.*;\nimport org.hibernate.annotations.ColumnTransformer;');
              }

              for (const field of vectorFields) {
                // Find the @Column annotation for this field and replace it
                const columnRegex = new RegExp(`@Column\\(name = "${field.fieldNameAsDatabaseColumn}"(.*?)\\)`, 'g');
                const replacement = `@Column(name = "${field.fieldNameAsDatabaseColumn}", columnDefinition = "vector(${field.vectorDimensionSaathratri})")\n    @Convert(converter = ${application.packageName}.domain.converter.PgVectorConverter.class)\n    @ColumnTransformer(write = "?::vector")`;
                content = content.replace(columnRegex, replacement);
              }
              return content;
            });
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

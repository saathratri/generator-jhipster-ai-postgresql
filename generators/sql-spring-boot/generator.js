import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { javaMainPackageTemplatesBlock, javaTestPackageTemplatesBlock } from 'generator-jhipster/generators/java/support';
import { sqlSpringBootUtils } from './sql-spring-boot-utils.js';

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
      async composingTemplateTask() {
        await this.composeWithJHipster('jhipster-multiple-human-readable-foreign-key-fields:sql-spring-boot:data-relational');
      },
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
      async preparingEachEntityTemplateTask({ entity }) {
        // Detect self-referential ManyToOne relationships (tree parent pointers)
        if (!entity.relationships || entity.relationships.length === 0) {
          return;
        }
        const selfRefRelationship = entity.relationships.find(r =>
          r.otherEntityName === entity.entityClass &&
          (r.relationshipManyToOne || r.relationshipOneToMany === false)
        );
        if (selfRefRelationship) {
          entity.hasSelfReferentialTreeSaathratri = true;
          entity.treeParentFieldNameSaathratri = selfRefRelationship.relationshipFieldName; // e.g., "child"
          entity.treeParentFieldNameCapitalizedSaathratri = selfRefRelationship.relationshipNameCapitalized; // e.g., "Child"
          // Find the inverse collection (children)
          const childrenRelationship = entity.relationships.find(r =>
            r.otherEntityName === entity.entityClass &&
            r.relationshipOneToMany
          );
          if (childrenRelationship) {
            entity.treeChildrenFieldNameSaathratri = childrenRelationship.relationshipFieldNamePlural; // e.g., "parents"
          }
          this.log.info(`Entity '${entity.entityClass}' has self-referential tree via '${selfRefRelationship.relationshipFieldName}'`);
        }
      },
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
        } else {
          // For gateways and monoliths, use the standard JHipster JDBC URL
          application.devJdbcUrlSaathratri = application.devJdbcUrl;
        }

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

        // pom.xml modifications are done in POST_WRITING via editFile
        // to avoid needing springBootDependencies from upstream generator
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingEntitiesTemplateTask({ application, entities }) {
        for (const entity of entities.filter(e => !e.builtIn)) {

          entity.serviceImpl = true;

          const mainTemplates = [
                    'web/rest/_entityClass_Resource.java',
                    'service/_entityClass_Service.java',
                    'service/impl/_entityClass_ServiceImpl.java',
                    /* saathratri-needle-sql-copy-dto-class */
                    'service/mapper/_entityClass_Mapper.java',
          ];
          if (entity.jpaMetamodelFiltering) {
            mainTemplates.push('service/_entityClass_QueryService.java');
          }

          await this.writeFiles({
            sections: {
              files: [
                {
                  condition: generator => generator.databaseTypeSql && !entity.skipServer,
                  ...javaMainPackageTemplatesBlock('_entityPackage_/'),
                  templates: mainTemplates,
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
      async postWritingTemplateTask({ application }) {
        const pomFile = 'pom.xml';

        // Patch maven-compiler-plugin with fork mode and increased memory for MapStruct
        this.editFile(pomFile, content => {
          if (!content.includes('<fork>true</fork>')) {
            content = content.replace(
              '                        <parameters>true</parameters>\n                        <annotationProcessorPaths>',
              '                        <parameters>true</parameters>\n' +
              '                        <!-- Fork the compiler in a separate process with more memory -->\n' +
              '                        <!-- This helps prevent OutOfMemoryError during MapStruct annotation processing -->\n' +
              '                        <!-- especially with complex entity relationships -->\n' +
              '                        <fork>true</fork>\n' +
              '                        <meminitial>2048m</meminitial>\n' +
              '                        <maxmem>8192m</maxmem>\n' +
              '                        <annotationProcessorPaths>'
            );
          }
          return content;
        });

        // Add Spring AI dependencies if any entity has vector fields
        if (application.hasVectorFieldsSaathratri) {
          this.editFile(pomFile, content => {
            // Add Spring AI version property
            if (!content.includes('spring-ai.version')) {
              content = content.replace(
                '    </properties>',
                '        <spring-ai.version>2.0.0-M3</spring-ai.version>\n    </properties>'
              );
            }

            // Add Spring AI BOM to dependencyManagement
            if (!content.includes('spring-ai-bom')) {
              if (content.includes('</dependencyManagement>')) {
                // Insert into existing dependencyManagement
                content = content.replace(
                  '        </dependencies>\n    </dependencyManagement>',
                  '            <dependency>\n' +
                  '                <groupId>org.springframework.ai</groupId>\n' +
                  '                <artifactId>spring-ai-bom</artifactId>\n' +
                  '                <version>${spring-ai.version}</version>\n' +
                  '                <type>pom</type>\n' +
                  '                <scope>import</scope>\n' +
                  '            </dependency>\n' +
                  '        </dependencies>\n    </dependencyManagement>'
                );
              } else {
                // Create dependencyManagement section before <dependencies>
                content = content.replace(
                  '\n    <dependencies>',
                  '\n    <dependencyManagement>\n' +
                  '        <dependencies>\n' +
                  '            <dependency>\n' +
                  '                <groupId>org.springframework.ai</groupId>\n' +
                  '                <artifactId>spring-ai-bom</artifactId>\n' +
                  '                <version>${spring-ai.version}</version>\n' +
                  '                <type>pom</type>\n' +
                  '                <scope>import</scope>\n' +
                  '            </dependency>\n' +
                  '        </dependencies>\n' +
                  '    </dependencyManagement>\n\n    <dependencies>'
                );
              }
            }

            // Add Spring AI OpenAI dependency (must run BEFORE repository insertion
            // so the </dependencyManagement>\n\n    <dependencies> anchor still matches)
            if (!content.includes('spring-ai-openai')) {
              // Try to match after </dependencyManagement> first
              const depMgmtPattern = '</dependencyManagement>\n\n    <dependencies>\n';
              if (content.includes(depMgmtPattern)) {
                content = content.replace(
                  depMgmtPattern,
                  '</dependencyManagement>\n\n    <dependencies>\n' +
                  '        <dependency>\n' +
                  '            <groupId>org.springframework.ai</groupId>\n' +
                  '            <artifactId>spring-ai-openai</artifactId>\n' +
                  '        </dependency>\n'
                );
              } else {
                // No dependencyManagement section, first <dependencies> is the main one
                content = content.replace(
                  '    <dependencies>\n',
                  '    <dependencies>\n' +
                  '        <dependency>\n' +
                  '            <groupId>org.springframework.ai</groupId>\n' +
                  '            <artifactId>spring-ai-openai</artifactId>\n' +
                  '        </dependency>\n'
                );
              }
            }

            // Add Spring milestones repository (runs AFTER OpenAI dep insertion)
            if (!content.includes('spring-milestones')) {
              if (content.includes('<repositories>')) {
                content = content.replace(
                  '<repositories>',
                  '<repositories>\n' +
                  '        <repository>\n' +
                  '            <id>spring-milestones</id>\n' +
                  '            <name>Spring Milestones</name>\n' +
                  '            <url>https://repo.spring.io/milestone</url>\n' +
                  '            <snapshots>\n' +
                  '                <enabled>false</enabled>\n' +
                  '            </snapshots>\n' +
                  '        </repository>'
                );
              } else {
                // Insert before the main <dependencies> (after </dependencyManagement> if present)
                const repoAnchor = content.includes('</dependencyManagement>')
                  ? '</dependencyManagement>\n\n    <dependencies>'
                  : '\n    <dependencies>';
                const repoReplacement = content.includes('</dependencyManagement>')
                  ? '</dependencyManagement>\n\n    <repositories>\n' +
                    '        <repository>\n' +
                    '            <id>spring-milestones</id>\n' +
                    '            <name>Spring Milestones</name>\n' +
                    '            <url>https://repo.spring.io/milestone</url>\n' +
                    '            <snapshots>\n' +
                    '                <enabled>false</enabled>\n' +
                    '            </snapshots>\n' +
                    '        </repository>\n' +
                    '    </repositories>\n\n    <dependencies>'
                  : '\n    <repositories>\n' +
                    '        <repository>\n' +
                    '            <id>spring-milestones</id>\n' +
                    '            <name>Spring Milestones</name>\n' +
                    '            <url>https://repo.spring.io/milestone</url>\n' +
                    '            <snapshots>\n' +
                    '                <enabled>false</enabled>\n' +
                    '            </snapshots>\n' +
                    '        </repository>\n' +
                    '    </repositories>\n\n    <dependencies>';
                content = content.replace(repoAnchor, repoReplacement);
              }
            }

            return content;
          });
        }
      },
    });
  }

    get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask({ entities, application }) {
        const packageFolder = (application.packageFolder ?? (application.packageName ? `${application.packageName.replace(/\./g, '/')}/` : undefined) ?? '').replace(/\/+$/, '');
        if (!packageFolder) {
          this.log.warn('[sql-spring-boot] POST_WRITING_ENTITIES: packageFolder and packageName are both unavailable, skipping file patches');
          return;
        }

        // Patch entity domain files to add vector field annotations
        const eligibleEntities = entities.filter(e => !e.builtIn && !e.skipServer);
        this.log.info(`[sql-spring-boot] POST_WRITING_ENTITIES: ${eligibleEntities.length} eligible entities out of ${entities.length} total`);
        for (const entity of eligibleEntities) {
          const allFields = entity.fields ?? [];
          const vectorFields = allFields.filter(f => f.fieldTypeVectorSaathratri);
          this.log.info(`[sql-spring-boot] Entity ${entity.name}: ${allFields.length} fields, ${vectorFields.length} vector fields`);
          if (vectorFields.length === 0) {
            // Log field names to understand why none matched
            if (allFields.length > 0) {
              this.log.info(`[sql-spring-boot] Field names: ${allFields.map(f => f.fieldName).join(', ')}`);
              for (const f of allFields) {
                if (f.fieldName && f.fieldName.toLowerCase().includes('embedding')) {
                  this.log.info(`[sql-spring-boot] Embedding field "${f.fieldName}": fieldTypeVectorSaathratri=${f.fieldTypeVectorSaathratri}, options=${JSON.stringify(f.options)}`);
                }
              }
            }
            continue;
          }

          const entityFile = `src/main/java/${packageFolder}/domain/${entity.persistClass}.java`;
          this.log.info(`[sql-spring-boot] Patching vector annotations in ${entityFile}`);

          // Use editFile for mem-fs patching
          this.editFile(entityFile, content => {
            if (content.includes('PgVectorConverter')) return content;
            content = this._patchVectorAnnotations(content, vectorFields, application.packageName);
            return content;
          });

          // Also patch on disk as fallback (editFile may not work in composed generators)
          const filePath = this.destinationPath(entityFile);
          try {
            const fs = await import('fs');
            if (fs.existsSync(filePath)) {
              let content = fs.readFileSync(filePath, 'utf8');
              if (!content.includes('PgVectorConverter')) {
                content = this._patchVectorAnnotations(content, vectorFields, application.packageName);
                fs.writeFileSync(filePath, content, 'utf8');
                this.log.info(`[sql-spring-boot] Patched ${entityFile} on disk (fallback)`);
              }
            }
          } catch (e) {
            this.log.warn(`[sql-spring-boot] Disk fallback failed for ${entityFile}: ${e.message}`);
          }
        }

        // Patch ExceptionTranslator to log stacktraces at ERROR level
        const exceptionTranslatorFile = `src/main/java/${packageFolder}/web/rest/errors/ExceptionTranslator.java`;
        this.editFile(exceptionTranslatorFile, content => {
          return content.replace(
            'LOG.debug("Converting Exception to Problem Details:", ex);',
            'LOG.error("Unhandled exception caught by ExceptionTranslator:", ex);'
          );
        });
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

  _patchVectorAnnotations(content, vectorFields, packageName) {
    // Add ColumnTransformer import
    if (!content.includes('import org.hibernate.annotations.ColumnTransformer;')) {
      content = content.replace(
        /import jakarta\.persistence\.\*;/,
        'import jakarta.persistence.*;\nimport org.hibernate.annotations.ColumnTransformer;'
      );
    }

    for (const field of vectorFields) {
      const columnName = field.fieldNameAsDatabaseColumn;
      // Match @Column(name = "xxx_embedding") or @Column(name = "xxx_embedding", ...)
      const columnRegex = new RegExp(
        `([ \\t]*)@Column\\(name\\s*=\\s*"${columnName}"[^)]*\\)`,
        'g'
      );
      content = content.replace(columnRegex, (match, indent) => {
        return `${indent}@Column(name = "${columnName}", columnDefinition = "vector(${field.vectorDimensionSaathratri})")\n${indent}@Convert(converter = ${packageName}.domain.converter.PgVectorConverter.class)\n${indent}@ColumnTransformer(write = "?::vector")`;
      });
    }
    return content;
  }
}

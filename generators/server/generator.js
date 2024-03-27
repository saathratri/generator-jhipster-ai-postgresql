import chalk from 'chalk';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import command from './command.js';

import saathratriUtils from '../utils-saathratri.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });

    if (this.options.help) return;

    if (!this.jhipsterContext) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints multiple-human-readable-foreign-key-fields')}`
      );
    }

    // References: 
    // - https://stackoverflow.com/questions/73705785/how-to-create-a-custom-blueprint
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
    
    this.jhipsterContext.getDTOArtifactName = this.getDTOArtifactName;
    this.jhipsterContext.getJavaValueGeneratorForType = this.getJavaValueGeneratorForType;
    this.jhipsterContext.getServerOptionForMappingsInEntityMapperToDTO = this.getServerOptionForMappingsInEntityMapperToDTO;
    this.jhipsterContext.getServerOptionForMappingsInEntityMapperToDTOId = this.getServerOptionForMappingsInEntityMapperToDTOId;
    this.jhipsterContext.getCompositePrimaryKeyInstanceVariableInitializationsFromDTOTest = this.getCompositePrimaryKeyInstanceVariableInitializationsFromDTOTest;
    this.jhipsterContext.getCompositePrimaryKeyInstanceVariablesFromDTOId = this.getCompositePrimaryKeyInstanceVariablesFromDTOId;
    this.jhipsterContext.getCompositePrimaryKeyNullCheck = this.getCompositePrimaryKeyNullCheck;
    this.jhipsterContext.getCompositePrimaryKeyResponseEntityUri = this.getCompositePrimaryKeyResponseEntityUri;
    this.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocUrl = this.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocUrl;
    this.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocMethodParameters = this.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocMethodParameters;

    this.jhipsterContext.getCompositePrimaryKeyInstanceVariables = this.getCompositePrimaryKeyInstanceVariables;
    this.jhipsterContext.getCompositePrimaryKeyResourceClassMethodQueryParameters = this.getCompositePrimaryKeyResourceClassMethodQueryParameters;
    this.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingUrl = this.getCompositePrimaryKeyPutPatchGetDeleteMappingUrl;
    this.jhipsterContext.getCompositePrimaryKeyPutPatchMappingMethodPathVariableParameters = this.getCompositePrimaryKeyPutPatchMappingMethodPathVariableParameters;
    this.jhipsterContext.getCompositePrimaryKeyLogStatement = this.getCompositePrimaryKeyLogStatement;
    this.jhipsterContext.getCompositePrimaryKeyEquivalenceCheck = this.getCompositePrimaryKeyEquivalenceCheck;

    this.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingMethodPathVariableParameters = this.getCompositePrimaryKeyGetDeleteMappingMethodPathVariableParameters;
    this.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingMethodRequestVariableParameters = this.getCompositePrimaryKeyGetDeleteMappingMethodRequestVariableParameters;
    this.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingSetStatements = this.getCompositePrimaryKeyGetDeleteMappingSetStatements;
    this.jhipsterContext.getCompositePrimaryKeyComputeValue = this.getCompositePrimaryKeyComputeValue;
    this.jhipsterContext.isCompositePrimaryKeyClientField = this.isCompositePrimaryKeyClientField;
    this.jhipsterContext.getCompositePrimaryKeyTestSetIdStatement = this.getCompositePrimaryKeyTestSetIdStatement;

    this.jhipsterContext.getCompositePrimaryKeyServerUrl = this.getCompositePrimaryKeyServerUrl;
    this.jhipsterContext.getPrimaryKeyWithNecessaryClusteringFields = this.getPrimaryKeyWithNecessaryClusteringFields;
    this.jhipsterContext.getCompositePrimaryKeyServiceMethodName = this.getCompositePrimaryKeyServiceMethodName;
    this.jhipsterContext.getCompositePrimaryKeyServiceFilterMethodName = this.getCompositePrimaryKeyServiceFilterMethodName;
    this.jhipsterContext.getPrimaryKeyWithClusteringFieldsOfTypeLong = this.getPrimaryKeyWithClusteringFieldsOfTypeLong;
    this.jhipsterContext.getCompositePrimaryKeyTypeAndInstanceVariables = this.getCompositePrimaryKeyTypeAndInstanceVariables;
    this.jhipsterContext.getAllComparisonMethodNames = this.getAllComparisonMethodNames;
    this.jhipsterContext.getCompositePrimaryKeyGetMappingUrl = this.getCompositePrimaryKeyGetMappingUrl;
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
      async writingTemplateTask(application) {

        console.log("Amar");
        console.log("this.baseName: " + this.jhipsterContext.baseName);
        //console.log(this.jhipsterContext);
        console.log("this.getDTOArtifactName(): " + this.getDTOArtifactName());
        console.log("this.jhipsterConfig.packageFolder: " + this.jhipsterConfig.packageFolder);
       
        this.jhipsterContext.dtoFiles = [
          {
            condition: generator => generator.dtoMapstruct,
            path: 'src/main/java/',
            templates: [
              {
                file: '_package_/_entityPackage_/service/dto/_dtoClass_.java',
                  renameTo: generator => `../../../../${this.getDTOArtifactName()}/src/main/java/${this.jhipsterConfig.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.java`,
              }
            ],
          }
        ];
        this.jhipsterContext.server = [
          {
            condition: generator => generator.applicationType === 'microservice',
            path: 'maven/',
            templates: [
              {
                file: 'pom.xml',
                renameTo: () => `../../${this.getDTOArtifactName()}/pom.xml`
              },
              {
                file: 'mvnw',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/mvnw`
              },
              {
                file: 'mvnw.cmd',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/mvnw.cmd`
              },
              {
                file: 'README.md',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/README.md`
              },
              {
                file: '.mvn/wrapper/MavenWrapperDownloader.java',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/.mvn/wrapper/MavenWrapperDownloader.java`
              },
              {
                file: '.mvn/wrapper/maven-wrapper.jar',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/.mvn/wrapper/maven-wrapper.jar`
              },
              {
                file: '.mvn/wrapper/maven-wrapper.properties',
                method: 'copy',
                noEjs: true,
                renameTo: () => `../../${this.getDTOArtifactName()}/.mvn/wrapper/maven-wrapper.properties`
              },
            ],
          },
        ];
        await this.writeFiles({
          sections: {
            files: [{ templates: ['template-file-server'] }],
          },
          context: application,
        });

        // Customize the Maven file if the application type is microservice
        await this.customizeMaven();

      },
    });
  }

  async customizeMaven() {
    // Check if application type is microservice and then edit the file
    if (this.applicationTypeMicroservice) {
      this.editFile('pom.xml', content =>
        content.replace(
          `<!-- jhipster-needle-maven-add-dependency -->`,
          `
            <!-- Saathratri DTOs -->
            <dependency>
              <groupId>${this.packageName}.dto</groupId>
              <artifactId>${this.getDTOArtifactName(this.packageName)}</artifactId>
              <version>1.0.1-RELEASE</version>
            </dependency>
            <!-- jhipster-needle-maven-add-dependency -->
          `
        )
      );
    }
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingEntitiesTemplateTask() {},
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

  getDTOArtifactName() {
    return saathratriUtils.getDTOArtifactName(this.baseName);
  }
}

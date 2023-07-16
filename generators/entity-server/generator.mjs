import chalk from 'chalk';
import EntityServerGenerator, { files } from 'generator-jhipster/esm/generators/entity-server';
import {
  PRIORITY_PREFIX,
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
} from 'generator-jhipster/esm/priorities';
import saathratriUtils from '../utils-saathratri.js';

export default class extends EntityServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    if (!this.options.jhipsterContext) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints cassandra-composite-primary-key')}`
      );
    }
    
    // References: 
    // - https://stackoverflow.com/questions/73705785/how-to-create-a-custom-blueprint
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
    
    this.options.jhipsterContext.getDTOArtifactName = this.getDTOArtifactName;
    this.options.jhipsterContext.getJavaValueGeneratorForType = this.getJavaValueGeneratorForType;
    this.options.jhipsterContext.getServerOptionForMappingsInEntityMapperToDTO = this.getServerOptionForMappingsInEntityMapperToDTO;
    this.options.jhipsterContext.getServerOptionForMappingsInEntityMapperToDTOId = this.getServerOptionForMappingsInEntityMapperToDTOId;
    this.options.jhipsterContext.getCompositePrimaryKeyInstanceVariableInitializationsFromDTOTest = this.getCompositePrimaryKeyInstanceVariableInitializationsFromDTOTest;
    this.options.jhipsterContext.getCompositePrimaryKeyInstanceVariablesFromDTOId = this.getCompositePrimaryKeyInstanceVariablesFromDTOId;
    this.options.jhipsterContext.getCompositePrimaryKeyNullCheck = this.getCompositePrimaryKeyNullCheck;
    this.options.jhipsterContext.getCompositePrimaryKeyResponseEntityUri = this.getCompositePrimaryKeyResponseEntityUri;
    this.options.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocUrl = this.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocUrl;
    this.options.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocMethodParameters = this.getCompositePrimaryKeyPutPatchGetDeleteMappingJavaDocMethodParameters;

    this.options.jhipsterContext.getCompositePrimaryKeyInstanceVariables = this.getCompositePrimaryKeyInstanceVariables;
    this.options.jhipsterContext.getCompositePrimaryKeyResourceClassMethodQueryParameters = this.getCompositePrimaryKeyResourceClassMethodQueryParameters;
    this.options.jhipsterContext.getCompositePrimaryKeyPutPatchGetDeleteMappingUrl = this.getCompositePrimaryKeyPutPatchGetDeleteMappingUrl;
    this.options.jhipsterContext.getCompositePrimaryKeyPutPatchMappingMethodPathVariableParameters = this.getCompositePrimaryKeyPutPatchMappingMethodPathVariableParameters;
    this.options.jhipsterContext.getCompositePrimaryKeyLogStatement = this.getCompositePrimaryKeyLogStatement;
    this.options.jhipsterContext.getCompositePrimaryKeyEquivalenceCheck = this.getCompositePrimaryKeyEquivalenceCheck;

    this.options.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingMethodPathVariableParameters = this.getCompositePrimaryKeyGetDeleteMappingMethodPathVariableParameters;
    this.options.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingMethodRequestVariableParameters = this.getCompositePrimaryKeyGetDeleteMappingMethodRequestVariableParameters;
    this.options.jhipsterContext.getCompositePrimaryKeyGetDeleteMappingSetStatements = this.getCompositePrimaryKeyGetDeleteMappingSetStatements;
    this.options.jhipsterContext.getCompositePrimaryKeyComputeValue = this.getCompositePrimaryKeyComputeValue;
    this.options.jhipsterContext.isCompositePrimaryKeyClientField = this.isCompositePrimaryKeyClientField;
    this.options.jhipsterContext.getCompositePrimaryKeyTestSetIdStatement = this.getCompositePrimaryKeyTestSetIdStatement;

    this.options.jhipsterContext.getCompositePrimaryKeyServerUrl = this.getCompositePrimaryKeyServerUrl;
    this.options.jhipsterContext.getPrimaryKeyWithNecessaryClusteringFields = this.getPrimaryKeyWithNecessaryClusteringFields;
    this.options.jhipsterContext.getCompositePrimaryKeyServiceMethodName = this.getCompositePrimaryKeyServiceMethodName;
    this.options.jhipsterContext.getCompositePrimaryKeyServiceFilterMethodName = this.getCompositePrimaryKeyServiceFilterMethodName;
    this.options.jhipsterContext.getPrimaryKeyWithClusteringFieldsOfTypeLong = this.getPrimaryKeyWithClusteringFieldsOfTypeLong;
    this.options.jhipsterContext.getCompositePrimaryKeyTypeAndInstanceVariables = this.getCompositePrimaryKeyTypeAndInstanceVariables;
    this.options.jhipsterContext.getAllComparisonMethodNames = this.getAllComparisonMethodNames;
    this.options.jhipsterContext.getCompositePrimaryKeyGetMappingUrl = this.getCompositePrimaryKeyGetMappingUrl;

    this.sbsBlueprint = true;
  }

  get [INITIALIZING_PRIORITY]() {
    return {
      async initializingTemplateTask() {},
      ...super._initializing(),
    };
  }

  get [PROMPTING_PRIORITY]() {
    return {
      async promptingTemplateTask() {},
      ...super._prompting(),
    }
  }

  get [CONFIGURING_PRIORITY]() {
    return {
      async configuringTemplateTask() {},
      ...super._configuring(),
    };
  }

  get [COMPOSING_PRIORITY]() {
    return {
      async composingTemplateTask() {},
      ...super._composing(),
    };
  }

  get [LOADING_PRIORITY]() {
    return {
      async loadingTemplateTask() {},
      ...super._loading(),
    };
  }

  get [PREPARING_PRIORITY]() {
    return {
      async preparingTemplateTask() {},
      ...super._preparing(),
    };
  }

  get [DEFAULT_PRIORITY]() {
    return {
      async defaultTemplateTask() {},
      ...super._default(),
    };
  }

  get [WRITING_PRIORITY]() {
    return {
      async writingTemplateTask() {
        files.dtoFiles = [
          {
            condition: generator => generator.dtoMapstruct,
            path: 'src/main/java/',
            templates: [
              {
                file: 'package/service/dto/EntityDTO.java',
                  renameTo: generator => `../../../../${this.getDTOArtifactName()}/src/main/java/${this.jhipsterConfig.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.java`,
              }
            ],
          }
        ];
        files.server = [
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
      },
      ...super._writing(),
    };
  }

  get [POST_WRITING_PRIORITY]() {
    return {
      async postWritingTemplateTask() {},
    ...super._postWriting(),
    };
  }

  get [INSTALL_PRIORITY]() {
    return {
      async installTemplateTask() {},
      ...super._install(),
    };
  }

  get [END_PRIORITY]() {
    return {
      async endTemplateTask() {},
      ...super._end(),
    };
  }
  
  getDTOArtifactName() {
    return saathratriUtils.getDTOArtifactName(this.baseName);
  }
}

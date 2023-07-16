import chalk from 'chalk';
import ServerGenerator, { files } from 'generator-jhipster/esm/generators/server';
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

export default class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    if (!this.options.jhipsterContext) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints cassandra-composite-primary-key')}`
      );
    }

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
      async writingTemplateTask() {},
      ...super._writing(),
      async customizeMaven() {
        if (this.applicationTypeMicroservice) {
          this.editFile('pom.xml', content =>
            content
              .replace(
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
      },
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

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
    this.jhipsterContext.isOptionToDisplayInGuiEnabled = this.isOptionToDisplayInGuiEnabled;
    this.jhipsterContext.getClientOptionToDisplayForUpdate = this.getClientOptionToDisplayForUpdate;
    this.jhipsterContext.getClientOptionToDisplayForModel = this.getClientOptionToDisplayForModel;
    this.jhipsterContext.getClientOptionToDisplayForManyToManyList = this.getClientOptionToDisplayForManyToManyList;
    this.jhipsterContext.getClientOptionToDisplayForList = this.getClientOptionToDisplayForList;
  }

  isOptionToDisplayInGuiEnabled = function isOptionToDisplayInGuiEnabled() {
    return saathratriConstants.USE_OPTION_TO_DISPLAY_IN_GUI;
  }

  getClientOptionToDisplayForUpdate = function getClientOptionToDisplayForUpdate(otherEntity, otherEntityName, otherEntityField) {
    return saathratriUtils.getClientOptionToDisplayForUpdate(otherEntity, otherEntityName, otherEntityField);
  }

  getClientOptionToDisplayForModel = function getClientOptionToDisplayForModel(otherEntity, relationshipFieldName, otherEntityField) {
      return saathratriUtils.getClientOptionToDisplayForModel(otherEntity, relationshipFieldName, otherEntityField);
  }

  getClientOptionToDisplayForManyToManyList = function getClientOptionToDisplayForManyToManyList(otherEntity, relationshipFieldName, otherEntityField) {
      return saathratriUtils.getClientOptionToDisplayForManyToManyList(otherEntity, relationshipFieldName, otherEntityField);
  }

  getClientOptionToDisplayForList = function getClientOptionToDisplayForList(otherEntity, entityInstanceName, relationshipFieldName, otherEntityField) {
      return saathratriUtils.getClientOptionToDisplayForList(otherEntity, entityInstanceName, relationshipFieldName, otherEntityField);
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
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: {
            files: [{ templates: ['template-file-angular'] }],
          },
          context: application,
        });
      },
    });
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
}

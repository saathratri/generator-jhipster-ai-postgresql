import chalk from 'chalk';
import EntityClientGenerator from 'generator-jhipster/esm/generators/entity-client';
import { PRIORITY_PREFIX, INITIALIZING_PRIORITY } from 'generator-jhipster/esm/priorities';
import saathratriConstants from '../constants-saathratri.js';
import saathratriUtils from '../utils-saathratri.js';

export default class extends EntityClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    // References: 
    // - https://stackoverflow.com/questions/73705785/how-to-create-a-custom-blueprint
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
    this.options.jhipsterContext.isOptionToDisplayInGuiEnabled = this.isOptionToDisplayInGuiEnabled;
    this.options.jhipsterContext.getClientOptionToDisplayForUpdate = this.getClientOptionToDisplayForUpdate;
    this.options.jhipsterContext.getClientOptionToDisplayForModel = this.getClientOptionToDisplayForModel;
    this.options.jhipsterContext.getClientOptionToDisplayForManyToManyList = this.getClientOptionToDisplayForManyToManyList;
    this.options.jhipsterContext.getClientOptionToDisplayForList = this.getClientOptionToDisplayForList;

    if (!this.options.jhipsterContext) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow(
          'jhipster --blueprints multiple-human-readable-foreign-key-fields'
        )}`
      );
    }

    this.sbsBlueprint = true;
  }

  get [INITIALIZING_PRIORITY]() {
    return {
      async initializingTemplateTask() {},
    };
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
}

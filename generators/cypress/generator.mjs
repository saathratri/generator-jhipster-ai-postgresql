import chalk from 'chalk';
import CypressGenerator from 'generator-jhipster/esm/generators/cypress';
import { PRIORITY_PREFIX, INITIALIZING_PRIORITY } from 'generator-jhipster/esm/priorities';

export default class extends CypressGenerator {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

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
}

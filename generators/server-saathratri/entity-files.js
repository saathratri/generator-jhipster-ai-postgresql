import { javaMainPackageTemplatesBlock } from 'generator-jhipster/generators/server/support';

export const entityServerFilesSaathratri = {
    server: [
        javaMainPackageTemplatesBlock({
            condition: generator => !generator.embedded,
            templates: [
                '_entityPackage_/service/mapper/_entityClass_Mapper.java',
            ],
        })
    ],
};
/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const baseServerFilesSaathratri = {
    serverResource: [
        {
            path: 'src/main/resources',
            templates: [
                'config/application-dev.yml',
            ],
        },
    ],
};
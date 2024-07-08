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

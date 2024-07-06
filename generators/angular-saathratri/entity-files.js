import { clientApplicationTemplatesBlock } from 'generator-jhipster/generators/client/support';

export const entityModelFiles = clientApplicationTemplatesBlock({
    templates: ['entities/_entityFolder_/_entityFile_.model.ts' /*, 'entities/_entityFolder_/_entityFile_.test-samples.ts'*/], 
});
    
export const entityServiceFiles = clientApplicationTemplatesBlock({
    condition: generator => !generator.embedded,
    templates: [/*'entities/_entityFolder_/service/_entityFile_.service.ts', 'entities/_entityFolder_/service/_entityFile_.service.spec.ts'*/],
});
    
export const angularFilesFromSaathratri = {
    model: [entityModelFiles],
    service: [entityServiceFiles],
    client: [
        clientApplicationTemplatesBlock({
            condition: generator => !generator.embedded,
            templates: [
                //'entities/_entityFolder_/_entityFile_.routes.ts',
                'entities/_entityFolder_/detail/_entityFile_-detail.component.html',
                //'entities/_entityFolder_/detail/_entityFile_-detail.component.ts',
                //'entities/_entityFolder_/detail/_entityFile_-detail.component.spec.ts',
                'entities/_entityFolder_/list/_entityFile_.component.html',
                //'entities/_entityFolder_/list/_entityFile_.component.ts',
                //'entities/_entityFolder_/list/_entityFile_.component.spec.ts',
                //'entities/_entityFolder_/route/_entityFile_-routing-resolve.service.ts',
                //'entities/_entityFolder_/route/_entityFile_-routing-resolve.service.spec.ts',
            ],
        }),
        clientApplicationTemplatesBlock({
            condition: generator => !generator.readOnly && !generator.embedded,
            templates: [
                //'entities/_entityFolder_/update/_entityFile_-form.service.ts',
                //'entities/_entityFolder_/update/_entityFile_-form.service.spec.ts',
                'entities/_entityFolder_/update/_entityFile_-update.component.html',
                //'entities/_entityFolder_/update/_entityFile_-update.component.spec.ts',
                //'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.html',
                //'entities/_entityFolder_/update/_entityFile_-update.component.ts',
                //'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.ts',
                //'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.spec.ts',
            ],
        }),
    ],
};
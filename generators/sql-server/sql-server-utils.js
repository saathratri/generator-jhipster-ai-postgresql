import { saathratriConstants } from '../saathratri-constants.js';

export const serverSaathratriUtils = {

    /**************************************
     * sql-server Helper Functions
     **************************************/

   /**
    * Get the otherEntity DisplayInGuiLink field.
    * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
    * This method is necessary because of lazy loading of the get API's. So when the 
    * REST API is called, the foreign key fields apart from the ID field are not loaded.
    *   
    * @param fields
    *   The fields of the entity.
    *   
    * @return
    *  The mapping to display in the mapper.
    * @Mapping(target = "fieldName", source = "fieldName")
    */
    getMappingsToDisplayInMapper(fields) {
        if(!fields) { return; }

        /*
        * Get the otherEntity DisplayInGuiLink field.
        * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
        */
        let mappingToDisplayInMapper = '';

        for (const field of fields.filter(field => !field.hidden)) {
            if(field.options) {

                if(field.options.customAnnotation[0] === "DISPLAY_IN_GUI_RELATIONSHIP_LINK") {

                    /*
                    * Display customization - human readable names.
                    * entityInstance + "." + relationshipFieldName + "." + otherEntityField
                    */ 
                    mappingToDisplayInMapper += "@Mapping(target = \"" + field.fieldName + "\", source = \"" + field.fieldName + "\")\n";
                } 
            }
        }

        return mappingToDisplayInMapper;
    },

    isOptionToDisplayInGuiEnabled() {
        return saathratriConstants.USE_OPTION_TO_DISPLAY_IN_GUI;
    }
}
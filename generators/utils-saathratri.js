//module.exports = {
export default {
    /*********************************
     * entity-client Helper Functions
     *********************************/
     getClientOptionToDisplayForUpdate,
     getClientOptionToDisplayForModel,
     getClientOptionToDisplayForManyToManyList,
     getClientOptionToDisplayForList,
     getDTOArtifactName
};

function getDTOArtifactName(baseName) {
    return baseName + 'dto';
}

/*********************************
 * entity-client Helper Functions
 *********************************/

function getClientOptionToDisplayForUpdate(otherEntity, otherEntityName, otherEntityField) {
  if(!otherEntity || !otherEntityName || !otherEntityField) { return; }

  /*
   * Get the otherEntity DisplayInGuiLink field.
   * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
   */
  let optionToDisplayInGui = '';

  for (const field of otherEntity.fields.filter(field => !field.hidden)) {
      if(field.options) {

          if(field.options.customAnnotation[0] === "DISPLAY_IN_GUI_RELATIONSHIP_LINK") {
          
              if(optionToDisplayInGui) {
                  optionToDisplayInGui += " + '" + field.options.customAnnotation[1] + "' + ";
              }

              /*
               * Display customization - human readable names.
               * otherEntityNameOption.otherEntityField
               */
              optionToDisplayInGui += otherEntityName + 'Option.' + field.fieldName;
          } 
      }
  }

  if(!optionToDisplayInGui) {
      /*
       * Display ID as before customization.
       * otherEntityNameOption.otherEntityField
       */
      optionToDisplayInGui = otherEntityName + 'Option.' + otherEntityField;
  }

  return optionToDisplayInGui;
}

function getClientOptionToDisplayForModel(otherEntity, relationshipFieldName, otherEntityField) {
  if(!otherEntity || !relationshipFieldName || !otherEntityField) { return; }

  /*
   * Get the otherEntity DisplayInGuiLink field.
   * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
   */
  let optionToDisplayInGui = '';

  for (const field of otherEntity.fields.filter(field => !field.hidden)) {
      if(field.options) {

          if(field.options.customAnnotation[0] === "DISPLAY_IN_GUI_RELATIONSHIP_LINK") {

              /*
               * Display customization - human readable names.
               * relationshipFieldName.otherEntityField
               */ 
              if( field.fieldName !== 'id') {
                optionToDisplayInGui += " | '" + field.fieldName + "'";
              }
          } 
      }
  }

  return optionToDisplayInGui;
}

function getClientOptionToDisplayForManyToManyList(otherEntity, relationshipFieldName, otherEntityField) {
  if(!otherEntity || !relationshipFieldName || !otherEntityField) { return; }

  /*
   * Get the otherEntity DisplayInGuiLink field.
   * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
   */
  let optionToDisplayInGui = '';

  for (const field of otherEntity.fields.filter(field => !field.hidden)) {
      if(field.options) {

          if(field.options.customAnnotation[0] === "DISPLAY_IN_GUI_RELATIONSHIP_LINK") {
          
              if(optionToDisplayInGui) {
                  optionToDisplayInGui += " + '" + field.options.customAnnotation[1] + "' + ";
              }

              /*
               * Display customization - human readable names.
               * relationshipFieldName.otherEntityField
               */ 
              optionToDisplayInGui += relationshipFieldName + "." + field.fieldName;
          } 
      }
  }

  if(!optionToDisplayInGui) {
      /*
       * Display ID as before customization.
       * relationshipFieldName.otherEntityField
       */
      optionToDisplayInGui = relationshipFieldName + "." + otherEntityField;
  }

  return optionToDisplayInGui;
}

function getClientOptionToDisplayForList(otherEntity, entityInstanceName, relationshipFieldName, otherEntityField) {
  if(!otherEntity || !entityInstanceName || !relationshipFieldName || !otherEntityField) { return; }

  /*
  * Get the otherEntity DisplayInGuiLink field.
  * Use @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")
  */
  let optionToDisplayInGui = '';

  for (const field of otherEntity.fields.filter(field => !field.hidden)) {
      if(field.options) {

          if(field.options.customAnnotation[0] === "DISPLAY_IN_GUI_RELATIONSHIP_LINK") {
          
              if(optionToDisplayInGui) {
                  optionToDisplayInGui += " + '" + field.options.customAnnotation[1] + "' + ";
              }

              /*
               * Display customization - human readable names.
               * entityInstance + "." + relationshipFieldName + "." + otherEntityField
               */ 
              optionToDisplayInGui += entityInstanceName + "." + relationshipFieldName + "." + field.fieldName;
          } 
      }
  }

  if(!optionToDisplayInGui) {
      /*
       * Display ID as before customization.
       * entityInstance + "." + relationshipFieldName + "." + otherEntityField
       */
      optionToDisplayInGui = entityInstanceName + "." + relationshipFieldName + "." + otherEntityField;
  }

  return optionToDisplayInGui;
}
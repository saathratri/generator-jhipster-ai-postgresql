import fs from 'fs';
import path from 'path';

const LAST_USED_PORT_FILE = 'last-used-port.json';

export const sqlServerUtils = {

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
    },

    /**************************************
     * server-utils Helper Functions
     **************************************/

    getLastUsedPortsFile( destinationPath ) {
        return path.join(destinationPath, '..', LAST_USED_PORT_FILE);
    },

    getLastUsedPort(destinationPath) {
        // Path to the last-used-port.json file
        const portFilePath = this.getLastUsedPortsFile(destinationPath);

        // Read the last used port
        let lastUsedPort;
        let portData;
        
        try {
            portData = JSON.parse(fs.readFileSync(portFilePath, 'utf8'));
            lastUsedPort = portData.lastUsedPort;

        } catch (error) {
            lastUsedPort = 5432;
        }

        return lastUsedPort
    },

    setLastUsedPort(destinationPath, port, appName) {
        // Path to the last-used-port.json file
        const portFilePath = this.getLastUsedPortsFile(destinationPath);

        // Read the last used port
        let portData;
        try {
            portData = JSON.parse(fs.readFileSync(portFilePath, 'utf8'));
        } catch (error) {
            portData = {};
        }

        // Ensure the appName key exists
        if (!portData[appName]) {
            portData[appName] = {};
        }

        // Update the last used port
        portData[appName].port = port;
        portData.lastUsedPort = port;

        // Write the last used port
        fs.writeFileSync(portFilePath, JSON.stringify(portData, null, 2));
    },

    getApplicationPort(destinationPath, appName) {
        // Path to the last-used-port.json file
        const portFilePath = this.getLastUsedPortsFile(destinationPath);

        // Read the last used port
        let portData;
        try {
            portData = JSON.parse(fs.readFileSync(portFilePath, 'utf8'));

        } catch (error) {
            portData = {};
        }

        // Ensure the appName key exists
        if (!portData[appName]) {
            portData[appName].port = 5432;
        }

        return portData[appName].port;
    }
}
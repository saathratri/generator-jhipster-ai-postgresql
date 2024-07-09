import fs from 'fs';
import path from 'path';

const LAST_USED_PORT_FILE = 'last-used-port.json';

export const serverUtils = {

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
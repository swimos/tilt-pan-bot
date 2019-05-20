class ConfigLoader {
    constructor(commandLineArgs) {
        this.args = [];
        this.configName = '';
        this.showDebug = false;
        this.configValues = null;
        this.processCommandLineArgs(commandLineArgs);
        this.loadConfig(this.args.config || 'localhost')

        if (this.showDebug) {
            console.info('[ConfigLoader] config loaded and processed');
            console.info('[ConfigLoader] args', this.args);
            console.info('[ConfigLoader] configValues', this.configValues);
        }        
    }

    /**
     * utility method to handle processing arguments from the command line
     * arguments will be stored in this.args
     */
    processCommandLineArgs(commandLineArgs) {
        commandLineArgs.forEach((val, index, arr) => {
            if(val.indexOf('=') > 0) {
                const rowValue = val.split('=');
                this.args[rowValue[0]] = rowValue[1];
            }
        })
    }

    /**
     * Load up configuration values from config file
     * @param {*} configName 
     */
    loadConfig(configName) {
        if (this.showDebug) {
            console.info(`[ConfigLoader] load config for ${configName}`);
        }
        // load config
        this.configValues = require('../../config/node/'+configName+'Config.js');

        if(this.configValues) {
            // toggle app debug output
            this.showDebug = this.configValues.showDebug;
        }
     
    }    
}

module.exports = ConfigLoader;
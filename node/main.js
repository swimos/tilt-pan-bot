console.info("[Main] Start.");
console.info("[Main] Include Required Libs.");

// const utils = require('./lib/utils');
const PythonWrapper = require('./lib/pythonWrapper');
const swim = require('@swim/core');
const ConfigLoader = require('./lib/configLoader');
const os = require("os");
 
class Main {
    constructor() {
        this.config = new ConfigLoader(process.argv);
        this.showDebug = this.config.showDebug;
        this.swimUrl = `ws://${this.config.configValues.swimUrl}:${this.config.configValues.swimPort}`;
        this.links = [];
        this.gamePads = [];
        this.startCpuMeasure = null;
        this.catPredictions = [];
        this.facePredictions = [];
        this.tiltPan = {
            file: this.config.configValues.tiltPan.pythonFile,
            process: null
        }
        this.currentMood = "neutral";

        this.initialize();
    }

    initialize() {
        if (this.showDebug) {
            console.info('[Main] initialize');
        }
        if(this.config.configValues.dualshock && this.config.configValues.dualshock.enabled) {
            const DualshockController = require('./lib/dualshock');
            this.gamePads[0] = new DualshockController(this.config, 0);
        }
        if(this.config.configValues.tiltPan && this.config.configValues.tiltPan.enabled) {
            this.tiltPan.process = new PythonWrapper(this.tiltPan.file, this.showDebug);
        }

        
    }

    start() {
        if (this.showDebug) {
            console.info('[Main] start');
        }
        if(this.config.configValues.dualshock && this.config.configValues.dualshock.enabled) {
            this.gamePads[0].start();
        }
        if(this.config.configValues.tiltPan && this.config.configValues.tiltPan.enabled && this.tiltPan.process !== null) {
            this.tiltPan.process.start();

            //setup links which will pass dualshock stick values to tiltPan python process
            this.links['leftStickX'] = swim.downlinkValue()
                .hostUri(this.swimUrl)
                .nodeUri("/gamePad/0/leftStickX")
                .laneUri('latest')
                .didSet((newValue) => {
                    if (this.showDebug) {
                        // console.info('[Main] write to process', `{"key":"stickX","value":"${newValue.value}"}`);
                    }                    
                    this.tiltPan.process.writeMessage(`{"key":"stickX","value":"${newValue.value}"}`);
                })
                .open();

            this.links['leftStickY'] = swim.downlinkValue()
                .hostUri(this.swimUrl)
                .nodeUri("/gamePad/0/leftStickY")
                .laneUri('latest')
                .didSet((newValue) => {
                    if (this.showDebug) {
                        // console.info('[Main] write to process', `{"key":"stickY","value":"${newValue.value}"}`);
                    }                    
                    this.tiltPan.process.writeMessage(`{"key":"stickY","value":"${newValue.value}"}`);
                })
                .open();

        }
        this.links['ledMode'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri('/robotState')
            .laneUri('ledMode')
            .didSet((newValue) => {
                if (this.showDebug) {
                    console.info('[Main] ledMode', newValue);
                    console.info('[Main] post:', (`{"key":"ledMode","value":"${newValue.value}"}`))
                }
                this.tiltPan.process.writeMessage(`{"key":"ledMode","value":"${newValue.value}"}`);

            })
            .open();           
            
        this.links['mood'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri('/robotState')
            .laneUri('mood')
            .didSet((newValue) => {
                
                if(newValue.value !== this.currentMood) {
                    this.currentMood = newValue.value
                    console.info('[Main] mood', this.currentMood);
                    if(this.currentMood === "happy") {
                        swim.command(this.swimUrl, '/robotState', `setLedMode`,  "greeneyes");
                    } else if(this.currentMood === "angry") {
                        swim.command(this.swimUrl, '/robotState', `setLedMode`,  "cylon");
                    } else {
                        swim.command(this.swimUrl, '/robotState', `setLedMode`,  "blueeyes");
                    }
                }
            })
            .open();     
            

        this.links['catPredictions'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri('/predictions/cat')
            .laneUri('latest')
            .didSet((newValue) => {
              const valueArr = eval(newValue.value);
              if (valueArr) {
                this.catPredictions = valueArr;
              } else {
                this.catPredictions = [];
              }
              if(this.catPredictions.length > 0 && this.facePredictions.length === 0) {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "happy");
              } else if(this.catPredictions.length === 0 && this.facePredictions.length > 0) {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "angry");
              } else {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "neutral");
              }

            })
            .open();            

        this.links['facePredictions'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri('/predictions/face')
            .laneUri('latest')
            .didSet((newValue) => {
              const valueArr = eval(newValue.value);
              if (valueArr) {
                this.facePredictions = valueArr;
              } else {
                this.facePredictions = [];
              }
              if(this.catPredictions.length > 0 && this.facePredictions.length === 0) {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "happy");
              } else if(this.catPredictions.length === 0 && this.facePredictions.length > 0) {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "angry");
              } else {
                swim.command(this.swimUrl, '/robotState', `setMood`,  "neutral");
              }
            })
            .open();              
        //Set delay for second Measure
        this.startCpuMeasure = this.cpuAverage();
        setInterval(() => { 

            const endMeasure = this.cpuAverage(); 
            const idleDifference = endMeasure.idle - this.startCpuMeasure.idle;
            const totalDifference = endMeasure.total - this.startCpuMeasure.total;
        
            //Calculate the average percentage CPU usage
            const percentageCPU = 100 - (100 * idleDifference / totalDifference);
        
            //Output result to console
            // console.log(percentageCPU + "% CPU Usage.");
            swim.command(this.swimUrl, '/introspection', `setCpuUsage`,  percentageCPU);
            this.startCpuMeasure = endMeasure;
        
        }, 500);      
        
        // this.tiltPan.process.writeMessage(`{"key":"pan","value":"-90"}`);
        // this.tiltPan.process.writeMessage(`{"key":"tilt","value":"90"}`);
        // this.tiltPan.process.writeMessage(`{"key":"tilt","value":"-90"}`);
        // this.tiltPan.process.writeMessage(`{"key":"tilt","value":"0"}`);

    }

    stop() {
        if (this.showDebug) {
            console.info('[Main] stop all');
        }

        for(let i=0; i<this.links.length; i++) {
            this.links[i].close();
        }
        if(this.config.configValues.tiltPan && this.config.configValues.tiltPan.enabled && this.tiltPan.process !== null) {
            this.tiltPan.process.stop();
        }
     
    }

    cpuAverage() {

        //Initialize sum of idle and time of cores and fetch CPU info
        var totalIdle = 0, totalTick = 0;
        var cpus = os.cpus();
      
        //Loop through CPU cores
        for(var i = 0, len = cpus.length; i < len; i++) {
      
          //Select CPU core
          var cpu = cpus[i];
      
          //Total up the time in the cores tick
          for(let type in cpu.times) {
            totalTick += cpu.times[type];
         }     
      
          //Total up the idle time of the core
          totalIdle += cpu.times.idle;
        }
      
        //Return the average Idle and Tick times
        return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
      }    

}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

console.info("[Main] Node Loaded.");
if (process && process.stdin) {
    const readline = require('readline');
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    console.info('[Main] Ctrl+c or Ctrl+x to exit application.');
    process.stdin.on('keypress', (str, key) => {
        // console.log(`You pressed the "${key.name}" key`);
        if (key.ctrl && (key.name === 'x' || key.name === 'c')) {
            // main.stop();
            console.info("[Main] shutting down");
            // pythonProcess.stdin.write(`{"key":"stop"}\n`);
            // pythonProcess.kill();
            main.stop();
            console.info('[Main] done');
            setTimeout(() => {
                process.exit();
            }, 10);
        } else {
            main.tiltPan.process.writeMessage(`{"key":"${key.name}"}`);
            console.log();
            console.log('[Main] from node', key);
            console.log();
        }
    });
}
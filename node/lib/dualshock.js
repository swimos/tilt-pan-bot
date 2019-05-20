const dualShock = require('dualshock-controller');
const utils = require('./utils');
const swim = require('@swim/core');

class DualshockController {

    constructor(config, controllerId) {
        
        this.config = config;
        this.showDebug = false;//this.config.configValues.showDebug;
        if(this.showDebug) {
            console.info('[DualshockController] constructor');
        }
        this.swimUrl = `ws://${this.config.configValues.swimUrl}:${this.config.configValues.swimPort}`;
        this.isConnected = false;
        this.controllerID = controllerId;
        
        this.controller = dualShock({
            config : this.config.configValues.config,
            accelerometerSmoothing : this.config.configValues.accelerometerSmoothing,
            analogStickSmoothing : this.config.configValues.analogStickSmoothing
        });

        if(this.config.configValues.config === "dualshock3") {
            this.controller.setExtras({
                rumbleLeft:  0,   // 0-1 (Rumble left on/off)
                rumbleRight: 0,   // 0-255 (Rumble right intensity)
                led: 2 // 2 | 4 | 8 | 16 (Leds 1-4 on/off, bitmasked)
            });        
        }

        if(this.config.configValues.config === "dualshock4-generic-driver") {
            this.controller.setExtras({
                rumbleLeft:  0,   // 0-255 (Rumble left intensity)
                rumbleRight: 0,   // 0-255 (Rumble right intensity)
                red:         0,   // 0-255 (Red intensity)
                green:       75,  // 0-255 (Blue intensity)
                blue:        225, // 0-255 (Green intensity)
                flashOn:     40,  // 0-255 (Flash on time)
                flashOff:    10   // 0-255 (Flash off time)
            });      
        }
    }

    start() {
        if(this.showDebug) {
            console.info('[DualshockController] start');
        }

        this.controller.on('connected', function() {
            this.isConnected = true;
        });        
        this.controller.on('left:move', data => {
            this.onMove('left', data);
        });
        this.controller.on('right:move', data => {
            this.onMove('right', data);
        });
        this.controller.on('rightLeft:motion', data => {
            this.onMotion('rightLeft', data);
        });
        this.controller.on('forwardBackward:motion', data => {
            this.onMotion('forwardBackward', data);
        });
        this.controller.on('upDown:motion', data => {
            this.onMotion('upDown', data);
        });
        this.controller.on('yaw:motion', data => {
            this.onMotion('yaw', data);
        });        

        const buttons = ['square', 'triangle', 'circle', 'x', 'l1', 'l2', 'r1', 'r2', 'start', 'select', 'dpadUp', 'dpadDown', 'dpadRight', 'dpadLeft', 'psxButton', 'rightAnalogBump', 'leftAnalogBump'];
        for(let i = 0; i<buttons.length; i++) {
            this.controller.on(`${buttons[i]}:press`, data => {
                this.onButton(buttons[i], true);
            });
            this.controller.on(`${buttons[i]}:release`, data => {
                this.onButton(buttons[i], false);
            });
    
        }
       
    }

    onMotion(channel, data) {
        if(this.showDebug) {
            console.info('[DualshockController] onMotion', channel, data);
        }

    }

    onMove(channel, data) {
        if(this.showDebug) {
            console.info('[DualshockController] onMove', channel, data);
        }

        let x = Math.round(data.x.map(0,255,-90,90)) * -1;
        let y = Math.round(data.y.map(0,255,-90,90)) * -1;
        let swimNodeX = (channel === "right") ? `/gamePad/${this.controllerID}/rightStickX` : `/gamePad/${this.controllerID}/leftStickX`;
        let swimNodeY = (channel === "right") ? `/gamePad/${this.controllerID}/rightStickY` : `/gamePad/${this.controllerID}/leftStickY`;
        
        swim.command(this.swimUrl, swimNodeX, `setLatest`,  x);
        swim.command(this.swimUrl, swimNodeY, `setLatest`,  y);
    
    }

    onButton(channel, isPressed) {
        if(this.showDebug) {
            console.info('[DualshockController] onButton', channel, isPressed);
        }

        let swimNode = `/gamePad/${this.controllerID}/${channel}`;
        swim.command(this.swimUrl, swimNode, `setLatest`,  (isPressed) ? 1: 0);
    }

}

module.exports = DualshockController;
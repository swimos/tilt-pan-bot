const HttpConfig = {
	deviceName: 'Localhost',
	showDebug: true,
	swimUrl: '192.168.10.83',
	swimPort: 9001,
	dualshock: {
		enabled: false,
		config: 'dualShock3',
		accelerometerSmoothing : true,
		analogStickSmoothing : false
	},
	tiltPan: {
		enabled: true,
		pythonFile: "./../tiltPanHat/nodeBridge.py"
	}
}

module.exports = HttpConfig;

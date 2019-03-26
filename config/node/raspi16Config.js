const HttpConfig = {
	deviceName: 'Local Host',
	httpEnabled: true,
	btEnabled: false,
	showDebug: true,
	hostUrl: '192.168.0.216',
	hostPort: 8081,
	swimUrl: '192.168.0.216',
	swimPort: 9001,
	circuitExpress: {
		bot: {
			enabled: false,
		},
		service: {
			enabled: true,
			arduinoAddress: '/dev/ttyACM0',
			baud: 19200,
			polling: {
				enabled: false,
				interval: 100
			}		
		}		
	}
}

module.exports = HttpConfig;

const HttpConfig = {
	deviceName: 'R23-TP1',
	httpEnabled: true,
	btEnabled: false,
	showDebug: true,
	hostUrl: '192.168.10.83',
	hostPort: 8081,
	swimUrl: '192.168.10.83',
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

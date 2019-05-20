const HttpConfig = {
	deviceName: 'Raspi2',
	httpEnabled: true,
	btEnabled: true,
	showDebug: true,
	hostUrl: '192.168.1.103',
	hostPort: 8081,
	swimUrl: '192.168.1.103',
	swimPort: 9001,
	circuitExpress: {
		bot: {
			enabled: false,
		},
		service: {
			enabled: true,
			arduinoAddress: '/dev/ttyACM1',
			baud: 19200,
			polling: {
				enabled: false,
				interval: 100
			}		
		}		
	}	
}

module.exports = HttpConfig;
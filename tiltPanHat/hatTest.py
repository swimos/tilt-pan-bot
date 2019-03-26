import board
import neopixel
from pantilthat import *

currTick = 0
currLed = 0
subtract = False

light_mode(WS2812)
light_type(GRB)

while True:

	pantilthat.tilt(0)
	pantilthat.pan(-10)
	clear()
	set_pixel(currLed, 255, 0, 0)
	show()

	if currTick == 1:
		if subtract:
			currLed -= 1
			if currLed < 0:
				currLed = 1
				subtract = False
		else:
			currLed += 1
			if currLed > 7:
				currLed = 6
				subtract = True

	currTick += 1
	if currTick > 3:
		currTick = 0



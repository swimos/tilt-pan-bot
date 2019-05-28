import multiprocessing
from multiprocessing import Process, Pipe
import sys, json
import neopixel
import random
import time

from pantilthat import *

currTick = 0
currLed = 0
subtract = False
currPan = 0
currTilt = 0
currBrightness = 255
appRunning = True
ledMode = 'cylon'

def start():
    print("[nodeBridge] Start Python<->Node Bridge")
    sys.stdout.flush()

    pantilthat.tilt(0)
    pantilthat.pan(-10)

    light_mode(WS2812)
    light_type(GRB)
    clear()
    show()
    print("[nodeBridge] Bridge Ready...")

def blueEyes():

  randomInt = random.randint(0,10)

  clear()
  if randomInt == 1:
    set_pixel(0, 0, 0, 0)
    set_pixel(1, 0, 0, 0)
    set_pixel(2, 0, 0, 0)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 0, 0, 0)
    set_pixel(6, 0, 0, 0)
    set_pixel(7, 0, 0, 0)
    time.sleep(1/3)
  else:
    set_pixel(0, 25,25,25)
    set_pixel(1, 0, 0, 100)
    set_pixel(2, 25,25,25)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 25,25,25)
    set_pixel(6, 0, 0, 100)
    set_pixel(7, 25,25,25)    

  show()    

def greenEyes():

  randomInt = random.randint(0,10)

  clear()
  if randomInt == 1:
    set_pixel(0, 0, 0, 0)
    set_pixel(1, 0, 0, 0)
    set_pixel(2, 0, 0, 0)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 0, 0, 0)
    set_pixel(6, 0, 0, 0)
    set_pixel(7, 0, 0, 0)
    time.sleep(1/3)
  else:
    set_pixel(0, 25,25,25)
    set_pixel(1, 0, 100, 0)
    set_pixel(2, 25,25,25)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 25,25,25)
    set_pixel(6, 0, 100, 0)
    set_pixel(7, 25,25,25)    

  show()  
  

def cylon():

  global currTick
  global currLed
  global subtract
  global currBrightness
  global ledMode

  clear()
  set_pixel(currLed, currBrightness, 0, 0)
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


def updateLeds(ledMode):
  print("[nodeBridge] updateLeds()")
  while True:
    
    if ledMode == 'blueeyes':
      blueEyes()
    elif ledMode == "greeneyes":
      greenEyes()
    else:
      cylon()

#start process
if __name__ == '__main__':
  start()
  led_queue = multiprocessing.Queue(1)

  parent_conn, child_con = Pipe()
  led_process = multiprocessing.Process(target=updateLeds,args=(ledMode,))
  led_process.start()
  
  while appRunning:
    message = input()
    key = ""
    try:
      payload = json.loads(message)
      key = payload["key"]
    except:
      print('[nodeBridge] json parse error')
    else:
      print("[nodeBridge] key: " + key)

      sys.stdout.flush()

      if key == "left":
        currPan += 5
        if currPan > 90:
          currPan = 90
        pan(currPan)

      if key == "right":
        currPan -= 5
        if currPan < -90:
          currPan = -90
        pan(currPan)
      
      if key == "down":
        currTilt += 5
        if currTilt > 90:
          currTilt = 90
        tilt(currTilt)

      if key == "up":
        currTilt -= 5
        if currTilt < -90:
          currTilt = -90
        tilt(currTilt)

      if key == "stickX":
        try:
          # print(payload["value"])
          currPan = int(payload["value"])
          pan(currPan)
        except:
          print("[nodeBridge] stickX error")

      if key == "stickY":
        try:
          # print(type(payload["value"]))
          currTilt = int(payload["value"])
          tilt(currTilt)
        except:
          print("[nodeBridge] stickY error")

      if key == "pan":
        currPan = payload["value"]
        pan(currPan)

      if key == "m":
        currBrightness += 10
        if currBrightness > 255:
          currBrightness = 255

      if key == "n":
        currBrightness -= 10
        if currBrightness < 0:
          currBrightness = 0      

      if key == "stop":
        print("[nodeBridge] end python process")
        led_process.terminate()
        for p in multiprocessing.active_children():
          p.terminate()        
        appRunning = False
        clear()
        set_all(0,0,0)
        show()
        # time.sleep(1)
        sys.exit()
        
      if key == "ledMode":
        print("[nodeBridge] ledmode change to:" + payload["value"])
        ledMode = payload["value"]
        led_process.terminate()
        led_process = multiprocessing.Process(target=updateLeds,args=(ledMode,))
        led_process.start()

import multiprocessing
import sys, json, numpy as np
import board
import neopixel
from pantilthat import *

currPan = 0
currTilt = 0
appRunning = True

def start():
    print("Start Tilt/Pan<->Node Bridge")
    sys.stdout.flush()

    pantilthat.tilt(0)
    pantilthat.pan(-10)

    print("Bridge Ready...")
  
#start process
if __name__ == '__main__':
  start()

  while appRunning:
    message = input()
    key = ""
    try:
      payload = json.loads(message)
      key = payload["key"]
    except:
      print('json parse error')
    else:
      # print("key")
      # print(key)

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
          print("stickX error")

      if key == "stickY":
        try:
          # print(type(payload["value"]))
          currTilt = int(payload["value"])
          tilt(currTilt)
        except:
          print("stickY error")

      if key == "panTo":
        try:
          # print(payload["value"])
          currPan = int(payload["value"])
          pan(currPan)
        except:
          print("pan error")          

      if key == "tiltTo":
        try:
          # print(type(payload["value"]))
          currTilt = int(payload["value"])
          tilt(currTilt)
        except:
          print("tilt error")

      if key == "pan":
        currPan = payload["value"]
        pan(currPan)

      if key == "stop":
        print("end tilt/pan python process")
        for p in multiprocessing.active_children():
          p.terminate()        
        appRunning = False
        sys.exit()
        
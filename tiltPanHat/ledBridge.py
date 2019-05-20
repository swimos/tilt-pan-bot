import multiprocessing
import sys, json, numpy as np
import board
import neopixel
from pantilthat import *

currTick = 0
currLed = 0
subtract = False
currBrightness = 255
appRunning = True
ledMode = 'cylon'

def start():
    print("Start LED<->Node Bridge")
    sys.stdout.flush()

    light_mode(WS2812)
    light_type(GRB)
    clear()
    show()
    print("Bridge Ready...")

def blueEyes():

  global currTick
  global currBrightness

  clear()
  if currTick < 100:
    set_pixel(0, 0, 0, 0)
    set_pixel(1, 25,25,25)
    set_pixel(2, 0, 0, 255)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 255)
    set_pixel(5, 25,25,25)
    set_pixel(6, 0, 0, 0)
    set_pixel(7, 0, 0, 0)
  elif currTick >= 100 and currTick <=110:
    set_pixel(0, 0, 0, 0)
    set_pixel(1, 0, 0, 0)
    set_pixel(2, 0, 0, 0)
    set_pixel(3, 0, 0, 0)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 0, 0, 0)
    set_pixel(6, 0, 0, 0)
    set_pixel(7, 0, 0, 0)
  else:
    set_pixel(0, 0, 0, 0)
    set_pixel(1, 0, 0, 0)
    set_pixel(2, 25,25,25)
    set_pixel(3, 0, 0, 200)
    set_pixel(4, 0, 0, 0)
    set_pixel(5, 0, 0, 200)
    set_pixel(6, 25,25,25)
    set_pixel(7, 0, 0, 0)

  show()  
  currTick += 1
  # time.sleep(.100)
  if currTick > 210:
    currTick = 0    

def cylon():

  global currTick
  global currLed
  global subtract
  global currBrightness

  while True:
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

def updateLeds(led_queue):
  global currTick
  global currLed
  global subtract
  global currBrightness  
  print("updateLeds")
  while True:
    # print("queue" + led_queue.get())
    if ledMode == 'cylon':
      cylon()
    else:
      blueEyes()
  
#start process
if __name__ == '__main__':
  start()

  led_queue = multiprocessing.Queue(1)

  led_process = multiprocessing.Process(target=updateLeds,args=(led_queue,))
  led_process.start()

  while True:
    message = input()
    key = ""
    try:
      payload = json.loads(message)
      key = payload["key"]
    except:
      print('json parse error')
    else:
      print("key")
      print(key)
      print("value")
      print(payload["value"])

      sys.stdout.flush()

      if key == "stop":
        print("end led python process")
        appRunning = False
        led_process.terminate()
        clear()
        set_all(0,0,0)
        show()
        time.sleep(1)
        sys.exit()
        
      if key == "ledMode":
        try:
          print("mode=" + payload["value"])
          ledMode = payload["value"]
          # led_queue.put(ledMode)

          # # updateLeds(ledMode)
          # led_process.terminate()
          # led_process = multiprocessing.Process(target=updateLeds,args=(led_queue,))
          # led_process.start()

          # led_process.start()
        except:
          print("ledMode error")   
    # if key == "r":
    #   clear()
    #   set_all(currBrightness,0,0)

    # if key == "g":
    #   clear()
    #   set_all(0,currBrightness,0)

    # if key == "b":
    #   clear()
    #   set_all(0,0,currBrightness)

    # if key == "w":
    #   clear()
    #   set_all(currBrightness,currBrightness,currBrightness)

    # if key == "b":
    #   clear()
    #   set_all(0,0,currBrightness)

    # if key == "o":
    #   clear()
    #   set_all(0,0,0)

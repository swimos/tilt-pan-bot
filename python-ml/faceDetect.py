import multiprocessing
import time
import cv2
import sys
import shutil
import base64
import zlib
import os

from websocket import create_connection

urlFromArgs = '127.0.0.1'

if(len(sys.argv) > 1):
  urlFromArgs = sys.argv[1]

print(urlFromArgs)

host = 'ws://' + urlFromArgs + ':9001'

remoteUrl = 0
remoteUrl2 = 1
capture_local = False
showResults = False

if not capture_local:
  remoteUrl = "http://" + urlFromArgs + ":8081"

ws = create_connection(host)
swimSocket = create_connection(host)

def readImage(selectedEye, videoUrl, imageQueue):

  frame_num = 0
  start_time = time.time()
  fps = 0
  videoFeed = None

  print("start reading cam for " + selectedEye + " @" + str(videoUrl))
  videoFeed = cv2.VideoCapture(videoUrl)

  if videoFeed != None:
    if not videoFeed.isOpened():
      raise IOError('Can\'t open webcam')

  print('start read update loop')
  while True:


    if face_cascade.empty():
        print('face cascade not found')

    if eye_cascade.empty():
        print('eye cascade not found')

    frame_info = '#:{0}, FPS:{1:.2f}'.format(frame_num, fps)
    ret, frame = videoFeed.read()

    if not ret:
      print('Can\'t read video data. Potential end of stream')

    else:
      faces = face_cascade.detectMultiScale(frame, 1.3, 5)
      faceResult = []
      for (x,y,w,h) in faces:
          cv2.rectangle(frame,(x,y),(x+w,y+h),(255,0,0),2)
          roi_gray = frame[y:y+h, x:x+w]
          eyes = eye_cascade.detectMultiScale(roi_gray)
          currFace = {
              "width": w,
              "height": h,
              "x1": x,
              "y1": y,
              "x2": x+w,
              "y2": y+h,
              "eyes": []
          }
          eyeList = []
          for (ex,ey,ew,eh) in eyes:
              cv2.rectangle(roi_gray,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)
              
              currFace['eyes'].append({
                  "width": ew,
                  "height": eh,
                  "x1": ex,
                  "y1": ey,
                  "x2": ex+w,
                  "y2": ey+h
              })

          faceResult.append(currFace)
  
      resultStr = str(faceResult)

      message = "@command(node:\"/predictions/face\",lane:\"setLatest\"){\"" + resultStr + "\"}"
      # print(message)
      swimSocket.send(message)         

      if showResults:
        cv2.imshow("Left Eye Face Detect", frame)
        cv2.waitKey(1)  

    videoFeed.release()
    videoFeed = cv2.VideoCapture(videoUrl)


    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time
    frame_num += 1

    message = "@command(node:\"/predictions/face\",lane:\"setFramenumber\"){\"" + str(frame_num) + "\"}"
    # print(message)
    swimSocket.send(message)      

    message = "@command(node:\"/predictions/face\",lane:\"setFps\"){\"" + str(fps) + "\"}"
    # print(message)
    swimSocket.send(message)      

    time.sleep(1/60)
    


if __name__ == '__main__':
  print("starting main")
  try:

    left_image_queue = multiprocessing.Queue(1)

    data_path = os.path.dirname(os.path.abspath(__file__)) + '/data/'

    face_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_eye.xml')

    left_image_queue = multiprocessing.Queue(1)

    left_eye_read_process = multiprocessing.Process(target=readImage,args=('leftEye', remoteUrl, left_image_queue,))
    left_eye_read_process.start()

    left_eye_read_process.join()

  except IOError as err:
    print("IO error: {0}".format(err))
  except:
    print("Unknown Error:", sys.exc_info()[0])
    raise

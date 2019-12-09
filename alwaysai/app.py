import cv2
import edgeiq
import time
import sys

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



def main():
    obj_detect = edgeiq.ObjectDetection("alwaysai/yolo_v2")
    obj_detect.load(engine=edgeiq.Engine.DNN)

    print("Loaded model:\n{}\n".format(obj_detect.model_id))
    print("Engine: {}".format(obj_detect.engine))
    print("Accelerator: {}\n".format(obj_detect.accelerator))
    print("Labels:\n{}\n".format(obj_detect.labels))

    fps = edgeiq.FPS()

    try:
        with edgeiq.WebcamVideoStream(remoteUrl) as video_stream:
            # Allow Webcam to warm up
            time.sleep(2.0)
            fps.start()

            # loop detection
            while True:
                frame = video_stream.read()
                results = obj_detect.detect_objects(frame, confidence_level=.5)
                # frame = edgeiq.markup_image(frame, results.predictions, colors=obj_detect.colors)

                # Generate text to display on streamer
                # text = ["Model: {}".format(obj_detect.model_id)]
                # text.append("Inference time: {:1.3f} s".format(results.duration))
                # text.append("Objects:")
                predictionResults = []

                for prediction in results.predictions:
                    # text.append("{}: {:2.2f}%".format(
                    #     prediction.label, prediction.confidence * 100))
                    print("Label: {}\n".format(prediction.label))
                    # print("Box start_x: {}\n".format(prediction.box.start_x))

                    x1 = prediction.box.start_x
                    y1 = prediction.box.start_y
                    x2 = prediction.box.end_x
                    y2 = prediction.box.end_y
                    w = x2 - x1
                    h = y2 - y1

                    currPrediction = {
                        "width": w,
                        "height": h,
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                        "centroidX": x1+(w/2),
                        "centroidY": y1+(h/2),
                        "totalArea": w*h,
                        "eyes": []
                    }       

                    predictionResults.append(currPrediction)             

                resultStr = str(predictionResults)

                message = "@command(node:\"/predictions/face\",lane:\"setLatest\"){\"" + resultStr + "\"}"
                # print(message)

                swimSocket.send(message)

                # streamer.send_data(frame, text)

                fps.update()

                # if streamer.check_exit():
                #     break

    finally:
        fps.stop()
        print("elapsed time: {:.2f}".format(fps.get_elapsed_seconds()))
        print("approx. FPS: {:.2f}".format(fps.compute_fps()))

        print("Program Ending")


if __name__ == "__main__":
    main()

import cv2
import mediapipe as mp
import asyncio
import json
from typing import Any
from websockets.server import serve
from websockets.exceptions import ConnectionClosed
from mediapipe.python.solutions.hands import Hands
from mediapipe.python.solutions.drawing_utils import draw_landmarks
from gestures import *


##we want to run at 30-fps

#open camera on default cam
async def gesture_server(websocket, path):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    #mediapipe settings for hands
    with Hands(
        max_num_hands=1,
        model_complexity=1,
        min_detection_confidence=0.5
    ) as hand_tracker:

        print("Client connected:", path)

        try:
            while True:
                #1 get frames, if frame isnt valid exit
                ret, frame = cap.read()
                if not ret:
                    continue
                
                #2 transform opencv BGR to RGB since that's what mediapipe expect, and store 21 mediapipe hand landmarks 
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results: Any = hand_tracker.process(rgb_frame)

                #3 if a hand was detected pass them to detect gesture function 
                gesture_name = None
                if hasattr(results, "multi_hand_landmarks") and results.multi_hand_landmarks:
                    gesture_name =  detectGesture(results.multi_hand_landmarks[0])

                #4 if we processed a gesture wrap it into a json string and send it over a websocket packet
                if gesture_name:
                    payload = json.dumps({"gesture": gesture_name})
                    await websocket.send(payload)
                
                #5 sleep for 0.01 to run at 30fps
                await asyncio.sleep(0.01)
        
        #handle no client exception
        except ConnectionClosed:
            print("Client disconnected")

        #release webcame when done
        finally:
            cap.release()


async def main():
    #launch a websocket local server at 8765 and wait for connection
    async with serve(gesture_server, "localhost", 8765):
        print("Gesture server listening on ws://localhost:8765")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())

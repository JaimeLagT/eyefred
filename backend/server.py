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

async def gesture_server(websocket, path):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    with Hands(
        max_num_hands=1,
        model_complexity=1,
        min_detection_confidence=0.5
    ) as hand_tracker:

        print("Client connected:", path)

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    continue

                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results: Any = hand_tracker.process(rgb_frame)

                gesture_name = None
                if hasattr(results, "multi_hand_landmarks") and results.multi_hand_landmarks:
                    gesture_name =  detectGesture(results.multi_hand_landmarks[0])

                if gesture_name:
                    payload = json.dumps({"gesture": gesture_name})
                    await websocket.send(payload)

                await asyncio.sleep(0.01)

        except ConnectionClosed:
            print("Client disconnected")

        finally:
            cap.release()


async def main():
    async with serve(gesture_server, "localhost", 8765):
        print("Gesture server listening on ws://localhost:8765")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())

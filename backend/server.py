import cv2
import mediapipe as mp
import asyncio
import websockets
import json

# 1. Initialize MediaPipe Hands
mp_hands = mp.solutions.hands.Hands(
    max_num_hands=1,
    model_complexity=1,
    min_detection_confidence=0.5,
)

async def gesture_server(websocket, path):
    # 2. Open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Client connected:", path)
    try:
        while True:
            # 3. Capture frame
            ret, frame = cap.read()
            if not ret:
                continue

            # 4. Preprocess & run MediaPipe
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = mp_hands.process(rgb)

            # 5. Simple placeholder classification
            gesture_name = None
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                #detectGestures(hand_landmarks)
                gesture_name = "hand_detected"

            # 6. Send JSON event if we saw a hand
            if gesture_name:
                payload = json.dumps({"gesture": gesture_name})
                await websocket.send(payload)

            # 7. Yield to event loop
            await asyncio.sleep(0.01)

    except websockets.ConnectionClosed:
        print("Client disconnected")
    finally:
        cap.release()

async def main():
    # The async context manager will start & stop the server cleanly
    async with websockets.serve(gesture_server, "localhost", 8765):
        print("Gesture server listening on ws://localhost:8765")
        # Keep the server running forever (or until cancelled)
        await asyncio.Future()

if __name__ == "__main__":
    # This will create the event loop and run your main() coroutine
    asyncio.run(main())
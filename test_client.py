import asyncio
import websockets
import json
import websockets.client
import websockets.exceptions

async def listen():
    uri = "ws://localhost:8765"
    async with websockets.client.connect(uri) as ws:
        print("Connected to gesture server. Waiting for gestures…")
        try:
            async for message in ws:
                data = json.loads(message)
                print("Received gesture:", data["gesture"])
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")

if __name__ == "__main__":
    asyncio.run(listen())

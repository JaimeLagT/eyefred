const { useEffect } = require("react");
import React from "react";
import './styles.css';

function App() {
    useEffect(() => {
        //1 create websocket
        const socket = new WebSocket('ws://localhost:8765');
        //2 handle incoming gestures
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const gesture = data.gesture;
            console.log("Received gesture:", gesture);
        };
        //handle unmount
        return () => {
            socket.close();
        };
    }, []);

    return (
        <h1 className="text-2xl font-bold text-purple-500">
            Eyefred is running 🎉
        </h1>
    );
}

export default App;
import React, { useEffect, useState } from 'react';
import './styles.css';
//========================== GLOBAL VARIABLES ==========================//


const actionList = [
    "toggleMute",
    "playPause",
    "nextTrack",
    "previousTrack"
];

//========================== HELPER FUNCTIONS ==========================//

function handlePacket(event) {
    //transform JSON gesture to a string
    const data = JSON.parse(event.data);
    const gesture = data.gesture;
    console.log("Received gesture:", gesture);
    //get the newest bindings
    const bindings = window.eyefred.getBindings();
    const action = bindings[gesture];
    //perform the action mapped by the gesture using a context bridge
    window.eyefred?.performAction?.(action);
}

//========================== MAIN FUNCTION ==========================//
function App() {
    const [bindings, setBindings] = useState({});
    //Websocket response
    useEffect(() => {
        let socket;
        const delay = setTimeout(() => {
            // 1. Create websocket after delay
            socket = new WebSocket('ws://localhost:8765');
            // 2. Handle incoming packets
            socket.onmessage = (event) => {
                handlePacket(event);
            };
        }, 800); // wait 500ms

        return () => {
            clearTimeout(delay); // cancel delayed connect if App unmounts quickly
            if (socket) socket.close();    // optional safety to close if open
        };
    }, []);

    //Binding mapping update
    useEffect(() => {
        const bindings = window.eyefred.getBindings();
        setBindings(bindings);
        //use dropdown menu with actionslist to update bindings
    }, []);

    return (
        <h1 className="text-2xl font-bold text-purple-500">
            Eyefred is running 🎉
        </h1>
    );
}

export default App;
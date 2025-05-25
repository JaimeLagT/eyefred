import React, { useEffect } from 'react';
import './styles.css';
const path = window.require('path');
const fs = window.require('fs');
//bunch of vite nonesense tbh
const appPathArg = process.argv.find(arg => arg.startsWith('--appPath='));
const appPath = appPathArg?.split('=')[1] || '.';

//========================== GLOBAL VARIABLES ==========================//

const actions = path.join(appPath, 'renderer', 'actions.json');
const bindingsPath = path.join(appPath, 'renderer', 'bindings.json');

// const actionList = [
//     "toggleMute",
//     "playPause",
//     "nextTrack",
//     "previousTrack"
// ];

//========================== HELPER FUNCTIONS ==========================//

function handlePacket(event) {
    //transform JSON gesture to a string
    const data = JSON.parse(event.data);
    const gesture = data.gesture;
    console.log("Received gesture:", gesture);
    //get the newest bindings
    const bindings = JSON.parse(fs.readFileSync(bindingsPath, 'utf8'));
    const action = bindings[gesture];
    //perform the action mapped by the gesture
    //actions.performAction(action);
}

//========================== MAIN FUNCTION ==========================//
function App() {
    //const [bindings, SetBindings] = useState({});
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
        }, 1000); // wait 500ms

        return () => {
            clearTimeout(delay); // cancel delayed connect if App unmounts quickly
            if (socket) socket.close();    // optional safety to close if open
        };
    }, []);

    //Binding mapping update
    // useEffect(() => {
    //     SetBindings(bindingsPath);
    //     const parsedBindings = JSON.parse(fs.readFileSync(bindingsPath, 'utf8'));
    //     SetBindings(parsedBindings);
    // }, []);

    return (
        <h1 className="text-2xl font-bold text-purple-500">
            Eyefred is running 🎉
        </h1>
    );
}

export default App;
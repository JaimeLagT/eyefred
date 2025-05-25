import React, { useEffect } from 'react';
import './styles.css';

const path = window.require('path');
const fs = window.require('fs');
//const actions = window.require('../actions.js');


//========================== GLOBAL VARIABLES ==========================//
const bindingsPath = path.join(__dirname, 'bindings.json');

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
    actions.performAction(action);
}

//========================== MAIN FUNCTION ==========================//
function App() {
    //const [bindings, SetBindings] = useState({});
    //Websocket response
    useEffect(() => {
        //1 create websocket
        const socket = new WebSocket('ws://localhost:8765');
        //2 handle incoming packets
        socket.onmessage = (event) => {
            handlePacket(event);
        };
        //3 handle unmount
        return () => {
            socket.close();
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
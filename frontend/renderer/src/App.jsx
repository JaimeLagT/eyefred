import React, { useEffect, useState } from 'react';
import './styles.css';


//you can still select the action but it will deselect the previous one

//========================== GLOBAL VARIABLES ==========================//
const actionList = [
    //"toggleMute",
    "Play / Pause",
    "Open Spotify",
    "Switch Window (Right)",
    "Switch Window (Left)",
    "Open Google",
    "Mission Control",
    "Volume Up",
    "Volume Down",

];

const gestureIcons = {
    openPalm: '🖐️',
    peace: '✌️',
    rock: '🤟',
    thumbsRight: '👍',
    thumbsLeft: '👍',
    fist: '👊',
    palmLeft: '👋',
    palmRight: '👋',
};

const flippedHGestures = new Set(["palmRight"]);
const flipped90Gestures = new Set(["thumbsRight"]);
const flippedNeg90Gestures = new Set(["thumbsLeft"]);

//========================== HELPER FUNCTIONS ==========================//
function handlePacket(event) {
    const data = JSON.parse(event.data);
    const gesture = data.gesture;
    console.log("Received gesture:", gesture);
    const bindings = window.eyefred.getBindings();
    const action = bindings[gesture];
    window.eyefred?.performAction?.(action);
}

//========================== MAIN FUNCTION ==========================//
function App() {
    const [bindings, setBindings] = useState({});

    // WebSocket setup
    useEffect(() => {
        let socket;
        const delay = setTimeout(() => {
            socket = new WebSocket('ws://localhost:8765');
            socket.onmessage = handlePacket;
        }, 1200);

        return () => {
            clearTimeout(delay);
            if (socket) socket.close();
        };
    }, []);

    // Load bindings on mount
    useEffect(() => {
        const initial = window.eyefred.getBindings();
        setBindings(initial);
    }, []);

    // Handle dropdown change
    const handleChange = (gesture) => async (e) => {
        const newAction = e.target.value;
        const updated = { ...bindings };
        // Remove this action from any other gesture
        Object.keys(updated).forEach(g => {
            if (updated[g] === newAction) updated[g] = '';
        });
        updated[gesture] = newAction;
        setBindings(updated);
        await window.eyefred.setBindings(updated);
    };

    // Reset all mappings
    const resetAll = async () => {
        const cleared = Object.fromEntries(
            Object.keys(bindings).map(g => [g, ''])
        );
        setBindings(cleared);
        await window.eyefred.setBindings(cleared);
    };

    //===================================== UI =====================================//
    return (
        <div className="app-container">
            <div className="drag-region" />

            <header className="app-header">
                <h1>Eyefred Gesture Mappings</h1>
                <p>Select an action for each gesture:</p>
            </header>

            <main>
                <div className="grid-container">
                    {Object.keys(bindings).map((gesture) => {
                        // Compute the correct transform class for this gesture:
                        const transformClass = flippedHGestures.has(gesture)
                            ? 'flipped'
                            : flipped90Gestures.has(gesture)
                                ? 'point-right'
                                : flippedNeg90Gestures.has(gesture)
                                    ? 'point-left'
                                    : '';

                        return (
                            <div key={gesture} className="card">
                                <label className="card-label">
                                    <span
                                        role="img"
                                        aria-label={gesture}
                                        className={`emoji ${transformClass}`}
                                    >
                                        {gestureIcons[gesture] || gesture}
                                    </span>
                                </label>
                                <select
                                    className="card-select"
                                    value={bindings[gesture] || ''}
                                    onChange={handleChange(gesture)}
                                >
                                    <option value="" disabled>
                                        Select action
                                    </option>
                                    {actionList.map((action) => (
                                        <option
                                            key={action}
                                            value={action}
                                            disabled={
                                                Object.values(bindings).includes(action) &&
                                                bindings[gesture] !== action
                                            }
                                        >
                                            {action}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>

                <div className="reset-container">
                    <button className="reset-button" onClick={resetAll}>
                        Reset All
                    </button>
                </div>
            </main>
        </div>
    );
}

export default App;

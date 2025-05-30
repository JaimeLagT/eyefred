import React, { useEffect, useState } from 'react';
import './styles.css';
import { Toggle } from './components/Toggle';

//========================== GLOBAL VARIABLES ==========================//
const actionList = [
    "Play / Pause",
    "Open Spotify",
    "Switch Window (Left)",
    "Switch Window (Right)",
    "Open Google",
    "Mission Control",
    "Volume Up",
    "Volume Down",
    'Toggle Do Not Disturb',
    'Lock Screen',
    'Take Screenshot',
    'Toggle Microphone Mute',
    'Show Desktop',
    'Next Track',
    'Previous Track',
    'Go to Netflix',
    'Go to YouTube',
    'Open Eyefred'
];


const gestureIcons = {
    openPalm: '🖐️',
    peace: '✌️',
    rock: '🤟',
    thumbsRight: '👍',
    thumbsLeft: '👍',
    fist: '✊',
    palmLeft: '👋',
    palmRight: '👋',
};

const flippedHGestures = new Set(["palmRight", "rock"]);
const flipped90Gestures = new Set(["thumbsRight"]);
const flippedNeg90Gestures = new Set(["thumbsLeft"]);

//========================== HELPER FUNCTIONS ==========================//
async function handlePacket(event) {
    const data = JSON.parse(event.data);
    const gesture = data.gesture;
    console.log("Received gesture:", gesture);
    const bindings = await window.eyefred.getBindings();
    const action = bindings[gesture];
    window.eyefred?.performAction?.(action);
}

// function updateBindings(newSet) {

// }

//========================== MAIN FUNCTION ==========================//
function App() {
    const [bindings, setBindings] = useState({});
    const [isDark, setIsDark] = useState({});

    // WebSocket setup
    useEffect(() => {
        let socket;
        const delay = setTimeout(() => {
            socket = new WebSocket('ws://localhost:8765');
            socket.onmessage = handlePacket;
        }, 1500);

        return () => {
            clearTimeout(delay);
            if (socket) socket.close();
        };
    }, []);

    // Load bindings on mount
    useEffect(() => {
        (async () => { //asynch now that IPC returns a promise
            try {
                const data = await window.eyefred.getBindings();
                setBindings(data);
            } catch (err) {
                console.error('Failed to load bindings:', err);
                setBindings({}); // fallback
            }
        })();
    }, []);

    // Load user Prefernce on mount
    useEffect(() => {
        (async () => {
            try {
                const stored = await window.eyefred.getDarkPreference();
                setIsDark(stored);
            } catch (err) {
                console.error("Failed to load Dark Mode Preference", err);
                setIsDark(false);
            }
        })();
    }, []);

    // Whenever isDark changes, toggle the body class
    useEffect(() => {
        // don’t run this while still loading
        if (isDark === null) return;

        // apply the correct class
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);

        // save exactly what we have
        window.eyefred.setDarkPreference(isDark);
    }, [isDark]);

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
        <div className={"app-container"}>
            {/* Invisible draggable strip at the top for moving a frameless window */}
            <div className="drag-region" />

            {/* App title and subtitle */}
            <header className="app-header">
                <h1>Eyefred Gesture Mappings</h1>
                <p>Select an action for each gesture:</p>
                <Toggle
                    isChecked={isDark}
                    handleChange={() => setIsDark(!isDark)}
                ></Toggle>
            </header>

            <main>
                {/* Grid layout to hold one “card” per gesture */}
                <div className="grid-container">
                    {Object.keys(bindings).map((gesture) => {
                        // Decide which CSS class to apply for rotating/flipping the emoji
                        const transformClass = flippedHGestures.has(gesture)
                            ? 'flipped'              // horizontal mirror
                            : flipped90Gestures.has(gesture)
                                ? 'point-right'      //  90° rotate
                                : flippedNeg90Gestures.has(gesture)
                                    ? 'point-left'   // -90° rotate
                                    : '';            // no transform

                        return (
                            <div key={gesture} className="card">
                                {/* Show the gesture icon (or name) with transform applied */}
                                <label className="card-label">
                                    <span
                                        role="img"
                                        aria-label={gesture}
                                        className={`emoji ${transformClass}`}
                                    >
                                        {gestureIcons[gesture] || gesture}
                                    </span>
                                </label>

                                {/* Dropdown for assigning an action to this gesture */}
                                <select
                                    className="card-select"
                                    value={bindings[gesture] || ''}
                                    onChange={handleChange(gesture)}
                                >
                                    {/* Placeholder prompt */}
                                    <option value="" disabled>
                                        Select action
                                    </option>

                                    {/* List all possible actions */}
                                    {actionList.map((action) => (
                                        <option
                                            key={action}
                                            value={action}
                                        >
                                            {action}

                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>

                {/* Button to clear every mapping back to unassigned */}
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

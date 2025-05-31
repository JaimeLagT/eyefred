import React, { useEffect, useState } from 'react';
import './styles.css';
import { Toggle } from './components/Toggle';

//========================== GLOBAL VARIABLES ==========================//
const actionList = [
    "Go to Netflix",
    "Go to YouTube",
    "Lock Screen",
    "Mission Control",
    "Previous Track",
    "Next Track",
    "None",
    "Open Eyefred",
    "Open Google",
    "Open Spotify",
    "Open Whatsapp",
    "Play / Pause",
    "Show Desktop",
    "Switch Tab (Left)",
    "Switch Tab (Right)",
    "Switch Window (Left)",
    "Switch Window (Right)",
    "Take Screenshot",
    "Toggle Do Not Disturb",
    "Toggle Microphone Mute",
    "Volume Down",
    "Volume Up",
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
const maxRetries = 10;
const initialDelay = 500;

//========================== HELPER FUNCTIONS ==========================//
async function handlePacket(event) {
    const data = JSON.parse(event.data);
    const gesture = data.gesture;
    console.log("Received gesture:", gesture);
    const bindings = await window.eyefred.getBindings();
    const action = bindings[gesture];
    window.eyefred?.performAction?.(action);
}

function handleConnection() {
    return new Promise((resolve, reject) => {
        let retries = 0;
        let delay = initialDelay;
        let socket;
        function tryConnection() {
            socket = new WebSocket('ws://localhost:8765');
            socket.onopen = () => {
                console.log('WebSocket connected');
                retries = 0;
                socket.onmessage = handlePacket;
                return resolve(socket);
            }
            socket.onerror = (err) => {
                console.warn('Connection failed retrying..', err);
            };
            socket.onclose = () => {
                if (retries < maxRetries) {
                    retries++
                    delay = delay * 2;
                    setTimeout(tryConnection, delay)
                } else {
                    console.warn('Max tries attempted');
                    return reject(new Error('Max WebSocket retries reached'));
                }
            }
        };
        tryConnection();
    });
}


//========================== MAIN FUNCTION ==========================//
function App() {
    const [bindings, setBindings] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    // WebSocket setup
    useEffect(() => {
        handleConnection().catch((err) => {
            console.error('WebSocket failed:', err.message);
        });
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

    // Load user dark mode on mount
    useEffect(() => {
        // initialize
        window.eyefred.getDarkMode().then(setDarkMode);
        // listen for changes
        window.eyefred.onDarkModeChanged(setDarkMode);
    }, []);

    //Whenever isDark changes, toggle the body class
    useEffect(() => {
        // Apply CSS classes on <body>
        document.body.classList.toggle('dark-mode', darkMode);
        document.body.classList.toggle('light-mode', !darkMode);
    }, [darkMode]);

    //handle the dark mode toggle
    const handleToggle = async () => {
        const newMode = await window.eyefred.toggleDarkMode();
        setDarkMode(newMode);
    };

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
                    isChecked={darkMode}
                    handleChange={handleToggle}
                ></Toggle>
            </header>

            <main>
                {/* Grid layout to hold one “card” per gesture */}
                <div className="grid-container">
                    {Object.keys(bindings).map((gesture) => {
                        // Decide which CSS class to apply for rotating/flipping the emoji
                        const transformClass = flippedHGestures.has(gesture)
                            ? 'flipped'            // horizontal mirror
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

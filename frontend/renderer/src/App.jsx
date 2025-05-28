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
        }, 800);

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
        // Enforce one-to-one mapping
        const updated = { ...bindings };
        // Remove this action from any other gesture
        Object.keys(updated).forEach(g => {
            if (updated[g] === newAction) updated[g] = '';
        });
        updated[gesture] = newAction;
        setBindings(updated);
        await window.eyefred.updateBindings(updated);
    };

    // Reset all mappings
    const resetAll = async () => {
        const cleared = Object.fromEntries(
            Object.keys(bindings).map(g => [g, ''])
        );
        setBindings(cleared);
        await window.eyefred.updateBindings(cleared);
    };

    return (
        <div className="app-container">
            <header className="app-header drag-region-header">
                <h1>Eyefred Gesture Mappings</h1>
                <p>Select an action for each gesture:</p>
            </header>
            <main>
                <div className="grid-container">
                    {Object.keys(bindings).map((gesture) => (
                        <div key={gesture} className="card">
                            <label className="card-label">{gesture}</label>
                            <select
                                className="card-select"
                                value={bindings[gesture] || ''}
                                onChange={handleChange(gesture)}
                            >
                                <option value="" disabled>Select action</option>
                                {actionList.map((action) => (
                                    <option
                                        key={action}
                                        value={action}
                                        disabled={Object.values(bindings).includes(action) && bindings[gesture] !== action}
                                    >
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
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

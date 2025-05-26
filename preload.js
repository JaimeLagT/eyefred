// preload.js
const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');

// // resolve real file location of preload.js, even if sandboxed
// const __filename = fileURLToPath(import.meta.url || require('url').pathToFileURL(__filename));
// const __dirname = path.dirname(__filename);


// Dynamically resolve the app's root path
const appPath = __dirname;

const bindingsPath = path.join(appPath, 'backend', 'bindings.json');
const actions = require(path.join(appPath, 'backend', 'actions.js'));

contextBridge.exposeInMainWorld('eyefred', {
    // Expose the action dispatcher
    performAction: actions.performAction,

    // Expose bindings safely
    getBindings: () => {
        try {
            const raw = fs.readFileSync(bindingsPath, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            console.error('Failed to read bindings.json from backend:', err);
            return {};
        }
    },
    setBindings: (newBindings) => {
        try {
            fs.writeFileSync(bindingsPath, JSON.stringify(newBindings, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to write to bindings.json at backend:', err);
            return {};
        }
    }
});
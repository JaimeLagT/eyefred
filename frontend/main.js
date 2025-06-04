const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const python = require('./start-python');
const path = require('path');
const fs = require('fs');
const Store = require("electron-store").default;
const store = new Store();
const { exec } = require('child_process');

process.on('uncaughtException', (error) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('=== UNHANDLED REJECTION ===');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    console.error('==========================');
});

console.log('Starting main process...');
console.log('Node version:', process.version);
console.log('Electron version:', process.versions.electron);
console.log('Is packaged:', !require('electron').app.isPackaged);


//========================== PATH RESOLUTION  ==========================//

const isDev = !app.isPackaged;
let backendPath;

if (isDev) {
    backendPath = path.join(__dirname, '..', 'backend');
} else {
    backendPath = path.join(process.resourcesPath, 'backend');
}

const bindingsPath = path.join(backendPath, 'bindings.json');

// Check if backend files exist
try {
    if (fs.existsSync(bindingsPath)) {
        console.log('✓ bindings.json exists');
    } else {
        console.error('✗ bindings.json NOT found at:', bindingsPath);
    }
} catch (err) {
    console.error('Error checking bindings.json:', err);
}

const actionsPath = path.join(backendPath, 'actions.js');
console.log('actionsPath:', actionsPath);

try {
    if (fs.existsSync(actionsPath)) {
        console.log('✓ actions.js exists');
    } else {
        console.error('✗ actions.js NOT found at:', actionsPath);
    }
} catch (err) {
    console.error('Error checking actions.js:', err);
}
// Try to load actions with detailed error handling
let actions;
try {
    console.log('Loading actions from:', actionsPath);
    actions = require(actionsPath);
    console.log('✓ actions.js loaded successfully');
} catch (err) {
    console.error('✗ Failed to load actions.js:', err);
    console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    throw err;
}
//========================== IPC FUNCTIONS ==========================//


// 1) performAction: just dispatch to your actions module
ipcMain.on('perform-action', (_event, actionName) => {
    actions.performAction(actionName);
});

// 2) getBindings: read the JSON file and return it
ipcMain.handle('get-bindings', async () => {
    try {
        const raw = await fs.promises.readFile(bindingsPath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read bindings.json:', err);
        return {};
    }
});

// 3) setBindings: write the JSON file
ipcMain.on('set-bindings', async (_event, newBindings) => {
    try {
        fs.writeFileSync(bindingsPath, JSON.stringify(newBindings, null, 2), 'utf8');
    } catch (err) {
        console.error('Failed to write to bindings.json at backend:', err);
        return {};
    }
});

// 4) get Dark Mode
ipcMain.handle('get-darkMode', async () => {
    const mode = store.get('darkMode');
    console.log('get-dark-mode →', mode);
    return mode;
});

// 5) toggle Dark Mode
ipcMain.handle('toggle-darkMode', () => {
    const current = store.get('darkMode');
    const next = !current;
    store.set('darkMode', next);
    console.log('toggle-dark-mode →', next);
    nativeTheme.themeSource = next ? 'dark' : 'light';

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('dark-mode-changed', next);
    });

    return next;
});


//========================== HELPER FUNCTIONS ==========================//

function closePortWindows(port = 8765) {
    const findPidCmd = `netstat -ano | findstr :${port}`;
    exec(findPidCmd, (error, stdout, stderr) => {
        if (error || stderr || !stdout) {
            console.error(`Could not find process using port ${port}.`);
            return;
        }

        const lines = stdout.trim().split('\n');
        const pids = new Set();
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (!isNaN(pid)) {
                pids.add(pid);
            }
        }

        for (const pid of pids) {
            exec(`taskkill /PID ${pid} /F`, (killErr) => {
                if (killErr) {
                    console.error(`Error killing PID ${pid}: ${killErr.message}`);
                } else {
                    console.log(`Killed PID ${pid} using port ${port}`);
                }
            });
        }
    });
}

(async () => {
    const psList = (await import('ps-list')).default;
    const processes = await psList();
    console.log(processes);
})();

function handleWindowClose() {
    // On non-macOS, quit when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function handleWindowOpen() {
    // On macOS, recreate a window when the dock icon is clicked and there are no open windows
    if (BrowserWindow.getAllWindows().length === 0) {
        newBrowserWindow();
    }
}

function applySavedTheme() {
    const darkMode = store.get('darkMode', false);
    nativeTheme.themeSource = darkMode ? 'dark' : 'light';
}

async function killOrphanServers() {
    const psList = (await import('ps-list')).default;
    const list = await psList();
    const orphans = list.filter(p => p.name.toLowerCase() === 'server.exe');
    for (const proc of orphans) {
        console.warn(`Killing orphan server.exe with PID ${proc.pid}`);
        exec(`taskkill /PID ${proc.pid} /F`);
    }
}

function newBrowserWindow() {
    // isDev should reflect whether we're running from source (false when packaged)
    const win = new BrowserWindow({
        title: 'Eyefred',
        width: 500,
        height: 650,
        titleBarStyle: 'hiddenInset',
        frame: false,
        resizable: false,
        // in the future please change this
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            additionalArguments: [`--appPath=${__dirname}`],
        }
    });

    applySavedTheme()

    // vite app.jsx window loading
    if (isDev) {
        win.loadURL('http://localhost:5173'); // default Vite dev server
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));
    }
}

//========================== MAIN FUNCTION ==========================//
// Kill Python backend before the app quits
app.on('will-quit', async (event) => {
    //let shutdown wait until Python is stopped
    event.preventDefault();
    try {
        await python.stop();
        closePortWindows();
    } catch (err) {
        console.error('Failed to stop Python', err)
    }
    console.log(process._getActiveHandles());
    killOrphanServers();
    app.exit(0);
});

// macOS: quit or recreate windows appropriately
app.on('window-all-closed', handleWindowClose);
app.on('activate', handleWindowOpen);

app.whenReady().then(() => {
    // start Python backend
    python.start();

    console.log("🧠 Using preload path:", path.join(__dirname, '..', 'preload.js'));
    newBrowserWindow();
});

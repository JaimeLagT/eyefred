const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const python = require('./start-python');
const path = require('path');
const fs = require('fs');
const Store = require("electron-store").default;
const store = new Store();

const appPath = __dirname;

const bindingsPath = path.join(appPath, '..', 'backend', 'bindings.json');
const actions = require(path.join(appPath, '..', 'backend', 'actions.js'));


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

function newBrowserWindow() {
    // isDev should reflect whether we're running from source (false when packaged)
    const isDev = !app.isPackaged;

    const win = new BrowserWindow({
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
app.on('before-quit', () => {
    python.stop();
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

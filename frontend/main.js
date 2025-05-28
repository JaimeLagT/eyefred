const { app, BrowserWindow } = require('electron');
const python = require('./start-python');
const path = require('path');

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

function newBrowserWindow() {
    const isDev = process.env.NODE_ENV !== 'production';

    const win = new BrowserWindow({
        width: 500,
        height: 650,
        titleBarStyle: 'hiddenInset',
        // in the future please change this
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            additionalArguments: [`--appPath=${__dirname}`],
            nodeIntegrationInWorker: isDev,
        }
    });

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
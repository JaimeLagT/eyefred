const { app, BrowserWindow } = require('electron');
require('./start-python.js');
const path = require('path');

//========================== HELPER FUNCTIONS ==========================//
function handleWindowClose() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function handleWindowOpen() {
    if (BrowserWindow.getAllWindows().length === 0) {
        newBrowserWindow();
    }
}

function newBrowserWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        //in the future please change this
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            additionalArguments: [`--appPath=${__dirname}`]
        }
    });

    //vite app.jsx window loading
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
        win.loadURL('http://localhost:5173'); // default Vite dev server
    } else {
        win.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));
    }

    return win;
}

//========================== MAIN FUNCTION ==========================//
app.whenReady().then(() => {
    //load window
    const win = newBrowserWindow();
    //console.log("typeof window.require:", typeof window.require);

    //handle window events
    app.on('window-all-closed', handleWindowClose);
    app.on('activate', handleWindowOpen);

    //debug for production
    if (process.env.NODE_ENV !== 'production') {
        win.webContents.openDevTools();
    }
});


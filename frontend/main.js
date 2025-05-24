const { app, BrowserWindow } = require('electron');
require('./start-python.js');

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
    });
    win.loadFile('renderer/index.html');
    return win;
}

//========================== MAIN FUNCTION ==========================//
app.whenReady().then(() => {
    //load window
    const win = newBrowserWindow();

    //handle window events
    app.on('window-all-closed', handleWindowClose);
    app.on('activate', handleWindowOpen);

    //debug for production
    if (process.env.NODE_ENV !== 'production') {
        win.webContents.openDevTools();
    }
});


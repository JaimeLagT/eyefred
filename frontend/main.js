const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    win.loadFile('renderer/index.html'); // make sure this file exists
});

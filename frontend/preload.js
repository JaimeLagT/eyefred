const { contextBridge, ipcRenderer } = require('electron');

console.log('preload loaded');

contextBridge.exposeInMainWorld('eyefred', {
    performAction: (actionName) => {
        ipcRenderer.send('perform-action', actionName);
    },

    getBindings: () => {
        // returns a Promise that resolves to your JSON
        return ipcRenderer.invoke('get-bindings');
    },

    setBindings: (newBindings) => {
        // returns a Promise that resolves when done
        ipcRenderer.send('set-bindings', newBindings);
    },

    getDarkPreference: () => {
        return ipcRenderer.invoke('get-preference')
    },
    setDarkPreference: (isDark) => {
        ipcRenderer.send('set-preference', isDark)
    }
});

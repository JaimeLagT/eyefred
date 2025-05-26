// preload.js
const { contextBridge } = require('electron');
const actions = require('./backend/actions.js');


contextBridge.exposeInMainWorld('eyefred', {
    performAction: actions.performAction
});

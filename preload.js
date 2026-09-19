const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    sendArduinoCommand: (cmd) => ipcRenderer.send('arduino-cmd', cmd),
});
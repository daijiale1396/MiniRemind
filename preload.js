
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  controlWindow: (command) => ipcRenderer.send('control-window', command),
  setWindowMode: (mode) => ipcRenderer.send('set-window-mode', mode),
  sendNotification: (data) => ipcRenderer.send('send-notification', data),
});


const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的 API 到全局 window 对象
contextBridge.exposeInMainWorld('electronAPI', {
  controlWindow: (command) => ipcRenderer.send('control-window', command),
  setWindowMode: (mode) => ipcRenderer.send('set-window-mode', mode),
  sendNotification: (data) => ipcRenderer.send('send-notification', data),
});

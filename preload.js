
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 发送指令到主进程
  controlWindow: (command) => ipcRenderer.send('control-window', command),
  setWindowMode: (mode) => ipcRenderer.send('set-window-mode', mode),
  sendNotification: (data) => ipcRenderer.send('send-notification', data),
  
  // 监听来自主进程的指令
  onToggleWidgetMode: (callback) => ipcRenderer.on('toggle-widget-mode', (_event) => callback()),
});

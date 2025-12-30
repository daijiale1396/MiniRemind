
const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, 
    transparent: true,
    webPreferences: {
      // 关键点：这里必须指向最终的 .cjs 文件
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

ipcMain.on('control-window', (event, command) => {
  if (!mainWindow) return;
  if (command === 'minimize') mainWindow.minimize();
  else if (command === 'maximize') {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
  else if (command === 'close') mainWindow.close();
});

ipcMain.on('set-window-mode', (event, mode) => {
  if (!mainWindow) return;
  if (mode === 'widget') {
    mainWindow.setSize(240, 120);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setResizable(false);
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow.setPosition(width - 260, height - 140);
  } else {
    mainWindow.setSize(1000, 700);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    mainWindow.center();
  }
});

ipcMain.on('send-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

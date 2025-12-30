
const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, // 无边框
    transparent: true,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载本地开发服务器或构建后的文件
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// IPC 处理
ipcMain.on('control-window', (event, command) => {
  if (!mainWindow) return;
  switch (command) {
    case 'minimize': mainWindow.minimize(); break;
    case 'maximize': mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); break;
    case 'close': mainWindow.close(); break;
  }
});

ipcMain.on('set-window-mode', (event, mode) => {
  if (!mainWindow) return;
  if (mode === 'widget') {
    mainWindow.setSize(240, 120);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setResizable(false);
    // 将窗口移动到右下角
    const { screen } = require('electron');
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
  new Notification({ title, body }).show();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

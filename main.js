
const { app, BrowserWindow, ipcMain, Notification, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, 
    transparent: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // 点击关闭按钮时隐藏窗口而非退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  createTray();
}

function createTray() {
  if (tray) return;

  // 创建一个空图标作为占位，如果有本地 icon.png 请替换路径
  const icon = nativeImage.createEmpty(); 
  tray = new Tray(icon);
  tray.setToolTip('微提醒 Pro');

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主界面', click: () => mainWindow.show() },
    { label: '挂件模式', click: () => {
      mainWindow.show();
      mainWindow.webContents.send('toggle-widget-mode');
    }},
    { type: 'separator' },
    { label: '彻底退出', click: () => {
      isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

ipcMain.on('control-window', (event, command) => {
  if (!mainWindow) return;
  if (command === 'minimize') mainWindow.minimize();
  else if (command === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
  else if (command === 'close') {
    mainWindow.hide(); // 点击 UI 上的 X 也是隐藏
  }
});

ipcMain.on('set-window-mode', (event, mode) => {
  if (!mainWindow) return;
  if (mode === 'widget') {
    mainWindow.setSize(240, 160);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setResizable(false);
    mainWindow.setSkipTaskbar(true);
    
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow.setPosition(width - 260, height - 180);
  } else {
    mainWindow.setSize(1000, 700);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    mainWindow.setSkipTaskbar(false);
    mainWindow.center();
  }
});

ipcMain.on('send-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (isQuitting) app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow.show();
});

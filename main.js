
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
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

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

  // 尝试加载本地图标，若无则使用一个简单的蓝色圆点 Base64 作为保底
  const iconPath = path.join(__dirname, 'icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  
  if (icon.isEmpty()) {
    // 保底：一个简单的蓝色方块图标 (Base64)
    icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlUlEQVR42mNkYGD4D8RAnJmByYAKGFAVMDD8Z2RgYPyPTYFBAQMjAxT8/08pALmS8T82BQYFDIwMUADiAnIFjAxgS8D6Gf9jU2BQwMDIAAUvGf9jU8DAyAAFv5mYGP7D9TMwMDAw/IdrYGBkYPiPTQEDAwMU/GZiYvgP18/AwMDA8B+ugYGRgeE/NgUMDAxQ8J8ZiwIApBIsC0Ym7qsAAAAASUVORK5CYII=');
  }
    
  tray = new Tray(icon);
  tray.setToolTip('微提醒 Pro');

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '打开主界面', 
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      } 
    },
    { 
      label: '进入挂件模式', 
      click: () => {
        mainWindow.show();
        // 通知渲染进程切换到挂件 UI
        mainWindow.webContents.send('toggle-widget-mode');
      } 
    },
    { type: 'separator' },
    { 
      label: '彻底退出', 
      click: () => {
        isQuitting = true;
        app.quit();
      } 
    }
  ]);

  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
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
    mainWindow.hide();
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
    new Notification({ 
      title, 
      body, 
      icon: path.join(__dirname, 'icon.png'),
      silent: false 
    }).show();
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

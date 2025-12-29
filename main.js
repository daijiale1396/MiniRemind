
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: true, // 设置为 false 可以实现自定义标题栏
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#f3f3f3',
  });

  // 如果是开发环境，加载 localhost，否则加载编译后的 index.html
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭时并不真正退出，而是隐藏（实现后台运行）
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public/icon.png'); // 确保有图标文件
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: '打开主界面', click: () => mainWindow.show() },
    { label: '开发者工具', click: () => mainWindow.webContents.openDevTools() },
    { type: 'separator' },
    { label: '退出程序', click: () => {
        app.isQuiting = true;
        app.quit();
      } 
    }
  ]);

  tray.setToolTip('微提醒 Pro - 运行中');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Windows 下通常保持托盘运行
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

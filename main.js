const { app, BrowserWindow, ipcMain, Menu, session, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ✅ IPC Handlers
ipcMain.handle('bookmarks:load', async () => {
  try {
    const file = path.join(dataDir, 'bookmarks.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  } catch { return []; }
});

ipcMain.handle('bookmarks:save', async (e, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'bookmarks.json'), JSON.stringify(data));
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('history:load', async () => {
  try {
    const file = path.join(dataDir, 'history.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  } catch { return []; }
});

ipcMain.handle('history:save', async (e, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'history.json'), JSON.stringify(data));
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('passwords:load', async () => {
  try {
    const file = path.join(dataDir, 'passwords.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  } catch { return {}; }
});

ipcMain.handle('passwords:save', async (e, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'passwords.json'), JSON.stringify(data));
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('downloads:load', async () => {
  try {
    const file = path.join(dataDir, 'downloads.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  } catch { return []; }
});

ipcMain.handle('downloads:save', async (e, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'downloads.json'), JSON.stringify(data));
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// ✅ Window controls
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });
ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

function createWindow() {
  console.log('\n========================================');
  console.log('🚀 CREATING WINDOW');
  console.log('========================================');
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    backgroundColor: '#ffffff',
    resizable: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      sandbox: false,
      zoomFactor: 1.0
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setZoomFactor(1.0);
  
  // ✅ DETAYLI DOSYA KONTROLÜ
  console.log('\n========================================');
  console.log('📁 FILE SYSTEM CHECK');
  console.log('========================================');
  console.log('__dirname:', __dirname);
  console.log('Is packaged:', app.isPackaged);
  console.log('App path:', app.getAppPath());
  console.log('Exe path:', app.getPath('exe'));
  console.log('User data:', userDataPath);
  
  const indexPath = path.join(__dirname, 'index.html');
  console.log('\n📄 index.html:', indexPath);
  console.log('   Exists:', fs.existsSync(indexPath));
  
  if (fs.existsSync(indexPath)) {
    const stats = fs.statSync(indexPath);
    console.log('   Size:', stats.size, 'bytes');
    console.log('   Modified:', stats.mtime);
  }
  
  // ✅ TÜM DOSYALARI KONTROL ET
  const requiredFiles = ['index.html', 'style.css', 'script.js', 'preload.js', 'main.js'];
  console.log('\n📦 REQUIRED FILES:');
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    const size = exists ? fs.statSync(filePath).size : 0;
    console.log(`   ${exists ? '✅' : '❌'} ${file.padEnd(15)} ${exists ? size + ' bytes' : 'NOT FOUND'}`);
  });
  
  // ✅ LOGO KONTROLÜ
  const logoPath = path.join(__dirname, 'logo.png');
  console.log(`   ${fs.existsSync(logoPath) ? '✅' : '⚠️ '} logo.png       ${fs.existsSync(logoPath) ? fs.statSync(logoPath).size + ' bytes' : 'OPTIONAL - NOT FOUND'}`);
  
  // ✅ KLASÖR İÇERİĞİNİ LİSTELE
  console.log('\n📂 DIRECTORY CONTENTS:');
  try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
      const filePath = path.join(__dirname, file);
      const stats = fs.statSync(filePath);
      const type = stats.isDirectory() ? '📁' : '📄';
      console.log(`   ${type} ${file}`);
    });
  } catch (err) {
    console.error('   ❌ Cannot read directory:', err.message);
  }
  
  console.log('========================================\n');
  
  // ✅ LOAD FILE
  console.log('🔄 Loading index.html...');
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('✅ loadFile() promise resolved');
    })
    .catch(err => {
      console.error('❌ loadFile() promise rejected:', err);
      console.error('   Error code:', err.code);
      console.error('   Error message:', err.message);
    });

  // ✅ Session ayarları (webview için kritik)
  console.log('🔧 Setting up session handlers...');
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: details.requestHeaders });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });

  // ✅ Webview izinleri (build için kritik)
  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    console.log('🔗 Webview attaching:', params.src);
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.webSecurity = false;
    webPreferences.allowRunningInsecureContent = true;
    webPreferences.devTools = true;
    });

    mainWindow.webContents.openDevTools();

  // ✅ Load event listeners
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('⏳ Main window started loading...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Main window loaded successfully');
    console.log('   URL:', mainWindow.webContents.getURL());
    console.log('   Title:', mainWindow.webContents.getTitle());
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Main window failed to load');
    console.error('   Error code:', errorCode);
    console.error('   Description:', errorDescription);
    console.error('   URL:', validatedURL);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('✅ DOM ready');
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['VERBOSE', 'INFO', 'WARNING', 'ERROR'];
    console.log(`[RENDERER ${levels[level]}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-changed', 'maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-changed', 'normal');
  });

  mainWindow.on('closed', () => {
    console.log('🔴 Window closed');
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('\n========================================');
  console.log('🎯 APP READY');
  console.log('========================================');
  console.log('Electron version:', process.versions.electron);
  console.log('Chrome version:', process.versions.chrome);
  console.log('Node version:', process.versions.node);
  console.log('Platform:', process.platform);
  console.log('Arch:', process.arch);
  console.log('========================================\n');

  createWindow();

  // ✅ Default session ayarları
  console.log('🔧 Configuring sessions...');
  const ses = session.defaultSession;
  
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('🔐 Permission requested:', permission);
    callback(true);
  });

  ses.setDevicePermissionHandler(() => true);

  ses.setProxy({ mode: 'direct' })
    .then(() => {
      console.log('✅ Default session proxy set to direct');
    })
    .catch(err => {
      console.error('❌ Default session proxy setup failed:', err);
    });

  // ✅ Persist session ayarları
  const persistSession = session.fromPartition('persist:main');
  
  persistSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('🔐 Persist session permission requested:', permission);
    callback(true);
  });

  persistSession.setDevicePermissionHandler(() => true);

  persistSession.setProxy({ mode: 'direct' })
    .then(() => {
      console.log('✅ Persist session proxy cleared');
    })
    .catch(err => {
      console.error('❌ Persist session proxy setup failed:', err);
    });

  // ✅ F12 kısayolu
  const f12Registered = globalShortcut.register('F12', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.isDevToolsOpened() 
        ? mainWindow.webContents.closeDevTools() 
        : mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });
  console.log('⌨️  F12 shortcut registered:', f12Registered);

  // ✅ Ctrl+Shift+I kısayolu
  const ctrlShiftIRegistered = globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.toggleDevTools();
    }
  });
  console.log('⌨️  Ctrl+Shift+I shortcut registered:', ctrlShiftIRegistered);
  
  console.log('\n✅ App initialization complete\n');
});

app.on('window-all-closed', () => {
  console.log('🔴 All windows closed');
  if (process.platform !== 'darwin') {
    console.log('🔴 Quitting app...');
    app.quit();
  }
});

app.on('activate', () => {
  console.log('🔄 App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log('🔄 No windows found, creating new window...');
    createWindow();
  }
});

app.on('will-quit', () => {
  console.log('🔴 App will quit, unregistering shortcuts...');
  globalShortcut.unregisterAll();
});

// ✅ Hata yakalama
process.on('uncaughtException', (error) => {
  console.error('\n========================================');
  console.error('💥 UNCAUGHT EXCEPTION');
  console.error('========================================');
  console.error(error);
  console.error('========================================\n');
});

process.on('unhandledRejection', (error) => {
  console.error('\n========================================');
  console.error('💥 UNHANDLED REJECTION');
  console.error('========================================');
  console.error(error);
  console.error('========================================\n');
});

console.log('\n========================================');
console.log('🟢 main.js loaded');
console.log('========================================\n');

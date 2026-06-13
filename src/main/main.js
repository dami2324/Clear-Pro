const { app, BrowserWindow, ipcMain, nativeTheme, Menu } = require('electron');
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const cleaner = require('./services/cleaner');
const scheduler = require('./services/scheduler');
const notifications = require('./services/notifications');

const store = new Store({
  defaults: {
    theme: 'dark',
    language: 'es',
    autoStart: false,
    schedule: { enabled: false, frequency: 'weekly' },
    stats: { today: 0, week: 0, month: 0, lastCleanedAt: null },
    history: []
  }
});

let mainWindow;
let updateState = {
  status: 'idle',
  message: '',
  version: null,
  percent: 0,
  error: null
};

const menuLabels = {
  es: {
    file: 'Archivo',
    edit: 'Editar',
    view: 'Ver',
    window: 'Ventana',
    help: 'Ayuda',
    quit: 'Salir',
    undo: 'Deshacer',
    redo: 'Rehacer',
    cut: 'Cortar',
    copy: 'Copiar',
    paste: 'Pegar',
    selectAll: 'Seleccionar todo',
    reload: 'Recargar',
    forceReload: 'Forzar recarga',
    toggleDevTools: 'Herramientas de desarrollo',
    resetZoom: 'Tamano real',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    toggleFullscreen: 'Pantalla completa',
    minimize: 'Minimizar',
    close: 'Cerrar',
    about: 'Acerca de ClearPro'
  },
  en: {
    file: 'File',
    edit: 'Edit',
    view: 'View',
    window: 'Window',
    help: 'Help',
    quit: 'Quit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Developer Tools',
    resetZoom: 'Actual Size',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    toggleFullscreen: 'Toggle Full Screen',
    minimize: 'Minimize',
    close: 'Close',
    about: 'About ClearPro'
  }
};

function applyAppMenu(language = 'es') {
  const labels = menuLabels[language] || menuLabels.es;
  const template = [
    {
      label: labels.file,
      submenu: [{ label: labels.quit, role: 'quit' }]
    },
    {
      label: labels.edit,
      submenu: [
        { label: labels.undo, role: 'undo' },
        { label: labels.redo, role: 'redo' },
        { type: 'separator' },
        { label: labels.cut, role: 'cut' },
        { label: labels.copy, role: 'copy' },
        { label: labels.paste, role: 'paste' },
        { type: 'separator' },
        { label: labels.selectAll, role: 'selectAll' }
      ]
    },
    {
      label: labels.view,
      submenu: [
        { label: labels.reload, role: 'reload' },
        { label: labels.forceReload, role: 'forceReload' },
        { label: labels.toggleDevTools, role: 'toggleDevTools' },
        { type: 'separator' },
        { label: labels.resetZoom, role: 'resetZoom' },
        { label: labels.zoomIn, role: 'zoomIn' },
        { label: labels.zoomOut, role: 'zoomOut' },
        { type: 'separator' },
        { label: labels.toggleFullscreen, role: 'togglefullscreen' }
      ]
    },
    {
      label: labels.window,
      submenu: [
        { label: labels.minimize, role: 'minimize' },
        { label: labels.close, role: 'close' }
      ]
    },
    {
      label: labels.help,
      submenu: [
        {
          label: labels.about,
          click: () => mainWindow?.webContents.send('clearpro:show-about')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 980,
    minHeight: 660,
    title: 'ClearPro',
    backgroundColor: '#0b1020',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow?.webContents.send('updater:status', updateState);
  });
}

function setUpdateState(patch) {
  updateState = { ...updateState, ...patch };
  mainWindow?.webContents.send('updater:status', updateState);
}

function configureAutoUpdater() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdateState({ status: 'checking', message: 'checking', percent: 0, error: null });
  });
  autoUpdater.on('update-available', (info) => {
    setUpdateState({ status: 'available', message: 'available', version: info.version, percent: 0, error: null });
  });
  autoUpdater.on('update-not-available', (info) => {
    setUpdateState({ status: 'not-available', message: 'notAvailable', version: info.version || null, percent: 0, error: null });
  });
  autoUpdater.on('download-progress', (progress) => {
    setUpdateState({ status: 'downloading', message: 'downloading', percent: Math.round(progress.percent || 0), error: null });
  });
  autoUpdater.on('update-downloaded', (info) => {
    setUpdateState({ status: 'downloaded', message: 'downloaded', version: info.version, percent: 100, error: null });
  });
  autoUpdater.on('error', (error) => {
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('404') || errorMsg.includes('statusCode: 404') || errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
      setUpdateState({ status: 'not-available', message: 'notAvailable', version: null, percent: 0, error: null });
    } else {
      setUpdateState({ status: 'error', message: 'error', error: errorMsg, percent: 0 });
    }
    log.warn('Auto-update error', error);
  });
}

function getState() {
  return {
    version: app.getVersion(),
    theme: store.get('theme'),
    language: store.get('language'),
    autoStart: store.get('autoStart'),
    schedule: store.get('schedule'),
    stats: store.get('stats'),
    history: store.get('history')
  };
}

function applyAutoStart(enabled) {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    openAsHidden: true,
    name: 'ClearPro'
  });
}

function recordCleanup(result) {
  const now = new Date();
  const bytes = result.freedBytes || 0;
  const stats = store.get('stats');
  store.set('stats', {
    today: stats.today + bytes,
    week: stats.week + bytes,
    month: stats.month + bytes,
    lastCleanedAt: now.toISOString()
  });

  const history = store.get('history');
  const entry = {
    id: now.getTime().toString(),
    date: now.toISOString(),
    freedBytes: bytes,
    deletedFiles: result.deletedFiles || 0,
    categories: result.categories || []
  };
  store.set('history', [entry, ...history].slice(0, 10));
  return entry;
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    setUpdateState({ status: 'dev-mode', message: 'devMode', percent: 0, error: null });
    return updateState;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const done = (status, patch) => {
      if (resolved) return;
      resolved = true;

      autoUpdater.removeListener('update-available', onAvailable);
      autoUpdater.removeListener('update-not-available', onNotAvailable);
      autoUpdater.removeListener('error', onError);

      setUpdateState({ status, ...patch });
      resolve(updateState);
    };

    const onAvailable = (info) => {
      done('available', { message: 'available', version: info.version, percent: 0, error: null });
    };

    const onNotAvailable = (info) => {
      done('not-available', { message: 'notAvailable', version: info.version || null, percent: 0, error: null });
    };

    const onError = (error) => {
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('404') || errorMsg.includes('statusCode: 404') || errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
        done('not-available', { message: 'notAvailable', version: null, percent: 0, error: null });
      } else {
        done('error', { message: 'error', error: errorMsg, percent: 0 });
      }
    };

    autoUpdater.once('update-available', onAvailable);
    autoUpdater.once('update-not-available', onNotAvailable);
    autoUpdater.once('error', onError);

    setUpdateState({ status: 'checking', message: 'checking', percent: 0, error: null });

    autoUpdater.checkForUpdates().catch((err) => {
      onError(err);
    });

    setTimeout(() => {
      if (!resolved) {
        done('not-available', { message: 'notAvailable', version: null, percent: 0, error: null });
      }
    }, 8000);
  });
}

app.whenReady().then(() => {
  nativeTheme.themeSource = store.get('theme') === 'light' ? 'light' : 'dark';
  applyAppMenu(store.get('language'));
  applyAutoStart(store.get('autoStart'));
  configureAutoUpdater();
  scheduler.configure({
    store,
    clean: async () => {
      const scan = await cleaner.scanSystem();
      const result = await cleaner.cleanScan(scan);
      const entry = recordCleanup(result);
      notifications.showCleanupComplete(result.freedBytes, result.deletedFiles, store.get('language'));
      mainWindow?.webContents.send('clearpro:cleanup-complete', { entry, state: getState() });
      return result;
    }
  });
  scheduler.reschedule();
  createWindow();
  checkForUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('app:get-state', () => getState());
ipcMain.handle('app:get-disk', () => cleaner.getDiskSummary());
ipcMain.handle('updater:get-state', () => updateState);
ipcMain.handle('updater:check', () => checkForUpdates());
ipcMain.handle('updater:install', () => {
  if (updateState.status === 'downloaded') {
    autoUpdater.quitAndInstall(false, true);
  }
  return updateState;
});
ipcMain.handle('cleaner:scan', () => cleaner.scanSystem());
ipcMain.handle('cleaner:clean', async (_event, scan) => {
  const result = await cleaner.cleanScan(scan);
  const entry = recordCleanup(result);
  notifications.showCleanupComplete(result.freedBytes, result.deletedFiles, store.get('language'));
  return { result, entry, state: getState() };
});

ipcMain.handle('settings:update', (_event, patch) => {
  if (patch.theme) {
    store.set('theme', patch.theme);
    nativeTheme.themeSource = patch.theme === 'light' ? 'light' : 'dark';
  }
  if (patch.language) {
    store.set('language', patch.language);
    applyAppMenu(patch.language);
  }
  if (typeof patch.autoStart === 'boolean') {
    store.set('autoStart', patch.autoStart);
    applyAutoStart(patch.autoStart);
  }
  if (patch.schedule) {
    store.set('schedule', { ...store.get('schedule'), ...patch.schedule });
    scheduler.reschedule();
  }
  return getState();
});

ipcMain.handle('history:clear', () => {
  store.set('history', []);
  return getState();
});

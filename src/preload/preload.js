const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clearpro', {
  getState: () => ipcRenderer.invoke('app:get-state'),
  getDisks: () => ipcRenderer.invoke('app:get-disks'),
  getDisk: (diskRoot) => ipcRenderer.invoke('app:get-disk', diskRoot),
  getUpdaterState: () => ipcRenderer.invoke('updater:get-state'),
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  scan: (options) => ipcRenderer.invoke('cleaner:scan', options),
  clean: (scan) => ipcRenderer.invoke('cleaner:clean', scan),
  showInFolder: (filePath) => ipcRenderer.invoke('file:show-in-folder', filePath),
  updateSettings: (patch) => ipcRenderer.invoke('settings:update', patch),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  onCleanupComplete: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('clearpro:cleanup-complete', handler);
    return () => ipcRenderer.removeListener('clearpro:cleanup-complete', handler);
  },
  onUpdaterStatus: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('updater:status', handler);
    return () => ipcRenderer.removeListener('updater:status', handler);
  }
});

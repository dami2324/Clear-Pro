const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clearpro', {
  getState: () => ipcRenderer.invoke('app:get-state'),
  getDisk: () => ipcRenderer.invoke('app:get-disk'),
  getUpdaterState: () => ipcRenderer.invoke('updater:get-state'),
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  scan: () => ipcRenderer.invoke('cleaner:scan'),
  clean: (scan) => ipcRenderer.invoke('cleaner:clean', scan),
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

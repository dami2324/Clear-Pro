const { Notification } = require('electron');
const electronNotifications = require('electron-notifications');

function formatBytes(bytes = 0) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function showCleanupComplete(bytes, language = 'es') {
  const body = language === 'en'
    ? `Cleanup complete. Space freed: ${formatBytes(bytes)}.`
    : `Limpieza completa. Espacio liberado: ${formatBytes(bytes)}.`;
  try {
    electronNotifications.notify('ClearPro', {
      message: body,
      duration: 5000
    });
    return;
  } catch {
    if (!Notification.isSupported()) return;
    new Notification({ title: 'ClearPro', body }).show();
  }
}

module.exports = { showCleanupComplete };

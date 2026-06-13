const { Notification } = require('electron');

function formatBytes(bytes = 0) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function showCleanupComplete(bytes, files = 0, language = 'es') {
  const body = language === 'en'
    ? `Cleanup complete. ${files} files removed. Space freed: ${formatBytes(bytes)}.`
    : `Limpieza completa. ${files} archivos eliminados. Espacio liberado: ${formatBytes(bytes)}.`;

  if (!Notification.isSupported()) return;
  new Notification({ title: 'ClearPro', body }).show();
}

module.exports = { showCleanupComplete };

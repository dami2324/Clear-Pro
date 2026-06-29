const state = {
  app: null,
  scan: null,
  selectedCategories: {},
  selectedFiles: {},
  selectedDiskRoot: null,
  disks: [],
  disk: null,
  updater: null,
  currentView: 'dashboard'
};

if (!window.clearpro) {
  const demoAppState = {
    version: 'dev-preview',
    theme: 'dark',
    language: 'es',
    autoStart: false,
    schedule: { enabled: false, frequency: 'weekly' },
    stats: { today: 0, week: 0, month: 0, lastCleanedAt: null },
    history: []
  };
  const demoDisks = [
    { id: 'C:\\', root: 'C:\\', name: 'Disco C:', total: 127 * 1024 ** 3, free: 24 * 1024 ** 3, removable: false },
    { id: 'D:\\', root: 'D:\\', name: 'Disco D:', total: 500 * 1024 ** 3, free: 19 * 1024 ** 3, removable: false }
  ];

  window.clearpro = {
    getState: async () => demoAppState,
    getDisks: async () => demoDisks,
    getDisk: async (diskRoot) => demoDisks.find((disk) => disk.root === diskRoot) || demoDisks[0],
    getUpdaterState: async () => ({ status: 'dev-mode', percent: 0 }),
    checkForUpdates: async () => ({ status: 'dev-mode', percent: 0 }),
    installUpdate: async () => ({ status: 'dev-mode', percent: 0 }),
    scan: async ({ diskRoot } = {}) => ({
      scannedAt: new Date().toISOString(),
      diskRoot: diskRoot || demoDisks[0].root,
      disks: demoDisks,
      healthScore: 88,
      totalBytes: 5.8 * 1024 ** 3,
      totalFiles: 156,
      categories: [
        { id: 'system-temp', label: 'System temporary files', bytes: 680 * 1024 ** 2, count: 2, files: [
          { name: 'cache.tmp', path: 'C:\\Temp\\cache.tmp', type: 'other', size: 380 * 1024 ** 2 },
          { name: 'install.tmp', path: 'C:\\Temp\\install.tmp', type: 'other', size: 300 * 1024 ** 2 }
        ], cleanable: true, defaultSelected: true },
        { id: 'browser-cache', label: 'Browser cache', bytes: 410 * 1024 ** 2, count: 1, files: [
          { name: 'data_0', path: 'C:\\Users\\Demo\\Chrome\\Cache\\data_0', type: 'other', size: 410 * 1024 ** 2 }
        ], cleanable: true, defaultSelected: true },
        { id: 'trash', label: 'Recycle bin', bytes: 220 * 1024 ** 2, count: 4, files: [
          { name: 'Papelera', path: 'RecycleBin::C:\\', type: 'other', size: 220 * 1024 ** 2, count: 4 }
        ], cleanable: true, defaultSelected: true },
        {
          id: 'large-files',
          label: 'Large files',
          bytes: 4.5 * 1024 ** 3,
          count: 3,
          cleanable: true,
          defaultSelected: false,
          files: [
            { name: 'Video promocional.mp4', path: 'D:\\Videos\\Video promocional.mp4', type: 'video', size: 2.4 * 1024 ** 3 },
            { name: 'Fotos producto.zip', path: 'D:\\Imagenes\\Fotos producto.zip', type: 'archive', size: 1.6 * 1024 ** 3 },
            { name: 'Catalogo.pdf', path: 'D:\\Documentos\\Catalogo.pdf', type: 'document', size: 520 * 1024 ** 2 }
          ]
        }
      ]
    }),
    clean: async () => ({ result: { freedBytes: 0, deletedFiles: 0, categories: [] }, entry: null, state: demoAppState }),
    showInFolder: async () => ({ ok: true }),
    updateSettings: async (patch) => Object.assign(demoAppState, patch),
    clearHistory: async () => Object.assign(demoAppState, { history: [] }),
    onCleanupComplete: () => () => {},
    onUpdaterStatus: () => () => {}
  };
}

const i18n = {
  es: {
    brandSubtitle: 'Cleaner',
    dashboard: 'Dashboard',
    scanner: 'Escaner',
    schedule: 'Programar',
    history: 'Historial',
    settings: 'Configuracion',
    health: 'Salud',
    cleanNow: 'Limpiar Ahora',
    diskHealth: 'Salud del disco',
    diskUsage: 'Uso del disco',
    diskSelector: 'Disco',
    selectedDisk: 'Disco seleccionado',
    today: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    lastCleanup: 'Ultima limpieza',
    scan: 'Escanear',
    availableToFree: ' disponibles para liberar',
    automaticCleanup: 'Limpieza automatica',
    frequency: 'Frecuencia',
    daily: 'Diaria',
    weekly: 'Semanal',
    monthly: 'Mensual',
    lastTenCleanups: 'Ultimas 10 limpiezas',
    clearHistory: 'Borrar historial',
    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    autoStart: 'Auto-inicio con el sistema',
    language: 'Idioma',
    home: 'Inicio',
    calculating: 'Calculando...',
    never: 'Nunca',
    ready: 'Listo para escanear archivos temporales, caches, papelera y residuos.',
    used: 'usado',
    before: 'Antes',
    after: 'Despues',
    free: 'libres',
    noScan: 'No hay escaneo todavia.',
    foundSummary: '{files} archivos basura encontrados. Vista previa: {bytes}.',
    filesFound: '{count} archivos encontrados',
    noHistory: 'Aun no hay limpiezas registradas.',
    filesDeleted: '{count} archivos eliminados',
    preparing: 'Preparando escaneo...',
    searching: 'Buscando caches, papelera y temporales...',
    previewReady: 'Vista previa lista',
    deleting: 'Eliminando archivos seguros...',
    completed: 'Limpieza completada',
    noFiles: 'No se encontraron archivos para limpiar.',
    noSelectedCategories: 'Selecciona al menos una categoria para limpiar.',
    scanFailed: 'No se pudo completar el escaneo. Intenta de nuevo o selecciona otro disco.',
    reviewOnly: 'Seleccion manual',
    showInFolder: 'Ver en carpeta',
    cannotOpenFile: 'No se pudo abrir la ubicacion del archivo.',
    topLargeFiles: 'Archivos pesados encontrados',
    filesToDelete: 'Archivos para revisar',
    moreFiles: '{count} archivos mas no mostrados',
    removableDisk: 'Extraible',
    localDisk: 'Local',
    noFilesInCategory: 'Sin archivos',
    fileTypes: {
      image: 'Imagen',
      video: 'Video',
      audio: 'Audio',
      archive: 'Comprimido',
      installer: 'Instalador',
      document: 'Documento',
      other: 'Archivo'
    },
    recentFreed: 'Liberado reciente',
    junkByCategory: 'Basura por categoria',
    scanImpact: 'Impacto del escaneo',
    scannerBreakdownTitle: 'Resumen del escaneo',
    selectedCleanup: 'Seleccionado para limpiar',
    temporaryAndCache: 'Temporales y cache',
    recycleBinSpace: 'Papelera',
    largeFileSpace: 'Archivos grandes',
    diskFreeSpace: 'Libre en disco',
    pendingScan: 'Pendiente de escaneo',
    noChartData: 'Sin datos',
    ofTotal: 'del total',
    updates: 'Actualizaciones',
    checkUpdates: 'Buscar actualizaciones',
    installUpdate: 'Instalar ahora',
    updateIdle: 'Listo para buscar actualizaciones.',
    updateChecking: 'Buscando actualizaciones...',
    updateAvailable: 'Actualizacion disponible.',
    updateNotAvailable: 'ClearPro esta actualizado.',
    updateDownloading: 'Descargando actualizacion...',
    updateDownloaded: 'Actualizacion lista para instalar.',
    updateError: 'No se pudo buscar actualizaciones.',
    updateDevMode: 'Las actualizaciones se prueban en la app empaquetada.',
    versionLabel: 'Version',
    currentVersion: 'Version actual',
    categories: {
      'system-temp': 'Temporales del sistema',
      'browser-cache': 'Cache de navegadores',
      'system-logs': 'Logs del sistema',
      'install-residue': 'Residuos de instalaciones',
      'app-cache': 'Cache de aplicaciones',
      trash: 'Papelera de reciclaje',
      'large-files': 'Archivos grandes'
    },
    categoryDescriptions: {
      'system-temp': 'Archivos temporales que Windows y otras apps crean para tareas momentaneas.',
      'browser-cache': 'Datos guardados por navegadores para cargar paginas mas rapido; se pueden volver a crear.',
      'system-logs': 'Registros tecnicos del sistema y aplicaciones, utiles para diagnosticos antiguos.',
      'install-residue': 'Restos de instaladores, paquetes temporales y registros que quedan despues de instalar o actualizar programas.',
      'app-cache': 'Caches locales de aplicaciones; suelen regenerarse automaticamente si la app los necesita.',
      trash: 'Elementos enviados a la papelera. Al limpiarlos se eliminan definitivamente.',
      'large-files': 'Videos, imagenes, instaladores, comprimidos y documentos grandes. Se muestran desmarcados para revisar antes de borrar.'
    }
  },
  en: {
    brandSubtitle: 'Cleaner',
    dashboard: 'Dashboard',
    scanner: 'Scanner',
    schedule: 'Schedule',
    history: 'History',
    settings: 'Settings',
    health: 'Health',
    cleanNow: 'Clean Now',
    diskHealth: 'Disk health',
    diskUsage: 'Disk usage',
    diskSelector: 'Disk',
    selectedDisk: 'Selected disk',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    lastCleanup: 'Last cleanup',
    scan: 'Scan',
    availableToFree: ' available to free',
    automaticCleanup: 'Automatic cleanup',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    lastTenCleanups: 'Last 10 cleanups',
    clearHistory: 'Clear history',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    autoStart: 'Start with system',
    language: 'Language',
    home: 'Home',
    calculating: 'Calculating...',
    never: 'Never',
    ready: 'Ready to scan temporary files, caches, recycle bin and leftovers.',
    used: 'used',
    before: 'Before',
    after: 'After',
    free: 'free',
    noScan: 'No scan yet.',
    foundSummary: '{files} junk files found. Preview: {bytes}.',
    filesFound: '{count} files found',
    noHistory: 'No cleanups recorded yet.',
    filesDeleted: '{count} files deleted',
    preparing: 'Preparing scan...',
    searching: 'Searching caches, recycle bin and temporary files...',
    previewReady: 'Preview ready',
    deleting: 'Deleting safe files...',
    completed: 'Cleanup completed',
    noFiles: 'No files found to clean.',
    noSelectedCategories: 'Select at least one category to clean.',
    scanFailed: 'Could not complete the scan. Try again or select another disk.',
    reviewOnly: 'Manual selection',
    showInFolder: 'Show in folder',
    cannotOpenFile: 'Could not open the file location.',
    topLargeFiles: 'Large files found',
    filesToDelete: 'Files to review',
    moreFiles: '{count} more files not shown',
    removableDisk: 'Removable',
    localDisk: 'Local',
    noFilesInCategory: 'No files',
    fileTypes: {
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      archive: 'Archive',
      installer: 'Installer',
      document: 'Document',
      other: 'File'
    },
    recentFreed: 'Recent freed space',
    junkByCategory: 'Junk by category',
    scanImpact: 'Scan impact',
    scannerBreakdownTitle: 'Scan summary',
    selectedCleanup: 'Selected to clean',
    temporaryAndCache: 'Temporary and cache',
    recycleBinSpace: 'Recycle bin',
    largeFileSpace: 'Large files',
    diskFreeSpace: 'Free on disk',
    pendingScan: 'Pending scan',
    noChartData: 'No data',
    ofTotal: 'of total',
    updates: 'Updates',
    checkUpdates: 'Check for updates',
    installUpdate: 'Install now',
    updateIdle: 'Ready to check for updates.',
    updateChecking: 'Checking for updates...',
    updateAvailable: 'Update available.',
    updateNotAvailable: 'ClearPro is up to date.',
    updateDownloading: 'Downloading update...',
    updateDownloaded: 'Update ready to install.',
    updateError: 'Could not check for updates.',
    updateDevMode: 'Updates are tested in the packaged app.',
    versionLabel: 'Version',
    currentVersion: 'Current version',
    categories: {
      'system-temp': 'System temporary files',
      'browser-cache': 'Browser cache',
      'system-logs': 'System logs',
      'install-residue': 'Installer leftovers',
      'app-cache': 'Application cache',
      trash: 'Recycle bin',
      'large-files': 'Large files'
    },
    categoryDescriptions: {
      'system-temp': 'Temporary files created by Windows and apps for short-lived tasks.',
      'browser-cache': 'Browser data used to load pages faster; it can be recreated.',
      'system-logs': 'Technical system and app logs, usually useful only for older diagnostics.',
      'install-residue': 'Installer remnants, temporary packages, and logs left after installs or updates.',
      'app-cache': 'Local app caches; apps usually rebuild them if needed.',
      trash: 'Items sent to the recycle bin. Cleaning removes them permanently.',
      'large-files': 'Large videos, images, installers, archives, and documents. They stay unchecked for review before deletion.'
    }
  }
};

const chartColors = ['#0066FF', '#4F94FF', '#20D489', '#FFBC42', '#7C9CFF'];
const $ = (selector) => document.querySelector(selector);
const t = (key) => key.split('.').reduce((value, part) => value?.[part], i18n[state.app?.language || 'es']) || key;

function template(text, values) {
  return Object.entries(values).reduce((output, [key, value]) => output.replace(`{${key}}`, value), text);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatBytes(bytes = 0) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return t('never');
  const locale = state.app?.language === 'en' ? 'en' : 'es';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function setProgress(visible, percent = 0, text = t('preparing')) {
  $('#progressWrap').classList.toggle('hidden', !visible);
  $('#progressText').textContent = text;
  $('#progressPercent').textContent = `${percent}%`;
  $('#progressBar').style.width = `${percent}%`;
}

function applyLanguage() {
  document.documentElement.lang = state.app?.language || 'es';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  $('#viewTitle').textContent = t(state.currentView);
  $('#eyebrow').textContent = state.currentView === 'dashboard' ? t('home') : 'ClearPro';
}

function categoryName(category) {
  return t(`categories.${category.id}`) || category.label;
}

function fileTypeName(type) {
  return t(`fileTypes.${type || 'other'}`) || t('fileTypes.other');
}

function categoryDescription(category) {
  return t(`categoryDescriptions.${category.id}`) || '';
}

function getSelectedScan() {
  if (!state.scan) return null;
  const categories = state.scan.categories
    .filter((category) => category.cleanable !== false && state.selectedCategories[category.id] !== false)
    .map((category) => {
      const files = (category.files || [])
        .filter((file) => state.selectedFiles[file.path] !== false)
        .map((file) => ({ ...file, selected: true }));
      const bytes = files.reduce((sum, file) => sum + file.size, 0);
      const count = files.reduce((sum, file) => sum + (file.count || 1), 0);
      return { ...category, files, bytes, count, selected: true };
    })
    .filter((category) => category.count > 0);
  const totalBytes = categories.reduce((sum, category) => sum + category.bytes, 0);
  const totalFiles = categories.reduce((sum, category) => sum + category.count, 0);
  return { ...state.scan, categories, totalBytes, totalFiles };
}

function resetSelectedCategories(scan) {
  state.selectedCategories = {};
  state.selectedFiles = {};
  (scan?.categories || []).forEach((category) => {
    const selected = category.cleanable !== false && category.defaultSelected !== false && category.count > 0;
    state.selectedCategories[category.id] = selected;
    (category.files || []).forEach((file) => {
      state.selectedFiles[file.path] = selected;
    });
  });
}

function renderState() {
  if (!state.app) return;
  document.body.classList.toggle('light', state.app.theme === 'light');
  $('#theme').value = state.app.theme;
  $('#language').value = state.app.language;
  $('#autoStart').checked = state.app.autoStart;
  $('#scheduleEnabled').checked = state.app.schedule.enabled;
  $('#frequency').value = state.app.schedule.frequency;
  applyLanguage();
  $('#statToday').textContent = formatBytes(state.app.stats.today);
  $('#statWeek').textContent = formatBytes(state.app.stats.week);
  $('#statMonth').textContent = formatBytes(state.app.stats.month);
  $('#lastCleaned').textContent = formatDate(state.app.stats.lastCleanedAt);
  renderHistory();
  renderDisk();
  renderScan();
  renderCharts();
  renderUpdater();
}

function renderDisk() {
  if (!state.disk) {
    $('#diskLabel').textContent = t('calculating');
    return;
  }
  renderDiskOptions();
  const used = Math.max(0, state.disk.total - state.disk.free);
  const percent = state.disk.total ? Math.round((used / state.disk.total) * 100) : 0;
  $('#diskLabel').textContent = `${state.disk.name || t('diskSelector')} - ${percent}% ${t('used')}`;
  $('#diskUsed').style.width = `${percent}%`;
  $('#diskBefore').textContent = `${t('before')}: ${formatBytes(state.disk.free)} ${t('free')}`;
  const preview = getSelectedScan()?.totalBytes || 0;
  $('#diskAfter').textContent = `${t('after')}: ${formatBytes(state.disk.free + preview)} ${t('free')}`;
  renderScannerDisk();
}

function renderDiskOptions() {
  const select = $('#diskSelect');
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = state.disks.map((disk) => {
    const kind = disk.removable ? t('removableDisk') : t('localDisk');
    return `<option value="${disk.root}">${disk.name || disk.root} - ${kind} - ${formatBytes(disk.free)} ${t('free')}</option>`;
  }).join('');
  select.value = state.selectedDiskRoot || currentValue || state.disk?.root || state.disks[0]?.root || '';
}

function renderScannerDisk() {
  const label = $('#scannerDiskLabel');
  if (!label) return;
  const disk = state.disk || state.disks.find((item) => item.root === state.selectedDiskRoot);
  const root = disk?.root || state.selectedDiskRoot || '--';
  const name = disk?.name ? `${disk.name} (${root})` : root;
  label.textContent = `${t('selectedDisk')}: ${name}`;
}

function renderScan() {
  const scan = state.scan;
  if (!scan) {
    $('#scanSummary').textContent = t('ready');
    $('#previewBytes').textContent = formatBytes(0);
    $('#scanImpact').textContent = '0%';
    $('#scanImpactBar').style.width = '0%';
    renderScannerBreakdown(null);
    $('#categoryList').innerHTML = `<div class="category-card empty"><p>${t('noScan')}</p></div>`;
    renderCharts();
    return;
  }

  const selectedScan = getSelectedScan();
  const selectedBytes = selectedScan?.totalBytes || 0;
  const selectedFiles = selectedScan?.totalFiles || 0;
  const impact = selectedBytes ? Math.max(2, Math.min(100, Math.round((selectedBytes / (1024 ** 3)) * 18))) : 0;
  $('#healthScore').textContent = scan.healthScore;
  $('#sidebarScore').textContent = scan.healthScore;
  $('#healthRing').style.background = `conic-gradient(var(--primary) ${scan.healthScore}%, var(--surface-2) 0)`;
  $('#scanSummary').textContent = template(t('foundSummary'), {
    files: selectedFiles,
    bytes: formatBytes(selectedBytes)
  });
  $('#previewBytes').textContent = formatBytes(selectedBytes);
  $('#scanImpact').textContent = `${impact}%`;
  $('#scanImpactBar').style.width = `${impact}%`;
  renderScannerBreakdown(scan);

  const maxBytes = Math.max(...scan.categories.map((category) => category.bytes), 1);
  $('#categoryList').innerHTML = scan.categories.map((category, index) => {
    const selectedFiles = (category.files || []).filter((file) => state.selectedFiles[file.path] !== false);
    const selectedBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const selectedCount = selectedFiles.reduce((sum, file) => sum + (file.count || 1), 0);
    const percent = Math.round((category.bytes / maxBytes) * 100);
    const checked = state.selectedCategories[category.id] !== false && category.count > 0 ? 'checked' : '';
    const disabled = category.cleanable === false || !category.files?.length ? 'disabled' : '';
    const badge = category.defaultSelected === false ? `<span class="review-badge">${t('reviewOnly')}</span>` : '';
    const fileLimit = category.id === 'large-files' ? 50 : 20;
    const filesToShow = (category.files || []).slice(0, fileLimit);
    const hiddenCount = Math.max(0, (category.files || []).length - filesToShow.length);
    const fileDetails = filesToShow.length
      ? `
        <div class="large-file-list">
          <span>${category.id === 'large-files' ? t('topLargeFiles') : t('filesToDelete')}</span>
          ${filesToShow.map((file) => {
            const fileChecked = state.selectedFiles[file.path] !== false ? 'checked' : '';
            return `
            <div class="large-file-row">
              <input type="checkbox" data-file-category="${category.id}" data-file-path="${escapeHtml(file.path)}" ${fileChecked} ${category.cleanable === false ? 'disabled' : ''} />
              <div>
                <strong>${escapeHtml(file.name || file.path?.split(/[\\/]/).pop() || categoryName(category))}</strong>
                <small>${fileTypeName(file.type)} - ${escapeHtml(file.path || '')}</small>
              </div>
              <button class="folder-button" data-open-path="${escapeHtml(file.path)}" ${file.path?.startsWith('RecycleBin::') ? 'disabled' : ''}>${t('showInFolder')}</button>
              <strong>${formatBytes(file.size)}</strong>
            </div>
          `;}).join('')}
          ${hiddenCount ? `<small class="more-files">${template(t('moreFiles'), { count: hiddenCount })}</small>` : ''}
        </div>
      `
      : '';
    return `
      <article class="category-card">
        <label class="category-check">
          <input type="checkbox" data-category-id="${category.id}" ${checked} ${disabled} />
          <div>
            <strong>${categoryName(category)} ${badge}</strong>
            <small class="category-description">${escapeHtml(categoryDescription(category))}</small>
            <p>${category.count ? `${template(t('filesFound'), { count: category.count })} - ${formatBytes(selectedBytes)} / ${selectedCount}` : t('noFilesInCategory')}</p>
            <div class="category-meter"><span style="width:${percent}%; background:${chartColors[index % chartColors.length]}"></span></div>
          </div>
        </label>
        <strong>${formatBytes(selectedBytes)}</strong>
        ${fileDetails}
      </article>
    `;
  }).join('');
  document.querySelectorAll('[data-category-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const categoryId = event.target.dataset.categoryId;
      state.selectedCategories[categoryId] = event.target.checked;
      const category = state.scan?.categories.find((item) => item.id === categoryId);
      (category?.files || []).forEach((file) => {
        state.selectedFiles[file.path] = event.target.checked;
      });
      renderScan();
    });
  });
  document.querySelectorAll('[data-file-path]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const categoryId = event.target.dataset.fileCategory;
      state.selectedFiles[event.target.dataset.filePath] = event.target.checked;
      const category = state.scan?.categories.find((item) => item.id === categoryId);
      const hasSelected = (category?.files || []).some((file) => state.selectedFiles[file.path] !== false);
      state.selectedCategories[categoryId] = hasSelected;
      renderScan();
    });
  });
  document.querySelectorAll('[data-open-path]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const response = await window.clearpro.showInFolder(event.currentTarget.dataset.openPath);
      if (!response?.ok) {
        setProgress(true, 100, t('cannotOpenFile'));
        setTimeout(() => setProgress(false), 1200);
      }
    });
  });
  renderDisk();
  renderCharts();
}

function categoryBytes(scan, ids, selectedOnly = false) {
  const categories = (scan?.categories || []).filter((category) => ids.includes(category.id));
  if (!selectedOnly) return categories.reduce((sum, category) => sum + category.bytes, 0);

  return categories.reduce((sum, category) => {
    return sum + (category.files || [])
      .filter((file) => state.selectedFiles[file.path] !== false)
      .reduce((fileSum, file) => fileSum + file.size, 0);
  }, 0);
}

function renderScannerBreakdown(scan) {
  const wrap = $('#scannerBreakdown');
  if (!wrap) return;

  const selectedScan = getSelectedScan();
  const selectedBytes = selectedScan?.totalBytes || 0;
  const tempBytes = categoryBytes(scan, ['system-temp', 'browser-cache', 'app-cache', 'system-logs', 'install-residue'], true);
  const trashBytes = categoryBytes(scan, ['trash'], true);
  const largeBytes = categoryBytes(scan, ['large-files']);
  const diskFree = state.disk?.free || 0;
  const baseline = Math.max(selectedBytes, tempBytes, trashBytes, largeBytes, diskFree, 1);

  const cards = [
    { label: t('selectedCleanup'), value: selectedBytes, tone: 'primary' },
    { label: t('temporaryAndCache'), value: tempBytes, tone: 'success' },
    { label: t('recycleBinSpace'), value: trashBytes, tone: 'warning' },
    { label: t('largeFileSpace'), value: largeBytes, tone: 'blue' },
    { label: t('diskFreeSpace'), value: diskFree, tone: 'muted' }
  ];

  wrap.innerHTML = `
    <div class="scanner-breakdown-head">
      <span>${t('scannerBreakdownTitle')}</span>
      <strong>${scan ? formatBytes(selectedBytes) : t('pendingScan')}</strong>
    </div>
    <div class="scanner-metric-grid">
      ${cards.map((card) => {
        const width = card.value ? Math.max(4, Math.round((card.value / baseline) * 100)) : 0;
        return `
          <article class="scanner-metric ${card.tone}">
            <span>${card.label}</span>
            <strong>${formatBytes(card.value)}</strong>
            <div class="scanner-metric-bar"><i style="width:${width}%"></i></div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderHistory() {
  const history = state.app?.history || [];
  $('#historyList').innerHTML = history.length ? history.map((entry) => `
    <article class="history-item">
      <div>
        <strong>${formatDate(entry.date)}</strong>
        <p>${template(t('filesDeleted'), { count: entry.deletedFiles })}</p>
      </div>
      <strong>${formatBytes(entry.freedBytes)}</strong>
    </article>
  `).join('') : `<article class="history-item"><p>${t('noHistory')}</p></article>`;
}

function renderCharts() {
  renderTrendChart();
  renderCategoryDonut();
}

function renderUpdater() {
  if (!$('#updateStatus')) return;
  const updater = state.updater || { status: 'idle', percent: 0 };
  const statusMap = {
    idle: 'updateIdle',
    checking: 'updateChecking',
    available: 'updateAvailable',
    'not-available': 'updateNotAvailable',
    downloading: 'updateDownloading',
    downloaded: 'updateDownloaded',
    error: 'updateError',
    'dev-mode': 'updateDevMode'
  };
  const label = t(statusMap[updater.status] || 'updateIdle');
  const detail = [
    state.app?.version ? `${t('currentVersion')}: ${state.app.version}` : '',
    updater.version ? `${t('versionLabel')}: ${updater.version}` : '',
    updater.error || ''
  ].filter(Boolean).join(' - ');

  $('#updateStatus').textContent = label;
  $('#updateDetail').textContent = detail;
  $('#updateProgress').style.width = `${updater.percent || 0}%`;
  $('#installUpdate').classList.toggle('hidden', updater.status !== 'downloaded');
  $('#checkUpdates').disabled = updater.status === 'checking' || updater.status === 'downloading';
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) return null;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function renderTrendChart() {
  const canvas = $('#trendChart');
  if (!canvas) return;
  const canvasState = setupCanvas(canvas);
  if (!canvasState) return;
  const { ctx, width, height } = canvasState;
  const history = [...(state.app?.history || [])].reverse().slice(-10);
  const values = history.length ? history.map((entry) => entry.freedBytes) : [0, 0, 0, 0, 0, 0];
  const total = values.reduce((sum, value) => sum + value, 0);
  $('#trendTotal').textContent = formatBytes(total);
  ctx.clearRect(0, 0, width, height);

  const pad = 18;
  const chartWidth = width - pad * 2;
  const chartHeight = height - pad * 2;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => ({
    x: pad + (chartWidth * index) / Math.max(values.length - 1, 1),
    y: pad + chartHeight - (value / max) * chartHeight
  }));

  const grid = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = pad + (chartHeight / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
  gradient.addColorStop(0, 'rgba(0, 102, 255, 0.45)');
  gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
  ctx.beginPath();
  ctx.moveTo(points[0].x, height - pad);
  points.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.lineTo(points[points.length - 1].x, height - pad);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = '#0066FF';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#4F94FF';
    ctx.fill();
  });

  if (!total) drawCenteredText(ctx, width, height, t('noChartData'));
}

function renderCategoryDonut() {
  const canvas = $('#categoryDonut');
  if (!canvas) return;
  const canvasState = setupCanvas(canvas);
  if (!canvasState) return;
  const { ctx, width, height } = canvasState;
  const categories = getSelectedScan()?.categories || [];
  const values = categories.map((category) => category.bytes);
  const total = values.reduce((sum, value) => sum + value, 0);
  $('#categoryTotal').textContent = formatBytes(total);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 12;
  if (radius <= 0) return;
  const inner = radius * 0.62;

  if (!total) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(152, 162, 179, 0.22)';
    ctx.lineWidth = radius - inner;
    ctx.stroke();
    drawCenteredText(ctx, width, height, '0 MB');
    $('#categoryLegend').innerHTML = `<p>${t('noChartData')}</p>`;
    return;
  }

  let start = -Math.PI / 2;
  categories.forEach((category, index) => {
    const angle = (category.bytes / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, (radius + inner) / 2, start, start + angle);
    ctx.strokeStyle = chartColors[index % chartColors.length];
    ctx.lineWidth = radius - inner;
    ctx.lineCap = 'round';
    ctx.stroke();
    start += angle;
  });

  drawCenteredText(ctx, width, height, formatBytes(total));
  $('#categoryLegend').innerHTML = categories.map((category, index) => {
    const percent = Math.round((category.bytes / total) * 100);
    return `
      <div class="legend-item">
        <span style="background:${chartColors[index % chartColors.length]}"></span>
        <div><strong>${categoryName(category)}</strong><small>${percent}% ${t('ofTotal')}</small></div>
      </div>
    `;
  }).join('');
}

function drawCenteredText(ctx, width, height, text) {
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text').trim();
  ctx.font = '800 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
}

function switchView(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach((node) => node.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((node) => node.classList.toggle('active', node.dataset.view === view));
  $(`#${view}`).classList.add('active');
  applyLanguage();
  renderCharts();
}

async function runScan() {
  const btn = $('#scanButton');
  if (btn) btn.disabled = true;
  try {
    setProgress(true, 10, t('preparing'));
    await new Promise((resolve) => setTimeout(resolve, 120));
    setProgress(true, 42, t('searching'));
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 60)));
    const scan = await window.clearpro.scan({ diskRoot: state.selectedDiskRoot });
    if (!scan || !Array.isArray(scan.categories)) throw new Error('Invalid scan response');
    state.scan = scan;
    if (state.scan?.diskRoot) state.selectedDiskRoot = state.scan.diskRoot;
    if (Array.isArray(state.scan?.disks)) state.disks = state.scan.disks;
    resetSelectedCategories(state.scan);
    setProgress(true, 100, t('previewReady'));
    renderScan();
    await new Promise((resolve) => setTimeout(resolve, 350));
    return state.scan;
  } catch (error) {
    console.error('Scan failed', error);
    state.scan = null;
    resetSelectedCategories(null);
    renderScan();
    setProgress(true, 100, t('scanFailed'));
    await new Promise((resolve) => setTimeout(resolve, 1600));
    return null;
  } finally {
    setProgress(false);
    if (btn) btn.disabled = false;
  }
}

async function cleanNow() {
  if (!state.scan) await runScan();
  const scan = getSelectedScan();
  if (!scan || !scan.totalFiles) {
    const hasFiles = Boolean(state.scan?.totalFiles);
    setProgress(true, 100, hasFiles ? t('noSelectedCategories') : t('noFiles'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProgress(false);
    return;
  }
  setProgress(true, 35, t('deleting'));
  const response = await window.clearpro.clean(scan);
  state.app = response.state;
  const cleanedPaths = new Set(scan.categories.flatMap((category) => (category.files || []).map((file) => file.path)));
  state.scan = {
    ...state.scan,
    categories: state.scan.categories.map((category) => {
      const files = (category.files || []).filter((file) => !cleanedPaths.has(file.path));
      const bytes = files.reduce((sum, file) => sum + file.size, 0);
      const count = files.reduce((sum, file) => sum + (file.count || 1), 0);
      return { ...category, bytes, count, files };
    })
  };
  state.scan.totalBytes = state.scan.categories.reduce((sum, category) => sum + category.bytes, 0);
  state.scan.totalFiles = state.scan.categories.reduce((sum, category) => sum + category.count, 0);
  setProgress(true, 100, t('completed'));
  renderState();
  await refreshDisk();
  await new Promise((resolve) => setTimeout(resolve, 450));
  setProgress(false);
}

async function refreshDisk() {
  state.disk = await window.clearpro.getDisk(state.selectedDiskRoot);
  if (state.disk?.root) state.selectedDiskRoot = state.disk.root;
  renderDisk();
}

async function init() {
  state.app = await window.clearpro.getState();
  state.updater = await window.clearpro.getUpdaterState();
  state.disks = await window.clearpro.getDisks();
  state.selectedDiskRoot = state.disks[0]?.root || null;
  renderState();
  await refreshDisk();

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
  $('#scanButton').addEventListener('click', runScan);
  $('#quickClean').addEventListener('click', cleanNow);
  $('#diskSelect').addEventListener('change', async (event) => {
    state.selectedDiskRoot = event.target.value;
    state.scan = null;
    resetSelectedCategories(null);
    renderScan();
    await refreshDisk();
  });
  $('#theme').addEventListener('change', async (event) => {
    state.app = await window.clearpro.updateSettings({ theme: event.target.value });
    renderState();
  });
  $('#language').addEventListener('change', async (event) => {
    state.app = await window.clearpro.updateSettings({ language: event.target.value });
    renderState();
  });
  $('#autoStart').addEventListener('change', async (event) => {
    state.app = await window.clearpro.updateSettings({ autoStart: event.target.checked });
    renderState();
  });
  $('#scheduleEnabled').addEventListener('change', async (event) => {
    state.app = await window.clearpro.updateSettings({ schedule: { enabled: event.target.checked } });
    renderState();
  });
  $('#frequency').addEventListener('change', async (event) => {
    state.app = await window.clearpro.updateSettings({ schedule: { frequency: event.target.value } });
    renderState();
  });
  $('#clearHistory').addEventListener('click', async () => {
    state.app = await window.clearpro.clearHistory();
    renderState();
  });
  $('#checkUpdates').addEventListener('click', async () => {
    state.updater = await window.clearpro.checkForUpdates();
    renderUpdater();
  });
  $('#installUpdate').addEventListener('click', async () => {
    state.updater = await window.clearpro.installUpdate();
    renderUpdater();
  });
  window.clearpro.onCleanupComplete(({ state: nextState }) => {
    state.app = nextState;
    renderState();
    refreshDisk();
  });
  window.clearpro.onUpdaterStatus((nextUpdater) => {
    state.updater = nextUpdater;
    renderUpdater();
  });
  window.addEventListener('resize', renderCharts);
}

init();

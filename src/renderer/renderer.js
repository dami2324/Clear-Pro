const state = {
  app: null,
  scan: null,
  disk: null,
  updater: null,
  currentView: 'dashboard'
};

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
    recentFreed: 'Liberado reciente',
    junkByCategory: 'Basura por categoria',
    scanImpact: 'Impacto del escaneo',
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
    categories: {
      'system-temp': 'Temporales del sistema',
      'browser-cache': 'Cache de navegadores',
      'system-logs': 'Logs del sistema',
      'install-residue': 'Residuos de instalaciones',
      trash: 'Papelera de reciclaje'
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
    recentFreed: 'Recent freed space',
    junkByCategory: 'Junk by category',
    scanImpact: 'Scan impact',
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
    categories: {
      'system-temp': 'System temporary files',
      'browser-cache': 'Browser cache',
      'system-logs': 'System logs',
      'install-residue': 'Installer leftovers',
      trash: 'Recycle bin'
    }
  }
};

const chartColors = ['#0066FF', '#4F94FF', '#20D489', '#FFBC42', '#7C9CFF'];
const $ = (selector) => document.querySelector(selector);
const t = (key) => key.split('.').reduce((value, part) => value?.[part], i18n[state.app?.language || 'es']) || key;

function template(text, values) {
  return Object.entries(values).reduce((output, [key, value]) => output.replace(`{${key}}`, value), text);
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
  const used = Math.max(0, state.disk.total - state.disk.free);
  const percent = state.disk.total ? Math.round((used / state.disk.total) * 100) : 0;
  $('#diskLabel').textContent = `${percent}% ${t('used')}`;
  $('#diskUsed').style.width = `${percent}%`;
  $('#diskBefore').textContent = `${t('before')}: ${formatBytes(state.disk.free)} ${t('free')}`;
  const preview = state.scan?.totalBytes || 0;
  $('#diskAfter').textContent = `${t('after')}: ${formatBytes(state.disk.free + preview)} ${t('free')}`;
}

function renderScan() {
  const scan = state.scan;
  if (!scan) {
    $('#scanSummary').textContent = t('ready');
    $('#previewBytes').textContent = formatBytes(0);
    $('#scanImpact').textContent = '0%';
    $('#scanImpactBar').style.width = '0%';
    $('#categoryList').innerHTML = `<div class="category-card empty"><p>${t('noScan')}</p></div>`;
    renderCharts();
    return;
  }

  const impact = Math.max(2, Math.min(100, Math.round((scan.totalBytes / (1024 ** 3)) * 18)));
  $('#healthScore').textContent = scan.healthScore;
  $('#sidebarScore').textContent = scan.healthScore;
  $('#healthRing').style.background = `conic-gradient(var(--primary) ${scan.healthScore}%, var(--surface-2) 0)`;
  $('#scanSummary').textContent = template(t('foundSummary'), {
    files: scan.totalFiles,
    bytes: formatBytes(scan.totalBytes)
  });
  $('#previewBytes').textContent = formatBytes(scan.totalBytes);
  $('#scanImpact').textContent = `${impact}%`;
  $('#scanImpactBar').style.width = `${impact}%`;

  const maxBytes = Math.max(...scan.categories.map((category) => category.bytes), 1);
  $('#categoryList').innerHTML = scan.categories.map((category, index) => {
    const percent = Math.round((category.bytes / maxBytes) * 100);
    return `
      <article class="category-card">
        <div>
          <strong>${categoryName(category)}</strong>
          <p>${template(t('filesFound'), { count: category.count })}</p>
          <div class="category-meter"><span style="width:${percent}%; background:${chartColors[index % chartColors.length]}"></span></div>
        </div>
        <strong>${formatBytes(category.bytes)}</strong>
      </article>
    `;
  }).join('');
  renderDisk();
  renderCharts();
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
  const { ctx, width, height } = setupCanvas(canvas);
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
  const { ctx, width, height } = setupCanvas(canvas);
  const categories = state.scan?.categories || [];
  const values = categories.map((category) => category.bytes);
  const total = values.reduce((sum, value) => sum + value, 0);
  $('#categoryTotal').textContent = formatBytes(total);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 12;
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
  setProgress(true, 10, t('preparing'));
  await new Promise((resolve) => setTimeout(resolve, 180));
  setProgress(true, 42, t('searching'));
  state.scan = await window.clearpro.scan();
  setProgress(true, 100, t('previewReady'));
  renderScan();
  await new Promise((resolve) => setTimeout(resolve, 350));
  setProgress(false);
  return state.scan;
}

async function cleanNow() {
  const scan = state.scan || await runScan();
  if (!scan.totalFiles) {
    setProgress(true, 100, t('noFiles'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProgress(false);
    return;
  }
  setProgress(true, 35, t('deleting'));
  const response = await window.clearpro.clean(scan);
  state.app = response.state;
  state.scan = { ...scan, totalBytes: 0, totalFiles: 0, categories: scan.categories.map((category) => ({ ...category, bytes: 0, count: 0, files: [] })) };
  setProgress(true, 100, t('completed'));
  renderState();
  await refreshDisk();
  await new Promise((resolve) => setTimeout(resolve, 450));
  setProgress(false);
}

async function refreshDisk() {
  state.disk = await window.clearpro.getDisk();
  renderDisk();
}

async function init() {
  state.app = await window.clearpro.getState();
  state.updater = await window.clearpro.getUpdaterState();
  renderState();
  await refreshDisk();

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
  $('#scanButton').addEventListener('click', runScan);
  $('#quickClean').addEventListener('click', cleanNow);
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

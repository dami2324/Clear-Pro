const fs = require('fs/promises');
const fsSync = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const MB = 1024 * 1024;
const GB = 1024 * MB;
const LARGE_FILE_MIN_SIZE = 100 * MB;

const categoryDefinitions = [
  {
    id: 'system-temp',
    label: 'System temporary files',
    paths: () => [os.tmpdir(), path.join(os.homedir(), 'AppData/Local/Temp')],
    extensions: ['.tmp', '.temp', '.cache']
  },
  {
    id: 'browser-cache',
    label: 'Browser cache',
    paths: () => browserCachePaths(),
    extensions: null
  },
  {
    id: 'system-logs',
    label: 'System logs',
    paths: () => logPaths(),
    extensions: ['.log']
  },
  {
    id: 'install-residue',
    label: 'Installer leftovers',
    paths: () => [os.tmpdir(), path.join(os.homedir(), 'Downloads')],
    extensions: ['.tmp', '.log', '.cache']
  },
  {
    id: 'app-cache',
    label: 'Application cache',
    paths: () => appCachePaths(),
    extensions: null,
    maxDepth: 8,
    limit: 1200,
    maxDirectories: 1800,
    maxDurationMs: 1800
  },
  {
    id: 'trash',
    label: 'Recycle bin',
    paths: ({ diskRoot }) => trashPaths(diskRoot),
    extensions: null
  },
  {
    id: 'large-files',
    label: 'Large files',
    paths: ({ diskRoot }) => largeFileRoots(diskRoot),
    extensions: null,
    cleanable: true,
    defaultSelected: false,
    minSize: LARGE_FILE_MIN_SIZE,
    maxDepth: 6,
    limit: 120,
    maxDirectories: 1600,
    maxDurationMs: 2600,
    sortBySize: true
  }
];

function browserCachePaths() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return [
      path.join(home, 'Library/Caches/Google/Chrome'),
      path.join(home, 'Library/Caches/Firefox'),
      path.join(home, 'Library/Caches/Microsoft Edge'),
      path.join(home, 'Library/Caches/com.apple.Safari')
    ];
  }
  return [
    path.join(home, 'AppData/Local/Google/Chrome/User Data/Default/Cache'),
    path.join(home, 'AppData/Local/Microsoft/Edge/User Data/Default/Cache'),
    ...discoverFirefoxCaches(path.join(home, 'AppData/Local/Mozilla/Firefox/Profiles'))
  ];
}

function appCachePaths() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return [
      path.join(home, 'Library/Caches'),
      path.join(home, 'Library/Application Support/Caches')
    ];
  }
  return [
    path.join(home, 'AppData/Local/Temp'),
    path.join(home, 'AppData/Local/CrashDumps'),
    path.join(home, 'AppData/Local/Microsoft/Windows/INetCache')
  ];
}

function discoverFirefoxCaches(profileRoot) {
  try {
    return fsSync
      .readdirSync(profileRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(profileRoot, entry.name, 'cache2', 'entries'));
  } catch {
    return [];
  }
}

function logPaths() {
  const home = os.homedir();
  if (process.platform === 'darwin') return [path.join(home, 'Library/Logs')];
  return [
    path.join(home, 'AppData/Local/Temp'),
    path.join(home, 'AppData/Local/Microsoft/Windows/INetCache')
  ];
}

function trashPaths(diskRoot) {
  const home = os.homedir();
  if (process.platform === 'darwin') return [path.join(home, '.Trash')];
  if (process.platform === 'win32') return windowsRecycleBinPaths(diskRoot);
  return [];
}

function windowsRecycleBinPaths(diskRoot) {
  const roots = new Set([normalizeDiskRoot(diskRoot || process.env.SystemDrive || 'C:')]);
  return Array.from(roots).map((drive) => path.join(normalizeDiskRoot(drive), '$Recycle.Bin'));
}

function largeFileRoots(diskRoot) {
  const root = normalizeDiskRoot(diskRoot || defaultDiskRoot());
  const home = os.homedir();

  if (process.platform === 'win32' && isSameWindowsDrive(root, home)) {
    return [
      path.join(home, 'Desktop'),
      path.join(home, 'Documents'),
      path.join(home, 'Downloads'),
      path.join(home, 'Music'),
      path.join(home, 'Pictures'),
      path.join(home, 'Videos'),
      path.join(root, 'Users', 'Public')
    ];
  }

  if (process.platform === 'darwin' && root === '/') {
    return [
      path.join(home, 'Desktop'),
      path.join(home, 'Documents'),
      path.join(home, 'Downloads'),
      path.join(home, 'Movies'),
      path.join(home, 'Music'),
      path.join(home, 'Pictures')
    ];
  }

  return [root];
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(root, extensions, options = {}) {
  const {
    limit = 900,
    maxDepth = 7,
    minSize = 0,
    maxDirectories = 1400,
    maxDurationMs = 1800,
    skipDirectories = defaultSkipDirectories()
  } = options;
  const files = [];
  const deadline = Date.now() + maxDurationMs;
  let visitedDirectories = 0;
  if (!(await exists(root))) return files;

  async function visit(current, depth) {
    if (files.length >= limit || depth > maxDepth || visitedDirectories >= maxDirectories || Date.now() > deadline) return;
    visitedDirectories += 1;
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= limit || visitedDirectories >= maxDirectories || Date.now() > deadline) break;
      const fullPath = path.join(current, entry.name);
      try {
        if (entry.isDirectory()) {
          if (skipDirectories.has(entry.name.toLowerCase())) continue;
          await visit(fullPath, depth + 1);
          continue;
        }
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions && !extensions.includes(ext)) continue;
        const stat = await fs.stat(fullPath);
        if (stat.size < minSize) continue;
        files.push({
          path: fullPath,
          name: entry.name,
          extension: ext,
          type: fileType(ext),
          size: stat.size,
          modifiedAt: stat.mtime.toISOString()
        });
      } catch {
        continue;
      }
    }

    if (depth % 2 === 0) await new Promise((resolve) => setImmediate(resolve));
  }

  await visit(root, 0);
  return files;
}

function fileType(extension) {
  const ext = extension.toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.raw', '.svg'].includes(ext)) return 'image';
  if (['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'].includes(ext)) return 'audio';
  if (['.zip', '.rar', '.7z', '.tar', '.gz', '.iso', '.dmg'].includes(ext)) return 'archive';
  if (['.exe', '.msi', '.pkg', '.deb', '.appx'].includes(ext)) return 'installer';
  if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'].includes(ext)) return 'document';
  return 'other';
}

function defaultSkipDirectories() {
  return new Set([
    '$recycle.bin',
    'system volume information',
    'windows',
    'program files',
    'program files (x86)',
    'programdata',
    'node_modules',
    '.git',
    '.cache'
  ]);
}

async function scanSystem(options = {}) {
  const globalSeen = new Set();
  const disks = await getAvailableDisks();
  const diskRoot = resolveDiskRoot(options.diskRoot, disks);
  const context = { diskRoot, disks };

  const scannedCategories = await Promise.all(categoryDefinitions.map(async (definition) => {
    const foundFiles = process.platform === 'win32' && definition.id === 'trash'
      ? await scanWindowsRecycleBin(diskRoot)
      : await scanPaths(definition, context);

    return { definition, foundFiles };
  }));

  const categories = scannedCategories.map(({ definition, foundFiles }) => {
    const unique = new Map();
    foundFiles.forEach((file) => {
      if (!globalSeen.has(file.path)) unique.set(file.path, file);
    });

    const files = Array.from(unique.values()).sort((a, b) => (
      definition.sortBySize ? b.size - a.size : 0
    ));
    files.forEach((file) => globalSeen.add(file.path));
    const bytes = files.reduce((sum, file) => sum + file.size, 0);
    const count = files.reduce((sum, file) => sum + (file.count || 1), 0);
    return {
      id: definition.id,
      label: definition.label,
      files,
      bytes,
      count,
      cleanable: definition.cleanable !== false,
      defaultSelected: definition.defaultSelected !== false
    };
  });

  const totalBytes = categories.reduce((sum, category) => sum + category.bytes, 0);
  const totalFiles = categories.reduce((sum, category) => sum + category.count, 0);
  return {
    scannedAt: new Date().toISOString(),
    diskRoot,
    disks,
    categories,
    totalBytes,
    totalFiles,
    healthScore: Math.max(0, Math.min(100, 100 - Math.round(totalBytes / (250 * MB)) * 6))
  };
}

async function scanPaths(definition, context) {
  const foundFiles = [];
  for (const root of definition.paths(context).filter((target) => isPathOnDisk(target, context.diskRoot))) {
    foundFiles.push(...await walk(root, definition.extensions, {
    limit: definition.limit,
    maxDepth: definition.maxDepth,
    minSize: definition.minSize,
    maxDirectories: definition.maxDirectories,
    maxDurationMs: definition.maxDurationMs
  }));
  }
  return foundFiles;
}

function isPathOnDisk(target, diskRoot) {
  if (!target) return false;
  const selectedRoot = normalizeDiskRoot(diskRoot || defaultDiskRoot());

  if (process.platform === 'win32') {
    return isSameWindowsDrive(target, selectedRoot);
  }

  const normalizedTarget = normalizeDiskRoot(target);
  if (selectedRoot === '/') return !normalizedTarget.startsWith('/Volumes/');
  return normalizedTarget === selectedRoot || normalizedTarget.startsWith(`${selectedRoot}/`);
}

async function scanWindowsRecycleBin(diskRoot) {
  const root = normalizeDiskRoot(diskRoot || defaultDiskRoot());
  const script = `
$code = @"
using System;
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
public struct SHQUERYRBINFO {
  public int cbSize;
  public long i64Size;
  public long i64NumItems;
}

public class RecycleBinNative {
  [DllImport("shell32.dll", CharSet=CharSet.Unicode)]
  public static extern int SHQueryRecycleBin(string pszRootPath, ref SHQUERYRBINFO pSHQueryRBInfo);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
$rows = @()
$targetRoot = "${root.replace(/"/g, '`"')}"
Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -eq $targetRoot } | ForEach-Object {
  $info = New-Object SHQUERYRBINFO
  $info.cbSize = [Runtime.InteropServices.Marshal]::SizeOf($info)
  $result = [RecycleBinNative]::SHQueryRecycleBin($_.Root, [ref]$info)
  if ($result -eq 0 -and $info.i64NumItems -gt 0) {
    $rows += [PSCustomObject]@{
      Path = "RecycleBin::" + $_.Root
      Size = [Int64]$info.i64Size
      Count = [Int64]$info.i64NumItems
      ModifiedAt = (Get-Date).ToString("o")
    }
  }
}
$rows | ConvertTo-Json -Depth 3
`;

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], { timeout: 2200 });
    const trimmed = stdout.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows.map((item, index) => ({
      path: item.Path || `RecycleBin::${index}`,
      size: Number(item.Size || 0),
      count: Number(item.Count || 1),
      modifiedAt: item.ModifiedAt || new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

async function cleanScan(scan) {
  let freedBytes = 0;
  let deletedFiles = 0;
  const categories = [];

  for (const category of scan.categories || []) {
    if (category.cleanable === false || category.selected === false) {
      categories.push({ id: category.id, label: category.label, freedBytes: 0, deletedFiles: 0, skipped: true });
      continue;
    }

    if (process.platform === 'win32' && category.id === 'trash') {
      const trashResult = await emptyWindowsRecycleBin(category);
      freedBytes += trashResult.freedBytes;
      deletedFiles += trashResult.deletedFiles;
      categories.push({ id: category.id, label: category.label, ...trashResult });
      continue;
    }

    let categoryBytes = 0;
    let categoryDeleted = 0;
    const selectedFiles = (category.files || []).filter((file) => file.selected !== false);
    for (const file of selectedFiles) {
      try {
        await fs.rm(file.path, { force: true, recursive: false });
        freedBytes += file.size;
        categoryBytes += file.size;
        deletedFiles += 1;
        categoryDeleted += 1;
      } catch {
        continue;
      }
    }
    categories.push({ id: category.id, label: category.label, freedBytes: categoryBytes, deletedFiles: categoryDeleted });
  }

  return { freedBytes, deletedFiles, categories };
}

async function emptyWindowsRecycleBin(category) {
  const selectedFiles = (category.files || []).filter((file) => file.selected !== false);
  const freedBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const deletedFiles = selectedFiles.reduce((sum, file) => sum + (file.count || 1), 0);
  if (!deletedFiles) return { freedBytes: 0, deletedFiles: 0 };

  try {
    await execFileAsync('powershell.exe', ['-NoProfile', '-Command', 'Clear-RecycleBin -Force -ErrorAction SilentlyContinue']);
    return { freedBytes, deletedFiles };
  } catch {
    return { freedBytes: 0, deletedFiles: 0 };
  }
}

function normalizeDiskRoot(root) {
  if (!root) return defaultDiskRoot();

  if (process.platform === 'win32') {
    const normalized = String(root).replace(/\//g, '\\');
    const match = normalized.match(/^([a-zA-Z]):/);
    if (match) return `${match[1].toUpperCase()}:\\`;
    return normalized.endsWith('\\') ? normalized : `${normalized}\\`;
  }

  if (root === '/') return '/';
  return String(root).replace(/\/+$/, '');
}

function defaultDiskRoot() {
  if (process.platform === 'win32') return normalizeDiskRoot(process.env.SystemDrive || 'C:');
  return '/';
}

function isSameWindowsDrive(left, right) {
  if (process.platform !== 'win32') return false;
  const leftDrive = normalizeDiskRoot(left).slice(0, 2).toUpperCase();
  const rightDrive = normalizeDiskRoot(right).slice(0, 2).toUpperCase();
  return leftDrive === rightDrive;
}

function resolveDiskRoot(requestedRoot, disks = []) {
  const fallback = disks[0]?.root || defaultDiskRoot();
  if (!requestedRoot) return normalizeDiskRoot(fallback);
  const normalized = normalizeDiskRoot(requestedRoot);
  const match = disks.find((disk) => normalizeDiskRoot(disk.root) === normalized);
  return normalizeDiskRoot(match?.root || fallback);
}

async function getAvailableDisks() {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execFileAsync('powershell.exe', [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -in 2,3 } | Select-Object DeviceID,VolumeName,DriveType,Size,FreeSpace | ConvertTo-Json"
      ], { timeout: 3500 });
      const parsed = JSON.parse(stdout || '[]');
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const disks = rows
        .filter((disk) => disk?.DeviceID)
        .map((disk) => {
          const root = normalizeDiskRoot(disk.DeviceID);
          return {
            id: root,
            root,
            name: disk.VolumeName ? `${disk.VolumeName} (${disk.DeviceID})` : `Disco ${disk.DeviceID}`,
            total: Number(disk.Size || 0),
            free: Number(disk.FreeSpace || 0),
            removable: Number(disk.DriveType) === 2
          };
        })
        .filter((disk) => disk.total > 0);
      return disks.length ? disks : [fallbackDisk()];
    } catch {
      return [fallbackDisk()];
    }
  }

  try {
    const { stdout } = await execFileAsync('df', ['-kP']);
    const disks = stdout.trim().split('\n').slice(1)
      .map((line) => line.replace(/\s+/g, ' ').split(' '))
      .filter((parts) => parts.length >= 6)
      .map((parts) => {
        const mount = parts.slice(5).join(' ');
        return {
          id: mount,
          root: normalizeDiskRoot(mount),
          name: mount === '/' ? 'Macintosh HD' : path.basename(mount),
          total: Number(parts[1]) * 1024,
          free: Number(parts[3]) * 1024,
          removable: mount.startsWith('/Volumes/')
        };
      })
      .filter((disk) => disk.root === '/' || disk.root.startsWith('/Volumes/'));
    return disks.length ? disks : [fallbackDisk()];
  } catch {
    return [fallbackDisk()];
  }
}

function fallbackDisk() {
  const root = defaultDiskRoot();
  return { id: root, root, name: 'Disco local', total: 512 * GB, free: 188 * GB, removable: false };
}

async function getDiskSummary(diskRoot) {
  const disks = await getAvailableDisks();
  const root = resolveDiskRoot(diskRoot, disks);
  return disks.find((disk) => normalizeDiskRoot(disk.root) === root) || fallbackDisk();
}

module.exports = { scanSystem, cleanScan, getDiskSummary, getAvailableDisks };

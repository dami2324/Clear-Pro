const fs = require('fs/promises');
const fsSync = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const MB = 1024 * 1024;

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
    id: 'trash',
    label: 'Recycle bin',
    paths: () => trashPaths(),
    extensions: null
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

function trashPaths() {
  const home = os.homedir();
  if (process.platform === 'darwin') return [path.join(home, '.Trash')];
  if (process.platform === 'win32') return windowsRecycleBinPaths();
  return [];
}

function windowsRecycleBinPaths() {
  const roots = new Set([process.env.SystemDrive || 'C:']);
  for (let code = 67; code <= 90; code += 1) {
    const drive = `${String.fromCharCode(code)}:`;
    if (fsSync.existsSync(`${drive}\\`)) roots.add(drive);
  }
  return Array.from(roots).map((drive) => path.join(`${drive}\\`, '$Recycle.Bin'));
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(root, extensions, limit = 900) {
  const files = [];
  if (!(await exists(root))) return files;

  async function visit(current, depth) {
    if (files.length >= limit || depth > 7) return;
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= limit) break;
      const fullPath = path.join(current, entry.name);
      try {
        if (entry.isDirectory()) {
          await visit(fullPath, depth + 1);
          continue;
        }
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions && !extensions.includes(ext)) continue;
        const stat = await fs.stat(fullPath);
        files.push({ path: fullPath, size: stat.size, modifiedAt: stat.mtime.toISOString() });
      } catch {
        continue;
      }
    }
  }

  await visit(root, 0);
  return files;
}

async function scanSystem() {
  const categories = [];
  const globalSeen = new Set();

  for (const definition of categoryDefinitions) {
    const unique = new Map();
    const foundFiles = process.platform === 'win32' && definition.id === 'trash'
      ? await scanWindowsRecycleBin()
      : await scanPaths(definition);

    foundFiles.forEach((file) => {
      if (!globalSeen.has(file.path)) unique.set(file.path, file);
    });

    const files = Array.from(unique.values());
    files.forEach((file) => globalSeen.add(file.path));
    const bytes = files.reduce((sum, file) => sum + file.size, 0);
    const count = files.reduce((sum, file) => sum + (file.count || 1), 0);
    categories.push({
      id: definition.id,
      label: definition.label,
      files,
      bytes,
      count
    });
  }

  const totalBytes = categories.reduce((sum, category) => sum + category.bytes, 0);
  const totalFiles = categories.reduce((sum, category) => sum + category.count, 0);
  return {
    scannedAt: new Date().toISOString(),
    categories,
    totalBytes,
    totalFiles,
    healthScore: Math.max(0, Math.min(100, 100 - Math.round(totalBytes / (250 * MB)) * 6))
  };
}

async function scanPaths(definition) {
  const foundFiles = [];
  for (const root of definition.paths()) {
    foundFiles.push(...await walk(root, definition.extensions));
  }
  return foundFiles;
}

async function scanWindowsRecycleBin() {
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
Get-PSDrive -PSProvider FileSystem | ForEach-Object {
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
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script]);
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
    if (process.platform === 'win32' && category.id === 'trash') {
      const trashResult = await emptyWindowsRecycleBin(category);
      freedBytes += trashResult.freedBytes;
      deletedFiles += trashResult.deletedFiles;
      categories.push({ id: category.id, label: category.label, ...trashResult });
      continue;
    }

    let categoryBytes = 0;
    let categoryDeleted = 0;
    for (const file of category.files || []) {
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
  const freedBytes = (category.files || []).reduce((sum, file) => sum + file.size, 0);
  const deletedFiles = category.count || category.files?.length || 0;
  if (!deletedFiles) return { freedBytes: 0, deletedFiles: 0 };

  try {
    await execFileAsync('powershell.exe', ['-NoProfile', '-Command', 'Clear-RecycleBin -Force -ErrorAction SilentlyContinue']);
    return { freedBytes, deletedFiles };
  } catch {
    return { freedBytes: 0, deletedFiles: 0 };
  }
}

async function getDiskSummary() {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execFileAsync('powershell.exe', [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\" | Select-Object Size,FreeSpace | ConvertTo-Json"
      ]);
      const disk = JSON.parse(stdout);
      return { total: Number(disk.Size || 0), free: Number(disk.FreeSpace || 0) };
    } catch {
      return fallbackDisk();
    }
  }

  try {
    const { stdout } = await execFileAsync('df', ['-k', os.homedir()]);
    const line = stdout.trim().split('\n')[1].replace(/\s+/g, ' ').split(' ');
    const total = Number(line[1]) * 1024;
    const free = Number(line[3]) * 1024;
    return { total, free };
  } catch {
    return fallbackDisk();
  }
}

function fallbackDisk() {
  return { total: 512 * 1024 * MB, free: 188 * 1024 * MB };
}

module.exports = { scanSystem, cleanScan, getDiskSummary };

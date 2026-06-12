# ClearPro

ClearPro es una aplicación de escritorio para Windows y macOS creada con Electron + Node.js. Permite escanear archivos temporales, cachés de navegadores, logs, residuos de instalaciones y papelera, mostrar una vista previa del espacio recuperable y ejecutar limpiezas manuales o programadas.

## Funciones

- Dashboard con salud del disco, barra de uso, última limpieza y métricas de espacio liberado.
- Escáner por categorías con vista previa exacta en MB/GB antes de eliminar.
- Botón `Limpiar Ahora` para limpieza rápida.
- Limpieza automática diaria, semanal o mensual con `node-schedule`.
- Preferencias e historial persistidos con `electron-store`.
- Notificaciones de escritorio al completar limpiezas.
- Modo oscuro por defecto, modo claro, auto-inicio e idioma ES/EN.
- Auto-actualizador integrado con `electron-updater`.
- Build para Windows NSIS `.exe` y macOS `.dmg`.

## Requisitos

- Node.js 18+
- npm 9+
- Windows 10/11 o macOS 12+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Construcción

Windows:

```bash
npm run build:win
```

Si `electron-builder` no puede escribir en la caché global de Windows, usa una caché local:

```powershell
$env:ELECTRON_BUILDER_CACHE=(Join-Path (Get-Location) '.cache\electron-builder')
npm run build:win
```

macOS:

```bash
npm run build:mac
```

Ambos:

```bash
npm run dist
```

Los instaladores se generan en `dist/`.

En este proyecto el build de Windows desactiva `signAndEditExecutable` para evitar fallos de symlinks en máquinas sin privilegio de desarrollador. Para producción con firma de código, vuelve a activarlo y configura tu certificado en CI.

## Auto-actualizaciones

El proyecto incluye `electron-updater` con:

- chequeo automatico al abrir la app empaquetada,
- boton manual en `Configuracion > Actualizaciones`,
- estado de descarga en la interfaz,
- instalacion con `quitAndInstall` cuando la actualizacion ya fue descargada.

Por defecto usa un proveedor `generic` de ejemplo:

```json
{
  "provider": "generic",
  "url": "https://updates.example.com/clearpro/"
}
```

Cambia esa URL en `package.json` por tu servidor de actualizaciones antes de publicar.

Si vas a publicar con GitHub Releases, cambia `publish` por algo como:

```json
{
  "provider": "github",
  "owner": "TU_USUARIO",
  "repo": "TU_REPO"
}
```

## Nota de seguridad

ClearPro escanea ubicaciones conocidas del sistema y del usuario. Siempre muestra una vista previa antes de borrar. En Windows, el vaciado completo de la papelera requiere integración nativa adicional; esta versión limpia rutas seguras de temporales, cachés, logs y residuos, y en macOS incluye `~/.Trash`.

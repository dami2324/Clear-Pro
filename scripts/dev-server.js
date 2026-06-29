const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.CLEARPRO_DEV_PORT || 4173);
const root = path.resolve(__dirname, '..', 'src');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    response.end(data);
  });
}

http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);
  const pathname = requestUrl.pathname === '/' ? '/renderer/index.html' : decodeURIComponent(requestUrl.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  sendFile(response, filePath);
}).listen(port, '127.0.0.1', () => {
  console.log(`ClearPro dev server running at http://localhost:${port}/renderer/index.html`);
});

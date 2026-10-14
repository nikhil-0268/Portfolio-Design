/* Tiny static preview server for the portfolio. `npm run dev` or START-PREVIEW.cmd */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const root = __dirname;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function resolveFile(requestPath) {
  const candidates = [];
  if (requestPath === '/' || requestPath === '') candidates.push('index.html');
  else {
    candidates.push('.' + requestPath);
    if (!path.extname(requestPath)) {
      candidates.push('.' + requestPath + '.html');
      candidates.push(path.join('.' + requestPath, 'index.html'));
    }
  }
  for (const candidate of candidates) {
    const file = path.resolve(root, candidate);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
    try {
      if (fs.statSync(file).isFile()) return file;
    } catch (_) {
      /* try the next candidate */
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  let name;
  try {
    name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad request');
  }

  const file = resolveFile(name);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(
      '<!doctype html><meta charset="utf-8"><title>Not found</title>' +
        '<p style="font:16px system-ui;padding:40px">That page is not here. ' +
        '<a href="/">Back to the desk</a>.</p>',
    );
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Could not read that file');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

const port = Number(process.env.PORT) || 0;
server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(
    `Portfolio preview: ${url}\nKeep this window open while previewing. Press Ctrl+C to stop.`,
  );
  if (process.platform === 'win32' && !process.env.DSH_NO_OPEN) {
    execFile('cmd.exe', ['/c', 'start', '', url], () => {});
  }
});

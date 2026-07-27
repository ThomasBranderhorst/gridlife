// Tijdelijke static server om de PWA lokaal te testen (JS draait echt, i.t.t. de statische preview-snapshot).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const PORT = Number(process.env.PORT) || 8137;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.css':'text/css' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/' || p === '') p = '/index.html';
    const file = join(root, normalize(p).replace(/^(\.\.[\/\\])+/, ''));
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log('devserver on http://localhost:' + PORT));

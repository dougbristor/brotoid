// Serves this repository at a root origin, so /brotoid/ here is /brotoid/ on bristorbrot.org. Static files only; a missing path is a 404.
//   node tests/serve.mjs [port]      (default 8190, bound to 127.0.0.1)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, extname, normalize, sep } from 'node:path';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), PORT = +process.argv[2] || 8190;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    let f = join(ROOT, p);
    if (f !== ROOT.replace(/[\\/]$/, '') && !f.startsWith(ROOT)) throw 0;
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    const body = await readFile(f);
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(body);
  } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} at http://localhost:${PORT}/`));

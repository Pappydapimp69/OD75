import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, '_site');
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:8175');
  if (url.pathname === '/qa.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(['partnership-checks.js', 'transport-checks.js', 'settings-checks.js', 'browser-qa.js', 'audio-qa.js'].map(file => fs.readFileSync(path.join(root, 'tests', file), 'utf8')).join('\n')); return;
  }
  const target = url.pathname === '/' || url.pathname === '/qa' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(site, target);
  if (!file.startsWith(site + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html');
  let content = fs.readFileSync(file);
  if (url.pathname === '/qa') content = content.toString().replace('</body>', '<script src="/qa.js"></script></body>');
  res.end(content);
}).listen(8175, '127.0.0.1', () => console.log('OD75 local: http://127.0.0.1:8175'));

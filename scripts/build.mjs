import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = fs.readdirSync(root).filter(n => /^b21-\d{2}\.js$/.test(n)).sort();
const source = modules.map(n => fs.readFileSync(path.join(root, n), 'utf8')).join('');
new vm.Script(source, { filename: 'game.js' });
const version = 'B67-SAFE-CARGO';
const date = '2026-09-03';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replaceAll('OD75-2026-08-12-B21-STARDRIVE', `OD75-${date}-${version}`)
  .replaceAll('game.js?v=B21-STARDRIVE', `game.js?v=${version}`);
fs.mkdirSync(path.join(root, '_site'), { recursive: true });
fs.writeFileSync(path.join(root, '_site/game.js'), source);
fs.writeFileSync(path.join(root, '_site/index.html'), html);
fs.writeFileSync(path.join(root, '_site/.nojekyll'), '');
console.log(`${version}: ${modules.length} ordered modules, assembled syntax OK`);

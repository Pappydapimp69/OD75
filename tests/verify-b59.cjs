const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  url: 'http://127.0.0.1:8175/', runScripts: 'outside-only', pretendToBeVisual: true
});
const win = dom.window;
win.requestAnimationFrame = () => 0;
win.cancelAnimationFrame = () => {};
const context = new Proxy({}, {get: (obj, key) => key in obj ? obj[key] :
  key === 'measureText' ? text => ({width: String(text).length * 7}) :
  key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({addColorStop(){}}) : () => {},
set: (obj, key, value) => {obj[key] = value; return true;}});
win.HTMLCanvasElement.prototype.getContext = () => context;
win.HTMLCanvasElement.prototype.setPointerCapture = () => {};
win.HTMLCanvasElement.prototype.releasePointerCapture = () => {};
win.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({x:0,y:0,left:0,top:0,width:1024,height:768,right:1024,bottom:768});
const files = fs.readdirSync(root).filter(n => /^b21-\d{2}\.js$/.test(n)).sort();
if (files.length !== 50 || files.at(-1) !== 'b21-50.js') throw Error('B60 module order');
const source = files.map(n => fs.readFileSync(path.join(root, n), 'utf8')).join('');
new vm.Script(source, {filename:'game.js'}).runInContext(dom.getInternalVMContext());
// Browser QA covers CSS. Removing styles keeps repeated state simulations inexpensive in JSDOM.
win.document.querySelectorAll('style').forEach(style => style.remove());
new vm.Script(fs.readFileSync(path.join(__dirname, 'partnership-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
const results = vm.runInContext('runPartnershipChecksB59()', dom.getInternalVMContext());
new vm.Script(fs.readFileSync(path.join(__dirname, 'transport-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runTransportChecksB60()', dom.getInternalVMContext()));
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.error ? ': '+r.error : ''}`);
dom.window.close();
if (results.some(r => !r.ok)) process.exitCode = 1;
else console.log(`${results.length} checks passed against the complete ${files.length}-module game.`);

// Renders ad.html to video, frame by frame, in headless Chrome.
//   node render.mjs stills 0.6 2 4 ...   → stills/<t>.jpg for checking scenes
//   node render.mjs encode               → re-encode existing frames only
//   node render.mjs video                → frames/*.jpg, then kabuor-builds-ad.mp4 (H.264, 30 fps)
// Needs `node serve.mjs` running (http://localhost:4300).
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const [mode = 'stills', ...args] = process.argv.slice(2);
const FPS = 30;
const SECONDS = 30;
const W = 1080;
const H = 1920;

const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--remote-debugging-port=${port}`,
  `--user-data-dir=C:/Users/ADMIN/AppData/Local/Temp/claude/chprof-ad-${port}`, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
});
const send = (method, params = {}) => new Promise((resolve) => {
  const n = ++id;
  pending.set(n, resolve);
  ws.send(JSON.stringify({ id: n, method, params }));
});
const run = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'script error');
  return r.result?.result?.value;
};
const shoot = async (quality = 92) => Buffer.from((await send('Page.captureScreenshot', { format: 'jpeg', quality, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })).result.data, 'base64');

await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Runtime.enable');

if (mode === 'stills') {
  await send('Page.navigate', { url: 'http://localhost:4300/ad/ad.html' });
  await sleep(1500);
  await run('window.ready');
  mkdirSync('stills', { recursive: true });
  for (const t of args.map(Number)) {
    await run(`window.seek(${t})`);
    await sleep(60);
    writeFileSync(`stills/${t.toFixed(1)}.jpg`, await shoot(85));
    console.log('still', t);
  }
} else if (mode === 'encode') {
  await send('Page.navigate', { url: 'http://localhost:4300/ad/encode.html' });
  await sleep(1500);
  writeFileSync('kabuor-builds-ad.mp4', Buffer.from(await run(`window.encode(${FPS * SECONDS}, ${FPS}, ${W}, ${H})`), 'base64'));
  console.log('wrote kabuor-builds-ad.mp4');
} else {
  await send('Page.navigate', { url: 'http://localhost:4300/ad/ad.html' });
  await sleep(1500);
  await run('window.ready');
  rmSync('frames', { recursive: true, force: true });
  mkdirSync('frames');
  const total = FPS * SECONDS;
  for (let f = 0; f < total; f++) {
    await run(`window.seek(${f / FPS})`);
    writeFileSync(`frames/${String(f).padStart(4, '0')}.jpg`, await shoot(92));
    if (f % 90 === 0) console.log(`frame ${f}/${total}`);
  }
  // Encode in the browser: WebCodecs H.264 + mp4-muxer, then hand the file back.
  await send('Page.navigate', { url: 'http://localhost:4300/ad/encode.html' });
  await sleep(1500);
  const b64 = await run(`window.encode(${total}, ${FPS}, ${W}, ${H})`);
  writeFileSync('kabuor-builds-ad.mp4', Buffer.from(b64, 'base64'));
  console.log('wrote kabuor-builds-ad.mp4');
}
ws.close();
chrome.kill();

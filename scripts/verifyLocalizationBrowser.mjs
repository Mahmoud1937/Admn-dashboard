import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const browser = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert.ok(browser, 'Set CHROME_PATH to a Chrome or Chromium executable');
const profile = await mkdtemp(path.join(os.tmpdir(), 'admin-localization-browser-'));
const server = await createServer({ server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
let processHandle;
let socket;
try {
  console.log('Starting localization test server...');
  await server.listen();
  console.log('Starting headless browser...');
  const address = server.httpServer.address();
  processHandle = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore','ignore','pipe'] });
  const debuggerUrl = await new Promise((resolve,reject) => {
    const timer = setTimeout(()=>reject(new Error('Browser startup timed out')), 20000);
    processHandle.on('error', reject);
    processHandle.stderr.on('data', chunk => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  console.log('Headless browser connected.');
  const port = new URL(debuggerUrl).port;
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(10000) })).json();
  console.log('Connecting to browser tab...');
  socket = new WebSocket(tabs.find(tab=>tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve,reject) => { const timer=setTimeout(()=>reject(new Error('Browser WebSocket timed out')),10000); socket.addEventListener('open', ()=>{clearTimeout(timer);resolve();}, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); } });
  const command = (method,params={}) => new Promise((resolve,reject) => { const id=nextId++; const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out`));},15000); pending.set(id, response=>{clearTimeout(timer);resolve(response);}); socket.send(JSON.stringify({id,method,params})); });
  let checkCount = 0;
  for (const width of [1440, 390]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await command('Runtime.evaluate', { expression: 'delete window.__localizationResult' });
    await command('Page.navigate', { url: `http://127.0.0.1:${address.port}/scripts/fixtures/localization.html?width=${width}` });
    console.log(`Running localization interactions at ${width}px...`);
    let result;
    for (let attempt=0; attempt<1200; attempt++) {
      const response = await command('Runtime.evaluate', { expression: 'window.__localizationResult', returnByValue: true });
      result = response.result?.result?.value;
      if (result) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    assert.ok(result, 'Localization browser checks timed out');
    if (result.status !== 'passed') console.error(result);
    assert.equal(result.status, 'passed', result.error);
    checkCount += result.checks.length;
  }
  console.log(`Browser localization passed: ${checkCount} checks at desktop and mobile widths for English/Arabic invoices, tickets, notifications, attachments, legal pages, contact details and live language switching.`);
} finally {
  socket?.close();
  if (processHandle && processHandle.exitCode === null) {
    processHandle.kill();
    await Promise.race([new Promise(resolve=>processHandle.once('exit',resolve)), new Promise(resolve=>setTimeout(resolve,2000))]);
  }
  await server.close();
  // The absolute target is a freshly created temporary browser profile.
  assert.ok(profile.startsWith(path.join(os.tmpdir(), 'admin-localization-browser-')));
  await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:250});
}

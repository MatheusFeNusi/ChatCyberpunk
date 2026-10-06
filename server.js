// NETRUNNER CHAT — servidor único compatível com Vercel (captura via server.listen)
// Local: `npm start` e acesse http://localhost:3000
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

// --- estado em memória ---
const store = global.__store || (global.__store = { messages: [], users: {} });

function now() { return new Date().toLocaleTimeString('pt-BR'); }
function pushMsg(m) {
  m.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  store.messages.push(m);
  if (store.messages.length > 100) store.messages.shift();
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 8e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
  });
}
function json(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://x');

  // --- API ---
  if (url.pathname === '/api/join' && req.method === 'POST') {
    const body = await readBody(req);
    const nick = String(body.nick || 'ANÔNIMO').slice(0, 16).toUpperCase();
    if (!store.users[nick]) pushMsg({ type: 'system', text: `>> ${nick} ENTROU NA REDE`, time: now() });
    store.users[nick] = Date.now();
    return json(res, { ok: true, nick, total: store.messages.length });
  }

  if (url.pathname === '/api/send' && req.method === 'POST') {
    const body = await readBody(req);
    const nick = String(body.nick || '').slice(0, 16).toUpperCase();
    const kind = ['chat', 'image', 'audio', 'rtc'].includes(body.kind) ? body.kind : 'chat';
    const text = String(body.text || '').slice(0, kind === 'chat' || kind === 'rtc' ? 20000 : 2_000_000);
    if (!nick || !text) return json(res, { ok: false });
    store.users[nick] = Date.now();
    pushMsg({ type: 'chat', kind, nick, text, time: now() });
    return json(res, { ok: true });
  }

  if (url.pathname === '/api/poll') {
    const since = parseInt(url.searchParams.get('since') || '0', 10);
    const nick = String(url.searchParams.get('nick') || '').slice(0, 16).toUpperCase();
    if (nick) store.users[nick] = Date.now();
    const nowMs = Date.now();
    for (const u of Object.keys(store.users)) {
      if (nowMs - store.users[u] > 30000) {
        delete store.users[u];
        pushMsg({ type: 'system', text: `>> ${u} SAIU DA REDE`, time: now() });
      }
    }
    return json(res, { messages: store.messages.slice(since), total: store.messages.length, users: Object.keys(store.users) });
  }

  // --- estáticos ---
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = path.join(__dirname, 'public', file);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });
});

server.listen(Number(process.env.PORT || 3000), () => console.log('SERVIDOR ATIVO >> http://localhost:3000'));

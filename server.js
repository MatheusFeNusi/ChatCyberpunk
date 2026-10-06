const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const filePath = path.join(__dirname, 'public', file);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
const clients = new Map();
let history = [];

function broadcast(msg) {
  const data = JSON.stringify(msg);
  clients.forEach((_, ws) => { if (ws.readyState === 1) ws.send(data); });
}

function onlineList() {
  return [...clients.values()];
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'join') {
      const nick = String(msg.nick || 'ANÔNIMO').slice(0, 16).toUpperCase();
      clients.set(ws, nick);
      ws.send(JSON.stringify({ type: 'init', nick, history, users: onlineList() }));
      broadcast({ type: 'users', users: onlineList() });
      broadcast({ type: 'system', text: `>> ${nick} ENTROU NA REDE` });
    }

    if (msg.type === 'chat' && clients.has(ws)) {
      const entry = {
        type: 'chat',
        nick: clients.get(ws),
        text: String(msg.text).slice(0, 500),
        time: new Date().toLocaleTimeString('pt-BR')
      };
      history.push(entry);
      if (history.length > 100) history.shift();
      broadcast(entry);
    }
  });

  ws.on('close', () => {
    const nick = clients.get(ws);
    clients.delete(ws);
    if (nick) {
      broadcast({ type: 'users', users: onlineList() });
      broadcast({ type: 'system', text: `>> ${nick} SAIU DA REDE` });
    }
  });
});

server.listen(PORT, () => console.log(`SERVIDOR ATIVO >> http://localhost:${PORT}`));

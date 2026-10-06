const store = require('./_store');

module.exports = (req, res) => {
  const nick = String(req.body?.nick || 'ANÔNIMO').slice(0, 16).toUpperCase();
  if (!store.users[nick]) {
    push(`>> ${nick} ENTROU NA REDE`);
  }
  store.users[nick] = Date.now();
  res.json({ ok: true, nick, total: store.messages.length });
};

function push(text) {
  store.messages.push({ type: 'system', text, time: now() });
  if (store.messages.length > 100) store.messages.shift();
}

function now() { return new Date().toLocaleTimeString('pt-BR'); }

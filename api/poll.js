const store = require('./_store');

module.exports = (req, res) => {
  const since = parseInt(req.query.since || '0', 10);
  const nick = String(req.query.nick || '').slice(0, 16).toUpperCase();

  // heartbeat
  if (nick) store.users[nick] = Date.now();

  // remove inativos há mais de 30s
  const nowMs = Date.now();
  for (const u of Object.keys(store.users)) {
    if (nowMs - store.users[u] > 30000) {
      delete store.users[u];
      store.messages.push({ type: 'system', text: `>> ${u} SAIU DA REDE`, time: new Date().toLocaleTimeString('pt-BR') });
    }
  }

  res.json({
    messages: store.messages.slice(since),
    total: store.messages.length,
    users: Object.keys(store.users)
  });
};

const store = require('./_store');

module.exports = (req, res) => {
  const nick = String(req.body?.nick || '').slice(0, 16).toUpperCase();
  const text = String(req.body?.text || '').slice(0, 500);
  if (!nick || !text) return res.json({ ok: false });
  store.users[nick] = Date.now();
  store.messages.push({ type: 'chat', nick, text, time: new Date().toLocaleTimeString('pt-BR') });
  if (store.messages.length > 100) store.messages.shift();
  res.json({ ok: true });
};

// Armazenamento em memória (suficiente para chat privado pequeno no Vercel)
global.__store = global.__store || { messages: [], users: {} };
module.exports = global.__store;

# 💚 NETRUNNER // CHAT PRIVADO CYBERPUNK

Chat privado estilo terminal hacker verde — canal seguro entre operadores.

## Como usar

### No Vercel
Importe o repositório no Vercel (Framework: **Other**, Root Directory: `./`). O `server.js` na raiz é detectado automaticamente como servidor Node e cuida de tudo (site + API `/api/*`). Sem configuração extra.

### Local
```bash
npm start
```
Acesse `http://localhost:3000` (ou `http://<seu-IP>:3000` de outro dispositivo na mesma rede). Digite seu codinome, conecte e converse.

## Recursos
- Tela de acesso com codinome obrigatório
- Chat em tempo real (polling) com histórico das últimas 100 mensagens
- Lista de operadores online (heartbeat, sai após 30s inativo)
- Visual terminal CRT verde: scanlines, glow, chuva Matrix

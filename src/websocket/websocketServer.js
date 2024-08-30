const WebSocket = require('ws');
const url = require('url');
const logger = require('../compartit/utils/logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ noServer: true });
    this.sessions = new Map(); // Map de sessionId a Set de connexions WebSocket
    this.usuarisPerSessio = new Map(); // Map de sessionId a Set d'usuariIds

    this.wss.on('connection', (ws, request, sessionId) => {
      logger.info(`Nova connexió WebSocket per a la sessió: ${sessionId}`);
      
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, new Set());
        this.usuarisPerSessio.set(sessionId, new Set());
      }
      this.sessions.get(sessionId).add(ws);

      ws.on('message', (message) => {
        this.handleMessage(sessionId, ws, message);
      });

      ws.on('close', () => {
        logger.info(`Connexió tancada per a la sessió: ${sessionId}`);
        this.sessions.get(sessionId).delete(ws);
        if (ws.usuariId) {
          this.usuarisPerSessio.get(sessionId).delete(ws.usuariId);
          this.notificarDesconnexioUsuari(sessionId, ws.usuariId);
        }
        if (this.sessions.get(sessionId).size === 0) {
          this.sessions.delete(sessionId);
          this.usuarisPerSessio.delete(sessionId);
        }
      });
    });

    server.on('upgrade', (request, socket, head) => {
      const { pathname } = url.parse(request.url);
      const sessionId = pathname.split('/')[2]; // Assumim que la URL és /ws/sessionId

      if (pathname.startsWith('/ws/')) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request, sessionId);
        });
      } else {
        socket.destroy();
      }
    });
  }

  handleMessage(sessionId, sender, message) {
    try {
      let parsedMessage;
      if (message instanceof Buffer) {
        parsedMessage = JSON.parse(message.toString());
      } else {
        parsedMessage = JSON.parse(message);
      }
      logger.info(`Missatge rebut a la sessió ${sessionId}: ${JSON.stringify(parsedMessage)}`);

      switch (parsedMessage.tipus) {
        case 'nou-usuari':
          this.gestionarNouUsuari(sessionId, sender, parsedMessage);
          break;
        case 'oferta':
        case 'resposta':
        case 'candidat':
          this.reenviarMissatge(sessionId, parsedMessage);
          break;
        default:
          logger.warn(`Tipus de missatge desconegut: ${parsedMessage.tipus}`);
      }
    } catch (error) {
      logger.error('Error en processar el missatge:', error);
    }
  }

  gestionarNouUsuari(sessionId, sender, missatge) {
    const usuariId = missatge.usuariId;
    sender.usuariId = usuariId;
    this.usuarisPerSessio.get(sessionId).add(usuariId);

    // Enviar la llista d'usuaris ja connectats al nou usuari
    const usuarisConnectats = Array.from(this.usuarisPerSessio.get(sessionId));
    sender.send(JSON.stringify({
      tipus: 'usuaris-connectats',
      usuaris: usuarisConnectats.filter(id => id !== usuariId)
    }));

    // Notificar als altres usuaris sobre el nou usuari
    this.broadcastToSession(sessionId, JSON.stringify({
      tipus: 'nou-usuari',
      usuariId: usuariId
    }), sender);
  }

  reenviarMissatge(sessionId, missatge) {
    const destinatari = missatge.destinatari;
    const clients = this.sessions.get(sessionId);
    if (clients) {
      for (const client of clients) {
        if (client.usuariId === destinatari && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(missatge));
          break;
        }
      }
    }
  }

  broadcastToSession(sessionId, message, exclude = null) {
    const clients = this.sessions.get(sessionId);
    if (clients) {
      clients.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  notificarDesconnexioUsuari(sessionId, usuariId) {
    this.broadcastToSession(sessionId, JSON.stringify({
      tipus: 'usuari-desconnectat',
      usuariId: usuariId
    }));
  }
}

module.exports = WebSocketServer;

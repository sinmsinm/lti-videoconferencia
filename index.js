const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');
const WebSocketServer = require('./src/websocket/websocketServer');

const sessionService = require('./src/sessionsVideoconferencia/sessionService');
const sessionView = require('./src/sessionsVideoconferencia/sessionView');
const ltiRoutes = require('./src/lti/ltiRoutes');
const sessionRoutes = require('./src/sessionsVideoconferencia/sessionRoutes');
const authMiddleware = require('./src/compartit/middleware/authMiddleware');

const appConfig = require('./src/compartit/config/appConfig');
const logger = require('./src/compartit/utils/logger');

const videoconferenciaController = require('./src/videoconferencia/videoconferenciaController');

const app = express();
const server = http.createServer(app);

// Configuració per servir fitxers estàtics
app.use(express.static(path.join(__dirname, 'public')));

// Configuració de la sessió i altres middlewares
app.use(session(appConfig.sessionConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuració de les rutes
app.use('/lti', ltiRoutes);
app.use('/sessions', sessionRoutes);

// Ruta principal
app.get('/', authMiddleware, async (req, res) => {
  try {
    logger.info('Accedint a la ruta principal');
    const { contextId, toolConsumerId } = req.session.launchParams || {};
    logger.info(`Paràmetres de llançament: contextId=${contextId}, toolConsumerId=${toolConsumerId}`);

    if (!contextId || !toolConsumerId) {
      logger.error('Paràmetres de llançament LTI incomplets');
      return res.status(400).send('Paràmetres de llançament LTI incomplets. Si us plau, inicia la sessió a través de LTI.');
    }

    // Renderitza la vista amb les sessions
    const app = createSSRApp({
      template: `
        <div>
          <h1>Eina de Videoconferència amb Xat</h1>
          <div id="sessions-container"></div>
        </div>
      `
    });

    const appHtml = await renderToString(app);
    const sessionsHtml = await sessionView.renderSessionList(req.session.userInfo, contextId, toolConsumerId);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sessions de Videoconferència</title>
          <script src="https://unpkg.com/vue@next"></script>
          <script src="/client.js"></script>
        </head>
        <body>
          ${appHtml}
          <div id="sessions-container">${sessionsHtml}</div>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Error obtenint sessions:', error);
    res.status(500).send('Error intern del servidor');
  }
});

// Inicialitzar el servidor WebSocket
new WebSocketServer(server);

// Ruta per la sala de videoconferència
app.get('/sala/:sessionId', authMiddleware, videoconferenciaController.iniciarSala);

// Iniciar el servidor
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Servidor escoltant al port ${port}`);
});

// Gestió d'errors no capturats
process.on('uncaughtException', (error) => {
  logger.error('Error no capturat:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rebutjada no gestionada:', reason);
});

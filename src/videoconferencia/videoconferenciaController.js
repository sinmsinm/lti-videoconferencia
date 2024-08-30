const videoconferenciaView = require('./videoconferenciaView');
const mediaController = require('./mediaController');
const webrtcController = require('./webrtcController');
const logger = require('../compartit/utils/logger');

const videoconferenciaController = {
  iniciarSala: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const usuariActual = req.session.userInfo;

      const html = videoconferenciaView.renderSala(sessionId, usuariActual);
      res.send(html);
    } catch (error) {
      logger.error('Error en iniciar la sala de videoconferència:', error);
      res.status(500).send('Error en iniciar la sala de videoconferència');
    }
  },

  gestionarConnexioClient: (socket) => {
    socket.on('unir-se', async (dades) => {
      // Lògica per unir-se a una sala
    });

    socket.on('oferta', async (dades) => {
      // Gestionar oferta WebRTC
    });

    socket.on('resposta', async (dades) => {
      // Gestionar resposta WebRTC
    });

    socket.on('candidat', async (dades) => {
      // Gestionar candidat ICE
    });
  }
};

module.exports = videoconferenciaController;

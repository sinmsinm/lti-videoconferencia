const sessionService = require('./sessionService');
const logger = require('../compartit/utils/logger');

const sessionController = {
  crearSessio: async (req, res) => {
    try {
      const { nom } = req.body;
      const { contextId, toolConsumerId } = req.session.launchParams;
      const creadorId = req.session.userInfo.userId;

      if (!req.session.userInfo.isInstructor) {
        return res.status(403).json({ error: 'Només els instructors poden crear sessions' });
      }

      const novaSessio = await sessionService.crearSessio(nom, contextId, toolConsumerId, creadorId);
      res.status(201).json(novaSessio);
    } catch (error) {
      logger.error('Error creant sessió:', error);
      res.status(500).json({ error: 'Error creant la sessió' });
    }
  },

  obtenirSessions: async (req, res) => {
    try {
      const { contextId, toolConsumerId } = req.session.launchParams;
      const sessions = await sessionService.obtenirSessionsPerContext(contextId, toolConsumerId);
      console.log (sessions);
      
      res.json(sessions);
    } catch (error) {
      logger.error('Error obtenint sessions:', error);
      res.status(500).json({ error: 'Error obtenint les sessions' });
    }
  },

  eliminarSessio: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const creadorId = req.session.userInfo.userId;

      if (!req.session.userInfo.isInstructor) {
        return res.status(403).json({ error: 'Només els instructors poden eliminar sessions' });
      }

      const sessioEliminada = await sessionService.eliminarSessio(sessionId, creadorId);
      if (!sessioEliminada) {
        return res.status(404).json({ error: 'Sessió no trobada o no autoritzat' });
      }
      res.json({ message: 'Sessió eliminada amb èxit' });
    } catch (error) {
      logger.error('Error eliminant sessió:', error);
      res.status(500).json({ error: 'Error eliminant la sessió' });
    }
  },

  obrirSessio: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessio = await sessionService.obtenirSessio(sessionId);
      if (!sessio) {
        return res.status(404).json({ error: 'Sessió no trobada' });
      }
      // Aquí redirigiries a la "sala de videoconferència"
      res.json({ message: 'Obrint sala de videoconferencia', sessio });
    } catch (error) {
      logger.error('Error obrint sessió:', error);
      res.status(500).json({ error: 'Error obrint la sessió' });
    }
  }
};

module.exports = sessionController;

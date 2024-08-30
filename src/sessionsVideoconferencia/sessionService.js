const { v4: uuidv4 } = require('uuid');
const logger = require('../compartit/utils/logger');

// Emmagatzematge en memòria
let sessions = [];

const sessionService = {
  crearSessio: async (nom, contextId, toolConsumerId, creadorId) => {
    const novaSessio = {
      id: uuidv4(),
      nom,
      contextId,
      toolConsumerId,
      creadorId,
      dataCreacio: new Date(),
      activa: true
    };
    sessions.push(novaSessio);
    logger.info(`Nova sessió creada: ${JSON.stringify(novaSessio)}`);
    return novaSessio;
  },

  obtenirSessionsPerContext: async (contextId, toolConsumerId) => {
    logger.info(`Buscant sessions per contextId=${contextId}, toolConsumerId=${toolConsumerId}`);
    const sessionsFiltered = sessions.filter(s => 
      s.contextId === contextId && 
      s.toolConsumerId === toolConsumerId && 
      s.activa
    );
    logger.info(`Sessions trobades: ${JSON.stringify(sessionsFiltered)}`);
    return sessionsFiltered;
  },

  eliminarSessio: async (sessionId, creadorId) => {
    const index = sessions.findIndex(s => s.id === sessionId && s.creadorId === creadorId);
    if (index !== -1) {
      sessions[index].activa = false;
      logger.info(`Sessió desactivada: ${JSON.stringify(sessions[index])}`);
      return sessions[index];
    }
    logger.warn(`Intent d'eliminar sessió no trobada o no autoritzada: ${sessionId}`);
    return null;
  },

  obtenirSessio: async (sessionId) => {
    const sessio = sessions.find(s => s.id === sessionId && s.activa);
    logger.info(`Sessió obtinguda: ${JSON.stringify(sessio)}`);
    return sessio;
  }
};

module.exports = sessionService;

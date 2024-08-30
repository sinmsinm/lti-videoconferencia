const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  if (req.session && req.session.userInfo) {
    // L'usuari està autenticat
    next();
  } else {
    // L'usuari no està autenticat
    logger.warn('Intent d\'accés no autoritzat', { 
      path: req.path, 
      method: req.method, 
      ip: req.ip 
    });
    res.status(401).json({ error: 'No autenticat. Si us plau, inicia sessió a través de LTI.' });
  }
};

module.exports = authMiddleware;

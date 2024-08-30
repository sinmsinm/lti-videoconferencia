const ltiService = require('./ltiService');
const logger = require('../compartit/utils/logger');

const ltiController = {
  handleLTIRequest: async (req, res) => {
    try {
      const validationResult = await ltiService.validateRequest(req);
      
      if (!validationResult.isValid) {
        logger.error('Sol·licitud LTI no vàlida');
        return res.status(401).send('Error d\'autenticació LTI');
      }

      const userInfo = ltiService.extractUserInfo(validationResult.data);
      const launchParams = ltiService.getLaunchParameters(validationResult.data);

      req.session.userInfo = userInfo;
      req.session.launchParams = launchParams;

      logger.info('Usuari autenticat via LTI:', userInfo);

      res.redirect('/');
    } catch (error) {
      logger.error('Error en la validació LTI:', error);
      res.status(500).send('Error intern del servidor');
    }
  }
};

module.exports = ltiController;

const lti = require('ims-lti');
const ltiConfig = require('./ltiConfig');
const logger = require('../compartit/utils/logger');

const ltiService = {
  validateRequest: (req) => {
    return new Promise((resolve, reject) => {
      const provider = new lti.Provider(ltiConfig.consumerKey, ltiConfig.consumerSecret);

      provider.valid_request(req, (err, isValid) => {
        if (err) {
          logger.error('Error en la validació LTI:', err);
          reject(err);
        } else if (!isValid) {
          logger.warn('Sol·licitud LTI no vàlida');
          resolve({ isValid: false });
        } else {
          logger.info('Sol·licitud LTI vàlida');
          resolve({ isValid: true, data: provider.body });
        }
      });
    });
  },

  extractUserInfo: (ltiData) => {
    const role = ltiData.roles ? ltiData.roles[0].toLowerCase() : 'desconegut';
    return {
      userId: ltiData.user_id,
      isInstructor: role.includes('instructor'),
      fullName: ltiData.lis_person_name_full,
      email: ltiData.lis_person_contact_email_primary
    };
  },

  getLaunchParameters: (ltiData) => {
    return {
      contextId: ltiData.context_id,
      toolConsumerId: ltiData.tool_consumer_instance_guid,
      resourceLinkId: ltiData.resource_link_id,
      launchPresentationReturnUrl: ltiData.launch_presentation_return_url
    };
  }
};

module.exports = ltiService;

const path = require('path');

module.exports = {
  // Configuració de la sessió
  sessionConfig: {
    secret: process.env.SESSION_SECRET || 'el_teu_secret_de_sessio',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hores
    }
  },

  // Configuració de l'aplicació
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configuració de les rutes
  paths: {
    public: path.join(__dirname, '../../../public'),
    views: path.join(__dirname, '../../../views')
  },

  // Configuració de la base de dades (si n'utilitzes una)
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/la_teva_base_de_dades'
  },

  // Configuració de LTI
  lti: {
    consumerKey: process.env.LTI_CONSUMER_KEY || 'la_teva_consumer_key_per_defecte',
    consumerSecret: process.env.LTI_CONSUMER_SECRET || 'el_teu_consumer_secret_per_defecte'
  },

  // Altres configuracions específiques de l'aplicació
  videoconferencia: {
    maxParticipants: 10,
    defaultDuration: 60 // minuts
  },

  xat: {
    maxMessageLength: 500
  }
};

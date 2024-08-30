const express = require('express');
const router = express.Router();
const sessionController = require('./sessionController');
const authMiddleware = require('../compartit/middleware/authMiddleware');

router.use(authMiddleware); // Assegura que totes les rutes requereixen autenticació

router.post('/', sessionController.crearSessio);
router.get('/', sessionController.obtenirSessions);
router.delete('/:sessionId', sessionController.eliminarSessio);
router.get('/:sessionId', sessionController.obrirSessio);

module.exports = router;

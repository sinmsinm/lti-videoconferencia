const express = require('express');
const router = express.Router();
const ltiController = require('./ltiController');

// Ruta principal per a la sol·licitud LTI
router.post('/', ltiController.handleLTIRequest);

// Ruta per a la validació de l'eina LTI (si és necessari)
router.get('/config', (req, res) => {
  res.json({
    version: "LTI-1p0",
    tool_id: "la_teva_eina_lti",
    tool_name: "La Teva Eina de Videoconferència",
    tool_description: "Una eina per a videoconferències i xat integrada amb LTI"
  });
});

// Ruta per a la pàgina de llançament LTI (si és necessari)
router.get('/launch', (req, res) => {
  res.send('Pàgina de llançament LTI');
});

// Ruta per gestionar errors LTI
router.get('/error', (req, res) => {
  res.status(400).send('Error en la sol·licitud LTI');
});

module.exports = router;

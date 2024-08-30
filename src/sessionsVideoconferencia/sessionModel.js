const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  contextId: { type: String, required: true },
  creadorId: { type: String, required: true },
  dataCreacio: { type: Date, default: Date.now },
  activa: { type: Boolean, default: true }
});

module.exports = mongoose.model('Session', sessionSchema);

const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  addedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
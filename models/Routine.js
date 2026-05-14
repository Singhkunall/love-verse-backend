const mongoose = require('mongoose');

const rouletteSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  lastTask: { type: String },
  spunBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  spunAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Roulette', rouletteSchema);
const mongoose = require('mongoose');

const rouletteSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  lastTask: { type: String },
  spunBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  spunAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  completedAt: { type: Date, default: null },
  xpEarned: { type: Number, default: 0 },
  proofImage: { type: String, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('Roulette', rouletteSchema);
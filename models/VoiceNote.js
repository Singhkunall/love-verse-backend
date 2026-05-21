const mongoose = require('mongoose');

const voiceNoteSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  audioUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  isHeard: { type: Boolean, default: false },
  reaction: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VoiceNote', voiceNoteSchema);
const mongoose = require('mongoose');

const doodleSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  savedByName: { type: String, default: 'Your Love' },
  title: { type: String, default: 'Our Love Doodle 🎨' }
}, { timestamps: true });

module.exports = mongoose.model('Doodle', doodleSchema);

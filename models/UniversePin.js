const mongoose = require('mongoose');

const universePinSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'memory' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  country: { type: String, default: 'Unknown' },
  imageUrl: { type: String, default: '' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('UniversePin', universePinSchema);
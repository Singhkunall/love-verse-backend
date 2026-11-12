const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true, unique: true },
  password: { type: String, default: null },
  avatar:  { type: String, default: null },
  role:    { type: String, default: 'partner1' },
  anniversaryDate: { type: String, default: null },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  partnerEmail: { type: String, default: null },
  mood: { type: String, default: 'Happy ❤️' },
  widgetPhoto: { type: String, default: null },
  widgetCaption: { type: String, default: null },
  widgetPhotoTime: { type: Date, default: null },
  heartbeatsSentToday: { type: Number, default: 0 },
  lastHeartbeatReset: { type: Date, default: Date.now },
  batteryLevel: { type: Number, default: null },
  fcmToken: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
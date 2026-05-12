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
  mood: { type: String, default: 'Happy ❤️' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
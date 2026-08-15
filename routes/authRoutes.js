const express = require('express');
const router = express.Router();
const Nudge = require('../models/Nudge');
const User = require('../models/User');

const { 
  googleLogin,
  googleCallback,
  connectPartner, 
  updateAnniversary, 
  updateMood, 
  getUserProfile,
  addMemory,
  getMemories,
  deleteMemory,
  getChatHistory 
} = require('../controllers/authController');

// --- 1. Pure Google Auth Route ---
router.post('/google-login', googleLogin);
router.get('/google-callback', googleCallback);

// --- 2. Profile & Connection ---
router.post('/connect', connectPartner);
router.post('/update-anniversary', updateAnniversary);
router.post('/update-mood', updateMood);
router.get('/profile/:id', getUserProfile);

// --- 3. Memories Routes ---
router.post('/add-memory', addMemory);
router.get('/get-memories', getMemories);
router.delete('/delete-memory/:id', deleteMemory);

// --- 4. Chat History ---
router.get('/chat/history/:roomId', getChatHistory); 

// --- 5. Nudge (Hugs/Pokes) System ---
router.post('/send-nudge', async (req, res) => {
  try {
    const { senderId, receiverId, roomId } = req.body;
    await Nudge.create({ senderId, receiverId, roomId });
    res.status(200).json({ message: "Hug sent! ❤️" });
  } catch (error) {
    res.status(500).json({ message: "Nudge fail ho gaya" });
  }
});

router.get('/check-nudges/:userId', async (req, res) => {
  try {
    const nudges = await Nudge.find({ receiverId: req.params.userId, isRead: false });
    await Nudge.updateMany({ receiverId: req.params.userId }, { isRead: true });
    res.json(nudges);
  } catch (error) {
    res.status(500).json({ message: "Error checking nudges" });
  }
});
router.post('/update-avatar', async (req, res) => {
  try {
    const { userId, avatar } = req.body;
    const cloudinary = require('cloudinary').v2;
    const upload = await cloudinary.uploader.upload(avatar, { folder: 'avatars' });
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: upload.secure_url },
      { new: true }
    );
    res.json({ success: true, avatar: upload.secure_url, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/upload-media', async (req, res) => {
  try {
    const { media, resourceType } = req.body;
    const cloudinary = require('cloudinary').v2;
    const type = resourceType === 'video' ? 'video' : 'auto';
    const upload = await cloudinary.uploader.upload(media, {
      folder: 'love_verse_chat',
      resource_type: type
    });
    res.json({ success: true, url: upload.secure_url });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
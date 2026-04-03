const express = require('express');
const router = express.Router();
const Nudge = require('../models/Nudge');

// Purane sendOTP, register, loginUser hata diye hain kyunki ab sirf Google use hoga
const { 
  googleLogin, 
  connectPartner, 
  updateAnniversary, 
  updateMood, 
  getUserProfile,
  addMemory,
  getMemories,
  deleteMemory,
  getChatHistory 
} = require('../controllers/authController');

// --- Auth Routes ---
// Ab sirf ek hi main login route hai
router.post('/google-login', googleLogin);

// --- Profile & Connection ---
router.post('/connect', connectPartner);
router.post('/update-anniversary', updateAnniversary);
router.post('/update-mood', updateMood);
router.get('/profile/:id', getUserProfile);

// --- Memories Routes ---
router.post('/add-memory', addMemory);
router.get('/get-memories', getMemories);
router.delete('/delete-memory/:id', deleteMemory);

// --- Chat History ---
router.get('/chat/history/:roomId', getChatHistory); 

// --- Nudge (Hugs/Pokes) System ---
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
    // Dekhne ke baad mark as read kar do
    await Nudge.updateMany({ receiverId: req.params.userId }, { isRead: true });
    res.json(nudges);
  } catch (error) {
    res.status(500).json({ message: "Error checking nudges" });
  }
});

module.exports = router;
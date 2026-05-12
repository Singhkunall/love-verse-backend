const express = require('express');
const router = express.Router();
const Nudge = require('../models/Nudge');

// Sirf wahi functions import kiye hain jo Google Auth aur Features ke liye chahiye
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

// --- 1. Pure Google Auth Route ---
// Ab na OTP ka route hai, na manual register ka. Bas ye ek hi kaafi hai.
router.post('/google-login', googleLogin);

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
    // Dekhne ke baad mark as read kar do
    await Nudge.updateMany({ receiverId: req.params.userId }, { isRead: true });
    res.json(nudges);
  } catch (error) {
    res.status(500).json({ message: "Error checking nudges" });
  }
});

module.exports = router;
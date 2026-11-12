const express = require('express');
const router = express.Router();
const Nudge = require('../models/Nudge');
const User = require('../models/User');

const { 
  googleLogin,
  googleCallback,
  connectPartner, 
  unlinkPartner,
  updateAnniversary, 
  updateMood, 
  getUserProfile,
  addMemory,
  getMemories,
  deleteMemory,
  getChatHistory,
  savePushToken
} = require('../controllers/authController');

// --- 1. Pure Google Auth Route ---
router.post('/google-login', googleLogin);
router.get('/google-callback', googleCallback);

// --- 2. Profile & Connection ---
router.post('/connect', connectPartner);
router.post('/unlink', unlinkPartner);
router.post('/save-push-token', savePushToken);
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

// --- 6. Home Screen Widget APIs ---
const { sendPushNotification } = require('../services/pushService');

// Upload or update widget photo / selfie
router.post('/widget/upload-snap', async (req, res) => {
  try {
    const { userId, photo, caption } = req.body;
    if (!userId || !photo) {
      return res.status(400).json({ success: false, message: "userId and photo are required" });
    }

    let photoUrl = photo;
    if (typeof photo === 'string' && photo.startsWith('data:image')) {
      const cloudinary = require('cloudinary').v2;
      const upload = await cloudinary.uploader.upload(photo, {
        folder: 'love_verse_widget',
        transformation: [{ width: 800, height: 800, crop: "fill", quality: "auto" }]
      });
      photoUrl = upload.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        widgetPhoto: photoUrl,
        widgetCaption: caption || "",
        widgetPhotoTime: new Date()
      },
      { new: true }
    );

    // Calculate days together
    let daysTogether = 1;
    if (user.anniversaryDate) {
      const start = new Date(user.anniversaryDate);
      const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff) && diff >= 0) daysTogether = diff;
    } else {
      const start = new Date(user.createdAt || Date.now());
      daysTogether = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Push update to partner's phone & widget
    if (user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        sendPushNotification({
          toUserId: String(partner._id),
          title: "New Home Screen Photo 📸❤️",
          body: `${user.name} sent a new photo to your widget!`,
          data: {
            type: "widget_update",
            photoUrl: photoUrl,
            caption: caption || "",
            senderName: user.name,
            daysTogether: String(daysTogether),
            mood: user.mood || "Happy ❤️"
          }
        }).catch(err => console.error("Widget push error:", err.message));
      }
    }

    res.json({
      success: true,
      photoUrl,
      caption: caption || "",
      daysTogether
    });
  } catch (err) {
    console.error("Widget Snap Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send 1-tap heartbeat from Home Screen widget
router.post('/widget/heartbeat', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Increment today's heartbeat count
    user.heartbeatsSentToday = (user.heartbeatsSentToday || 0) + 1;
    await user.save();

    if (user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        sendPushNotification({
          toUserId: String(partner._id),
          title: "Heartbeat Received 💓",
          body: `${user.name} sent you a love heartbeat!`,
          data: {
            type: "heartbeat",
            senderName: user.name,
            timestamp: String(Date.now()),
            totalCount: String(user.heartbeatsSentToday)
          }
        }).catch(err => console.error("Heartbeat push error:", err.message));
      }
    }

    res.json({
      success: true,
      heartbeatsSentToday: user.heartbeatsSentToday,
      message: "Heartbeat sent to partner! 💓"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch latest widget data for Android Home Screen
router.get('/widget/data/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('partnerId');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const partner = user.partnerId;
    let daysTogether = 1;
    const anniv = user.anniversaryDate || (partner ? partner.anniversaryDate : null);
    if (anniv) {
      const start = new Date(anniv);
      const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff) && diff >= 0) daysTogether = diff;
    } else {
      const start = new Date(user.createdAt || Date.now());
      daysTogether = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    res.json({
      success: true,
      partnerName: partner?.name || "Partner ❤️",
      partnerPhoto: partner?.widgetPhoto || partner?.avatar || null,
      caption: partner?.widgetCaption || "",
      mood: partner?.mood || "Happy ❤️",
      batteryLevel: partner?.batteryLevel || 75,
      daysTogether: daysTogether,
      heartbeatsToday: user.heartbeatsSentToday || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update real battery percentage
router.post('/update-battery', async (req, res) => {
  try {
    const { userId, batteryLevel } = req.body;
    if (!userId || batteryLevel === undefined || batteryLevel === null) {
      return res.status(400).json({ success: false, message: "userId and batteryLevel required" });
    }
    const user = await User.findByIdAndUpdate(userId, { batteryLevel: Number(batteryLevel) }, { new: true });
    res.json({ success: true, batteryLevel: user.batteryLevel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
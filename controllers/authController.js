const User = require('../models/User');
const Memory = require('../models/Memory');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- FIX: Direct Client ID (Taaki 500 Error na aaye) ---
const GOOGLE_ID = "36124091072-k7t809qm7ttdvjf0c306qmblbvlqo622.apps.googleusercontent.com";
const googleClient = new OAuth2Client();
const JWT_SECRET = process.env.JWT_SECRET || 'merapyarsabsepyara123';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// --- 1. GOOGLE LOGIN (Scratch se naya login logic) ---
exports.googleLogin = async (req, res) => {
  const { name, email, picture } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email missing!" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        role: "partner1"
      });
      console.log("🆕 Naya User ban gaya:", email);
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      partnerId: user.partnerId,
      anniversaryDate: user.anniversaryDate,
      mood: user.mood,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// --- 2. CONNECT PARTNER (NO CHANGE) ---
exports.connectPartner = async (req, res) => {
  const { userId, partnerEmail } = req.body;
  try {
    const { io } = require('../server');
    const partner = await User.findOne({ email: partnerEmail });
    const me = await User.findById(userId);

    if (!partner) return res.status(404).json({ message: "Partner nahi mila! Unhe bhi Google se login karne bolo." });
    if (partner._id.toString() === userId) return res.status(400).json({ message: "Bhai, khud se connect nahi ho sakte!" });

    await User.findByIdAndUpdate(userId, { partnerId: partner._id, partnerEmail: partner.email });
    await User.findByIdAndUpdate(partner._id, { partnerId: userId, partnerEmail: me.email });

    // Real-time notify dono ko
    io.to(userId).emit("partner_connected");
    io.to(partner._id.toString()).emit("partner_connected");

    res.status(200).json({ message: "Boom! Verse Linked! ❤️" });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- 3. UPDATE ANNIVERSARY (NO CHANGE) ---
exports.updateAnniversary = async (req, res) => {
  const { userId, date } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { anniversaryDate: date }, { new: true });
    if (user && user.partnerId) { 
      await User.findByIdAndUpdate(user.partnerId, { anniversaryDate: date }); 
    }
    res.status(200).json({ message: "Date set ho gayi!", anniversaryDate: user.anniversaryDate });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- 4. UPDATE MOOD (NO CHANGE) ---
exports.updateMood = async (req, res) => {
  const { userId, mood } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { mood }, { new: true });
    res.status(200).json({ message: "Mood updated!", mood: user.mood });
  } catch (error) { 
    res.status(500).json({ message: "Mood update failed" }); 
  }
};

// --- 5. GET PROFILE (NO CHANGE) ---
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('partnerId', 'name email mood avatar');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- 6. ADD MEMORY (NO CHANGE) ---
exports.addMemory = async (req, res) => {
  const { userId, partnerId, image, caption } = req.body;
  try {
    if (!image) return res.status(400).json({ message: "Photo missing!" });
    
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "exists" : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "exists" : "MISSING",
    });

    const uploadRes = await cloudinary.uploader.upload(image, { folder: 'love_verse_memories' });
    const memory = await Memory.create({ 
      userId, 
      partnerId: partnerId || null, 
      imageUrl: uploadRes.secure_url, 
      caption 
    });
    res.status(201).json(memory);
  } catch (error) { 
    console.error("❌ Memory upload error:", error.message);
    res.status(500).json({ message: "Upload failed: " + error.message }); 
  }
};

// --- 7. GET MEMORIES (NO CHANGE) ---
exports.getMemories = async (req, res) => {
  const { userId, partnerId } = req.query;
  try {
    const memories = await Memory.find({ 
      $or: [{ userId }, { userId: partnerId }, { partnerId: userId }] 
    }).sort({ createdAt: -1 });
    res.status(200).json(memories);
  } catch (error) { 
    res.status(500).json({ message: "Fetch failed" }); 
  }
};

// --- 8. DELETE MEMORY (NO CHANGE) ---
exports.deleteMemory = async (req, res) => {
  try {
    await Memory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Memory deleted successfully! 🗑️" });
  } catch (error) { 
    res.status(500).json({ message: "Delete error" }); 
  }
};

// --- 9. GET CHAT HISTORY (NO CHANGE) ---
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) { 
    res.status(500).json({ error: "Chat load nahi ho payi" }); 
  }
};
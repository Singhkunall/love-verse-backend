const express = require('express');
const router = express.Router();
const Doodle = require('../models/Doodle');
const cloudinary = require('cloudinary').v2;

// GET /api/doodle/:roomId — fetch all doodles for room
router.get('/:roomId', async (req, res) => {
  try {
    const doodles = await Doodle.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.json(doodles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doodle/save — upload canvas drawing to Cloudinary & save in MongoDB
router.post('/save', async (req, res) => {
  try {
    const { roomId, imageBase64, savedBy, savedByName, title } = req.body;
    if (!roomId || !imageBase64) {
      return res.status(400).json({ message: 'Room ID and image data are required' });
    }

    const upload = await cloudinary.uploader.upload(imageBase64, {
      folder: 'doodles',
      resource_type: 'image'
    });

    const doodle = await Doodle.create({
      roomId,
      imageUrl: upload.secure_url,
      savedBy: savedBy || null,
      savedByName: savedByName || 'Your Love',
      title: title || 'Our Love Doodle 🎨'
    });

    res.json(doodle);
  } catch (err) {
    console.error('Doodle save error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/doodle/:id — delete a saved doodle
router.delete('/:id', async (req, res) => {
  try {
    await Doodle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doodle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

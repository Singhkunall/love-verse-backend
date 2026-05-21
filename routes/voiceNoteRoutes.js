const express = require('express');
const router = express.Router();
const VoiceNote = require('../models/VoiceNote');
const cloudinary = require('cloudinary').v2;

// Get all voice notes for a room
router.get('/:roomId', async (req, res) => {
  try {
    const notes = await VoiceNote.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload voice note
router.post('/upload', async (req, res) => {
  try {
    const { roomId, senderId, senderName, audio, duration } = req.body;
    
    const upload = await cloudinary.uploader.upload(audio, {
      resource_type: 'video', // Cloudinary audio ke liye video type use karta hai
      folder: 'voice_notes',
    });

    const voiceNote = await VoiceNote.create({
      roomId,
      senderId,
      senderName,
      audioUrl: upload.secure_url,
      duration,
    });

    res.json(voiceNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as heard
router.put('/heard/:id', async (req, res) => {
  try {
    const note = await VoiceNote.findByIdAndUpdate(
      req.params.id,
      { isHeard: true },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add reaction
router.put('/react/:id', async (req, res) => {
  try {
    const note = await VoiceNote.findByIdAndUpdate(
      req.params.id,
      { reaction: req.body.reaction },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Delete voice note
router.delete('/:id', async (req, res) => {
  try {
    const note = await VoiceNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Not found" });

    // Cloudinary se bhi delete karo
    const cloudinary = require('cloudinary').v2;
    const publicId = note.audioUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

    await VoiceNote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
const express = require('express');
const router = express.Router();
const Roulette = require('../models/Roulette');

// Get today's task
router.get('/:roomId', async (req, res) => {
  try {
    const roulette = await Roulette.findOne({ roomId: req.params.roomId })
      .populate('spunBy', 'name');
    
    if (!roulette) return res.json(null);

    // Check if spun today
    const today = new Date();
    const spunAt = new Date(roulette.spunAt);
    const isSameDay = today.toDateString() === spunAt.toDateString();

    if (!isSameDay) return res.json(null);
    
    res.json(roulette);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Spin the wheel
router.post('/spin', async (req, res) => {
  try {
    const { roomId, userId, task } = req.body;

    const roulette = await Roulette.findOneAndUpdate(
  { roomId },
  { lastTask: task, spunBy: userId, spunAt: new Date() },
  { upsert: true, returnDocument: 'after' }
).populate('spunBy', 'name');

    res.json(roulette);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Complete the task
router.post('/complete', async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    
    const roulette = await Roulette.findOneAndUpdate(
      { roomId },
      { 
        isCompleted: true, 
        completedBy: userId,
        completedAt: new Date(),
        xpEarned: 50
      },
      { returnDocument: 'after' }
    ).populate('spunBy', 'name').populate('completedBy', 'name');

    const { io } = require('../server');
    io.to(roomId).emit("task_completed", { 
      task: roulette.lastTask,
      completedBy: roulette.completedBy?.name,
      xp: 50
    });

    res.json(roulette);
  } catch (err) {
    console.error("Complete error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
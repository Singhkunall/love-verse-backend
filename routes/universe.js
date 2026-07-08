const express = require('express');
const router = express.Router();
const UniversePin = require('../models/UniversePin');

router.get('/:roomId', async (req, res) => {
  try {
    const pins = await UniversePin.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.json(pins);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/add', async (req, res) => {
  try {
    const pin = await UniversePin.create(req.body);
    res.status(201).json(pin);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await UniversePin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pin deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
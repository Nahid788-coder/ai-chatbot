const router = require('express').Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const convs = await Conversation.find({ userId: req.userId })
      .select('-messages')
      .sort({ updatedAt: -1 });
    res.json(convs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single conversation with messages
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.userId });
    if (!conv) return res.status(404).json({ message: 'Not found' });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new conversation with first message pair
router.post('/conversations', auth, async (req, res) => {
  try {
    const { title, modelId, modelName, modelEmoji, userMessage, assistantMessage } = req.body;

    const conv = await Conversation.create({
      userId: req.userId,
      title,
      modelId,
      modelName,
      modelEmoji,
      messages: [
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: assistantMessage, model: modelName, timestamp: new Date() },
      ],
    });

    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Append messages to existing conversation
router.patch('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { userMessage, assistantMessage, modelName } = req.body;

    const conv = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: userMessage, timestamp: new Date() },
              { role: 'assistant', content: assistantMessage, model: modelName, timestamp: new Date() },
            ],
          },
        },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!conv) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete conversation
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

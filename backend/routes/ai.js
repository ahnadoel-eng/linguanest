/**
 * LinguaNest — AI Routes
 * These endpoints interface with the alem.plus infrastructure
 */

const express = require('express');
const router = express.Router();
const AlemPlusAPI = require('../services/alemPlusAPI');

// In a real app we would use auth middleware here
// const { requireAuth } = require('../middleware/auth');

/**
 * @route POST /api/ai/generate-lesson
 * @desc Generate custom lesson materials using LLM
 * @access Private (Teacher)
 */
router.post('/generate-lesson', async (req, res) => {
    try {
        const { topic, level } = req.body;
        if (!topic || !level) {
            return res.status(400).json({ error: "Topic and level are required" });
        }

        const lessonPlan = await AlemPlusAPI.generateLessonplan(topic, level);
        res.json({ success: true, lesson: lessonPlan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Generation failed" });
    }
});

/**
 * @route POST /api/ai/chat
 * @desc Chat with AI Speaking Buddy
 * @access Private (Student)
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await AlemPlusAPI.chatWithBuddy(message, history || []);
        res.json({ success: true, reply: response.reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Chat failed" });
    }
});

/**
 * @route POST /api/ai/chat-audio
 * @desc Transcribe audio and chat with AI Speaking Buddy
 * @access Private (Student)
 */
router.post('/chat-audio', async (req, res) => {
    try {
        const { audioBase64, history } = req.body;
        if (!audioBase64) {
            return res.status(400).json({ error: "Audio base64 is required" });
        }

        const transcript = await AlemPlusAPI.transcribeAudio(audioBase64);
        if (!transcript) {
            return res.json({ success: false, error: "Cloud not understand audio." });
        }

        const response = await AlemPlusAPI.chatWithBuddy(transcript, history || []);
        res.json({ success: true, userText: transcript, reply: response.reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Audio Chat failed" });
    }
});

module.exports = router;

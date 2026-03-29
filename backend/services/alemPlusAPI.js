/**
 * LinguaNest — alem.plus API integration Service
 * Using real API keys provided for the hackathon.
 */

// API Keys
const ALEM_LLM_KEY = 'sk-6IrQDtEXWGDLBaSjEermuA';
const ALEM_IMAGE_KEY = 'sk-fh4zqedAmbqF3UWJWeljEw';
const ALEM_STT_KEY = 'sk-VTZcYf-xInpcJR4mSfwdPQ';

// URLs
const LLM_API_URL = 'https://llm.alem.ai/v1/chat/completions';
const IMAGE_API_URL = 'https://llm.alem.ai/v1/images/generations';
const STT_API_URL = 'https://llm.alem.ai/v1/audio/transcriptions';

const AlemPlusAPI = {
    /**
     * Generate a lesson plan using alem.plus LLM
     */
    async generateLessonplan(topic, level) {
        try {
            const response = await fetch(LLM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ALEM_LLM_KEY}`
                },
                body: JSON.stringify({
                    model: "alemllm",
                    messages: [
                        { role: "system", content: `You are an expert English language teacher creating lesson plans. Generate a complete, ready-to-use lesson plan in JSON format with these exact fields:
- "title": string, the lesson title
- "greeting": string, a warm opening paragraph the teacher reads to students (e.g. "Hello everyone! Today we are going to learn about...")
- "new_words": array of strings, each string is a word with its definition (e.g. "Resume — a document describing your work experience")
- "discussion_topics": array of strings, conversation questions for the class
- "exercises": array of strings, each a clear exercise instruction
- "closing": string, a summary paragraph the teacher reads at the end

All array items MUST be plain strings only. Never use objects inside arrays.` },
                        { role: "user", content: `Create a lesson plan for English level ${level} on the topic: "${topic}". Output strictly valid JSON, nothing else.` }
                    ]
                })
            });
            const data = await response.json();
            let rawContent = data.choices[0].message.content;
            
            // Fix for models that wrap JSON in markdown blocks
            rawContent = rawContent.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            
            const plan = JSON.parse(rawContent);
            
            // Safety: ensure all arrays contain only strings
            ['new_words', 'discussion_topics', 'exercises'].forEach(key => {
                if (Array.isArray(plan[key])) {
                    plan[key] = plan[key].map(item => typeof item === 'string' ? item : JSON.stringify(item));
                }
            });

            // Fetch a cover image for the lesson
            try {
                const imgRes = await fetch(IMAGE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ALEM_IMAGE_KEY}`
                    },
                    body: JSON.stringify({
                        model: "text-to-image",
                        prompt: `A beautiful educational illustration about: ${topic}, minimal, abstract language learning aesthetic`,
                        size: "256x256"
                    })
                });
                const imgData = await imgRes.json();
                if (imgData && imgData.data && imgData.data.length > 0) {
                    plan.cover_image = imgData.data[0].url;
                }
            } catch (imgErr) {
                console.error("Text-to-Image API failed, ignoring cover generation:", imgErr);
            }
            return plan;
        } catch (error) {
            console.error("alem.plus LLM API Error:", error);
            throw new Error("Failed to generate lesson plan via alem.plus LLM");
        }
    },

    /**
     * AI Speaking Buddy Chat
     */
    async chatWithBuddy(message, history = []) {
        try {
            const messages = [
                { role: "system", content: "You are an AI language learning buddy. Keep responses short, conversational, and correct grammatical mistakes gently." },
                ...history,
                { role: "user", content: message }
            ];

            const response = await fetch(LLM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ALEM_LLM_KEY}`
                },
                body: JSON.stringify({
                    model: "alemllm",
                    messages: messages
                })
            });
            const data = await response.json();
            return { reply: data.choices[0].message.content };
        } catch (error) {
            console.error("alem.plus Chat API Error:", error);
            throw new Error("Failed to chat via alem.plus");
        }
    },

    /**
     * AI Speech-to-Text Transcription
     */
    async transcribeAudio(audioBase64) {
        try {
            const buffer = Buffer.from(audioBase64, 'base64');
            const blob = new Blob([buffer], { type: 'audio/webm' });
            
            const formData = new FormData();
            formData.append('model', 'speech-to-text');
            formData.append('file', blob, 'speech.webm');
            formData.append('language', 'en');

            const response = await fetch(STT_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ALEM_STT_KEY}`
                },
                body: formData
            });

            const data = await response.json();
            return data.text || '';
        } catch (error) {
            console.error("alem.plus STT API Error:", error);
            throw new Error("Failed to transcribe audio via alem.plus");
        }
    }
};

module.exports = AlemPlusAPI;

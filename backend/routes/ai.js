const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

router.post('/smart-match', async (req, res, next) => {
    try {
        const { taskId, taskDescription, volunteers } = req.body;
        
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
            console.warn("No GEMINI_API_KEY found, returning mock response");
            return res.json({
                matchedVolunteers: volunteers ? volunteers.slice(0, 1) : [],
                reasoning: "Mock Match: Assigning the closest available volunteer based on generic criteria since Gemini API Key is missing."
            });
        }

        const prompt = `You are a Smart Resource Allocation engine for an NGO dispatch system. 
Given the following task description: "${taskDescription}"
And the following list of volunteers with skills: ${JSON.stringify(volunteers)}
Please recommend the best top 3 volunteers by their IDs, and explain why. 
Format response as JSON with keys "matchedVolunteers" (array of IDs) and "reasoning" (string).`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        // Extract JSON from potential markdown blocks
        let jsonStr = textResponse;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        }

        res.json(JSON.parse(jsonStr));
    } catch (e) {
        console.error("Smart Match Error: ", e);
        res.status(500).json({ error: 'Failed to process AI Match', details: e.message });
    }
});

module.exports = router;

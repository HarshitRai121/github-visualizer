require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The main endpoint to get code descriptions from Gemini
app.post('/analyze-code', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code content is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Explain the purpose and implementation of the following code in a clear and concise paragraph. Focus on what the code does and how it fits into a larger project.

    \`\`\`
    ${code}
    \`\`\``;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ description: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get description from AI.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
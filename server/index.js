require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // This try-catch block is more granular to catch specific Gemini API errors.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ description: text });
  } catch (error) {
    // Log the full error to the console to help debug the 500 status
    console.error('Error calling Gemini API:', error.message, error.stack);
    if (error.message.includes('context window')) {
      return res.status(400).json({ error: 'File content is too large for the AI model.' });
    }
    // If a different error occurs, return a generic 500
    res.status(500).json({ error: 'Failed to get description from AI.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
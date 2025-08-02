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
    // FIX: Change the model name to match your API key's model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Explain the purpose and implementation of the following code in a clear and concise paragraph. Focus on what the code does and how it fits into a larger project.

    \`\`\`
    ${code}
    \`\`\``;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.status(200).json({ description: text });
    } catch (geminiError) {
      console.error('Error calling Gemini API:', geminiError);
      res.status(500).json({ error: 'Failed to get description from AI. Check the backend logs for details.' });
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
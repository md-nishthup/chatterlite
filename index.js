import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import imageGenRoutes from './bot-backend/routes/imageGen.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/image', imageGenRoutes);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: 'Invalid or missing "messages" array' });
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    const assistantMessage = response.data.choices[0].message;
    res.json({ assistant: assistantMessage });
  } catch (error) {
    console.error(
      'Groq API error:',
      (error.response && error.response.data) || error.message
    );
    res.status(500).json({ error: 'Failed to fetch from Groq API' });
  }
});

app.listen(PORT, () => console.log(`Bot backend running on port ${PORT}`));

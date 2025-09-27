import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import './styles/responsive.css'; // 👈 Global mobile adjustments



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const HF_API_URL = 'https://api-inference.huggingface.co/models/EleutherAI/phi-2';
// Token must come from server (never hardcode). This file should not be used in production for server calls.
const HF_TOKEN = import.meta.env.VITE_DUMMY_HF_TOKEN || '';

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt cannot be empty' });
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
  ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      return res
        .status(500)
        .json({ error: `Hugging Face API error: ${errorMsg}` });
    }

    const data = await response.json();
    const botReply = data[0]?.generated_text || '[No response from model]';

    res.json({ response: botReply });
  } catch (error) {
    console.error('ChatWithMe backend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`ChatWithMe backend listening on http://localhost:${PORT}`);
});

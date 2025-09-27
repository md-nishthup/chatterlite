import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid or missing "messages" array' });
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
  try {
    const response = await axios.post(
      GROQ_API_URL,
      { model: 'meta-llama/llama-4-scout-17b-16e-instruct', messages },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } }
    );
    const assistantMessage = response.data.choices?.[0]?.message || { role: 'assistant', content: '[No response]' };
    return res.status(200).json({ assistant: assistantMessage });
  } catch (err) {
    console.error('Groq API error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch from Groq API' });
  }
}

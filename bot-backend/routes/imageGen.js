import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          Accept: 'image/png',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Hugging Face API error:', err); // <-- LOG FULL ERROR
      return res
        .status(500)
        .json({ error: err.error || 'Image generation failed' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Image = buffer.toString('base64');
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error('Backend error:', err); // <-- LOG BACKEND ERRORS
    res.status(500).json({ error: 'Image generation failed' });
  }
});

export default router;

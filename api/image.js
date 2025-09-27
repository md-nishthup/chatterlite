import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST' && req.url.endsWith('/generate')) {
    const { prompt, referenceImage } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    try {
      const HF_TOKEN = process.env.HF_API_TOKEN;
      if (!HF_TOKEN) return res.status(500).json({ error: 'Missing HF_API_TOKEN' });

      // Basic payload; extend with referenceImage support if backend model supports it later
      const payload = { inputs: prompt };
      // (Future) If reference image guided generation added, include fields here

      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          Accept: 'image/png',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errDetail = '';
        try { errDetail = JSON.stringify(await response.json()); } catch {}
        console.error('HF generation error:', errDetail || response.statusText);
        return res.status(500).json({ error: 'Image generation failed' });
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64Image = buffer.toString('base64');
      return res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
    } catch (e) {
      console.error('Image handler exception:', e);
      return res.status(500).json({ error: 'Image generation failed' });
    }
  } else {
    return res.status(404).json({ error: 'Not found' });
  }
}

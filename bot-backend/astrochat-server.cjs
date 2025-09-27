const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;
const NASA_API_KEY = process.env.NASA_API_KEY;

if (!NASA_API_KEY) {
  console.warn('[astrochat] Warning: NASA_API_KEY is not set. Requests may fail or hit demo limits.');
}

app.use(cors());

// Utility: Safe fetch wrapper
async function safeFetch(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
  return response.json();
}

// Astronomy Picture of the Day endpoint
app.get('/api/astrochat/apod', async (req, res) => {
  try {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Mars Rover Photos (latest)
app.get('/api/astrochat/mars/:rover', async (req, res) => {
  const rover = req.params.rover.toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  try {
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data.photos.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Earth Imagery
app.get('/api/astrochat/earth', async (req, res) => {
  const { lat, lon } = req.query;
  try {
  const url = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&dim=0.1&api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Near Earth Objects (today)
app.get('/api/astrochat/neo', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data.near_earth_objects[today].slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. NASA Media Search
app.get('/api/astrochat/media', async (req, res) => {
  const { q } = req.query;
  try {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}`;
    const data = await safeFetch(url);
    res.json(data.collection.items.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. TechTransfer Patents
app.get('/api/astrochat/techtransfer/patents', async (req, res) => {
  try {
  const url = `https://api.nasa.gov/techtransfer/patent/?engine&api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data.results.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DONKI Space Weather Events
app.get('/api/astrochat/spaceweather', async (req, res) => {
  const startDate = new Date(Date.now() - 86400000 * 5)
    .toISOString()
    .split('T')[0];
  try {
  const url = `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&api_key=${NASA_API_KEY}`;
    const data = await safeFetch(url);
    res.json(data.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Pollinations Image Generation (Free / No Key)
// Endpoint: /api/astrochat/image/pollinations?prompt=your+idea&width=512&height=512
// Returns a proxied image (as a redirect) OR JSON with direct URL if json=1
app.get('/api/astrochat/image/pollinations', async (req, res) => {
  try {
    const { prompt, width = 512, height = 512, json } = req.query;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt parameter' });

    // Pollinations standard URL pattern
    // Example direct image: https://image.pollinations.ai/prompt/your%20prompt?width=512&height=512
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}`;

    if (json === '1') {
      return res.json({ url: imgUrl, prompt, width: Number(width), height: Number(height), provider: 'pollinations' });
    }

    // Optionally we could stream, but a simple redirect keeps it light-weight and cache-friendly.
    res.redirect(imgUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AstroChat backend running on port ${PORT}`);
});

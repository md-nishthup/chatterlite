import fetch from 'node-fetch';

const NASA_API_KEY = process.env.NASA_API_KEY;

async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export default async function handler(req, res) {
  // Path style: /api/astrochat?endpoint=apod ... or nested route forwarding (we parse query)
  const { endpoint, rover, lat, lon, q, json, prompt, width = 512, height = 512 } = req.query;

  try {
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint query param' });
    }

    switch (endpoint) {
      case 'apod': {
        const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data);
      }
      case 'mars': {
        const roverName = (rover || 'curiosity').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${date}&api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data.photos.slice(0, 5));
      }
      case 'earth': {
        if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
        const url = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&dim=0.1&api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data);
      }
      case 'neo': {
        const today = new Date().toISOString().split('T')[0];
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data.near_earth_objects[today].slice(0, 5));
      }
      case 'media': {
        if (!q) return res.status(400).json({ error: 'Missing q search term' });
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}`;
        const data = await safeFetch(url);
        return res.status(200).json(data.collection.items.slice(0, 5));
      }
      case 'patents': {
        const url = `https://api.nasa.gov/techtransfer/patent/?engine&api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data.results.slice(0, 5));
      }
      case 'spaceweather': {
        const startDate = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];
        const url = `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&api_key=${NASA_API_KEY}`;
        const data = await safeFetch(url);
        return res.status(200).json(data.slice(0, 5));
      }
      case 'pollinations': {
        if (!prompt) return res.status(400).json({ error: 'Missing prompt parameter' });
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}`;
        if (json === '1') {
          return res.status(200).json({ url: imgUrl, prompt, width: Number(width), height: Number(height), provider: 'pollinations' });
        }
        return res.redirect(imgUrl);
      }
      default:
        return res.status(400).json({ error: 'Unknown endpoint' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

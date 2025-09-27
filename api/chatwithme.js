export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });
  // Simple mock improvement (replace with real model later)
  const improvedPrompt = `Improved prompt: ${message}`;
  return res.status(200).json({ reply: improvedPrompt });
}

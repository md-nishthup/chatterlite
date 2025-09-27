import { useState } from 'react';
import axios from 'axios';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    setError('');
    setLoading(true);
    setImage('');
    try {
  const res = await axios.post('/api/image/generate', {
        prompt,
      });
      setImage(res.data.image);
    } catch (err) {
      setError('Image generation failed');
      setImage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <input
        type="text"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 rounded text-black"
        disabled={loading}
      />
      <button
        onClick={generateImage}
        className="ml-2 p-2 bg-blue-500 rounded"
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <div className="text-red-400 mt-2">{error}</div>}
      {image && (
        <img
          src={image}
          alt="Generated"
          className="mt-4 rounded"
          style={{ maxWidth: 400 }}
        />
      )}
    </div>
  );
}

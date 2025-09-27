import { useState } from "react";
import axios from "axios";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImage("");
    try {
  const res = await axios.post("/api/image/generate", {
        prompt,
      });
      setImage(res.data.image);
    } catch (err) {
      alert("Image generation failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={generateImage} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {image && <img src={image} alt="Generated" style={{ marginTop: 20, maxWidth: 400 }} />}
    </div>
  );
}
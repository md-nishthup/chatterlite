import React, { useState, useRef, useEffect } from 'react';
import '../components/ChatToImage.css';
import usePresence from '../hooks/usePresence';

const promptPresets = [
  'A neon cyberpunk city at night',
  'A fantasy dragon soaring the sky',
  'A futuristic robot with glowing eyes',
];

// Supported HuggingFace-style models
const modelOptions = [
  { name: 'SDX-1', value: 'sdx-1' },
  { name: 'OpenJourney', value: 'openjourney' },
  { name: 'Dreamlike Diffusion', value: 'dreamlike' },
  { name: 'Anything V5', value: 'anything-v5' },
  { name: 'Pollinations (Free)', value: 'pollinations' }, // Added free model
];

function uniqueMessageId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ========== Async Image Generation ==========
const NON_FREE_MAX = 1; // one generation limit per session for non-pollinations
const POLLINATIONS_COOLDOWN_MS = 5000;

async function generateImage(prompt, model, referenceImageUrl) {
  try {
    if (model === 'pollinations') {
      const width = 512;
      const height = 512;
      const seed = Date.now();
      const encoded = encodeURIComponent(prompt.trim());
      const url = `https://pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
      return url;
    }

  const response = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, referenceImage: referenceImageUrl || undefined }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const data = await response.json();
    if (data.image) return data.image;
    throw new Error(data.error || 'No image returned');
  } catch (error) {
    console.error('Image Generation Error:', error);
    return null;
  }
}

// ========== Main Component ==========
const ChatToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null); // last generated image (could be used for preview modal later)
  const [model, setModel] = useState('sdx-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [lastPollinationTime, setLastPollinationTime] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [lightbox, setLightbox] = useState({ open: false, src: '', prompt: '' });
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Container refs
  const placeholderRef = useRef(null); // outer card (no longer used for scrolling)
  const messagesRef = useRef(null); // scrollable messages area
  const fileInputRef = useRef(null);

  const botOnline = true;

  // Auto-scroll the messages list when new messages arrive or loading state changes
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Pollinations cooldown timer
  useEffect(() => {
    let t;
    if (model === 'pollinations') {
      const tick = () => {
        const diff = Date.now() - lastPollinationTime;
        const remain = POLLINATIONS_COOLDOWN_MS - diff;
        setCooldownLeft(remain > 0 ? remain : 0);
        t = requestAnimationFrame(tick);
      };
      tick();
    }
    return () => t && cancelAnimationFrame(t);
  }, [model, lastPollinationTime]);

  // ===== Send to ChatWithMe bot for prompt enhancement =====
  const sendToChatWithMe = async (inputPrompt) => {
    try {
  const res = await fetch('/api/chatwithme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `"${inputPrompt}", create a grandmaster prompt to generate actual image`,
        }),
      });
      if (!res.ok) throw new Error('Failed to improve prompt');
      const data = await res.json();
      return data.reply || data.message || '';
    } catch (err) {
      console.error('ChatWithMe Error:', err);
      return '';
    }
  };

  const handleChatWithMe = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const improved = await sendToChatWithMe(prompt);
    setPrompt(improved || prompt);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setError('');
    if (!prompt.trim()) return;

    // Non-free model limit
    if (model !== 'pollinations' && generationCount >= NON_FREE_MAX) {
      setError('Limit reached for this model. Use Pollinations (Free) for unlimited generations.');
      return;
    }
    // Pollinations cooldown
    if (model === 'pollinations') {
      const since = Date.now() - lastPollinationTime;
      if (since < POLLINATIONS_COOLDOWN_MS) {
        setError(`Please wait ${(POLLINATIONS_COOLDOWN_MS - since) / 1000 | 0}s before next Pollinations image.`);
        return;
      }
    }

    setLoading(true);
  const img = await generateImage(prompt, model, referenceImageUrl);
    setLoading(false);

    if (img) {
      const usedPrompt = prompt;
      setImageUrl(img);
      setMessages((prev) => [
        ...prev,
        { id: uniqueMessageId(), senderId: 'me', type: 'image', content: img, prompt: usedPrompt, timestamp: Date.now() },
      ]);
      setPrompt('');
      if (model === 'pollinations') setLastPollinationTime(Date.now());
      else setGenerationCount(c => c + 1);
    } else {
      setError('Image generation failed. Try changing the prompt or model.');
      setImageUrl(null);
    }
  };

  const handlePreset = (preset) => setPrompt(preset);
  const handleAttachmentClick = () => fileInputRef.current?.click();
  async function uploadImageToCloudinaryUnsigned(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload'); // must exist in your Cloudinary account
    const res = await fetch('https://api.cloudinary.com/v1_1/dwdvb6rp0/image/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return data.secure_url;
  }
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Image too large (max 8MB)'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImageToCloudinaryUnsigned(file);
      setReferenceImageUrl(url);
    } catch (err) {
      console.error('Upload error', err);
      setError('Upload failed. Try again.');
    } finally { setUploading(false); }
  };

  const copyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  const openLightbox = (src, prompt) => {
    setLightbox({ open: true, src, prompt });
  };
  const closeLightbox = () => setLightbox(l => ({ ...l, open: false }));

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open]);

  return (
    <div className="chattoimage-container">
      <div className="chattoimage-placeholder" ref={placeholderRef}>
        <div className="chattoimage-top-section">
          {/* Header */}
          <div className="chattoimage-header-row">
            <button
              className="chattoimage-back-btn"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >←</button>
            <h2 className="chattoimage-header">ChatToImage Bot</h2>
            <span
              className="chattoimage-status"
              title={botOnline ? 'Online' : 'Offline'}
              style={{
                background: botOnline ? '#22c55e' : '#b3b2c0',
                border: '2px solid #161b22',
              }}
            />
            <span className="chattoimage-status-label">
              {botOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Prompt Presets */}
          <div className="chattoimage-presets">
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                className="chattoimage-preset-btn"
                onClick={() => handlePreset(preset)}
                disabled={loading}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="chattoimage-prompt-area">
            <input
              type="text"
              placeholder="Enter image prompt..."
              className="chattoimage-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              aria-label="Image generation prompt"
            />
            <button
              className="chattoimage-attach-btn"
              onClick={handleAttachmentClick}
              title="Attach file"
              disabled={loading}
              aria-label="Attach a reference file"
            >📎</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={loading}
              aria-hidden="true"
            />
            <button
              className="chattoimage-generate-btn"
              onClick={handleGenerate}
              disabled={
                loading || uploading || !prompt.trim() ||
                (model !== 'pollinations' && generationCount >= NON_FREE_MAX) ||
                (model === 'pollinations' && cooldownLeft > 0)
              }
            >
              {loading
                ? 'Generating...'
                : model === 'pollinations' && cooldownLeft > 0
                  ? `Wait ${Math.ceil(cooldownLeft / 1000)}s`
                  : 'Generate'}
            </button>
          </div>
          {uploading && (
            <div style={{ fontSize: '0.7rem', color: '#3cd7f8', marginTop: 6 }}>Uploading reference image...</div>
          )}
          {referenceImageUrl && !uploading && (
            <div className="chattoimage-ref-preview">
              <div className="chattoimage-ref-thumb-wrap">
                <img src={referenceImageUrl} alt="Reference" className="chattoimage-ref-thumb" />
              </div>
              <div className="chattoimage-ref-meta">
                <span className="chattoimage-ref-label">Reference image attached</span>
                <div className="chattoimage-ref-actions">
                  <button onClick={() => setReferenceImageUrl(null)} className="chattoimage-ref-remove">Remove</button>
                </div>
              </div>
            </div>
          )}
          <div className="chattoimage-usage-line">
            {model !== 'pollinations'
              ? `Generations used: ${generationCount}/${NON_FREE_MAX}`
              : `Pollinations free mode (cooldown 5s)`}
          </div>

          {/* Prompt Assistant */}
          <div className="chattoimage-help-prompt">
            Problem writing prompt?{' '}
            <button
              className="chattoimage-help-btn"
              onClick={handleChatWithMe}
              disabled={loading || !prompt.trim()}
            >
              Generate with ChatWithMe
            </button>
          </div>

          {/* Model Selection */}
          <div className="chattoimage-model-switcher">
            <label htmlFor="modelSelect">Model:</label>
            <select
              id="modelSelect"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
            >
              {modelOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status / Error (kept above messages so it doesn't scroll away immediately) */}
          {error && <div className="chattoimage-error" role="alert">{error}</div>}
        </div>

        {/* Scrollable Messages / Images */}
        <div className="chattoimage-messages" ref={messagesRef} aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.senderId === 'me' ? 'flex-end' : 'flex-start',
              }}
            >
              <div className={`chattoimage-bubble${msg.senderId === 'me' ? ' me' : ''}`}>
                {msg.type === 'image' ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={msg.content}
                      alt="Generated visual result"
                      className="chattoimage-image"
                      loading="lazy"
                      onClick={() => openLightbox(msg.content, msg.prompt || '')}
                      style={{ cursor: 'zoom-in' }}
                    />
                    <a
                      href={msg.content}
                      download={`generated-image-${msg.id}.png`}
                      className="chattoimage-download-btn"
                    >
                      Download
                    </a>
                    {msg.prompt && (
                      <div className="chattoimage-prompt-meta">
                        <span className="chattoimage-prompt-text" title={msg.prompt}>{msg.prompt}</span>
                        <div className="chattoimage-prompt-actions">
                          <button
                            onClick={() => copyPrompt(msg.prompt)}
                            className="chattoimage-copy-btn"
                            title="Copy prompt"
                            aria-label="Copy prompt"
                          >Copy</button>
                          <button
                            onClick={() => setPrompt(msg.prompt)}
                            className="chattoimage-reuse-btn"
                            title="Reuse prompt"
                            aria-label="Reuse prompt"
                          >Use</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span>{msg.content}</span>
                )}
                <div className="chattoimage-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="chattoimage-bubble me" style={{ opacity: 0.85 }}>
                <span style={{ fontStyle: 'italic' }}>Rendering image...</span>
                <div className="chattoimage-timestamp">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>
        {lightbox.open && (
          <div
            className="chattoimage-lightbox-overlay"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
          >
            <div className="chattoimage-lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.src} alt="Full size generated" className="chattoimage-lightbox-image" />
              {lightbox.prompt && (
                <div className="chattoimage-lightbox-caption">
                  <div className="chattoimage-lightbox-prompt" title={lightbox.prompt}>{lightbox.prompt}</div>
                  <div className="chattoimage-lightbox-actions">
                    <button onClick={() => copyPrompt(lightbox.prompt)}>Copy Prompt</button>
                    <button onClick={() => { setPrompt(lightbox.prompt); closeLightbox(); }}>Use Prompt</button>
                    <button onClick={closeLightbox}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatToImage;

import React, { useEffect, useState } from "react";
import { fetchNews } from "../utils/fetchNews";
import "./ChatForNews.css";

const REGIONS = [
  { label: "🌍 World", value: "world" },
  { label: "🇧🇩 Bangladesh", value: "bd" },
  { label: "🇺🇸 US", value: "us" },
  { label: "🇪🇺 Europe", value: "europe" },
  { label: "🇮🇳 India", value: "india" },
  { label: "🇨🇳 China", value: "china" },
  { label: "🇷🇺 Russia", value: "russia" },
  { label: "🇮🇱 Middle East", value: "middle east" },
  { label: "🇯🇵 Asia", value: "asia" },
];

const translateText = async (text) => {
  const res = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: "bn",
      target: "en",
      format: "text",
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return json.translatedText;
};

const ChatForNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("world");
  const [searching, setSearching] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});

  const loadNews = async (q = region) => {
    setLoading(true);
    if (q === "bd") {
  const res = await fetch("/api/bdnews");
      const news = await res.json();
      setArticles(news);
    } else {
      const news = await fetchNews(q, 12);
      setArticles(news);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews(region);
    // eslint-disable-next-line
  }, [region]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    if (region === "bd") {
      // For BD, search is not supported, just reload BD news
      await loadNews("bd");
    } else {
      const news = await fetchNews(query, 12);
      setArticles(news);
    }
    setSearching(false);
  };

  const handleTranslate = async (idx, text) => {
    setTranslating((prev) => ({ ...prev, [idx]: true }));
    const translated = await translateText(text);
    setTranslations((prev) => ({ ...prev, [idx]: translated }));
    setTranslating((prev) => ({ ...prev, [idx]: false }));
  };

  return (
    <div className="chatfornews-bg">
      <div className="w-full flex flex-col items-center py-8 px-2">
        <h1 className="chatfornews-header">
          ChatForNews <span role="img" aria-label="news">📰</span>
        </h1>
        <p className="chatfornews-subtitle">
          Live geopolitical news, AI-powered search, and region-based headlines. Stay informed with style.
        </p>
        <div className="chatfornews-toolbar">
          <form onSubmit={handleSearch} className="chatfornews-search">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={region === "bd" ? "Bangladesh news (search not supported)" : "Search news (e.g. Gaza, Ukraine, elections...)"}
              disabled={region === "bd"}
            />
            <button type="submit" disabled={searching || region === "bd"}>
              {searching ? "Searching..." : "Search"}
            </button>
          </form>
          <div className="chatfornews-regions">
            {REGIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setRegion(r.value)}
                className={`chatfornews-region-btn${region === r.value ? " active" : ""}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="chatfornews-loading">
            <div className="chatfornews-spinner"></div>
            <p className="text-white text-lg">Loading news...</p>
          </div>
        ) : articles.length === 0 ? (
          <p className="chatfornews-empty">No news found.</p>
        ) : (
          <div className="chatfornews-feed">
            {articles.map((a, i) => (
              <div key={i} className="chatfornews-card group">
                <div className="chatfornews-card-glow" />
                {a.image && (
                  <img
                    src={a.image}
                    alt={a.title}
                    className="chatfornews-card-img"
                  />
                )}
                <h2 className="chatfornews-card-title">{a.title}</h2>
                <p className="chatfornews-card-desc">{a.description}</p>
                {a.language === 'bn' && (
                  <div style={{ marginTop: 6 }}>
                    <button
                      className="text-green-400 hover:text-white text-sm font-semibold"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      disabled={!!translations[i] || translating[i]}
                      onClick={() => handleTranslate(i, a.description)}
                    >
                      {translating[i] ? 'Translating...' : (translations[i] ? 'Translated' : '🌐 Translate')}
                    </button>
                    {translations[i] && (
                      <div className="chatfornews-card-desc" style={{ color: '#7ed6df', marginTop: 4 }}>
                        {translations[i]}
                      </div>
                    )}
                  </div>
                )}
                <div className="chatfornews-card-footer">
                  <span className="chatfornews-card-source">
                    {a.source} &middot; {a.date ? new Date(a.date).toLocaleString() : (a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '')}
                  </span>
                  <a
                    href={a.link || a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chatfornews-card-link"
                  >
                    Read full →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatForNews; 
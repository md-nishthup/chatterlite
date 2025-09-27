const NEWSAPI_KEY = "4f7940a789ce4157b7a8d04b89cc3fe6";
const GNEWS_KEY = "de498b77de14f60dc18e84601b8f43d0";

// Format standard article object
const formatArticle = (article) => ({
  title: article.title,
  description: article.description || article.content || "",
  url: article.url,
  image: article.image || article.urlToImage || "",
  source: article.source?.name || article.source || "",
  publishedAt: new Date(article.publishedAt || article.published).toISOString(),
});

// Fetch from GNews
export const fetchFromGNews = async (query = "world", max = 10) => {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${max}&apikey=${GNEWS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.articles?.map(formatArticle) || [];
};

// Fetch from NewsAPI
export const fetchFromNewsAPI = async (query = "world", max = 10) => {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${max}&language=en&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.articles?.map(formatArticle) || [];
};

// Unified fetch (tries GNews first, then NewsAPI fallback)
export const fetchNews = async (query = "world", max = 10) => {
  try {
    const gnews = await fetchFromGNews(query, max);
    if (gnews.length > 0) return gnews;
    const newsapi = await fetchFromNewsAPI(query, max);
    return newsapi;
  } catch (err) {
    console.error("News fetch error:", err);
    return [];
  }
}; 
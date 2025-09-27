const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 5000;

app.use(cors());

const sources = [
  { name: 'Prothom Alo recent', url: 'https://www.prothomalo.com/collection/latest' },
  { name: 'BDNews24 recent', url: 'https://bdnews24.com/archive' },
  { name: 'azadi ', url: 'https://dainikazadi.net/' }
];

app.get('/api/bdnews', async (req, res) => {
  try {
    const allFeeds = [];
    for (const source of sources) {
      const feed = await parser.parseURL(source.url);
      const items = feed.items.map(item => ({
        source: source.name,
        title: item.title,
        description: item.contentSnippet || item.content || '',
        link: item.link,
        date: item.pubDate,
        image: item.enclosure && item.enclosure.url ? item.enclosure.url : null,
        language: /[\u0980-\u09FF]/.test(item.title) ? 'bn' : 'en'
      }));
      allFeeds.push(...items.slice(0, 5)); // Top 5 from each
    }
    res.json(allFeeds);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching BD news');
  }
});

const server = app.listen(PORT, () => console.log(`🚀 BDNews server running on port ${PORT}`));

process.on('SIGINT', () => {
  console.log('Server stopped by SIGINT (Ctrl+C)');
  process.exit();
});
process.on('SIGTERM', () => {
  console.log('Server stopped by SIGTERM');
  process.exit();
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
}); 
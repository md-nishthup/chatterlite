import Parser from 'rss-parser';

const parser = new Parser();
const sources = [
  { name: 'Prothom Alo recent', url: 'https://www.prothomalo.com/collection/latest' },
  { name: 'BDNews24 recent', url: 'https://bdnews24.com/archive' },
  { name: 'azadi', url: 'https://dainikazadi.net/' }
];

export default async function handler(req, res) {
  try {
    const allFeeds = [];
    for (const source of sources) {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).map(item => ({
        source: source.name,
        title: item.title,
        description: item.contentSnippet || item.content || '',
        link: item.link,
        date: item.pubDate,
        image: item.enclosure && item.enclosure.url ? item.enclosure.url : null,
        language: /[\u0980-\u09FF]/.test(item.title) ? 'bn' : 'en'
      }));
      allFeeds.push(...items.slice(0, 5));
    }
    return res.status(200).json(allFeeds);
  } catch (err) {
    console.error('BDNews error', err);
    return res.status(500).json({ error: 'Error fetching BD news' });
  }
}

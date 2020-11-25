import Feed from 'rss';

import { getPath, getCoverURL, getAbsoluteURL } from '../../styles/util';

const page = require.context('..', true, /\.md$/);
const docsPages = page.keys()
  .map(key => page(key).frontMatter)
  .filter(page => page.published && page.published.live)
  .sort((a, b) => {
    if (!a.published || !a.published.date) return -1;
    if (!b.published || !b.published.date) return 1;
    return new Date(b.published.date).valueOf() -
      new Date(a.published.date).valueOf();
  });

const generateRSSFeed = async (req, res) => {
  const feed = new Feed({
    title: 'Kitten | Latest Posts',
    description: 'Random and hopefully useful thoughts and posts around JS, React, GraphQL, and more.',
    feed_url: getAbsoluteURL('/rss.xml'),
    site_url: getAbsoluteURL(),
    image_url: getAbsoluteURL('/avatars/icon.png'),
    pubDate: docsPages.length ? new Date(docsPages[0].published.date) : null,
    language: 'en',
    ttl: 1440,
  });

  docsPages.forEach(page => {
    feed.item({
      title: page.title,
      url: getAbsoluteURL(getPath(page)),
      description: page.excerpt,
      author: page.published.handle ? `@${page.published.handle}` : '@_philpl',
      date: new Date(page.published.date),
      enclosure: {
        url: getCoverURL(page),
        type: 'image/png',
      },
    });
  });

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate');
  res.setHeader('Content-Type', 'application/xml');
  res.write(feed.xml({ indent: true }));
  res.end();
};

export default generateRSSFeed;

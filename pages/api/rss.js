import { Feed } from 'feed';

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
    id: "http://example.com/",
    link: getAbsoluteURL(null, req),
    language: 'en',
    favicon: getAbsoluteURL('/avatars/icon.png', req),
    updated: docsPages.length ? new Date(docsPages[0].published.date) : null,
    feedLinks: {
      atom: getAbsoluteURL('/rss.xml', req),
    },
    generator: null,
    author: {
      name: 'Phil Pluckthun',
      email: 'phil@kitten.sh',
      link: 'https://twitter.com/_philpl',
    }
  });

  docsPages.forEach(page => {
    feed.addItem({
      title: page.title,
      id: getAbsoluteURL(getPath(page), req),
      link: getAbsoluteURL(getPath(page), req),
      description: page.excerpt,
      date: new Date(page.published.date),
      image: getCoverURL(page),
      author: [
        { name: `@${page.published.handle}` },
      ],
    });
  });

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate');
  res.setHeader('Content-Type', 'application/xml');
  res.write(feed.rss2());
  res.end();
};

export default generateRSSFeed;

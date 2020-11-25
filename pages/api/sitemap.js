import { SitemapStream, streamToPromise } from 'sitemap';

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

const generateSitemap = async (req, res) => {
  const smStream = new SitemapStream({
    hostname: getAbsoluteURL(null, req),
    lastmodDateOnly: true,
  });

  smStream.write({
    url: '/',
    changefreq: 'daily',
    priority: 0.3,
  });

  docsPages.forEach(page => {
    const element = {
      url: `/${getPath(page)}`,
      changefreq: 'weekly',
      priority: 0.7,
      img: [{
        url: getCoverURL(page),
        title: page.title,
      }],
    };

    if (page.published && page.published.date) {
      element.lastmod = new Date(page.published.date);
    }

    if (page.published && page.published.live) {
      smStream.write(element);
    }
  });

  smStream.end();

  const sitemap = await streamToPromise(smStream).then((sm) => sm.toString());

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
};

export default generateSitemap;

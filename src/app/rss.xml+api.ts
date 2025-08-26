import { metadataList } from '~/lib/posts/metadata';

const ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const ESCAPE_REGEX = /[&><\u2028\u2029]/g;
const escape = (str: string) => str.replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match]);

export function GET() {
  const content = metadataList.map((post) => {
    const url = new URL(`https://kitten.sh/blog/${post.id}`);
    return [
      '<item>',
      `  <title>${escape(post.title)}</title>`,
      `  <description>${escape(post.subtitle)}</description>`,
      `  <link>${url}</link>`,
      `  <guid isPermaLink="false">${url}</guid>`,
      '  <dc:creator>Phil Pluckthun</dc:creator>',
      `  <pubDate>${post.createdAt.toUTCString()}</pubDate>`,
      '</item>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">',
    '<channel>',
    '<title>Phil Pluckthun’s blog</title>',
    '<description>Occasional posts and musings about JavaScript, TypeScript, GraphQL, React, and React Native.</description>',
    '<link>https://kitten.sh/</link>',
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `<atom:link href=${JSON.stringify('https://kitten.sh/rss.xml')} rel="self" type="application/rss+xml"/>`,
    content.join('\n'),
    '</channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'cache-control': 'public, max-age=3600, stale-while-revalidate=3600',
      'content-type': 'application/xml',
    },
  });
}

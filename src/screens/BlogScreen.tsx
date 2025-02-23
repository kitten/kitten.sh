import { createElement, useMemo } from 'react';
import Head from 'expo-router/head';

import { MarkdownFile } from '../env';
import { ArticleLayout } from '~/components/ArticleLayout/ArticleLayout';

const contentRe = /([^\/]+)(?:[\/]index)\.mdx?$/i;
const context = require.context('../../blog', true, /([^\/]+)(?:[\/]index)\.mdx?$/i);

export function getPost(postId: string): typeof MarkdownFile | null {
  const moduleName = context.keys().find((moduleName) => {
    switch (moduleName) {
      case `./${postId}.mdx`:
      case `./${postId}.md`:
      case `./${postId}/index.mdx`:
      case `./${postId}/index.md`:
        return true;
      default:
        return false;
    }
  });
  return moduleName ? context(moduleName) : null;
}

export const blogPosts = context
  .keys()
  .map((moduleName) => {
    const postId = moduleName.match(contentRe)?.[1];
    return postId ? { id: postId } : null;
  })
  .filter((entry) => entry != null);

interface Props {
  postId: string;
}

export function BlogScreen({ postId }: Props) {
  const ogImageUrl = `https://kitten.sh/blog/${postId}/_og-image`;
  const url = `https://kitten.sh/blog/${postId}`;

  const post = useMemo(() => {
    return getPost(postId);
  }, [postId]);
  return post && (
    <>
      <Head>
        <title>{post.metadata.title}</title>
        <link rel="canonical" href={url} />
        <meta name="description" content={post.metadata.subtitle} />

        <meta property="og:site_name" content="kitten.sh" />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_GB" />

        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta property="og:title" content={post.metadata.title} />
        <meta property="og:description" content={post.metadata.subtitle} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={new Date(post.metadata.createdAt).toISOString()} />
        <meta property="article:author" content="https://github.com/kitten" />

        <meta property="twitter:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metadata.title} />
        <meta name="twitter:description" content={post.metadata.subtitle} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script id="ld+article" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.metadata.title,
            preview: post.metadata.subtitle,
            url: url,
            image: ogImageUrl,
            datePublished: post.metadata.createdAt,
            author: {
              '@type': 'Person',
              name: 'Phil Pluckthun',
            },
          })}
        </script>
      </Head>

      <ArticleLayout metadata={post.metadata}>
        {createElement(post.default)}
      </ArticleLayout>
    </>
  );
}

import { createElement, useMemo } from 'react';
import Head from 'expo-router/head';

import { getPost } from '~/lib/posts/default';
import { getMetadata } from '~/lib/posts/metadata';
import { ArticleLayout } from '~/components/ArticleLayout/ArticleLayout';

interface Props {
  postId: string;
}

export function BlogScreen({ postId }: Props) {
  const ogImageUrl = `https://kitten.sh/blog/${postId}/_og-image`;
  const url = `https://kitten.sh/blog/${postId}`;

  const post = useMemo(() => getPost(postId), [postId]);
  const metadata = useMemo(() => getMetadata(postId), [postId]);

  return post && metadata && (
    <>
      <Head>
        <title>{metadata.title}</title>
        <link rel="canonical" href={url} />
        <meta name="description" content={metadata.subtitle} />

        <meta property="og:site_name" content="kitten.sh" />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_GB" />

        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.subtitle} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={new Date(metadata.createdAt).toISOString()} />
        <meta property="article:author" content="https://github.com/kitten" />

        <meta property="twitter:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.subtitle} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script id="ld+article" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: metadata.title,
            preview: metadata.subtitle,
            url: url,
            image: ogImageUrl,
            datePublished: metadata.createdAt,
            author: {
              '@type': 'Person',
              name: 'Phil Pluckthun',
            },
          })}
        </script>
      </Head>

      <ArticleLayout metadata={metadata}>
        {createElement(post.default)}
      </ArticleLayout>
    </>
  );
}

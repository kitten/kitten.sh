import { Link } from 'expo-router';

import { toDateString } from '~/lib/date';
import { MarkdownFile } from '../env';
import styles from './HomeScreen.module.css';

const contentRe = /([^\/]+)(?:[\/]index)\.mdx?$/i;
const context = require.context('../../blog', true, /([^\/]+)(?:[\/]index)\.mdx?$/i);

const blogPosts = context
  .keys()
  .map((moduleName) => {
    const postId = moduleName.match(contentRe)?.[1] || null;
    const post: typeof MarkdownFile | null = postId && context(moduleName);
    return post && {
      id: postId!,
      title: post.metadata.title,
      subtitle: post.metadata.subtitle,
      createdAt: new Date(post.metadata.createdAt),
    };
  })
  .filter((entry) => entry != null)
  .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());

export function HomeScreen() {
  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <h2 className={styles.heading}>Articles</h2>
      </div>

      <section className={styles.section}>
        {blogPosts.map((post) => (
          <article key={post.id}>
            <Link href={`/blog/${post.id}`} className={styles.title}>{post.title}</Link>
            <p className={styles.subtitle}>{post.subtitle}</p>
            <span className={styles.date}>{toDateString(post.createdAt)}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

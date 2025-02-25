import { Link } from 'expo-router';
import Head from 'expo-router/head';

import { toDateString } from '~/lib/date';
import { metadataList } from '~/lib/posts/metadata';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>kitten.sh</title>
      </Head>

      <div className={styles.main}>
        <div className={styles.section}>
          <h2 className={styles.heading}>Articles</h2>
        </div>

        <section className={styles.section}>
          {metadataList.map((post) => (
            <article key={post.id}>
              <Link href={`/blog/${post.id}`} className={styles.title}>{post.title}</Link>
              <p className={styles.subtitle}>{post.subtitle}</p>
              <span className={styles.date}>{toDateString(post.createdAt)}</span>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}

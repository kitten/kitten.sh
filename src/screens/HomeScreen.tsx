import { Link } from 'expo-router';

import { toDateString } from '~/lib/date';
import { metadataList } from '~/lib/posts/metadata';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  return (
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
  );
}

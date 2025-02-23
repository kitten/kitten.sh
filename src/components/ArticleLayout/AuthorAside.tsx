import { Metadata } from '~/lib/mdx';
import styles from './AuthorAside.module.css';

import { toDateString } from '~/lib/date';
import avatar from '~/assets/images/avatar.png';

interface Props {
  metadata: Metadata;
}

export function AuthorAside({ metadata }: Props) {
  return (
    <aside className={styles.aside}>
      <div className={styles.author}>
        <div className={styles.author_column}>
          <span>{toDateString(metadata.createdAt)}</span>
          <a rel="author external" target="_blank" href="https://github.com/kitten">Phil Pluckthun</a>
        </div>
        <img src={avatar.uri} className={styles.avatar} loading="lazy" />
      </div>
    </aside>
  );
}

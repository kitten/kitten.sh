import { Metadata } from '~/lib/mdx';
import styles from './AuthorAside.module.css';

import { toDateString } from '~/lib/date';

import avatar_avif from '~/assets/images/avatar.avif';
import avatar_png from '~/assets/images/avatar.png';

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
        <picture>
          <source srcSet={`${avatar_avif} ${avatar_png.width}w`} type="image/avif" />
          <source srcSet={`${avatar_png.uri} ${avatar_png.width}w`} type="image/png" />
          <img alt="" src={avatar_png.uri} className={styles.avatar} loading="lazy" />
        </picture>
      </div>
    </aside>
  );
}

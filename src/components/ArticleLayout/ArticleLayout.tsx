import { ReactNode, Children, cloneElement } from 'react';
import { Link } from 'expo-router';

import { Metadata, JSXComponents } from '~/lib/mdx';
import { postsList } from '~/lib/posts/default';
import { AuthorAside } from './AuthorAside';
import styles from './ArticleLayout.module.css';

const toText = (children: ReactNode | ReactNode[]) => {
  return Children.toArray(children).reduce((acc: string, child): string => {
    if (typeof child !== 'object' || !child || !('props' in child)) return acc;
    return acc +
      (typeof child.props.children === 'string'
        ? child.props.children
        : toText(child.props.children));
  }, '');
};

const components: JSXComponents = {
  img({ src, ...props }) {
    if (typeof src !== 'object') return <img loading="lazy" {...props} src={src} />;
    const style = {
      aspectRatio: src.width && src.height ? src.width / src.height : undefined,
      maxHeight: `min(calc(${src.height}px / var(--size-dppx)), calc(100svh - 2cap))`,
    };
    return (
      <figure className={styles.article_bleed}>
        <img loading="lazy" srcSet={`${src.uri} ${src.width}w`} {...props} style={style} />
        {props.alt && <figcaption className={styles.img_alt}>{props.alt}</figcaption>}
      </figure>
    );
  },

  blockquote(props) {
    const text = toText(props.children);
    const isPullQuote = text.length >= 47 && !/^["“]/.test(text);
    return (
      <blockquote
        {...props}
        role={isPullQuote ? 'presentation' : undefined}
        aria-hidden={isPullQuote ? 'true' : 'false'}
        className={isPullQuote ? styles.pullquote : undefined}
      />
    );
  },

  pre(props) {
    return (
      <pre
        {...props}
        className={styles.page_bleed}
        style={{ ...props.style, background: 'none', color: 'inherit' }}
      />
    );
  },

  table(props) {
    return (
      <div className={styles.page_bleed}>
        <table {...props} />
      </div>
    );
  },
};

interface Props {
  children: JSX.Element | null;
  metadata: Metadata;
}

export const ArticleLayout = ({ children, metadata }: Props) => {
  return (
    <article className={styles.article}>
      <header className={styles.heading}>
        <h1>{metadata.title}</h1>
        {metadata.subtitle ? <h2>{metadata.subtitle}</h2> : null}
        <Link href="/" className={styles.number} aria-label={`Post ${metadata.number} out of ${postsList.length}`}>
          {`${metadata.number}/${postsList.length}`}
        </Link>
      </header>
      <AuthorAside metadata={metadata} />
      <section className={styles.content}>
        {children && cloneElement(children, { components })}
      </section>
    </article>
  );
};

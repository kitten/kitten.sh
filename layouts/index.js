import Link from 'next/link';
import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';
import { styled } from 'goober';

import { sizes, tablet } from '../styles/theme';
import { toDateString, getPath, getAbsoluteURL, getCoverURL } from '../styles/util';
import { Header, Avatar } from '../styles/layout';
import { InfoOverlay } from '../styles/overlay';
import Floaty from '../styles/floaty';
import Footer from '../styles/footer';
import Signup from '../styles/signup';
import * as components from '../styles/article';

const Article = styled('article')`
  position: relative;
  text-rendering: geometricPrecision;
`;

const Content = styled('div')`
  max-width: 45ch;
  width: 100%;
  margin: 2.5rem auto 0.5rem auto;

  text-rendering: optimizeLegibility;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  -webkit-hyphenate-limit-before: 4;
  -webkit-hyphenate-limit-after: 3;
  -moz-hyphenate-limit-chars: 7 4 3;
  -webkit-hyphenate-limit-chars: 7 4 3;
  -ms-hyphenate-limit-chars: 7 4 3;
  hyphenate-limit-chars: 7 4 3;
  hanging-punctuation: first;
  /*letter-spacing: 0.03ch;*/
  line-height: 2.34ch;
`;

const Sidebar = styled('aside')`
  position: absolute;
  width: calc((${sizes.page}px - 45ch - 6ch) / 2);
  margin-top: 2.8rem;

  ${tablet`
    position: static;
    margin-top: 0.8rem;

    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
    width: auto;

    & > img {
      margin-right: 1ch;
    }
  `}
`;

const SidebarNote = styled('small')`
  display: block;
  margin-bottom: 0.3rem;
  color: var(--color-gray-text);
  font-size: 1.1rem;
  line-height: 1.0;
`;

const Handle = styled(components.a)`
  background-size: 100% 0;
  font-style: italic;
`;

const Layout = ({ children, frontMatter }) => {
  const coverURL = getCoverURL(frontMatter);

  return (
    <>
      <Head>
        <title>{frontMatter.title}</title>
        <meta name="og:title" content={frontMatter.title} />
        <meta property="og:image" content={coverURL} />
        <meta property="og:image:width" content="610" />
        <meta property="og:image:height" content="385" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={coverURL} />
        <meta name="twitter:title" content={frontMatter.title} />
        {frontMatter.published && frontMatter.published.handle ? (
          <meta name="twitter:creator" content={frontMatter.published.handle} />
        ) : null}
        {frontMatter.excerpt ? (
          <meta name="description" content={frontMatter.excerpt} />
        ) : null}
        {frontMatter.excerpt ? (
          <meta name="og:description" content={frontMatter.excerpt} />
        ) : null}
        <link rel="canonical" href={frontMatter.canonical || getAbsoluteURL(getPath(frontMatter))} />
      </Head>

      {!frontMatter.published || !frontMatter.published.live ? (
        <InfoOverlay title="This draft isn't published yet." />
      ) : null}

      <Article>
        {frontMatter.cover || frontMatter.title || frontMatter.subtitle ? (
          <Header page={frontMatter}>
            <Floaty showThemeToggle />
          </Header>
        ) : null}

        <Sidebar>
          <SidebarNote>
            {frontMatter.published && frontMatter.published.date ? (
              <div>{toDateString(frontMatter.published.date)}</div>
            ) : null}
            {frontMatter.published && frontMatter.published.handle ? (
              <div>
                {'by '}
                <Handle
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://twitter.com/${frontMatter.published.handle || ''}`}
                >
                  @{frontMatter.published.handle}
                </Handle>
              </div>
            ) : null}
          </SidebarNote>

          <Avatar src={frontMatter.published.avatar} alt="" />
        </Sidebar>

        <Content>
          <MDXProvider components={components}>
            {children}
          </MDXProvider>
        </Content>
      </Article>

      <Signup />

      <Footer page={frontMatter}>
        <Floaty bottom />
      </Footer>
    </>
  );
};

export default Layout;

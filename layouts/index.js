import Link from 'next/link';
import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';
import { styled } from 'goober';

import { sizes, mobile, tablet, desktop } from '../styles/theme';
import { toDateString, getPath, getCoverURL } from '../styles/util';
import { Header, Avatar } from '../styles/layout';
import Footer from '../styles/footer';
import ThemeToggle from '../styles/theme-toggle';
import * as components from '../styles/article';
import arrowSvg from '../assets/arrow-1.svg';

const MoreArticles = styled('span')`
  display: inline-block;
  position: absolute;
  margin: 2rem 0;
  padding-left: 3ch;
  line-height: 1.0;
  font-size: 0.9em;
  font-family: var(--font-heading);
  color: var(--color-active);
  z-index: 2;

  & > a {
    text-decoration: none;
    color: inherit;
  }

  ${p => p.bottom ? 'bottom: 0;' : 'top: 0;'};

  ${tablet`
    margin: 1rem 0;
    font-size: 0.8em;
  `}

  ${desktop`
    &:hover {
      transition: filter 0.3s ease;
      filter: invert(0.8);
    }
  `}

  &:before {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    width: 2ch;
    height: 1em;
    content: '';
    transform: rotate(180deg);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('${arrowSvg}');
  }
`;

const Article = styled('article')`
  position: relative;
  text-rendering: geometricPrecision;
`;

const Content = styled('div')`
  max-width: 65ch;
  width: 100%;
  margin: 2.5rem auto;

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
`;

const Sidebar = styled('aside')`
  position: absolute;
  width: calc((${sizes.page}px - 65ch - 6ch) / 2);
  margin-top: 2.8rem;

  ${tablet`
    position: static;
    margin-top: 0.8rem;
  `}

  ${mobile`
    margin-top: 1.6rem;
  `}
`;

const SidebarNote = styled('small')`
  display: block;
  margin-bottom: 0.3rem;
  color: var(--color-gray-text);
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
        <meta name="twitter:title" content={frontMatter.title} />
        {frontMatter.published && frontMatter.published.handle ? (
          <meta name="twitter:creator" content={frontMatter.published.handle} />
        ) : null}
        <meta name="og:title" content={frontMatter.title} />
        <meta property="og:image" content={coverURL} />
        <meta name="twitter:image" content={coverURL} />
        <link rel="canonical" href={frontMatter.canonical || `https://kitten.sh/${getPath(frontMatter)}`} />
      </Head>

      <Article>
        {frontMatter.cover || frontMatter.title || frontMatter.subtitle ? (
          <Header page={frontMatter}>
            <MoreArticles>
              <Link href="/">
                <a href="/">
                  other posts
                </a>
              </Link>
              <ThemeToggle />
            </MoreArticles>
          </Header>
        ) : null}

        <Sidebar>
          {frontMatter.published && frontMatter.published.date ? (
            <SidebarNote>{toDateString(frontMatter.published.date)}</SidebarNote>
          ) : null}
          {frontMatter.published && frontMatter.published.handle ? (
            <SidebarNote>
              {'by '}
              <Handle
                rel="noopener noreferrer"
                target="_blank"
                href={`https://twitter.com/${frontMatter.published.handle || ''}`}
              >
                @{frontMatter.published.handle}
              </Handle>
            </SidebarNote>
          ) : null}
          <Avatar src={frontMatter.published.avatar} alt="" />
        </Sidebar>

        <Content>
          <MDXProvider components={components}>
            {children}
          </MDXProvider>
        </Content>
      </Article>

      <Footer>
        <MoreArticles bottom>
          <Link href="/">
            <a href="/">
              other posts
            </a>
          </Link>
        </MoreArticles>
      </Footer>
    </>
  );
};

export default Layout;

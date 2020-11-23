import Link from 'next/link';
import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';
import { styled } from 'goober';

import { sizes, mobile, tablet, desktop } from '../styles/theme';
import { toDateString, getPath } from '../styles/util';
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

const Avatar = styled('img')`
  display: inline-block;
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--color-active);
  margin: 0.6rem 0;
`;

const Header = styled('header')`
  position: relative;
  padding: 4rem 0 0.5rem 0;
  width: 100%;

  ${mobile`
    padding: 4rem 0 0 0;
  `}
`;

const Title = styled('h1')`
  font-size: 4.5rem;
  padding-top: 1rem;

  ${tablet`
    display: inline;
    position: relative;
    z-index: 1;
    background-image: linear-gradient(
      to bottom,
      transparent,
      transparent 30%,
      var(--color-background) 30%,
      var(--color-background)
    );
  `}

  ${mobile`
    font-size: 2.5em;
    line-height: 1.1em;
  `}
`;

const HeaderGap = styled('div')`
  display: block;

  ${tablet`
    margin-top: 1rem;
  `}
`;

const Subtitle = styled('h2')`
  font-size: 2.2em;
  color: var(--color-passive);
  background: var(--color-background);
  margin-top: 1rem;
  z-index: 1;

  ${tablet`
    display: inline;
    line-height: 1.2em;
    position: relative;
    z-index: 1;
  `}

  ${mobile`
    font-size: 2em;
  `}
`;

const Cover = styled('div')`
  background-image: url('${p => p.src}');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  width: 17rem;
  height: 17rem;
  margin-left: 1rem;
  margin-bottom: -1rem;
  float: right;
  z-index: 0;
  opacity: 0.8;

  box-shadow:
    1px 7px 21px 3px rgba(0, 0, 0, 0.24),
    -1px -7px 21px rgba(255, 255, 255, 0.09);

  ${tablet`
    position: absolute;
    right: -8rem;
    bottom: 1rem;
    float: unset;
  `}

  ${mobile`
    position: absolute;
    right: -15vw;
    bottom: 1.5rem;
    height: 65vw;
    width: 65vw;
  `}
`;

const Layout = ({ children, frontMatter }) => (
  <>
    <Head>
      <title>{frontMatter.title}</title>
      <meta name="twitter:title" content={frontMatter.title} />
      {frontMatter.published && frontMatter.published.handle ? (
        <meta name="twitter:creator" content={frontMatter.published.handle} />
      ) : null}
      <meta name="og:title" content={frontMatter.title} />
      <link rel="canonical" href={frontMatter.canonical || `https://kitten.sh/${getPath(frontMatter)}`} />
    </Head>

    <Article>
      {frontMatter.cover || frontMatter.title || frontMatter.subtitle ? (
        <Header>
          <MoreArticles>
            <Link href="/">
              <a href="/">
                other posts
              </a>
            </Link>
            <ThemeToggle />
          </MoreArticles>

          {frontMatter.cover && <Cover src={frontMatter.cover} />}
          {frontMatter.title && <Title>{frontMatter.title}</Title>}
          {frontMatter.title && frontMatter.subtitle ? <HeaderGap /> : null}
          {frontMatter.subtitle && (
            <Subtitle>
              {!/[.?!]\s*$/i.test(frontMatter.subtitle)
                ? `${frontMatter.subtitle.trim()}.`
                : frontMatter.subtitle.trim()
              }
            </Subtitle>
          )}
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

export default Layout;

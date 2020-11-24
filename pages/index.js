import Link from 'next/link';
import Head from 'next/head';
import { styled } from 'goober';

import { toDateString, getPath } from '../styles/util';
import { sizes, tablet, mobile } from '../styles/theme';
import { Avatar } from '../styles/layout';
import Footer from '../styles/footer';

const Logo = styled('img')`
  transform: translate(0, 5px);
  display: inline-block;
  vertical-align: bottom;
  margin-right: 0.5ch;
  width: 1em;
  height: 1em;
`;

const PostsHeading = styled('h1')`
  text-transform: capitalize;
  font-size: 4.5rem;
  padding: 3rem 0 1.5rem 0;
  color: var(--color-active);
`;

const PostList = styled('ul')`
  list-style-type: none;
  max-width: ${sizes.page}px;
  margin: 2.5rem auto 1.5rem auto;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 3rem;

  ${tablet`
    grid-template-columns: 1fr 1fr;
  `}

  ${mobile`
    grid-template-columns: 1fr;
  `}
`;

const Post = styled('li')`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 1rem;

  &:after {
    display: inline-block;
    background-color: var(--color-active);
    width: 4ch;
    height: 0.4em;
    margin-top: 0.8ch;
    vertical-align: baseline;
    content: '';
  }
`;

const PostLink = styled('a')`
  color: inherit;
  text-decoration: none;
  outline: none;

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const Title = styled('h2')`
  display: inline;
  font-size: 2.2rem;
  line-height: 1.2;
  color: var(--color-text);

  text-decoration: none;
  background-color: var(--color-background);
  background-size: 100% 1.6px;
  background-repeat: no-repeat;
  background-position: 0 100%;

  transition:
    color 0.2s ease-out,
    background-position 0.1s,
    background-size 0.1s;

  background-image: linear-gradient(
    to bottom,
    var(--color-active) 0%,
    var(--color-active) 100%
  );

  @media (prefers-reduced-motion) {
    &, &:hover {
      transition: none;
    }
  }

  @media (hover: hover) {
    ${PostLink}:hover & {
      background-size: 100% 1.2em;
      background-position: 0 0;
      color: white;
    }
  }
`;

const Note = styled('small')`
  display: inline-block;
  background: var(--color-background);
  margin: 0.5rem 0 1rem 0;
  color: var(--color-gray-text);
  line-height: 1.0;
`;

const Handle = styled('span')`
  color: var(--color-active);
  font-style: italic;
`;

const Excerpt = styled('p')`
  display: inline;
  line-height: 1.4;
  font-size: 0.9em;
  background: var(--color-background);
  color: var(--color-text);
`;

const FloatyAvatar = styled(Avatar)`
  margin: -0.3rem 1rem 0 0;
  float: left;
`;

const Cover = styled('div')`
  background-image: url('${p => p.src}');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  width: 10rem;
  height: 10rem;

  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  box-shadow:
    1px 7px 21px 3px rgba(0, 0, 0, 0.24),
    -1px -7px 21px rgba(255, 255, 255, 0.09);
`;

const description = 'Random and hopefully useful thoughts and posts around JS, React, GraphQL, and more.';

const page = require.context('.', true, /\.md$/);
const docsPages = page.keys()
  .map(key => page(key).frontMatter)
  .filter(page => page.published && page.published.live)
  .sort((a, b) => {
    if (!a.published || !a.published.date) return -1;
    if (!b.published || !b.published.date) return 1;
    return new Date(b.published.date).valueOf() -
      new Date(a.published.date).valueOf();
  });

const Index = () => (
  <>
    <Head>
      <title>Latest Posts | Kitten</title>
      <meta name="twitter:title" content="Kitten" />
      <meta name="twitter:creator" content="@_philpl" />
      <meta name="og:title" content="Kitten" />
      <meta name="description" content={description} />
      <meta name="og:description" content={description} />
      <link rel="canonical" href="https://kitten.sh" />
    </Head>

    <main>
      <PostsHeading>
        <Logo src="/avatars/icon.png" />
        Recently Published
      </PostsHeading>

      <PostList>
        {docsPages.map(page => (
          <Post key={page.__resourcePath}>
            <Link href={getPath(page)}>
              <PostLink href={getPath(page)}>
                <Title>{page.title}</Title>
                {page.published ? (
                  <div>
                    <Note>
                      {page.published.date ? toDateString(page.published.date) : null}
                      {page.published.date && page.published.handle ? ' ' : null}
                      {page.published.handle ? 'by ' : null}
                      {page.published.handle ? <Handle>@{page.published.handle}</Handle> : null}
                    </Note>
                  </div>
                ) : null}
                {page.published && page.published.avatar ? (
                  <FloatyAvatar src={page.published.avatar} alt="" />
                ) : null}
                <Excerpt>{page.excerpt || page.subtitle}</Excerpt>
              </PostLink>
            </Link>
            {page.cover ? <Cover src={page.cover} /> : null}
          </Post>
        ))}

        {docsPages.length === 0 ? (
          <h3>Nothing to see here... yet. 🤔</h3>
        ) : null}
      </PostList>
    </main>

    <Footer />
  </>
);

export default Index;

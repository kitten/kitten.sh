import Head from 'next/head';
import { styled } from 'goober';

import { Header, Avatar } from '../../../styles/layout';
import { getPath } from '../../../styles/util';
import * as components from '../../../styles/article';

import { frontMatter } from '../../**/*.md';

const Wrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 610px;
  height: 385px;
`;

const HeaderBox = styled(Header)`
  padding: 1rem 0;
`;

const AuthorBar = styled('aside')`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.4em;
`;

const Handle = styled(components.a)`
  background-size: 100% 0;
  font-style: italic;
  font-size: 1.2em;
  margin-left: 2ch;
`;

const Cover = ({ page }) => (
  <>
    <Head>
      <meta name="robots" content="noindex" />
    </Head>
    <Wrapper>
      <HeaderBox page={page}>
        <AuthorBar>
          <Avatar src={page.published.avatar} alt="" />
          <Handle>
            @{page.published.handle}
          </Handle>
        </AuthorBar>
      </HeaderBox>
    </Wrapper>
  </>
);

export const getStaticProps = ({ params: { slug } }) => {
  const page = frontMatter.find(page => {
    return getPath(page) === slug.join('/');
  });

  return { props: { page } };
};

export const getStaticPaths = () => {
  const paths = frontMatter.map(page => {
    params: { slug: getPath(page) }
  });

  return {
    paths: frontMatter.map(page => ({
      params: { slug: getPath(page).split('/') }
    })),
    fallback: false,
  };
};

export default Cover;

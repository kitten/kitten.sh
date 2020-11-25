import { load as loadFathom, trackPageview } from 'fathom-client';
import { prefix } from 'goober-autoprefixer';
import { styled, css, setup } from 'goober';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { sizes, desktop, tablet } from '../styles/theme';
import '../styles/global.css';

import 'focus-visible';

setup(React.createElement, prefix);

const description = 'Random and hopefully useful thoughts and posts around JS, React, GraphQL, and more.';

const Main = styled('main')`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  max-width: ${sizes.page}px;
  margin: 0 auto 0 auto;
  padding: 0 1.5ch 0 1.5ch;
  color: var(--color-text);
  background: var(--color-background);
  min-height: 100vh;

  ${desktop`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `}

  ${tablet`
    overflow-x: hidden;
  `}
`;

const App = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    loadFathom('SOSQTHKA', {
      excludedDomains: ['localhost']
    });

    const onRouteChange = () => {
      trackPageview();
    };

    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
    }
  }, []);

  return (
    <Main>
      <Head>
        <meta name="og:type" content="website" />
        <link rel="icon" type="image/png" href="/avatars/icon.png" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      </Head>
      <Component {...pageProps} />
    </Main>
  );
}

export default App;

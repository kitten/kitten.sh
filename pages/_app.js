import galite from '@philpl/ga-lite';
import { prefix } from 'goober-autoprefixer';
import { styled, css, setup } from 'goober';
import React, { useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { sizes, desktop, tablet } from '../styles/theme';
import '../styles/global.css';

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

const useUniversalEffect = typeof window !== 'undefined'
  ? useLayoutEffect
  : useEffect;

const App = ({ Component, pageProps }) => {
  const router = useRouter();

  useLayoutEffect(() => {
    galite('create', 'UA-183931096-1', 'auto');

    const unloadEvent = 'onpagehide' in window ? 'pagehide' : 'unload';

    const onRouteChange = () => {
      galite('send', 'pageview');
    };

    const onUnload = () => {
      galite('send', 'timing', 'JS Dependencies', 'unload');
    };

    const onError = error => {
      galite('send', 'exception', {
        exDescription: error.message,
        exFatal: true
      });
    };

    if (window.performance) {
      const timeSincePageLoad = Math.round(performance.now());
      galite('send', 'timing', 'JS Dependencies', 'load', timeSincePageLoad);
    }

    onRouteChange();
    window.addEventListener(unloadEvent, onUnload, { capture: true });
    window.addEventListener('error', onError);
    router.events.on('routeChangeComplete', onRouteChange);

    if ('pageshow' in window) {
      window.addEventListener(onRouteChange);
    }

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
      window.removeEventListener(onRouteChange);
      window.removeEventListener(unloadEvent, onUnload, { capture: true });
      window.removeEventListener('error', onError);
    };
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

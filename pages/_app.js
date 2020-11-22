import React from 'react';
import { prefix } from 'goober-autoprefixer';
import { styled, css, setup } from 'goober';

import { sizes, desktop, tablet } from '../styles/theme';
import '../styles/global.css';

import 'focus-visible';

setup(React.createElement, prefix);

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

const App = ({ Component, pageProps }) => (
  <Main>
    <Component {...pageProps} />
  </Main>
);

export default App;

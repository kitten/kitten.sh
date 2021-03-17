import Link from 'next/link';
import { styled } from 'goober';

import { tablet, desktop } from './theme';
import ThemeToggle from '../styles/theme-toggle';
import arrowSvg from '../assets/arrow-1.svg';

const Wrapper = styled('div')`
  display: inline-block;
  position: absolute;
  margin: 2rem 0;
  z-index: 2;

  ${p => p.bottom ? 'bottom: 0;' : 'top: 0;'};

  ${tablet`
    margin: 1rem 0;
  `}
`;

const MoreArticles = styled('a')`
  text-decoration: none;
  line-height: 1.0;
  font-size: 0.9em;
  color: var(--color-active);
  transition: filter 0.3s ease;
  padding-left: 3ch;

  font-weight: var(--text-weight-medium);
  font-variation-settings:
    "wght" var(--text-weight-medium)
    "opsz" var(--text-width-label);

  ${tablet`
    font-size: 0.8em;
  `}

  ${desktop`
    &:hover {
      filter: hue-rotate(-20deg) brightness(1.4);
    }

    @media (prefers-reduced-motion) {
      &, &:hover {
        transition: none;
      }
    }
  `}

  &:before {
    position: absolute;
    top: 0.28rem;
    left: 0;
    display: inline-block;
    width: 2ch;
    height: 1rem;
    content: '';
    transform: rotate(180deg);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('${arrowSvg}');
  }
`;

const Floaty = ({ showThemeToggle = false, bottom, children }) => (
  <Wrapper bottom={bottom}>
    <Link href="/">
      <MoreArticles href="/">
        other posts
      </MoreArticles>
    </Link>
    {showThemeToggle ? <ThemeToggle /> : null}
  </Wrapper>
);

export default Floaty;

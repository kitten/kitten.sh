import { styled } from 'goober';
import { mobile, tablet } from '../styles/theme';

const HeaderWrapper = styled('header')`
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
  font-size: 2rem;
  float: right;
  z-index: 0;
  opacity: 0.8;

  box-shadow: var(--shadow);

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

export const Header = ({ className, page, children }) => (
  <HeaderWrapper className={className}>
    {children}

    {page.cover && <Cover src={page.cover} />}
    {page.title && <Title>{page.title}</Title>}
    {page.title && page.subtitle ? <HeaderGap /> : null}
    {page.subtitle && (
      <Subtitle>
        {!/[.?!]\s*$/i.test(page.subtitle)
          ? `${page.subtitle.trim()}.`
          : page.subtitle.trim()
        }
      </Subtitle>
    )}
  </HeaderWrapper>
);

export const Avatar = styled('img')`
  display: inline-block;
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--color-active);
  margin: 0.6rem 0;
`;

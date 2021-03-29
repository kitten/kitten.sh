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
  font-family: var(--font-heading);
  font-size: 4.5rem;
  padding-top: 1rem;

  ${tablet`
    display: inline;
    position: relative;
    z-index: 1;

    background-color: transparent;
    background-image: linear-gradient(
      to bottom,
      transparent,
      transparent 31%,
      var(--color-background) 31%,
      var(--color-background) 96%,
      transparent 96%,
      transparent 100%
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
  font-family: var(--font-heading);
  color: var(--color-passive);
  padding-top: 1rem;

  background-color: transparent;
  background-image: linear-gradient(
    to bottom,
    transparent,
    transparent 31%,
    var(--color-background) 31%,
    var(--color-background) 96%,
    transparent 96%,
    transparent 100%
  );

  ${tablet`
    display: inline;
    position relative;
    line-height: 1.2em;
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
  width: 19rem;
  height: 19rem;
  font-size: 2rem;
  float: right;
  z-index: 0;
  opacity: 0.8;
  box-shadow: var(--shadow);
  margin-left: 2rem;
  margin-right: -1rem;
  shape-outside: circle(50%);

  ${tablet`
    position: absolute;
    right: -8rem;
    bottom: 1rem;
    float: unset;
    margin-left: 0;
    margin-right: 0;
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
    {page.subtitle && page.subtitle.length <= 70 && (
      <Subtitle>
        {!/[.?!]\s*$/i.test(page.subtitle)
          ? `${page.subtitle.trim()}.`
          : page.subtitle.trim()
        }
      </Subtitle>
    )}
  </HeaderWrapper>
);

const IntroductionWrapper = styled('section')`
  margin-bottom: 1.5rem;
`;

const InlineSubtitle = styled('p')`
  font-size: 1.4em;
  color: var(--color-passive);
  font-variation-settings:
    "wght" var(--text-weight-bold),
    "opsz" var(--text-width-headline);
`;

export const Introduction = ({ page }) => {
  if (page.subtitle.length <= 70) return null;

  return (
    <IntroductionWrapper>
      <InlineSubtitle>{page.subtitle}</InlineSubtitle>
    </IntroductionWrapper>
  );
};

export const Avatar = styled('img')`
  display: inline-block;
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--color-active);
  margin: 0.6rem 0;
`;

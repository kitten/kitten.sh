import { Children } from 'react';
import { styled } from 'goober';

import { emphasisPath, emphasisSvg } from './emphasis';
import { sizes, tablet, mobile, desktop } from './theme';

import arrow1Svg from '../assets/arrow-1.svg';
import arrow2Svg from '../assets/arrow-2.svg';
import arrow3Svg from '../assets/arrow-3.svg';

export const FullBleed = styled('div')`
  display: grid;
  grid-template-columns: 1fr min(${sizes.page}px, 100%) 1fr;
  position: relative;
  width: 100vw;
  left: 50%;
  margin-left: -50vw;

  & > * {
    grid-column: 2;
  }
`;

const ImageDescription = styled('span')`
  display: block;
  width: 100%;
  box-sizing: border-box;
  color: var(--color-gray-text);
  max-width: 65ch;
  text-align: center;
  font-size: 0.75em;
  margin: 1rem auto 1.5rem auto;
  padding: 0 2ch;
  opacity: 0.8;

  ${mobile`
    text-align: left;
  `}
`;

const Image = styled('img')`
  margin-top: 2.5rem;
  object-fit: contain;
  width: 100%;
  max-height: 80vh;

  ${mobile`
    max-height: 100vh;
  `}
`;

export const img = ({ src, alt, width, height, layout, className }) => {
  const props = { layout: layout || (!width && !height ? 'fill' : null), className };
  if (typeof src === 'object' && src.srcSet) {
    props.srcSet = src.srcSet;
  } else {
    props.src = `${src}`;
  }

  return (
    <FullBleed>
      <Image {...props} />
      {alt && <ImageDescription>{alt}</ImageDescription>}
    </FullBleed>
  );
};

export const p = styled('p')`
  line-height: 2.5ch;
  margin-top: 0.8rem;

  &:first-of-type::first-letter {
    float: left;
    font-size: 3em;
    font-weight: bold;
    padding-right: 0.4rem;
    line-height: 3rem;
    margin-left: -0.07ch;
    margin-top: 0.5rem;
  }

  p + &, p + blockquote + & {
    text-indent: 2ch;
  }

  & > * {
    text-indent: 0;
  }
`;

export const h2 = styled('h2')`
  display: block;
  width: 100%;
  font-size: 2.2em;
  margin-top: 2.5rem;
  letter-spacing: -0.4px;
  color: var(--color-active);

  ${mobile`
    font-size: 2em;
  `}
`;

const EmphasisUnderline = styled(emphasisSvg)`
  color: var(--color-active);
  position: absolute;
  pointer-events: none;
  width: 100%;
  height: 0.8ch;
  opacity: 0.8;
  bottom: -15%;
  left: 0;
  right: 0;
  z-index: 0;
`;

const EmphasisWrapper = styled('span')`
  position: relative;
`;

const EmphasisText = styled('span')`
  position: relative;
  z-index: 1;
`;

export const h3 = styled(({ className, children, ...rest }) => (
  <h3 {...rest} className={`${className} ${emphasisPath}`}>
    <EmphasisWrapper>
      <EmphasisText>{children}</EmphasisText>
      <EmphasisUnderline />
    </EmphasisWrapper>
  </h3>
))`
  margin: 2.5rem 0 1rem 0;
  font-size: 1.2em;

  ${mobile`
    font-size: 1.2em;
  `}
`;

export const inlineCode = styled('code')`
  position: relative;
  display: inline-block;
  font-size: 0.9em;
  padding: 1px 0.5ch;
  margin: -1px 0;
  color: inherit;
  opacity: 0.8;

  &:before {
    opacity: 0.34;
    position: absolute;
    display: block;
    content: '';
    top: 0;
    right: 2px;
    bottom: 3px;
    left: 2px;
    background: var(--color-box-background);
    border-radius: 4px;
    pointer-events: none;
  }
`;

const toText = children => Children.toArray(children).reduce((acc, child) => {
  return acc +
    (typeof child.props.children === 'string'
      ? child.props.children
      : toText(child.props.children));
}, '');

export const blockquote = styled(props => {
  const text = toText(props.children);
  const startsWithQuote = /^["“]/.test(text);
  const isShort = text.length < 47;
  return <blockquote {...props} data-quote={startsWithQuote || isShort} />;
})`
  color: var(--color-passive);
  line-height: 0.8;
  font-weight: bold;
  letter-spacing: 0.8px;
  padding: 1.3em 0 1.1em 2ch;

  ${desktop`
    &:not([data-quote]) {
      font-size: 1.2em;
      float: right;
      max-width: 70%;
      margin-right: calc(-0.5 * (1200px - 65ch + 10ch));
      margin-top: 0.8rem;
      padding-left: 2em;
    }

    &[data-quote] {
      padding: 0.8em 0 0 2ch;
    }
  `}

  & > p:first-child:before {
    display: inline-block;
    background-color: currentColor;
    width: 4ch;
    height: 0.7em;
    margin-right: 1ch;
    vertical-align: baseline;
    content: '';
  }

  & > p {
    margin: 1rem 0;
    line-height: 1.1;
  }
`;

export const a = styled(props => {
  if (/^https?/.test(props.href))
    return <a {...props} rel="noopener noreferrer" target="_blank" />;
  return <a {...props} />;
})`
  color: var(--color-active);
  text-decoration: none;
  background-size: 100% 1.5px;
  background-repeat: no-repeat;
  background-position: 0 1em;

  transition:
    color 0.2s ease-out,
    background-position 0.1s,
    background-size 0.1s;

  background-image: linear-gradient(
    to bottom,
    var(--color-active) 0%,
    var(--color-active) 100%
  );

  @media (hover: hover) {
    &:hover {
      background-size: 100% 1.1em;
      background-position: 0 0.1em;
      color: white;
    }
  }
`;

export const ol = styled('ol')`
  display: block;
  padding: 0.8rem 0 0.8rem 1ch;
  margin: 0;

  & + ul, & + ol {
    padding-top: 0;
  }

  & > li {
    position: relative;
    margin-top: 0.8rem;
    margin-left: 2ch;
    padding-left: 1ch;
    line-height: 2.5ch;

    &::marker {
      font-weight: bold;
      color: var(--color-active);
    }
  }
`;

export const ul = styled('ul')`
  display: block;
  list-style-type: none;
  padding: 0.8rem 0 0.8rem 1ch;
  margin: 0;

  & + ul, & + ol {
    padding-top: 0;
  }

  & > li {
    position: relative;
    padding-left: 3ch;
    margin-top: 0.8rem;
    line-height: 2.5ch;

    &:before {
      position: absolute;
      left: 0;
      top: 0;
      display: block;
      content: '';
      width: 2ch;
      height: 1em;
      background-size: contain;
      background-position: 0 50%;
      background-repeat: no-repeat;
      margin-right: 1ch;
    }
  }

  & > li:nth-child(3n):before {
    background-image: url('${arrow1Svg}');
  }

  & > li:nth-child(3n + 1):before {
    background-image: url('${arrow2Svg}');
  }

  & > li:nth-child(3n + 2):before {
    background-image: url('${arrow3Svg}');
  }
`;

export const pre = styled('pre')`
  margin: 1.6rem 0;
  font-size: 1.1rem;
  white-space: pre;
  word-wrap: normal;
  word-break: normal;
`;

export const code = styled('code')`
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: antialiased;

  display: block;
  color: var(--color-prism-fg);
  background-color: var(--color-prism-bg);

  white-space: pre;
  word-wrap: normal;
  word-break: normal;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  padding: 0.8rem 2ch;
  margin: -0.8rem -2ch;

  .comment {
    color: var(--color-prism-comment);
  }

  .string, .builtin, .char, .constant, .url, .attr-name {
    color: var(--color-prism-identifier);
  }

  .variable {
    color: var(--color-prism-variable);
  }

  .number {
    color: var(--color-prism-number);
  }

  .punctuation, .function, .selector, .doctype, .tag {
    color: var(--color-prism-punctuation);
  }

  .class-name {
    color: var(--color-prism-class);
  }

  .operator, .property, .keyword, .namespace {
    color: var(--color-passive);
  }

  .boolean {
    color: var(--color-prism-boolean);
  }

  .function, .selector, .doctype, .attr-name, .comment {
    font-style: italic;
  }
`;

import { cloneElement, Children } from 'react';
import { styled } from 'goober';

import { emphasisPath, emphasisSvg } from './emphasis';
import { sizes, notMobile, tablet, mobile, desktop } from './theme';

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

  ${tablet`
    height: auto;
  `}

  ${mobile`
    max-height: 100vh;
  `}
`;

export const img = ({ src, alt, width, height, layout, className }) => {
  const props = { alt, width, height, layout: layout || (!width && !height ? 'fill' : null), className };
  if (typeof src === 'object' && src.srcSet) {
    props.srcSet = src.srcSet;
  } else {
    props.src = `${src}`;
  }

  return (
    <FullBleed>
      <Image {...props} />
      {alt && <ImageDescription aria-hidden="true">{alt}</ImageDescription>}
    </FullBleed>
  );
};

export const p = styled('p')`
  line-height: 2.5ch;
  margin-top: 0.8rem;
  color: inherit;

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

const TableWrapper = styled('div')`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TableCell = styled('span')`
  display: inline-block;
  max-width: 46ch;

  ${mobile`
    max-width: calc(100vw - 2ch);
    width: max-content;
  `}
`;

export const table = styled(({ children, ...rest }) => {
  children = Children.toArray(children);
  if (children.length === 2) {
    const rows = Children.toArray(children[1].props.children).map(row => {
      const children = Children.toArray(row.props.children).map(cell =>
        cloneElement(cell, cell.props,
          <TableCell>{cell.props.children}</TableCell>));
      return cloneElement(row, row.props, children);
    });
    children = [children[0], cloneElement(children[1], children[1].props, rows)];
  }

  return (
    <FullBleed>
      <TableWrapper>
        <table {...rest}>{children}</table>
      </TableWrapper>
    </FullBleed>
  );
})`
  position: relative;
  margin: 2.5rem auto 1.5rem auto;
  padding: 0 2ch;
  max-width: 100%;
  min-width: 69ch;

  ${mobile`
    max-width: unset;
    min-width: unset;
  `}

  border-collapse: separate;
  border-spacing: 0;

  & > * {
    font-size: 0.9em;
  }

  & tr td {
    padding: 0.8rem 1ch;
    border-bottom: 1px solid var(--color-box-background);
    line-height: 2.5ch;
    width: max-content;
  }

  & th {
    padding: 0.5rem 2ch 0.5rem 1ch;
    background: var(--color-prism-bg);
    border-bottom: 1px solid var(--color-box-background);
    border-top: 1px solid var(--color-box-background);

    word-break: normal;
    hyphens: initial;
    font-family: var(--font-heading);
    text-align: left;

    &:first-child {
      border-left: 1px solid var(--color-box-background);
      border-radius: 0.5rem 0 0 0.5rem;
    }

    &:last-child {
      border-right: 1px solid var(--color-box-background);
      border-radius: 0 0.5rem 0.5rem 0;
    }
  }
`;

export const hr = styled('hr')`
  width: 50%;
  margin: 2.5rem auto 1.5rem auto;
  border: none;
  border-top: 2px solid var(--color-active);

  & + p:last-child {
    color: var(--color-gray-text);
    font-size: 1.1rem;
  }
`;

export const h2 = styled('h2')`
  display: block;
  width: 100%;
  font-size: 2.2em;
  margin-top: 2.5rem;
  letter-spacing: -0.4px;
  color: var(--color-active);

  word-break: normal;
  hyphens: initial;

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
  color: inherit;
  z-index: 1;
`;

export const h3 = styled(({ className, children, ...rest }) => (
  <h3 {...rest} className={`${className} ${emphasisPath}`}>
    <EmphasisWrapper>
      <EmphasisText>{children}</EmphasisText>
      <EmphasisUnderline aria-hidden="true" />
    </EmphasisWrapper>
  </h3>
))`
  margin: 2.5rem 0 1rem 0;
  font-size: 1.2em;
  color: inherit;

  ${mobile`
    font-size: 1.2em;
  `}
`;

export const inlineCode = styled(props => (
  <code {...props}>
    {props.children === '\\|' ? '|' : props.children}
  </code>
))`
  position: relative;
  display: inline-block;
  font-size: 0.9em;
  padding: 1px 0.5ch;
  margin: -1px 0;
  color: var(--color-text);
  opacity: 0.8;

  word-break: normal;
  hyphens: initial;
  hanging-punctuation: initial;

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
  if (!child || !child.props) return acc;
  return acc +
    (typeof child.props.children === 'string'
      ? child.props.children
      : toText(child.props.children));
}, '');

export const blockquote = styled(props => {
  const text = toText(props.children);
  const isPullQuote = text.length >= 47 && !/^["“]/.test(text);
  return (
    <blockquote
      {...props}
      role={isPullQuote ? 'presentation' : null}
      aria-hidden={isPullQuote ? 'true' : 'false'}
      data-quote={!isPullQuote}
    />
  );
})`
  color: var(--color-passive);
  line-height: 0.8;
  font-weight: bold;
  letter-spacing: 0.8px;
  padding: 1.3em 0 1.1em 2ch;

  word-break: normal;
  hyphens: initial;
  hanging-punctuation: initial;

  &[data-quote] > *:first-child {
    margin-top: 0;
  }

  ${desktop`
    &[data-quote] {
      padding: 0.8em 0 0 2ch;
    }
  `}

  ${notMobile`
    &:not([data-quote]) {
      font-size: 1.2em;
      float: right;
      max-width: 70%;
      margin-right: calc(-0.5 * (1200px - 65ch + 10ch));
      padding: 1.5rem 0 1rem 2ch;
      shape-outside: padding-box;
      margin-top: 0;
    }
  `}

  ${tablet`
    &:not([data-quote]) {
      max-width: 50%;
      margin-right: calc(-0.5 * (100vw - 65ch + 10ch));
      padding-right: 1ch;
    }
  `}

  ${mobile`
    &:not([data-quote]) {
      display: none;
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
  background-size: 100% 1.4px;
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

  @media (prefers-reduced-motion) {
    &, &:hover {
      transition: none;
    }
  }

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
  margin: 2.2rem 0;
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

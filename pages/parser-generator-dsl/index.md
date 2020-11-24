---
title: Parser Generator DSLs
subtitle: Building Parsers from Babel Macros and JS template literals
cover: /covers/reghex.jpg
excerpt: >-
  Parsers are fascinating and in the JavaScript ecosystem they're all around us. With Babel Macros
  tagged template literals can do more than just embed DSLs, they can be precompiled to become generated
  code. Let's look at how I built RegHex which let's you create parsers right in your JS code.
published:
  live: false
  date: 2020-11-24
  handle: '_philpl'
  avatar: /avatars/phil.png
---

Ever since I started working on _styled-components_ I've been fascinated by parsers. Writing a plugin for
Webpack or Babel for the first time felt like pure magic, especially if the plugin doesn't just transpile
some code for compatibility reasons or adds some metadata, but instead generates entirely new code
or enables functionality that just isn't feasibly implemented as runtime-only code.

These days as JavaScript developers parsers are all around us. When we're starting up a
Webpack or Rollup process Acorn parses our code in the background. When we're using a CSS-in-JS
library then there's a good chance [stylis](https://github.com/thysultan/stylis.js) is parsing our
CSS code. When we're using GraphQL the reference implementation's parser diligently does its work
in the background.

To me, nothing exemplifies this **omnipresence of parsers** more than ["Babel
Macros"](https://github.com/kentcdodds/babel-plugin-macros), which is a Babel plugin that in
itself runs other plugins, which are embedded in special npm packages, called "macros". Very meta.
With macros, a package can feasibly appear as if it was just a JS library, but use the full
power of compile-time transpilation without us having to update our Babel config.
For example, `eval.macro` evaluates JS code inside tagged template literals during compile-time.
**Tagged template literals** were actually even meant for embedding domain specific languages
("DSLs") into JavaScript, as Dr. Axel Rauschmayer writes [in his post on
them](https://2ality.com/2011/09/quasi-literals.html):

> "In ECMAScript 6, template strings are a syntactic construct that facilitates the implementation
> of embedded DSLs in JavaScript."

Given that macros can be used ad hoc to transpile any code, including tagged template literals,
just by using importing a package, plugins like `eval.macro`, which itself technically embeds
JS into JS, can pre-compile some of their functionality:

```js
import eval from 'eval.macro';

// using the macro this:
const val = eval`7 * 6`;
// …turns into this:
const val = 42;
```

Parsers are indeed all around us and frequently grant us _amazing new abilities_. But if we look
at the state of the JavaScript ecosystem from the perspective of native, compiled languages we
may notice that we can go a step further than this with **metacompilers**, which is a fancy
category of programs that also includes **parser generators**.  Parser Generators — an example
for JavaScript being [peg.js](https://pegjs.org/) — allow us to write a parser in a DSL, which
often looks similar to regular expressions, and subsequently generate the parser itself automatically.

> Parser Generators allow us to write a parser in a DSL, which often
> looks similar to regular expressions, and subsequently output the parser itself automatically.

This on its own is pretty interesting knowledge, but knowing Babel Macros, I was wondering
whether it was feasible to create a macro that allowed me to write _parsing grammar_ in a tagged
template literal and compiles it to a parser. If my parser generator would be able to output
compact code that is still reasonably fast, it'd make itself very useful to create small & quick
DSLs that can be run in the browser. Let's look at how I built
[RegHex](https://github.com/kitten/reghex)!

## Creating an Implementation Plan

When jumping into a complex project like this, I typically start out at both ends of the process
and ask myself, "What should the library's API look like?" and "What are the small implementation
details I need to know before I start coding?"<br />
However, planning and actually starting are two
steps that due to procrastination take me quite... a considerable amount of time.

For this project I came up with the rough idea for it about a year ago in 2019. I then wrote the
first API design draft in April 2020, and implemented the library a month later in May 2020.
I was pretty excited about the idea and have no excuses for this, so let's just move on. The
first draft for the **API design** looked something like the following:

```js
const identifier = match('identifier')`
  ${/[-\w]+/}
`;

const string = match('string')`
  ( ${/"[^"]*"/} | ${/'[^']*'/} )
`;

const values = match('values')`
  ( ${identifier} | ${string} )*
`;
```

The API's general idea is to expose a `match` function that is called with a parsing grammar's
name. It then is called as a tagged template literal with a regular expression-like grammar,
which contains interpolations with either regular expressions or other grammars. The output
of `match` can then be used to start parsing a string and will return an abstract syntax tree ("AST").

While parsing `match` can be used with regular expressions as interpolations to _match_ a given
part of the input string at the current parsing position. Outside of the interpolations we can
use the regular expression syntax we're already familiar with to express parsing logic, e.g.
`|` for matching something else if the first part of a group didn't match, or `*` to allow for
multiple matches.

### Parser Combinators

This initial draft revealed a crucial difference to a regular parser generator. Because I chose
to embed the parsing grammar into JS code via a tagged template literal, the draft started looking
like a "parser combinator". In short, [parser combinators](https://en.wikipedia.org/wiki/Parser_combinator)
are functions that accept other parsers as inputs and return a new parser.
In this case `match`'s template optionally accepts other `match` parsers as interpolations.

<img
  src={require('./parser-combinators.png')}
  width="450" height="400"
  alt={`The grammar in the draft API states that either an
    identifier or a string matches as often as possible, while
    the two are grammars of their own too.`}
/>

> In short, parser combinators are functions that accept other parsers as inputs and
> return a new parser.

This allows a larger grammar to be built up and bits of the grammar to be reused without writing
a larger definition in one piece, which generates smaller bits of code in the macro and makes
the tagged template literals feel more cohesive in our JS code. To me, this looks like a similar
pattern to how styled-components splits up CSS for separate components, each rendering a single
element with their own styles.

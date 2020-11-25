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
element with their own styles. :star-struck:

### Sticky Regular Expressions

The parser generator so far works by creating smaller pieces of grammar, defined by interpolating
other small matching grammars or regular expressions into it. However, while writing a small
parser with regular expressions is something that quite a few people have done before, doing
so without skipping over any characters in the input string is crucial.

Typically, regular expressions will scan an input string until they've found a match, which
is both costly and counter to how a parser works. Luckily in ECMAScript 6 the
["sticky flag"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky)
for regular expressions was added, which forces the regular expression to match only at its
exact position, rather than starting to scan the string for matches:

```js
const regex = new RegExp('hi', 'y');
const input = 'oh hi';

regex.lastIndex = 0;
regex.exec(input); // null

regex.lastIndex = 3;
regex.exec(input); // ['hi', index: 3]

regex.lastIndex; // 5
```

Since regular expressions carry a `lastIndex` property that specifies _where they should match_,
and move this index along if they have matched a part of the input string, this lends itself
very well to building a continuous parser combinator that consists mostly of regular
expressions and some branches and loops.

## The Parser Generator's DSL's Parser

Starting the implementation of this parser generator, this is where things become _meta_. Since
the `match` API I've outlined is in itself a language that looks like regular expression syntax.
I had to get to writing a small parser for it. The fascinating part about this parser is that
the syntax is very reduced and hence the parser was quite small.
I kept the grammar overall as simple as possible while supporting the operators I'm used to from
regular expressions, so at the very least I had to add _quantifiers_, various types of groups,
and alternations. Furthermore RegHex's DSL ignores whitespaces for
readability which is a nice, small touch. Here's a small overview of the non-obvious operators:

| Operator      | Description                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `?`, `+`, `*` | A **quantifier** may be used to change how many matches are accepted, in order: one or none, one or more, or any amount.                                                                 |
| `\|`          | An **alternation** can be used to match either one thing or another, falling back when the first interpolation fails.                                                                    |
| `(?: )`       | A **non-capturing group** is like a regular group, but the interpolations matched inside it don't appear in the parser's output.                                                         |
| `(?= )`       | A **positive lookahead** checks whether interpolations match, and if so continues the matcher without changing the input. If it matches, it's essentially ignored.                       |
| `(?! )`       | A **negative lookahead** checks whether interpolations _don't_ match, and if so continues the matcher without changing the input. If the interpolations do match the matcher is aborted. |

As shown, the grammar won't have many features, however, the most important one are undoubtedly
alternations, since a parser that can't match several alternative patterns won't be able to
express any languages. To look at an example of this DSL in use, here's a grammar which matches strings of repeated
"this"s and "that"s:

```js
const thisThat = match('thisThat')`
  (?: ${/and/})
  (
    ((?! ${/.*that/}) ${/this/}+)
    | ((?! ${/.*this/}) ${/that/}+)
  )
`;
```

This snippet will only match a given input if it starts with "and", however "and" is in a
non-capturing group and won't be output to the AST node. It then matches either a repetition
of "this" or a repetition of "that". There are negative lookahead groups which will make
sure that we _don't unnecessarily start matching_ if any of the repeated sequences contain
both "this" and "that".
Given that this is very similar to the behaviour of regular expressions and fairly
concise this made me pretty optimistic in that this would be a usable syntax and API.

<img
  src={require('./long-parse-grammar.png')}
  alt="A diagram of our longer grammar of the matcher as shown in the code snippet above."
/>

## Generating the parsing code in Babel

The last part of the endeavour was writing the actual Babel plugin code which would pick
up all written grammars and replace them with parsing code. While writing the Babel code
itself isn't too hard, since I wrote a couple of Babel plugins before, since one of the
goals was to generate small & quick code deciding _what code_ to generate proved to be a
little tricky. I decided early on that "generating small code" would mean that each
`match` should be compiled to only **a single function**.

There are a lot of places in the parsing grammar where one part of the match may be
unsuccessful and will jump to another. This can happen for instance if a group is
optional or if we have an alternation inside a group, which all means that there
may be nested interpolations that the generated function will start to match and,
after failing, may give up on while continuing with another part of the grammar.

```js
import match from 'reghex/macro';

const parser = match('parsed')`
  (\${1} \${2}+) | ${3}
`;
```

For instance, given the above code the grammar may match `1` and then repeatedly `2`.
However if at any point of the first part this grammar fails to match against the
input string, the function will still need to attempt to match `3`.

### Labelled Statements to the rescue!

As it turns out, if we need to only output a single function for this parsing
grammar, there exists only one unlikely solution to the problem, and this solution
is — what I'd consider — quite an archaic language feature in JavaScript:
**Labelled Block Statements**.

We may not see this very often in handwritten JavaScript code, but any loop
or block may be annotated using a label. Once we have a label we may break
out of it by calling `break`. As [MDN puts it in their explanation of labelled
statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label)
though:

> "Labeled loops or blocks are very uncommon. Usually function calls can be used instead of loop jumps."

So in conclusion, they're quite useful for generated code that is trying to
avoid additional functions in its code output. However if you use labels in
your own code it's very likely that a reviewer may just either complain or even
exclaim in confusion. :shrug:

The Babel [code](https://github.com/kitten/reghex/blob/1d76d26/src/babel/generator.js)
I ended up writing shouldn't be a surprise — although it is a bit of a mess — and
structures each part of the grammar's feature into its own "Node Class" which
is specialised in accepting a part of [the parsed meta DSL](#parser-combinators). It
recursively creates groups of nodes like `QuantifierNode`, `AlternationNode`,
or `GroupNode`.

The eventual output looks like following. This code snippet is annotated and
modified to be easier to read:

```js
import { _exec } from "reghex";

const parser = function _parsed(state) {
  // This creates the AST node, which is an array with a tag
  const node = [];
  node.tag = "parsed";

  let last_index = state.index;
  let match;

  // This "block_0" contains the first group of our grammar
  block_0: {
    var index_0 = state.index;
    var length_0 = node.length;

    // We first attempt to match "1"
    if (match = _exec(state, /1/y)) {
      node.push(match);
    } else {
      // If we fail, we restore the node as it was, and break out of "block_0"
      node.length = length_0;
      state.index = index_0;
      break block_0;
    }

    // We then attempt to match "2" repeatedly
    loop_1: for (var i = 0; true; i++) {
      var index_1 = state.index;

      // Note that the matching itself is done the same, even in a loop
      if (match = _exec(state, /2/y)) {
        node.push(match);
      } else {
        // If we had results we're good and can end the loop
        if (iter_1) {
          state.index = index_1;
          break loop_1;
        }

        // If we didn't, we again restore the node, and break out of "block_0"
        node.length = length_0;
        state.index = index_0;
        break block_0;
      }
    }

    // If we get here the first group matched. Success!
    return node;
  }

  // This is the second part of our grammar, where we attempt to match "3"
  if (match = _exec(state, /3/y)) {
    node.push(match);
  } else {
    // there's nothing left anymore since the grammar is over
    // restore the the index from before any matchers ran and return
    state.index = last_index;
    return;
  }

  // We matched a "3". Success!
  return node;
};
```

In general, [each sequence that RegHex generates](https://github.com/kitten/reghex/blob/1d76d26/src/babel/generator.js#L334-L346)
follows this same pattern of setting up a block, adding the prior index and node length to it,
and then adding in the rest of the grammar recursively. It passes on a `break` statement to
the lower nodes, which those can use to break out of the block.

> If you use labelled block statements in your own code it’s very likely that a
> reviewer may just either complain or even exclaim in confusion. 🤷

The trickiest part here is to actually _read_ the code that the generator outputs,
as it's clearly not very readable for people. However, I believe it's the **most
compact** code that can be generated given the requirements — and [Google's Closure Compiler](https://developers.google.com/closure/compiler)
agrees! Closure Compiler actually outputs labelled block statements when inlining some
functions into loops quite frequently as well. In fact, when I tried to _handcode_ a grammar
with inline functions, Closure Compiler turned those back into labelled block statements.

## How does RegHex do?

From an implementation standpoint, I'm quite pleased with the result. The API
that I ended up with uses a lot of different ideas and language features all
in a single project, which I've always found to be best for good learning
experiences. If you've read this far this post has already covered:

- Tagged Template Literals
- Parser Combinators
- Sticky Regular Expressions
- Labelled Break Statements

And to put RegHex through its paces, I wrote down the grammar for the entire GraphQL
query language using it, which is published as
[`graphql-parse`](https://github.com/kitten/graphql-parse). The file that contains
the grammar is about _300 lines_ long and given that the implementation
uses regular expression the compiled output comes in at only **2.6kB**
(minified and gzipped).

<img
  src={require('./graphql-parse.webp')}
  alt="Because it looks nice and fits. The graphql-parse bundle in one image. Ok, old joke thanks to Jason Miller."
/>

Running some benchmarks reveal that, probably due to the non trivial overhead of
regular expressions in JavaScript, the performance of this parser is a third of
the reference implementation. This is a little better than I expected given that
RegHex is still a good tool for prototyping and creating small parsers quickly.

### What does the future hold?

It's worth noting that RegHex could also [support parsing entire tagged template
literals](https://github.com/kitten/reghex/issues/2), which would increase the
level of metaness even more, since it'd allow RegHex to be used to generate
its own DSL's parser.

RegHex also doesn't support errors very well, since it doesn't unroll a nice
error message to where the match ultimately failed, which means that parsers
that are implemented using it may not give any useful hints as to what went
wrong at all.

However, given how many concepts this one code base touches it was still a worthwhile
proof of concept to write, no matter the shortcomings.<br />
**[Check out the code, if you'd like to learn more even more about it!](https://github.com/kitten/reghex)**

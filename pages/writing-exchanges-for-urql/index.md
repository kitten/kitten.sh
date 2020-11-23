---
title: In-depth Guide to Exchanges in urql
subtitle: Writing & Learning Exchanges from scratch
cover: /covers/interchange.jpg
excerpt: >-
  Like many Open Source projects that deal with complex state management or data fetching, no week goes
  by without usage questions or requests for help or advice — how to fix a bug or an error, how to work
  with some of our documented features, or how something actually works.
published:
  date: 2020-11-24
  handle: '_philpl'
  avatar: /avatars/phil.png
---

Like many Open Source projects that deal with _complex state management_ or _data fetching_, no week goes
by without usage questions or requests for help or advice — how to fix a bug or an error, how to work
with some of our documented features, or how something actually works. But approximately every week or
so I see discussions on `urql`'s [discussion board](https://github.com/FormidableLabs/urql/discussions)
(or our issues in the past) with a question that goes beyond a typical request for help or for advice.

They're often worded like feature requests and ask for behaviour that's outside of what `urql` offers
out-of-the-box or as part of our officially maintained, first-party packages. What the posters often
don't realise at that point is that they actually are posting a very clear idea already. If they know
about our "exchanges" already, they may suggest that their idea could be written as one.

> What the posters often
> don't realise at that point is that they actually are posting a very clear idea already. If they know
> about our "exchanges" already, they may suggest that their idea could be written as one.

What's usually suggested is a feature that alters the behaviour and data flow or `urql` in a wide-reaching
manner. And if the poster isn't aware of exchanges, I'm usually prepared enough to post a quick explanation
of how those can help them implement their desired feature. However, what's become clear to me recently
is that I'm not prepared enough to give everyone a clear guide on how to **get started** with exchanges.

Our documentation attempts to thoroughly explain how exchanges work, what their type signature must
be, and — in theory — everything else that's required to write exchanges, but, alas, people aren't
machines of course and given that technical documentation only excels at explaining the prerequisites
and boundaries of implementations but not **teaching**, I feel there isn't any comprehensive resource
that we've put out there that actually walks you through how to write exchanges.

## Why Exchanges exist

Exchanges are responsible for performing the important transform from the operations (input) stream
to the results stream. Exchanges are handler functions that deal with these input and output streams.
They're one of urql's key components, and are needed to implement vital pieces of logic such as
caching, fetching, deduplicating requests, and more. In other words, Exchanges are handlers that
fulfill our GraphQL requests and can change the stream of operations or results.

<img src={require('./good-boi.jpg')} alt="Some guy with his good boiii." />

The default set of exchanges that @urql/core contains and applies to a Client are:

- `dedupExchange`: Deduplicates pending operations (pending = waiting for a result)
- `cacheExchange`: The default caching logic with "Document Caching"
- `fetchExchange`: Sends an operation to the API using fetch and adds results to the output stream
- some others in separate packages

### Exchange Signatures

Exchanges are akin to [middleware in Redux](https://redux.js.org/advanced/middleware) due to the way that they apply transforms.

```ts
import { Client, Operation, OperationResult } from '@urql/core';

type ExchangeInput = { forward: ExchangeIO; client: Client };
type Exchange = (input: ExchangeInput) => ExchangeIO;
type ExchangeIO = (ops$: Source<Operation>) => Source<OperationResult>;
```

The first parameter to an exchange is a forward function that refers to the next Exchange
in the chain. The second second parameter is the Client being used. Exchanges always
return an `ExchangeIO` function (this applies to the forward function as well),
which accepts the source of Operations and returns a source of Operation Results.

> "The Client accepts an exchanges option that defaults to the three default
> exchanges mentioned above. When we pass a custom list of exchanges the Client uses the composeExchanges utility,
> which starts chaining these exchanges."

In essence these exchanges build a pipeline that runs in the order they're passed;
Operations flow in from the start to the end, and Results are returned through
the chain in reverse.

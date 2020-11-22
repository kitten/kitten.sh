---
title: In-depth Guide to Exchanges in urql
subtitle: Writing & Learning Exchanges from scratch
cover: /covers/interchange.jpg
excerpt: >-
  When your car has an odd noise at a specific speed in inclement weather, it’s frustrating yet
  forgettable. When the car won’t start in the morning, though — or, perhaps worse, when it randomly
  won’t start even after repairs for seemingly no reason — it’s maddening.
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

---
title: Caching Relational GraphQL Data
subtitle: urql Graphcache's cache mechanisms explained
published:
  live: false
  date: 2020-11-28
  handle: '_philpl'
  avatar: /avatars/phil.png
---

When I see essays on why to build new apps with [GraphQL](https://graphql.org/), most of them
generally seem to promote two main reasons. Querying data from GraphQL gives us the perfect
relational shape of data, and this data, like with a surgical knife, is cut precisely to which
fields we've requested, theoretically reducing the payload of what is sent. Those who've worked
longer with GraphQL, however, may give a more succinct analysis of its benefits; its schema's
self-documenting nature, strongly typed constraints with custom scalars, and, if it's properly
cared for, it may replace the maintenance of multiple "backends for frontends" (BFFs), the
concept of creating an intermediary API that shapes data from other data sources into a new
API that caters for a specific team or application's data requirements. A perfectly **balanced** API.

However, I believe this can be distilled even further to its consequence on how we build APIs
_and_ apps. GraphQL maps data sources into a schema that encodes both business logic and
relations into a single API, which only leaves our apps, the consumers of a GraphQL API, to almost
purely map this data to UI structures or views.

This sounds rather innocent but GraphQL's strengths lie in how it pairs with today's architecture
of rich web applications nicely. With the rise of React most developers adopted patterns where
application data flows **unidirectionally**, from top to bottom, with UI state being added in deeper
in their apps' structure. An app that follows this pattern embraces its structure as a graph or tree
more than its similarity to MVC ("Model View Controller" pattern).
GraphQL's ideas may individually not be new but it is comprehensive in guiding and extending
_the unidirectional flow of data_ from its sources through a schema via a query to our apps' UI.
The ingenuity of complementing the unidirectional nature of our apps on the API-side is what should
be the biggest selling point of GraphQL.

<img
  src={require('./unidirectional-data-flow.png')}
  alt="GraphQL's queries pairs nicely into the mantra of unidirectional data flows."
/>

**GraphQL Clients** fulfil a large responsibility in this system. They bridge the gap from querying
this interconnected data to injecting it into an app's data flow, making this domain-crossing
transition of data seamless. However, rich client apps often show another requirement, which is
to treat relational data as such, and [normalise this data as we frequently do in
Redux](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape).
Normalised data stores exploit the relational shape of our data to ensure that no piece of data
is duplicated and updates are distributed across an entire app. In GraphQL, this means that
different queries and mutations may have to update one another automatically.

> The ingenuity of complementing the unidirectional nature of our apps on the API-side is what
> should be the biggest selling point of GraphQL.

APIs typically send data in a more or less denormalised form to optimise delivery — in GraphQL our
queries mean that all data is highly relational and denormalised. In a rich web app we'd typically
normalise that data when storing it, putting it into relational "tables" keyed by a primary key
and denormalise that data again when it is read from our UI's app tree.
In GraphQL **normalised caches** automate this process of normalising and re-denormalising the
API's data, guided by query documents and types, and ensure that queries and mutations can affect
and update each other _automatically_.

This automatic normalisation enables the seamless unidirectional flow of relational data from data
sources through a GraphQL API to a frontend app, with little developer intervention. While this
magic-like feature is often hidden away, let's explore how it is transparently and intuitively
implemented in [`urql`'s normalised cache](https://formidable.com/open-source/urql/docs/graphcache/),
and work our way from the basics all the way to how we can stack more benefits on top of this base idea.

## Normalising relational data

The principles of normalising relational data as it's pulled from an API are the same, no matter
whether we're dealing with a GraphQL API, a RESTful API, or any other API. This also closely
resembles structures in relational databases, which isn't a coincidence, since we're dealing
with "entities" identified by primary keys that are linked together.

> "Collectively, multiple tables of data are called relational data because it is the relations,
> not just the individual datasets, that are important."<br />
> — [R for Data Science](https://r4ds.had.co.nz/relational-data.html)

In GraphQL we write schemas with types that have fields returning either scalars or other types.
As data is built up and resolved on our API these relations and scalars are copied into nested,
denormalised JSON data, which the API receives matching the query document it has sent. For a
normalisation to take place this **hierarchical nested data** needs to be stored into **flat
tables**, or records. For that, the cache needs information on the types of the data and an
ID to index the objects (or "entities") by a **primary key**.

If we wrote normalisation code for a REST API the responses' structures are known per endpoint
and we'd write our code to make assumptions based on that. This is for instance the underlying
principle of [normalizr](https://github.com/paularmstrong/normalizr) a library that normalises
JSON data by having you write a schema definition for it.  However, in GraphQL, the responses'
structures are _dynamic_ and change depending on the query document, so it isn't possible to
automatically assume a type for any given field. Clients solve
this by using two things: the query document itself and ["Type Name
Introspection".](http://spec.graphql.org/June2018/#sec-Type-Name-Introspection)

With _Type Name Introspection_ a query document may contain the special `__typename` field on
any selection set to inquire the API about the type of a returned entity. If we query an API
for a type `Item` and add the `__typename` field to our selection then the GraphQL API will
respond with the `"__typename": "Item"` record on the response. The normalised cache can add
this field to any outgoing query's selection sets automatically and thus retrieve all of the
response's type information on the fly.

We also know that any response must match the query document the API received, which we can
use to our advantage to traverse the response as it's also traversing the query. Furthermore,
they way a query is written it already says a lot about the response. If a field has no
selection set it's typically a scalar, e.g. `{ createdAt }`, and if a field has a selection set
it's likely a relation to another entity, e.g. `{ todo { id } }`.

Lastly, the normalised cache needs to be able to generate a _primary key_ for each entity.
[Relay enforces](https://relay.dev/docs/en/graphql-server-specification.html#object-identification)
that types on a schema must all have an `id` field with a globally unique ID. Apollo and
Graphcache on the other hand assume that a type _may_ have either an `id` or `_id` field,
by default, and that the query document always includes it, though the specific keying
function is configurable by type in either though.

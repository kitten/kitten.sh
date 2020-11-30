---
title: Caching Relational GraphQL Data
subtitle: urql's normalised cache mechanisms explained
published:
  live: false
  date: 2020-11-30
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

<img
  src={require('./query-document-info.png')}
  width="450" height="354"
  alt="Normalisation can be based on types, keys, and relations, which can be assumed by the presence of selection sets in query documents."
/>

### Traversing a Query Document

A query document contains an operation and often fragments, defining **nested selection sets of
fields**. A normalised cache traverses the selection sets both when writing results from the API
and when generating results from its cached data. The structure of [GraphQL.js'
types.](https://github.com/graphql/graphql-js/blob/cd273ad136d615b3f2f4c830bd8891c7c5590c30/src/language/ast.d.ts#L108-L151)
An `OperationDefinitionNode` contains a `SelectionSetNode`, which may contain `FragmentSpreadNode`s
and `InlineFragmentNode`s, or `FieldNode`s which may again contain a selection set.

The traversal of GraphQL types in a document, a result's structure, and the relations that
a cache stores all mirror each other. Traversing a `SelectionSetNode` as part of writing
or reading normalised data is the most intensive part of the normalised cache. Here, during
the writing process, we may differentiate between fields that contain scalars (or "records"
in Graphcache) and fields with selection sets that lead to other _entities_, so relations,
and store both in our data structure. During the reading process, where the normalised cache
attempts to create a result just from its cached data the cache can use the relations it has
stored, when it reaches a nested selection set, to traverse the query document and the relations
in its cache in tandem.

> The traversal of GraphQL types in a document, a result's structure, and the relations that
> a cache stores all mirror each other.

A special case here is **"embedded data"**. Not all types in GraphQL have keyable fields.
Some may just abstract scalar-like data or simply add nested data to its parent type. For
instance, an `Image` type may just exist locally but contain fields for URLs, image formats,
dimensions, or other data. If a normalised cache encounters an unkeyable type it may embed
it inside the parent entity. This means that, like a scalar, it becomes only reachable from
its parent's field on which it was originally found. Caches have varying approaches to
storing _embedded data_, but Graphcache still treats it as a relation and creates a key based
on the parent's key and the current field.

### Normalised Data Structures

At its core, normalising data means that we take individual fields and store them in a table, in our
case we'd store all values of fields in a dictionary of their primary key, generated from an ID or other
key and type name and the field's name and arguments, if it has any.

| Primary Key | Field | Value |
| --- | --- | --- |
| Type name and ID / Key | Field name (not alias) and optionally arguments | Scalar value or relation |

How this data is stored in normalised caches differs from one implementation to another.
Graphcache itself went through _three different phases_, where we optimised and iterated on
its internal data structure and how it stores GraphQL data. Currently the data structure
compares to and resembles tables as seen in relational databases quite closely. It stores
each entity as a record object of its fields and this object is stored separately in a `Map`
of primary keys.

```js
Map {
  'Item:123': Record {
    __typename: 'Item',
    id: '123',
    name: 'Generic Example',
    'description({"short":true})': 'Generic...'
  }
}
```

In this data structure a `Map` is used to index entities by its primary key. Each entity
is stored with all its fields. The fields are keyed not only by their names but also by
a JSON string of their arguments, if the fields have any. Previously, Graphcache used to
store all this data on a flat `Map` (and later [a HAMT
tree](https://en.wikipedia.org/wiki/Hash_array_mapped_trie)), but we found that this more
nested structure pairs well with how JavaScript engines optimise for consistent shapes of
objects.

Furthermore, it may be surprising that this data structure is directly mutated rather than
being an immutable structure. Graphcache always copies data from its cache on reading a
query, so each query result it generates is a fresh result unrelated to the cached data
or to a previous result.

This data structure is beneficial for storing records, but it's also used to store relations,
which Graphcache calls "links", which are stored separately, since they can also be identified
separately on query documents by the presence or absence of selection sets on fields.

```js
Map {
  'Query': Record {
    'item({"id":"123"})': 'Item:123',
    'item({"id":"123"})': null,
    'items': ['Item:123'],
  },
  'Item:123': Record {
    creator: 'Author:123'
  }
}
```

A _separate table_ of entities stores just the fields that contain **relations** to other entities.
Here we can also first see the `Query` root type from which queries originate. Links from one
entity to another may be represented by a single key, but when a relation is to an array of
entities the data structure stores an array of keys. Any field in GraphQL that isn't marked as
required may also be nullable, so any link may also be set to `null`.

### Are all updates automatic?

While normalised caches store and update entities in a location, which means that all changes
to an entity are shared across queries, an API makes a lot of implicit changes to the relations
of data as it runs. For instance, when an item is created a cache won't know how a list of this
item may change and it won't automatically know to add the item to this list.

As I've mentioned earlier, a configuration option exists to alter the keys that are generated for
entities by type. Other configuration options exist to step into Graphcache's traversal process
as data is either read or written to the cache. It's common in GraphQL caches and clients to have
options available both to tell the cache how to assume a relation exists and to update relations
as needed after mutations (or subscription events.)

```js
{
  resolvers: {
    Query: {
      todo: (_parent, args) => ({ __typename: 'Todo', id: args.id })
    }
  }
}
```

When an entity is traversed, Graphcache also looks at a configuration option that's called
`resolvers`, which can alter the value of a field dynamically without interrupting the cache's
traversal process. This is a pretty powerful concept as it may "interleave" results from the
resolver and the cached data. The example shows the simplest resolver which relates the
`Query.todo` field to a `Todo` item which allows the cache to lookup the item even if it
hasn't seen the relation from an API result before.

The interleaving of resolver results come into play when the resolver's result contains additional
fields that aren't used just for keying. In that case it may override the value of fields even
if the fields are cached. This is particularly useful to [perform
pagination](https://formidable.com/open-source/urql/docs/graphcache/computed-queries/#pagination),
where several pages are merged into an "infinite list" of results.

Similarly to `resolvers`, the traversal process for mutations may also be altered by adding
`updates`. The configuration option may be used to update queries or fragments separate from
any query that the cache is currently running. This spawns a nested traversal that ad hoc starts
traversing the cache separately. The data that a method like `cache.updateQuery` allows the user
to update is a fresh copy, as previously mentioned, so it's even safe to mutate it:

```js
{
  updates: {
    Mutation: {
      addTodo: (result, args, cache, info) => {
        cache.updateQuery({ query: TodosQuery }, data => {
          data.todos.push(result.addTodo);
          return data;
        });
      }
    }
  }
}
```

What we're hoping from these configuration APIs is that they're obvious enough to feel trivial.
They're modelled to imitate the GraphQL resolvers that are found on the backend. Personally, I
feel that having configurations for keys, resolvers, and updaters on the cache that all seem
related and inituitive is a big win from an API design standpoint. They each represent a
_specific step_ in the traversal and caching process.

We also early on made the decision to keep these configuration options centralised. These
options represent how data is cached and closely represent the application data as the API
presents it. By keeping this configuration central and closely related to the schema, rather
than queries or the UI, the cache **imitates the API** ever more closely.

### Doing better with more information.

As we can see, a normalised cache can do a lot with just the bare minimum of type information,
with type name introspection via the `__typename` field. So it's worth asking at this point
whether we can do any better given that GraphQL has a whole schema worth of information about
its data graph. What can we do if we give Graphcache, say, the entire schema?
[Mikhail Novikov's talk about GraphQL clients](https://youtu.be/QvYEal9C8tI?t=1060) contains
a mention of this concept, which really stuck with me:

> "We can make the cache know more about the API. [...]
> The way to make better caches is to have more metadata."
> — Mikhail Novikov

While this talk presented the idea of adding more metadata _on top_ of the existing schema with
directives as additional annotations, I felt that the existing dynamic GraphQL clients of the
time didn't even use that information efficiently. And one feature that can be implemented with
more metadata from the schema are **partial results**.

While retrieving data from the cache there are a lot of opportunities for cache misses. Thinking
of the most basic app examples, having a list page go to a details page is pretty common, and
furthermore, displaying (and hence querying) more data on the details page than for the list
is also commonly found. But how can a GraphQL client deal with displaying the details page
sooner? By displaying some of it, as best as it can.

When a `schema` is passed to Graphcache it receives metadata on which fields of a schema are
optional. Given that a lot of GraphQL apps we're seeing now use TypeScript with type generation
Graphcache then encounters a missing field in its cache, it does exactly what the `graphql`
execution would on the server-side, it sets the field to `null` if it's optional or cascades
the cache miss upwards until either the query itself is a cache miss still or it finds a nullable
field.

<img
  src={require('./partial-results.png')}
  alt="A query may display stale partial data without waiting for the full result to be available."
/>

This is one of the more "extravagant" features in Graphcache, but based on what I personally have
experienced when building apps and heard from people who are starting from scratch with GraphQL,
it was a grievance for some, and the intention of **partial results** is to make it easier to
progressively improve the user experience of our apps. It also is one of the defining features
that pushed us to add **Offline Support**!

## Optimistic Ordering and Layers

There are two more features that I was leaving out so far that enable us to do one more thing™.
In Graphcache we went so far as to add [Offline
Support](https://formidable.com/open-source/urql/docs/graphcache/offline/) back in June 2020,
and it's two important features that enabled us to do this:

- **Optimistic Updates**, which allow mutations to optimistically make changes to the cache's data
  immediately, before a request is even sent to the API.
- **Commutative Data Layering**, which ensures that results from the API are applied in order,
  even if they arrive in a varying order.

Both of these features were vital for us to allow **Offline Support** to be added while
keeping the developer experience neither complicated nor confusing. When this mode of Graphcache
is used a `storage` engine may be passed (the default one uses IndexedDB) which persists
results and queued mutations. When the client is offline then Graphcache is able to continue
delivering fully cached or patial results as best as it can, while when it's online it
continually persists data.

### Optimistic Updates

"Optimistic Updates" are a feature that we've added almost right at the start of implementing
Graphcache as it has become an almost standard feature of GraphQL normalised caches. With
_optimistic updates_ a `optimistic` configuration option may be passed to Graphcache that
tells the cache how to generate a "fake result" for a mutation before a request has been
sent to the API.

```js
{
  optimistic: {
    favoriteTodo: (variables, cache, info) => ({
      __typename: 'Todo',
      id: variables.id,
      favorite: true,
    })
  }
}
```

So far the data structure that we've looked at previously stores normalised data just fine and
Graphcache keeps two tables of entries, one for "records" (or scalars) and one for "links" (or
relations.) When an optimistic result is applied, the cache actually creates additional layers
of these tables that it stacks on top of the "base layer".

When a mutation is executed that has an `optimistic` entry the optimistic result is used to
temporarily apply changes to the cache on new layers. When the API responds with the mutation's
result this layer is erased again so the API's result can be applied to the _base layer_. This
allows the UI to immediately adapt to mutations when the API would otherwise delay an interaction.

On apps like Twitter this is a common UX technique to display likes immediately rather than
waiting for the UI to respond, since, unlike composing a tweet, liking a tweet is an action
that can be sent to the API at any point of time in the future.

### Commutative Data Layering

The first feature is one we've added right at the start, which luckily allowed us to work on
the second one iteratively. Conceptualising the second feeature, commutativity, wasn't easy
and the first implementation that [Jovi de Croock]() and I discussed over weeks was implemented
in [a PR from March 2020](https://github.com/FormidableLabs/urql/pull/565), while we were travelling to
[Formidable's](https://formidable.com) HQ in Seattle.

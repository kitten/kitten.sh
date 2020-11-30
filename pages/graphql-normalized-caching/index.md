---
title: Caching Relational GraphQL Data
subtitle: urql's normalised cache mechanisms explained
cover: /covers/graphcache.jpg
excerpt: >-
  How do normalised caches in GraphQl work? Normalised caching in GraphQL is one of the most
  commonly used features. urql's Graphcache is one of those caches, which with GraphQL's schema
  can add ever smarter features like “Offline Support” or “Patial Results”. Let's find out what
  makes it tick.
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
of rich web applications nicely. With the rise of React, most developers adopted patterns where
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

The principles of normalising relational data as it's pulled from an API hold true, no matter whether
we're dealing with a GraphQL API, a RESTful API, or any other API. This also closely resembles
structures in relational databases, which isn't a coincidence, since we're dealing with "entities"
identified by primary keys that are linked together.

> "Collectively, multiple tables of data are called relational data because it is the relations,
> not just the individual datasets, that are important."<br />
> — [R for Data Science](https://r4ds.had.co.nz/relational-data.html)

In GraphQL, we write schemas with types that have fields, which return either scalars or other types,
and build up a graph. As data resolved by our API these relations and scalars are copied into nested,
denormalised JSON data, which the API receives, matching the query document it has sent. For a
normalisation to take place this **hierarchical nested data** needs to be stored in **flat tables**,
and for that, the cache needs information on the types of the data and an ID to index the objects
(or "entities") by a **primary key**.

If we wrote normalisation code for a REST API, the responses' structures are known by us per endpoint
beforehand, and we'd write our code to make assumptions based on that. This is, for instance, the
underlying principle of [normalizr](https://github.com/paularmstrong/normalizr), a library that normalises
JSON data by having us write a schema definition for it.  However, in GraphQL, the responses' structures
are _dynamic_ and change depending on the query document, so it isn't possible to automatically assume
a type for any given field. GraphQL clients solve this by using two things: the query document's structure
itself and ["Type Name Introspection".](http://spec.graphql.org/June2018/#sec-Type-Name-Introspection)

With _Type Name Introspection_, a query document may contain special `__typename` fields on any selection
set to inquire the API about the type name of an entity. If we query an API for a type `Item` and add the
`__typename` field to our selection then the GraphQL API will respond with the `"__typename": "Item"`
record on the response. The normalised cache can add this field to any outgoing query's selection sets
automatically and thus retrieve all the response's type information on the fly.

We also know that any response must match the query document the API received, which we can use to our
advantage to traverse the response as it's also traversing the query. Furthermore, the way a query is
written it already says a lot about the response. If a field has no selection set it's typically a scalar,
e.g. `{ createdAt }`, and if a field has a selection set it's likely a relation to another entity,
e.g. `{ todo { id } }`.

Lastly, the normalised cache needs to be able to generate a _primary key_ for each entity. [Relay
enforces](https://relay.dev/docs/en/graphql-server-specification.html#object-identification) that types
on a schema must all have an `id` field with a globally unique ID. Apollo and Graphcache on the other
hand assume that a type _may_ have either an `id` or `_id` field, by default, and that the query document
always includes it, though the specific keying function is configurable by type in either, though.

<img
  src={require('./query-document-info.png')}
  width="450" height="354"
  alt="Normalisation can be based on types, keys, and relations, which can be assumed by the presence of selection sets in query documents."
/>

### Traversing a Query Document

Query documents contain an operation and fragments, defining **nested selection sets of
fields**. A normalised cache traverses the selection sets both when storing results from the API
and when generating results from its stored data. The structure of [GraphQL.js'
types](https://github.com/graphql/graphql-js/blob/cd273ad136d615b3f2f4c830bd8891c7c5590c30/src/language/ast.d.ts#L108-L151)
makes traversing query documents rather simple. An `OperationDefinitionNode` contains a
`SelectionSetNode`, which may contain `FragmentSpreadNode`s and `InlineFragmentNode`s,
or `FieldNode`s which may again contain a selection set.

The traversal of GraphQL types in a document, a result's structure, and the relations that
a cache stores all mirror each other. Traversing a `SelectionSetNode` as part of writing
or reading normalised data is the most intensive part of the normalised cache's logic.
Here, during the writing process, we may differentiate between fields that contain
scalars (or "records" in Graphcache) and fields with selection sets that lead to other
_entities_, so relations, and store both in our data structure. During the reading process,
where the normalised cache attempts to create a result just from its cached data, the cache
can use the relations it has stored, when it reaches a nested selection set, to traverse
the query document and the relations in its cache in tandem.

> The traversal of GraphQL types in a document, a result's structure, and the relations that
> a cache stores all mirror each other.

A special case here is **"embedded data"**. Not all types in GraphQL have keyable fields.
Some may just abstract scalar-like data or simply add nested data to its parent type. For
instance, an `Image` type may just exist locally but contain fields for URLs, image formats,
dimensions, or other data. If a normalised cache encounters an unkeyable type, it may embed
it inside the parent entity. This means that, like a scalar, it becomes only reachable from
its parent's field on which it was originally found. Caches have varying approaches to
storing _embedded data_, but Graphcache still treats it as a relation and creates a key based
on the parent's key and the current field.

### Normalised Data Structures

At its core, normalising data means that we take individual fields and store them in a table.
In our case we store all values of fields in a dictionary of their primary key, generated from
an ID or other key and type name, and the field's name and arguments, if it has any.

| Primary Key | Field | Value |
| --- | --- | --- |
| Type name and ID / Key | Field name (not alias) and optionally arguments | Scalar value or relation |

How this data is stored in normalised caches differs from one implementation to another.
Graphcache itself went through _three different phases_, where we optimised and iterated on
its internal data structure and how it stores GraphQL data. Currently, the data structure
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
is stored as an object containing all fields. The fields are keyed not only by their names
but also by a JSON string of their arguments. In an earlier version, Graphcache used to store
all this data on a flat `Map` (and later [a HAMT
tree](https://en.wikipedia.org/wiki/Hash_array_mapped_trie)), but we found that the newer, more
nested structure pairs well with how JavaScript engines optimise for consistent shapes of
objects.

On a side note, it may be surprising that this data structure is directly mutated rather than
being a kind of immutable structure. Graphcache always copies data from its cache on
reading a query, so each query result it generates is a fresh result unrelated to the
cached data or to a previous result, hence immutability isn't necessary internally.

This data structure is also used to store relations, which Graphcache calls "links", albeit
in a separate table, since they can also be identified separately on query documents by the
presence or absence of selection sets on fields.

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
Here we also first see the `Query` root type from which the traversal of queries originates. Links
from one entity to another may be represented by a single key, but when a relation is to an array
of entities the data structure stores an array of keys. Any field in GraphQL that isn't marked as
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
the `__typename` fields. So it's worth asking at this point whether we can do any better given
that GraphQL has a whole schema worth of information about its data graph. What can we do if
we give Graphcache, say, the entire schema?
[Mikhail Novikov's talk about GraphQL clients](https://youtu.be/QvYEal9C8tI?t=1060) contains
a mention of this concept, which really stuck with me:

> "We can make the cache know more about the API. [...]
> The way to make better caches is to have more metadata."<br />
> — Mikhail Novikov

While this talk presented the idea of adding more metadata _on top_ of the existing schema with
directives as additional annotations, I felt that the existing dynamic GraphQL clients of the
time didn't even use that information efficiently. And one feature that can be implemented with
more metadata from the schema are **partial results**.

While retrieving data from the cache there are a lot of opportunities for cache misses, when the
cache doesn't have enough data to fulfil a query only from its store. Thinking of the most basic
app examples, having a list page go to a details page is pretty common, and furthermore,
displaying (and hence querying) more data on the details page than for the list is also
commonly found. But how can a GraphQL client deal with displaying the details page
sooner? By displaying some of it, as best as it can.

When a `schema` is passed to Graphcache, it receives metadata on which fields of a schema are
optional. Given that a lot of GraphQL apps we're seeing now use TypeScript with type generation
Graphcache then encounters a missing field in its cache, it does exactly what the `graphql`
execution would on the server-side, it sets the field to `null` if it's optional or cascades
the cache miss upwards until either the query itself is a cache miss still or it finds a nullable
field.

<img
  src={require('./partial-results.png')}
  alt="A query may display stale partial data without waiting for the full result to be available."
/>

This is one of the more "extravagant" features in Graphcache, but based on what I have
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
  even if they arrive in varying order.

Both of these features were vital for us to allow **Offline Support** to be added while
keeping the developer experience neither complicated nor confusing. When this mode of Graphcache
is used a `storage` engine may be passed (the default one uses IndexedDB) which persists
results and queued mutations. When the client is offline then Graphcache is able to continue
delivering fully cached or partial results as best as it can, while when it's online it
continually persists data.

### Optimistic Updates

"Optimistic Updates" are a feature that we've added almost right at the start of implementing
Graphcache as it has become an almost standard feature of GraphQL normalised caches. With
_optimistic updates_ an `optimistic` configuration option may be passed to Graphcache that
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

On apps like Twitter, this is a common UX technique to display likes immediately rather than
waiting for the UI to respond, since, unlike composing a tweet, liking a tweet is an action
that can be sent to the API at any point of time in the future. For _Offline Support_ this means
that our apps can stay interactive even when (less important) mutations can't be sent, since
the result of those mutations can be **optimistically emulated** for the UI.

### Commutative Data Layering

For _Optimistic Updates_ we already had data layering implemented, but for full _Offline
Support_ it became clear that we needed to provide stronger guarantees around the cache's
data for a client to maintain its data consistently despite unstable or inconsitent network
access. When an app becomes offline-resilient it first starts adding retry logic to its
requests (for `urql` we have [a retry
exchange](https://formidable.com/open-source/urql/docs/advanced/retry-operations/)) which
means it's dealing with a potentially large flurry of requests that may resolve at different
points in the future, out of order.

This is horrible for maintaining consistency in the cached data. There's no prediction of
how data is written and merged into the cache anymore, there's no guarantee in which order
a query's data is written to the cache, and worse, there's no guarantee in which order
mutations are written to the cache. Oops, or as [James Long says in his talk "CRDTs for
Mortals"](https://youtu.be/DEcwa68f-jY?t=298):

> "Why is syncing so hard? Unreliable ordering and conflicts."<br />
> — James Long

In this talk, James talks about synchronising data from multiple distributed clients with
[CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type), which are a
method of assigning timestamps to messages to establish eventual consistency when
synchronising updates across multiple clients.

Unfortunately, CRDTs aren't suitable for our GraphQL cache, since implementing them
requires changes to the API, and as they're more suitable for synchronising updates
rather than entire sets of results. Luckily though, since with GraphQL we're dealing with a
client/server network, there isn't as much distribution and hence synchronisation that
needs to be done. Instead, we can assume any correct order and move on.

The method that we applied to Graphcache for ensuring more consistency is what we aptly
call **commutativity** — the strategy of applying ordered results _in order_. Understanding
and planning this feature wasn't easy and the first implementation that [Jovi de
Croock](https://twitter.com/JoviDeC) and I discussed over weeks was implemented in
[a PR from March 2020](https://github.com/FormidableLabs/urql/pull/565), while we were
at [Formidable's](https://formidable.com) HQ in Seattle.

What we planned was to _reuse_ the **layering** approach that was already implemented for
_optimistic updates_. To implement this feature we decided that queries and mutations
would register themselves in order as they were queued up and as their results came in.
If the results arrive out of order, they'd first be applied to layers that are kept
_in the original order_. These commutative layers essentially sort changes in the cache's
data structure as they are applied.

<img
  src={require('./commutative-layers.png')}
  width="645" height="450"
  alt="If a layer result comes in first, results are written to separate layers, where data in later ones take precedence."
/>

> Commutative layers essentially sort changes in the cache's data structure as
> they are applied.

When the earliest result in the stack of layers is resolved from the API, then that layer
is squashed into the "base layer". Since all of these layers are tables of scalars and
relations, this is the equivalent of copying each entry down to the base layer, so they're
squashed and cleaned up continuously. Optimistic layers also participate in this structure
and are different in that they may already contain optimistic values when they're created.

As the cache now reads values from this layered data structure, when it looks up an entry
in the layered tables it will start with the latest layer on top and cascade down into the
base layer until it finds the value or not. This may also be one of the rare cases where
JavaScript's difference between `null` and `undefined` comes in handy! If we want a layer
to erase an entry, we can set it to `undefined` and treat it separately from having no
value at all and from having a scalar of `null`.

### Keeping optimistic and non-optimistic data apart.

The last problem we faced with this system is keeping optimistic changes away from non-optimistic
ones. With the `updates` API, it's easy for developers to accidentally read some optimistic
data while an update is written to a non-optimistic layer, making the change permanent.
This may even happen when multiple items are optimistically added to a list, which makes
the result contain optimistic items. Oops again.

Hence, we put some systems into place to [keep optimistic data as
separate](https://formidable.com/open-source/urql/docs/graphcache/under-the-hood/#optimistic-results--refetches)
from "real data" as possible. Once one or more optimistic updates are started all active
mutations for these optimistic updates will be delayed to resolve them as a batch together.
For the user, this makes no difference as the optimistic change already reflects what the
server data will change as well. But internally this allows all optimistic layers to be
cleared before the mutations' results are applied, preventing the mutation results from
ever "seeing" the optimistic ones.

Relatedly, we quickly found out that it's inconvenient to have queries overwrite optimistic
mutations. When an optimistic mutation adds an item to the list it'd be very awkward for
a query to refetch that list, making the optimistic addition disappear. So we also started
blocking queries that conflict with optimistic updates, which solved this issue too.

The idea that we could **delay** results to improve the user experience around optimistic
updates was an unexpected and important realisation to say the least.

### Taking the garbage out.

Another small feature that shall not go unmentioned here is **Garbage Collection**. Over
the lifetime of an app it may accumulate a lot of unused entities in memory. This could
even be a more severe problem when the cache is used offline, since all persisted data
is loaded into memory on startup.

To prevent this from becoming a problem, Graphcache schedules a _garbage collection_
run after every change. If an entity has no relation leading to it, and is hence
unused, it is removed during this clean up phase. When we implemented this we had
to decide between two main implementations: tracing gargabe collection and [automatic
reference counting](https://en.wikipedia.org/wiki/Automatic_Reference_Counting).

The former scans all data, following and marking all relations that are currently in
memory, to find ones which are definitely unused. Reference counting on the other
hands counts the amounts of references to an entity as they are created, updated,
or removed. Ultimately, we decided on the latter method as it's much faster and
easier to implement.

```js
{
  refCount: {
    'Item:123': 1,
    'Item:0': 0
  },
  refLock: {
    [1]: { 'Item:234': 1 }
  },
  gc: Set { 'Item:0' }
}
```

Our data structure tracks the amount of references to each entity, both on the base
layer and separately on the optimistic layers. When the amount of references falls
to zero, the entity key is added to the `gc` set, which means it's scheduled for
deletion.

This approach does not delete references that have created a cycle. If two entities
reference each other, for instance, they won't be deleted, even if they can't be
reached via a query. This is a drawback, but given that this garbage collector is
designed to be fast rather than 100% effective, we've found the trade off to be
worth it.

## Notifying the UI of changes

In `urql`, all queries, mutations, and subscriptions are sent through an extension pipeline,
which contains all of its GraphQL client logic. The `Client` itself only has the task to
coordinate this pipeline and to communicate with bindings. This pipeline contains what we
call "Exchanges", which are middleware that accept a stream of operations (queries, mutations
and subscriptions), forward them to the next _exchange_, and return a stream of results.
This system allows us to **integrate caches into the same pipeline** as all other logic,
like retrying, fetching, or deduplication, rather than layering caches on top of the
`Client` with an additional API-surface.

For Graphcache this means that it needs to notify the `Client` of any changes to the
active queries as it updates its cache. For instance, a mutation may update an entity
that is shared with a query, which means that Graphcache needs to notify the `Client`
that the query's data has changed.

<img
  src={require('./data-dependencies.png')}
  width="633" height="420"
  alt="The Client is notified when any dependencies of a query overlap with an update."
/>

To identify changes as data is updated by the cache, the traversal also tracks all
entities it has visited by key. A `Set` of keys is collected. This `Set` clearly identifies
either which entities have been read or written, depending on whether Graphcache was
updating or reading from its store. We call this list of keys the "dependencies" of a
query document.

The _exchange_ then only needs to compare the `Set` it gets when it updates the cache
with the dependencies of active queries. If any queries contains a dependency that has
been updated, the `Client` is notified that this query has a new update.

## Graphcache — More than just a normalised cache

Graphcache has come quite far in the year that we've been working on it now, and as this
post has hopefully shown, what goes into a normalised GraphQL cache goes much beyond
the data normalisation bit of it. Today we can be proud of a normalised cache that is
one of the fastest and smallest in the community. We're continuing to experiment
with **"smart features"** which have already brought us ideas such as the built-in
Offline Support, which are what ultimately make Graphcache unique. But seeing how
much I had to cover in just one post explaining it is encouraging already — to
recap:

- Normalised Data Structures & GraphQL document traversal
- Manual updaters & resolvers configurations
- Schema awareness & partial results
- Optimistic Updates
- Commutative Layers
- Garbage Collection
- Data Dependencies for notifying the `Client`

It's easy for me to list out where the implementation of our cache has ended up and
what it does, but there's a long list of reasons, discussions, and failed experiments
behind each change and feature, we've introduced. It's almost a shame to not mention them since
each problem related to Graphcache felt like the hardest I'd work on for weeks at a
time. However, the important takeaway is that we focus on making each of our features
intuitive, which is best exemplified by the [detailed warnings and
errors](https://formidable.com/open-source/urql/docs/graphcache/errors/) Graphcache
logs when something goes wrong. It's impressive how a simple specification like
GraphQL that enough people can and have agreed on can enable us to experiment with
more automatic optimisations and mechanisms that ultimately benefit a lot of people.

> "There are two hard problems in Computer Science: We only have one joke and it's not funny."
> [(Source)](https://twitter.com/pbowden/status/468855097879830528)

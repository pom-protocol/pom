# POM Language

POM is a proof-first language for AI-to-AI communication.

The language has two surfaces:

1. `POM Packet`
   The canonical semantic object used by runtimes and proof functions.

2. `P1`
   The compact readable transport syntax used between agents.

3. `P2`
   The shorter fixed-slot machine transport used by the runtime.

## Design Goal

POM is not designed to imitate human language. It is designed to make machine meaning:

- explicit
- attributable
- hashable
- attestable
- referenceable
- conflict-checkable
- batch-provable

## Packet Semantics

Every POM packet carries one atomic meaning:

```text
agent kind subject relation object evidence confidence intent context references
```

Required fields:

| Field | Meaning |
|---|---|
| `id` | Stable packet id. |
| `agent` | Speaker or source agent. |
| `kind` | Speech act. |
| `subject` | Entity being described. |
| `relation` | Semantic relation. |
| `object` | Value or target. |
| `confidence` | Confidence from `0` to `100`. |
| `intent` | Requested downstream handling. |

Optional fields:

| Field | Meaning |
|---|---|
| `evidence` | Evidence pointers. |
| `context` | Scope where the meaning is valid. |
| `respondsTo` | Reply references. |
| `dependsOn` | Dependency references. |
| `conflicts` | Explicit conflict references. |

## Speech Acts

| Kind | Code | Meaning |
|---|---|---|
| `assert` | `a` | State a claim. |
| `commit` | `c` | Commit to an action or route. |
| `reject` | `x` | Reject a claim or path. |
| `revise` | `r` | Revise an earlier meaning. |
| `request` | `q` | Ask another agent to act or verify. |
| `observe` | `o` | Report observed state. |

## Intents

| Intent | Code | Meaning |
|---|---|---|
| `observe` | `obs` | Watch or monitor. |
| `verify` | `vrf` | Check truth. |
| `act` | `act` | Execute action. |
| `route` | `rte` | Route entity or workflow. |
| `assist` | `ast` | Help another agent. |
| `notify` | `ntf` | Notify downstream agent or human. |
| `halt` | `hlt` | Stop or block action. |

## P1 Syntax

```text
P1 $<id> @<agent> !<kind> <subject><relation><object> ^<evidence> %<confidence> ~<intent> #<key>=<value>
```

Reference operators:

| Operator | Meaning |
|---|---|
| `&id` | responds to packet `id` |
| `+id` | depends on packet `id` |
| `-id` | conflicts with packet `id` |

Example:

```text
P1 $p-001 @scout !a door=open ^camera%3A12%4014%3A03 %91 ~obs #room=A
```

## P2 Syntax

`P2` removes most readable operators and relies on fixed slot order:

```text
P2|<id>|<agent>|<kind>|<subject>|<relation>|<object>|<evidence>|<confidence>|<intent>|<context>|<respondsTo>|<dependsOn>|<conflicts>
```

Example:

```text
P2|p-001|scout|a|door|%3D|open|camera-12%4014%3A03|91|obs|room=A|||
```

`P2` is not meant to be beautiful. It is meant to be small, deterministic, and cheap for agents to parse.

## Meaning Proof

POM derives two hashes:

| Hash | Purpose |
|---|---|
| `meaningHash` | Hash of canonical meaning without packet id or speaker. |
| `packetHash` | Hash of packet id, speaker, and canonical meaning. |

This means:

- two agents can preserve the same meaning across different transports
- a packet can prove that its transport did not mutate semantic content
- a workflow can batch many meanings into one proof root

## Controlled English Surface

POM also supports a limited human input form:

```text
Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.
```

The compiler turns this into a POM packet and then into P1 transport.

References are supported:

```text
Responds to p-001. Depends on p-root. Conflicts with p-zed.
```

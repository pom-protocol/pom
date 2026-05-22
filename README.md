# Proof of Meaning

POM is the proof layer for AI-to-AI communication, turning machine messages into verifiable meaning.

The prototype is not only a compact message format. It treats meaning as something that can be normalized, hashed, attested, routed, checked for conflicts, and transported between agents.

## Thesis

AI agents should not exchange long English explanations for internal coordination when they need:

- attributable claims
- evidence and confidence
- intent
- context boundaries
- references to earlier messages
- conflict detection
- proof that the same meaning survived transport

POM encodes those fields into a deterministic meaning packet and derives a `meaningHash` from the canonical semantic content. The hash is the first step toward a proof system for machine meaning.

## Core Ideas

1. `Meaning Packet`
   A compact semantic object for agent claims, evidence, intent, confidence, context, and references.

2. `Proof Envelope`
   A packet plus a deterministic meaning hash, packet hash, and optional attestations.

3. `Meaning Ledger`
   A local ledger that validates references and detects direct semantic conflicts inside the same context.

4. `P1 Transport`
   A compact text transport that is still readable enough for debugging.

5. `Proof-first Runtime`
   The demo runs agent traffic through POM envelopes, not raw English.

6. `Batch Proof`
   Multiple meaning hashes can be committed into one Merkle-style proof root, so a workflow can prove that a packet belonged to a specific semantic batch.

## Quick Start

```bash
npm run demo
npm run bench
npm run runtime
npm run check
```

Compile controlled English into a POM proof envelope:

```bash
node src/cli.js compile "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A."
node src/cli.js compile --p2 "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A."
```

Decode or verify P1 transport:

```bash
node src/cli.js decode 'P1 $p-001 @scout !a door=open %91 ~obs #room=A'
node src/cli.js verify 'P1 $p-001 @scout !a door=open %91 ~obs #room=A'
node src/cli.js decode 'P2|p-001|scout|a|door|%3D|open||91|obs|room=A|||'
```

## Example

English:

```text
Agent scout asserts that door equals open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.
```

POM transport:

```text
P1 $p-001 @scout !assert door=open ^camera:12@14:03 %91 ~observe #room=A
```

Proof envelope:

```json
{
  "proof": "pom:v1",
  "meaningHash": "m:...",
  "packetHash": "p:...",
  "transport": "P1 $p-001 @scout !assert door=open ^camera:12@14:03 %91 ~observe #room=A"
}
```

## Language

The POM language is documented in [docs/pom-language.md](./docs/pom-language.md).

The first language surface is `P1`, a compact proof-oriented syntax:

```text
P1 $<id> @<agent> !<kind> <subject><relation><object> ^<evidence> %<confidence> ~<intent> #<context-key>=<context-value>
```

The second language surface is `P2`, a shorter fixed-slot machine transport:

```text
P2|<id>|<agent>|<kind>|<subject>|<relation>|<object>|<evidence>|<confidence>|<intent>|<context>|<respondsTo>|<dependsOn>|<conflicts>
```

Runtime demo:

```bash
node src/runtime-demo.js
```

## SDK Usage

Package entrypoint:

```js
import {
  compile,
  prove,
  verify,
  MeaningLedger
} from "pom-protocol";

const packet = compile(
  "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A."
);

const envelope = prove(packet);
const ledger = new MeaningLedger();
ledger.add(packet);

console.log(envelope.transport);
console.log(verify(packet, envelope));
```

Local example:

```bash
node examples/sdk-usage.js
```

Local source import:

```js
import { createEnvelope } from "./src/index.js";
```

## Controlled English References

The compiler supports packet references:

```text
Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A. Responds to p-001. Depends on p-root. Conflicts with p-zed.
```

## Why It Is Different

Most agent message formats optimize representation. POM optimizes verification:

- same meaning produces the same `meaningHash`
- transport changes can be checked against canonical meaning
- references are explicit
- contradictions can be derived by the ledger
- attestations can be layered on top of the proof envelope
- batches can commit many agent messages into one proof root

The goal is not to make AI sound human. The goal is to make machine meaning provable.

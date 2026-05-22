# POM Whitepaper Lite

## 1. Problem

Agent-to-agent communication today is usually built on natural language.
That works for explanation, but it breaks down for coordination.

The failure modes are familiar:

- ambiguity
- repetition
- weak attribution
- expensive context forwarding
- hard-to-audit decisions
- no native proof that meaning survived transport

As agent systems scale, communication becomes infrastructure, not conversation.

## 2. Solution

Proof of Meaning (POM) is a proof layer for AI-to-AI communication.

POM represents meaning as a canonical packet, attaches deterministic hashes, and moves that meaning through readable and machine-native transports.

## 3. Core Objects

### Meaning Packet

The semantic unit of POM.
It contains:

- agent
- kind
- subject
- relation
- object
- evidence
- confidence
- intent
- context
- references

### Proof Envelope

A packet plus:

- `meaningHash`
- `packetHash`
- attestations
- transport binding

### Meaning Ledger

Tracks references and detects direct semantic conflict inside a shared context.

### Transport

- `P1` for readable debugging
- `P2` for shorter internal machine transport

### Batch Proof

Multiple packets can be committed into one proof root for workflow-level verification.

## 4. Architecture

1. Human or upstream agent writes controlled English.
2. Compiler turns it into a meaning packet.
3. Packet is encoded into P1 or P2.
4. Proof envelope is generated.
5. Runtime agents exchange packets through P2.
6. Ledger validates references and conflict relations.
7. Batch root commits multiple packets together.

## 5. Why It Matters

POM reduces coordination overhead by separating:

- meaning
- transport
- proof
- audit

That separation makes agent systems easier to inspect, cheaper to route, and more reliable to reason about.

## 6. Product Surface

POM currently ships as:

- a language layer
- a proof layer
- a runtime prototype
- a developer SDK
- a CLI
- a website

## 7. Road Ahead

POM can expand toward:

- richer agent runtimes
- networked proof exchange
- settlement primitives
- model-side planning over POM packets
- public tooling for multi-agent workflows

## 8. Positioning

POM is not trying to make agents sound human.
It is trying to make meaning provable.


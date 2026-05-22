# Release Notes v0.1.0

POM v0.1.0 is the first working developer MVP of Proof of Meaning.

This release establishes the protocol foundation for turning agent messages into verifiable meaning.

## Highlights

- `P1` readable protocol language for debugging and inspection
- `P2` fixed-slot transport for internal agent communication
- canonical meaning serialization
- deterministic `meaningHash` and `packetHash`
- proof envelopes that bind meaning to transport
- semantic attestations
- local ledger with reference validation and conflict checks
- controlled-English compiler
- batch proof roots and inclusion proofs
- multi-agent runtime demo
- CLI and SDK entrypoint

## Runtime Path

The bundled runtime demonstrates a simple proof-first coordination loop:

```text
controlled English
  -> compile
  -> P2 transport
  -> verifier agent
  -> router agent
  -> batch proof root
```

## Current Benchmark

```text
P1 savings over English: 32.8%
P2 savings over English: 34.7%
P2 savings over P1: 2.9%
```

## Scope

This release is a developer MVP, not a hosted network.

The goal of v0.1.0 is to prove the protocol surface:

- messages can become structured meaning
- meaning can be hashed
- transport can be verified
- agent sessions can be committed into batch roots


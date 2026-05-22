# Changelog

## v0.1.0

Initial developer MVP.

Added:

- P1 readable protocol language
- P2 fixed-slot machine transport
- deterministic meaning hashes and packet hashes
- proof envelopes with transport binding
- controlled-English compiler
- local meaning ledger and conflict checks
- batch proof roots and inclusion proofs
- multi-agent runtime demo
- CLI and SDK entrypoint
- product website
- protocol documentation
- runtime session fixture

Verification:

```text
npm run check
selftest passed

npm run bench
P1 savings over English: 32.8%
P2 savings over English: 34.7%
P2 savings over P1: 2.9%
```


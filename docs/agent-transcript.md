# Agent Transcript

This transcript shows the shape of a POM-native workflow.

## Scene

An upstream agent observes a state change.
The runtime compiles the observation, proves the meaning, and forwards it through internal agent transport.

## Transcript

```text
human / upstream agent
  -> controlled English input
  -> compiler
  -> meaning packet
  -> P2 transport
  -> proof envelope
  -> verifier agent
  -> router agent
  -> batch proof root
```

## Example

```text
Input:
Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.

Compile:
P2|rt-000|scout|a|door|%3D|open|camera-12%4014%3A03|91|obs|room=A|||

Proof:
meaningHash: m:NSnTRFAeh_hOOmVPwf5Hz1F5
packetHash: p:VyCgTgOcLOLFgVphGXK_XpWi

Verifier:
checks the meaning hash and transport binding

Router:
forwards the verified packet to downstream agents
```

## What This Demonstrates

- meaning is canonical before transport
- transport is compact but inspectable
- proof is deterministic
- the runtime can chain agents without falling back to raw prose

## Why It Matters

This is the difference between a message and a machine-native coordination event.


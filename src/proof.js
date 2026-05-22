import { createHash } from "node:crypto";
import { canonicalMeaning, canonicalPacket } from "./canonical.js";
import { POM_VERSION, validatePacket } from "./model.js";
import { encodeP1, encodeP2 } from "./transport.js";

export function hashText(prefix, text) {
  const digest = createHash("sha256").update(text).digest("base64url").slice(0, 24);
  return `${prefix}:${digest}`;
}

export function meaningHash(packet) {
  return hashText("m", canonicalMeaning(packet));
}

export function packetHash(packet) {
  return hashText("p", canonicalPacket(packet));
}

export function createEnvelope(packet, attestations = [], options = {}) {
  validatePacket(packet);
  const transportMode = options.transport ?? "P1";

  return {
    proof: POM_VERSION,
    meaningHash: meaningHash(packet),
    packetHash: packetHash(packet),
    transport: encodeTransport(packet, transportMode),
    attestations: attestations.map(normalizeAttestation)
  };
}

export function verifyEnvelope(packet, envelope) {
  const transport = envelope.transport?.startsWith("P2|") ? encodeP2(packet) : encodeP1(packet);
  return {
    version: envelope.proof === POM_VERSION,
    meaningHash: envelope.meaningHash === meaningHash(packet),
    packetHash: envelope.packetHash === packetHash(packet),
    transport: envelope.transport === transport,
    ok:
      envelope.proof === POM_VERSION &&
      envelope.meaningHash === meaningHash(packet) &&
      envelope.packetHash === packetHash(packet) &&
      envelope.transport === transport
  };
}

export function attest(packet, agent, statement = "meaning verified") {
  const base = `${agent}|${meaningHash(packet)}|${statement}`;
  return {
    agent,
    statement,
    target: meaningHash(packet),
    attestationHash: hashText("a", base)
  };
}

function normalizeAttestation(attestation) {
  return {
    agent: String(attestation.agent),
    statement: String(attestation.statement),
    target: String(attestation.target),
    attestationHash: String(attestation.attestationHash)
  };
}

function encodeTransport(packet, mode) {
  if (mode === "P2") return encodeP2(packet);
  if (mode === "P1") return encodeP1(packet);
  throw new Error(`unsupported proof transport: ${mode}`);
}

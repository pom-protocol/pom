export { POM_VERSION, allowedKinds, allowedIntents, createPacket, validatePacket } from "./model.js";
export { canonicalMeaning, canonicalPacket } from "./canonical.js";
import { compileControlledEnglish } from "./compiler.js";
import { createEnvelope, verifyEnvelope } from "./proof.js";

export { encodeP1, decodeP1, encodeP2, decodeP2 } from "./transport.js";
export { hashText, meaningHash, packetHash, createEnvelope, verifyEnvelope, attest } from "./proof.js";
export { MeaningLedger } from "./ledger.js";
export { renderEnglish } from "./render.js";
export { createProofBatch, createInclusionProof, verifyInclusionProof } from "./batch.js";
export { compileControlledEnglish } from "./compiler.js";
export { runPomRuntimeSession, defaultAgents } from "./runtime.js";

export function compile(input, options = {}) {
  return compileControlledEnglish(input, options);
}

export function prove(packet, attestations = []) {
  return createEnvelope(packet, attestations);
}

export function verify(packet, envelope) {
  return verifyEnvelope(packet, envelope);
}

export function compileAndProve(input, options = {}) {
  const packet = compileControlledEnglish(input, options);
  return {
    packet,
    envelope: createEnvelope(packet)
  };
}

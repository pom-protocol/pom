import assert from "node:assert/strict";
import { createPacket } from "./model.js";
import { createEnvelope, verifyEnvelope } from "./proof.js";
import { decodeP1, encodeP1 } from "./transport.js";
import { MeaningLedger } from "./ledger.js";
import { createProofBatch, createInclusionProof, verifyInclusionProof } from "./batch.js";
import { compileControlledEnglish } from "./compiler.js";
import * as pom from "./index.js";
import { encodeP2, decodeP2 } from "./transport.js";
import { runPomRuntimeSession } from "./runtime.js";

const packet = createPacket({
  id: "p-001",
  agent: "self",
  kind: "assert",
  subject: "door",
  object: "open",
  evidence: ["camera:12"],
  confidence: 91,
  intent: "observe",
  context: { room: "A" }
});

const encoded = encodeP1(packet);
const decoded = decodeP1(encoded);
const envelope = createEnvelope(packet);
const p2Envelope = createEnvelope(packet, [], { transport: "P2" });
assert.deepEqual(decoded, packet);
assert.deepEqual(decodeP2(encodeP2(packet)), packet);
assert.equal(verifyEnvelope(decoded, envelope).ok, true);
assert.equal(verifyEnvelope(packet, p2Envelope).ok, true);

const compiled = compileControlledEnglish(
  "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A. Responds to p-000. Depends on p-root.",
  { id: "p-compiled" }
);
assert.equal(compiled.agent, "scout");
assert.equal(compiled.subject, "door");
assert.equal(compiled.object, "open");
assert.deepEqual(compiled.evidence, ["camera-12@14:03"]);
assert.deepEqual(compiled.context, { room: "A" });
assert.deepEqual(compiled.respondsTo, ["p-000"]);
assert.deepEqual(compiled.dependsOn, ["p-root"]);
assert.equal(typeof pom.createEnvelope, "function");
assert.equal(typeof pom.MeaningLedger, "function");

const ledger = new MeaningLedger();
ledger.add(packet);
const result = ledger.add(createPacket({
  id: "p-002",
  agent: "self",
  kind: "assert",
  subject: "door",
  object: "closed",
  evidence: ["sensor:9"],
  confidence: 80,
  intent: "verify",
  context: { room: "A" },
  respondsTo: ["p-001"]
}));

assert.equal(result.derivedConflicts.length, 1);

const batch = createProofBatch([packet, decoded]);
const proof = createInclusionProof(batch, "p-001");
assert.equal(verifyInclusionProof(proof), true);

const session = runPomRuntimeSession(undefined, { maxRounds: 2 });
assert.equal(session.transport, "P2");
assert.equal(session.batch.size, session.finalPackets.length);
console.log("selftest passed");

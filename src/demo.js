import { createPacket } from "./model.js";
import { createEnvelope, attest, verifyEnvelope } from "./proof.js";
import { decodeP1 } from "./transport.js";
import { MeaningLedger } from "./ledger.js";
import { renderEnglish } from "./render.js";
import { createProofBatch, createInclusionProof, verifyInclusionProof } from "./batch.js";
import { compileControlledEnglish } from "./compiler.js";

const ledger = new MeaningLedger();

const p1 = createPacket({
  id: "p-001",
  agent: "scout",
  kind: "assert",
  subject: "door",
  relation: "=",
  object: "open",
  evidence: ["camera:12@14:03"],
  confidence: 91,
  intent: "observe",
  context: { room: "A" }
});

const compiled = compileControlledEnglish(
  "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.",
  { id: "p-compiled" }
);

const envelope = createEnvelope(p1, [attest(p1, "verifier")]);
const roundtrip = decodeP1(envelope.transport);
const ledgerResult = ledger.add(p1);

const p2 = createPacket({
  id: "p-002",
  agent: "guard",
  kind: "assert",
  subject: "door",
  relation: "=",
  object: "closed",
  evidence: ["lock-sensor:7"],
  confidence: 88,
  intent: "verify",
  context: { room: "A" },
  respondsTo: ["p-001"]
});

const conflict = ledger.add(p2);
const batch = createProofBatch([p1, p2]);
const inclusion = createInclusionProof(batch, "p-002");

console.log("POM DEMO");
console.log("");
console.log("English:");
console.log(renderEnglish(p1));
console.log("");
console.log("Transport:");
console.log(envelope.transport);
console.log("");
console.log("Compiled From Controlled English:");
console.log(JSON.stringify(compiled, null, 2));
console.log("");
console.log("Envelope:");
console.log(JSON.stringify(envelope, null, 2));
console.log("");
console.log("Verify:");
console.log(JSON.stringify(verifyEnvelope(roundtrip, envelope), null, 2));
console.log("");
console.log("Ledger:");
console.log(JSON.stringify({ first: ledgerResult, second: conflict }, null, 2));
console.log("");
console.log("Proof Batch:");
console.log(JSON.stringify({
  root: batch.root,
  size: batch.size,
  inclusionOk: verifyInclusionProof(inclusion)
}, null, 2));

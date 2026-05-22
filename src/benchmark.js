import { createPacket } from "./model.js";
import { createEnvelope } from "./proof.js";
import { renderEnglish } from "./render.js";
import { encodeP2 } from "./transport.js";

const packets = [
  createPacket({
    id: "p-001",
    agent: "scout",
    kind: "assert",
    subject: "door",
    object: "open",
    evidence: ["camera:12@14:03"],
    confidence: 91,
    intent: "observe",
    context: { room: "A", incident: "HX21" }
  }),
  createPacket({
    id: "p-002",
    agent: "planner",
    kind: "commit",
    subject: "medic",
    relation: "->",
    object: "roomA",
    evidence: ["dispatch:88", "voice:44"],
    confidence: 86,
    intent: "route",
    context: { room: "A", incident: "HX21" },
    respondsTo: ["p-001"]
  }),
  createPacket({
    id: "p-003",
    agent: "guard",
    kind: "reject",
    subject: "main-corridor",
    object: "blocked",
    evidence: ["camera:19"],
    confidence: 78,
    intent: "verify",
    context: { room: "A", incident: "HX21" },
    dependsOn: ["p-002"]
  })
];

const english = packets.map(renderEnglish).join("\n");
const p1 = packets.map((packet) => createEnvelope(packet).transport).join("\n");
const p2 = packets.map(encodeP2).join("\n");
const proof = packets.map((packet) => JSON.stringify(createEnvelope(packet))).join("\n");

console.log("POM BENCHMARK");
console.log(JSON.stringify({
  englishBytes: bytes(english),
  p1Bytes: bytes(p1),
  p2Bytes: bytes(p2),
  proofEnvelopeBytes: bytes(proof),
  p1SavingsOverEnglish: percent(1 - bytes(p1) / bytes(english)),
  p2SavingsOverEnglish: percent(1 - bytes(p2) / bytes(english)),
  p2SavingsOverP1: percent(1 - bytes(p2) / bytes(p1)),
  proofOverheadVsEnglish: percent(bytes(proof) / bytes(english) - 1)
}, null, 2));

function bytes(text) {
  return Buffer.byteLength(text, "utf8");
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

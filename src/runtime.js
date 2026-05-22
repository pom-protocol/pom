import { compileControlledEnglish } from "./compiler.js";
import { createPacket } from "./model.js";
import { createEnvelope } from "./proof.js";
import { encodeP2, decodeP2 } from "./transport.js";
import { MeaningLedger } from "./ledger.js";
import { createProofBatch } from "./batch.js";

export function runPomRuntimeSession(input = defaultInput(), options = {}) {
  const ledger = new MeaningLedger();
  const agents = options.agents ?? defaultAgents();
  const maxRounds = options.maxRounds ?? 3;
  const transcript = [];

  const ingress = compileControlledEnglish(input, { id: "rt-000" });
  addHop(transcript, ledger, "ingress", ingress);

  let frontier = [ingress];
  let counter = 1;

  for (let round = 1; round <= maxRounds && frontier.length; round += 1) {
    const next = [];

    for (const packet of frontier) {
      for (const agent of agents) {
        const response = agent.handle(packet, { round, nextId: () => `rt-${String(counter++).padStart(3, "0")}` });
        if (response) {
          addHop(transcript, ledger, agent.name, response);
          next.push(response);
        }
      }
    }

    frontier = next;
  }

  const packets = transcript.map((hop) => hop.packet);
  return {
    runtime: "pom-runtime:v1",
    transport: "P2",
    hops: transcript.map(({ packet, ...hop }) => hop),
    finalPackets: packets,
    batch: createProofBatch(packets),
    conflicts: ledger.conflicts
  };
}

export function defaultAgents() {
  return [
    verifierAgent(),
    routerAgent(),
    sentinelAgent()
  ];
}

function addHop(transcript, ledger, actor, packet) {
  const transport = encodeP2(packet);
  const decoded = decodeP2(transport);
  const ledgerResult = ledger.add(decoded);
  transcript.push({
    actor,
    packet: decoded,
    transport,
    envelope: createEnvelope(decoded, [], { transport: "P2" }),
    ledger: ledgerResult
  });
}

function verifierAgent() {
  return {
    name: "verifier",
    handle(packet, ctx) {
      if (packet.intent !== "observe" && packet.intent !== "verify") return null;
      return createPacket({
        id: ctx.nextId(),
        agent: "verifier",
        kind: "assert",
        subject: `${packet.subject}-meaning`,
        relation: "=",
        object: "verified",
        evidence: [packet.id],
        confidence: Math.max(60, packet.confidence - 4),
        intent: "notify",
        context: packet.context,
        respondsTo: [packet.id]
      });
    }
  };
}

function routerAgent() {
  return {
    name: "router",
    handle(packet, ctx) {
      if (!["act", "route", "notify"].includes(packet.intent)) return null;
      return createPacket({
        id: ctx.nextId(),
        agent: "router",
        kind: "commit",
        subject: "meaning",
        relation: "->",
        object: "downstream-agent",
        evidence: [packet.id],
        confidence: Math.max(55, packet.confidence - 8),
        intent: "assist",
        context: packet.context,
        dependsOn: [packet.id]
      });
    }
  };
}

function sentinelAgent() {
  return {
    name: "sentinel",
    handle(packet, ctx) {
      if (packet.confidence >= 50) return null;
      return createPacket({
        id: ctx.nextId(),
        agent: "sentinel",
        kind: "reject",
        subject: packet.subject,
        relation: "=",
        object: packet.object,
        evidence: [packet.id],
        confidence: 92,
        intent: "halt",
        context: packet.context,
        conflicts: [packet.id]
      });
    }
  };
}

function defaultInput() {
  return "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.";
}

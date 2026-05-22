import { normalizeList, normalizeMap, validatePacket } from "./model.js";

export function canonicalMeaning(packet) {
  validatePacket(packet);

  return stableJson({
    kind: packet.kind,
    subject: atom(packet.subject),
    relation: atom(packet.relation),
    object: atom(packet.object),
    evidence: normalizeList(packet.evidence).map(atom),
    confidence: packet.confidence,
    intent: packet.intent,
    context: normalizeMap(packet.context),
    respondsTo: normalizeList(packet.respondsTo),
    dependsOn: normalizeList(packet.dependsOn),
    conflicts: normalizeList(packet.conflicts)
  });
}

export function canonicalPacket(packet) {
  validatePacket(packet);

  return stableJson({
    id: packet.id,
    agent: packet.agent,
    meaning: JSON.parse(canonicalMeaning(packet))
  });
}

export function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function atom(value) {
  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
}

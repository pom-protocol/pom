export const POM_VERSION = "pom:v1";

export const allowedKinds = new Set(["assert", "commit", "reject", "revise", "request", "observe"]);
export const allowedIntents = new Set(["observe", "verify", "act", "route", "assist", "notify", "halt"]);

export function createPacket(input) {
  const packet = {
    id: required(input.id, "id"),
    agent: required(input.agent, "agent"),
    kind: input.kind ?? "assert",
    subject: required(input.subject, "subject"),
    relation: input.relation ?? "=",
    object: required(input.object, "object"),
    evidence: normalizeList(input.evidence),
    confidence: clampConfidence(input.confidence ?? 50),
    intent: input.intent ?? "verify",
    context: normalizeMap(input.context),
    respondsTo: normalizeList(input.respondsTo),
    dependsOn: normalizeList(input.dependsOn),
    conflicts: normalizeList(input.conflicts)
  };

  validatePacket(packet);
  return packet;
}

export function validatePacket(packet) {
  for (const key of ["id", "agent", "subject", "relation", "object"]) {
    required(packet[key], key);
  }

  if (!allowedKinds.has(packet.kind)) {
    throw new Error(`unsupported kind: ${packet.kind}`);
  }

  if (!allowedIntents.has(packet.intent)) {
    throw new Error(`unsupported intent: ${packet.intent}`);
  }

  clampConfidence(packet.confidence);
  return true;
}

export function normalizeList(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => String(item).trim()).filter(Boolean).sort();
}

export function normalizeMap(value) {
  const out = {};
  if (!value) return out;

  for (const [key, item] of Object.entries(value)) {
    const cleanKey = String(key).trim();
    const cleanValue = String(item).trim();
    if (cleanKey && cleanValue) out[cleanKey] = cleanValue;
  }

  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

function clampConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) {
    throw new Error(`confidence must be between 0 and 100: ${value}`);
  }
  return Math.round(number);
}

function required(value, name) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`missing required field: ${name}`);
  }
  return String(value).trim();
}

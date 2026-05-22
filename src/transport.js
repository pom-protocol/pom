import { createPacket } from "./model.js";

const kindCodes = {
  assert: "a",
  commit: "c",
  reject: "x",
  revise: "r",
  request: "q",
  observe: "o"
};

const intentCodes = {
  observe: "obs",
  verify: "vrf",
  act: "act",
  route: "rte",
  assist: "ast",
  notify: "ntf",
  halt: "hlt"
};

const reverseKinds = invert(kindCodes);
const reverseIntents = invert(intentCodes);

export function encodeP1(packet) {
  const parts = [
    "P1",
    `$${safe(packet.id)}`,
    `@${safe(packet.agent)}`,
    `!${kindCodes[packet.kind] ?? packet.kind}`,
    `${safe(packet.subject)}${packet.relation}${safe(packet.object)}`
  ];

  for (const evidence of packet.evidence) parts.push(`^${safe(evidence)}`);
  parts.push(`%${packet.confidence}`);
  parts.push(`~${intentCodes[packet.intent] ?? packet.intent}`);

  for (const id of packet.respondsTo) parts.push(`&${safe(id)}`);
  for (const id of packet.dependsOn) parts.push(`+${safe(id)}`);
  for (const id of packet.conflicts) parts.push(`-${safe(id)}`);
  for (const [key, value] of Object.entries(packet.context)) parts.push(`#${safe(key)}=${safe(value)}`);

  return parts.join(" ");
}

export function decodeP1(input) {
  const parts = input.trim().split(/\s+/);
  if (parts.shift() !== "P1") throw new Error("transport must start with P1");

  const draft = {
    evidence: [],
    respondsTo: [],
    dependsOn: [],
    conflicts: [],
    context: {}
  };

  for (const part of parts) {
    if (part.startsWith("$")) draft.id = unsafe(part.slice(1));
    else if (part.startsWith("@")) draft.agent = unsafe(part.slice(1));
    else if (part.startsWith("!")) draft.kind = reverseKinds[part.slice(1)] ?? part.slice(1);
    else if (part.startsWith("^")) draft.evidence.push(unsafe(part.slice(1)));
    else if (part.startsWith("%")) draft.confidence = Number(part.slice(1));
    else if (part.startsWith("~")) draft.intent = reverseIntents[part.slice(1)] ?? part.slice(1);
    else if (part.startsWith("&")) draft.respondsTo.push(unsafe(part.slice(1)));
    else if (part.startsWith("+")) draft.dependsOn.push(unsafe(part.slice(1)));
    else if (part.startsWith("-")) draft.conflicts.push(unsafe(part.slice(1)));
    else if (part.startsWith("#")) {
      const [key, value] = part.slice(1).split("=");
      draft.context[unsafe(key)] = unsafe(value);
    } else {
      const match = part.match(/^(.+?)(=|!=|>=|<=|>|<|->)(.+)$/);
      if (!match) throw new Error(`cannot parse claim: ${part}`);
      draft.subject = unsafe(match[1]);
      draft.relation = match[2];
      draft.object = unsafe(match[3]);
    }
  }

  return createPacket(draft);
}

export function encodeP2(packet) {
  return [
    "P2",
    safe(packet.id),
    safe(packet.agent),
    kindCodes[packet.kind] ?? packet.kind,
    safe(packet.subject),
    safe(packet.relation),
    safe(packet.object),
    packet.evidence.map(safe).join(","),
    packet.confidence,
    intentCodes[packet.intent] ?? packet.intent,
    encodeMap(packet.context),
    packet.respondsTo.map(safe).join(","),
    packet.dependsOn.map(safe).join(","),
    packet.conflicts.map(safe).join(",")
  ].join("|");
}

export function decodeP2(input) {
  const [
    version,
    id,
    agent,
    kind,
    subject,
    relation,
    object,
    evidence,
    confidence,
    intent,
    context,
    respondsTo,
    dependsOn,
    conflicts
  ] = input.trim().split("|");

  if (version !== "P2") throw new Error("transport must start with P2");

  return createPacket({
    id: unsafe(id),
    agent: unsafe(agent),
    kind: reverseKinds[kind] ?? kind,
    subject: unsafe(subject),
    relation: unsafe(relation),
    object: unsafe(object),
    evidence: decodeList(evidence),
    confidence: Number(confidence),
    intent: reverseIntents[intent] ?? intent,
    context: decodeMap(context),
    respondsTo: decodeList(respondsTo),
    dependsOn: decodeList(dependsOn),
    conflicts: decodeList(conflicts)
  });
}

function encodeMap(value) {
  return Object.entries(value).map(([key, item]) => `${safe(key)}=${safe(item)}`).join(",");
}

function decodeMap(value) {
  const out = {};
  if (!value) return out;
  for (const item of value.split(",")) {
    const [key, entryValue] = item.split("=");
    if (key) out[unsafe(key)] = unsafe(entryValue ?? "");
  }
  return out;
}

function decodeList(value) {
  if (!value) return [];
  return value.split(",").filter(Boolean).map(unsafe);
}

function safe(value) {
  return encodeURIComponent(String(value).trim()).replace(/%20/g, "_");
}

function unsafe(value) {
  return decodeURIComponent(String(value).replace(/_/g, "%20"));
}

function invert(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [item, key]));
}

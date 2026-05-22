import { createPacket } from "./model.js";

const kindWords = {
  asserts: "assert",
  assert: "assert",
  commits: "commit",
  commit: "commit",
  rejects: "reject",
  reject: "reject",
  revises: "revise",
  revise: "revise",
  requests: "request",
  request: "request",
  observes: "observe",
  observe: "observe"
};

const intentWords = {
  observe: "observe",
  verify: "verify",
  act: "act",
  route: "route",
  assist: "assist",
  notify: "notify",
  halt: "halt"
};

export function compileControlledEnglish(input, options = {}) {
  const text = String(input).trim();
  const first = text.match(/^Agent\s+(\S+)\s+(\S+)\s+that\s+(.+?)\s+with\s+(\d{1,3})%\s+confidence\./i);
  if (!first) {
    throw new Error("input does not match POM controlled English");
  }

  const [, agent, kindWord, claimText, confidence] = first;
  const claim = parseClaim(claimText);
  const evidence = parseEvidence(claim.evidenceText);
  const intent = parseIntent(text) ?? options.defaultIntent ?? defaultIntent(kindWords[kindWord.toLowerCase()]);
  const context = parseContext(text, options.defaultContext);
  const references = parseReferences(text);

  return createPacket({
    id: options.id ?? nextId(options.idPrefix ?? "p"),
    agent,
    kind: kindWords[kindWord.toLowerCase()],
    subject: claim.subject,
    relation: claim.relation,
    object: claim.object,
    evidence,
    confidence: Number(confidence),
    intent,
    context,
    respondsTo: references.respondsTo,
    dependsOn: references.dependsOn,
    conflicts: references.conflicts
  });
}

let counter = 0;

function nextId(prefix) {
  counter += 1;
  return `${prefix}-${String(counter).padStart(3, "0")}`;
}

function parseClaim(text) {
  const [core, evidenceText = ""] = text.split(/\s+based\s+on\s+/i);
  const patterns = [
    [/^(.+?)\s+is\s+not\s+(.+)$/i, "!="],
    [/^(.+?)\s+is\s+(.+)$/i, "="],
    [/^(.+?)\s+equals\s+(.+)$/i, "="],
    [/^(.+?)\s+routes\s+to\s+(.+)$/i, "->"],
    [/^(.+?)\s+is\s+at\s+least\s+(.+)$/i, ">="],
    [/^(.+?)\s+is\s+at\s+most\s+(.+)$/i, "<="]
  ];

  for (const [pattern, relation] of patterns) {
    const match = core.trim().match(pattern);
    if (match) {
      return {
        subject: cleanAtom(match[1]),
        relation,
        object: cleanAtom(match[2]),
        evidenceText
      };
    }
  }

  throw new Error(`cannot parse claim: ${core}`);
}

function parseEvidence(text) {
  if (!text) return [];
  return text
    .replace(/\s+and\s+/gi, ",")
    .replace(/\s+at\s+/gi, "@")
    .split(",")
    .map(cleanAtom)
    .filter(Boolean);
}

function parseIntent(text) {
  const match = text.match(/\.\s*(Observe|Verify|Act|Route|Assist|Notify|Halt)\s+next\./i);
  if (!match) return null;
  return intentWords[match[1].toLowerCase()];
}

function parseContext(text, fallback = {}) {
  const match = text.match(/\.\s*Context\s+(.+?)\./i);
  if (!match) return fallback;

  const context = {};
  for (const item of match[1].split(",")) {
    const clean = item.trim();
    const pair = clean.match(/^(\S+)\s+(.+)$/);
    if (pair) context[cleanAtom(pair[1])] = cleanAtom(pair[2]);
  }
  return context;
}

function parseReferences(text) {
  return {
    respondsTo: parseRefList(text, /Responds\s+to\s+(.+?)\./i),
    dependsOn: parseRefList(text, /Depends\s+on\s+(.+?)\./i),
    conflicts: parseRefList(text, /Conflicts\s+with\s+(.+?)\./i)
  };
}

function parseRefList(text, pattern) {
  const match = text.match(pattern);
  if (!match) return [];
  return match[1]
    .replace(/\s+and\s+/gi, ",")
    .split(",")
    .map(cleanAtom)
    .filter(Boolean);
}

function defaultIntent(kind) {
  return {
    assert: "verify",
    commit: "act",
    reject: "halt",
    revise: "verify",
    request: "assist",
    observe: "observe"
  }[kind] ?? "verify";
}

function cleanAtom(value) {
  return String(value).trim().replace(/\s+/g, "-");
}

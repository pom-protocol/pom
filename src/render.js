export function renderEnglish(packet) {
  const evidence = packet.evidence.length ? ` based on ${packet.evidence.join(", ")}` : "";
  const context = Object.entries(packet.context).length
    ? ` Context ${Object.entries(packet.context).map(([key, value]) => `${key} ${value}`).join(", ")}.`
    : "";

  return `Agent ${packet.agent} ${packet.kind}s that ${packet.subject} ${wordRelation(packet.relation)} ${packet.object}${evidence} with ${packet.confidence}% confidence. Intent: ${packet.intent}.${context}`;
}

function wordRelation(relation) {
  return {
    "=": "is",
    "!=": "is not",
    "->": "routes to",
    ">=": "is at least",
    "<=": "is at most"
  }[relation] ?? relation;
}

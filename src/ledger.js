import { meaningHash } from "./proof.js";

const opposites = new Map([
  ["open", "closed"],
  ["closed", "open"],
  ["true", "false"],
  ["false", "true"],
  ["safe", "unsafe"],
  ["unsafe", "safe"],
  ["allowed", "blocked"],
  ["blocked", "allowed"]
]);

export class MeaningLedger {
  constructor() {
    this.packets = new Map();
    this.byMeaning = new Map();
    this.conflicts = [];
  }

  add(packet) {
    if (this.packets.has(packet.id)) {
      throw new Error(`duplicate packet id: ${packet.id}`);
    }

    for (const ref of [...packet.respondsTo, ...packet.dependsOn, ...packet.conflicts]) {
      if (!this.packets.has(ref)) {
        throw new Error(`unknown reference ${ref} in packet ${packet.id}`);
      }
    }

    const derived = this.deriveConflicts(packet);
    this.packets.set(packet.id, packet);
    this.byMeaning.set(meaningHash(packet), packet.id);
    this.conflicts.push(...derived);

    return {
      id: packet.id,
      meaningHash: meaningHash(packet),
      derivedConflicts: derived
    };
  }

  deriveConflicts(packet) {
    const conflicts = [];
    for (const existing of this.packets.values()) {
      if (sameContext(existing.context, packet.context) && sameAtom(existing.subject, packet.subject)) {
        if (isConflict(existing, packet)) {
          conflicts.push({
            left: existing.id,
            right: packet.id,
            reason: `${existing.subject} ${existing.relation} ${existing.object} conflicts with ${packet.relation} ${packet.object}`
          });
        }
      }
    }
    return conflicts;
  }
}

function isConflict(a, b) {
  if (a.relation === "=" && b.relation === "!=" && sameAtom(a.object, b.object)) return true;
  if (a.relation === "!=" && b.relation === "=" && sameAtom(a.object, b.object)) return true;
  if (a.relation === "=" && b.relation === "=") {
    return opposites.get(String(a.object).toLowerCase()) === String(b.object).toLowerCase();
  }
  return false;
}

function sameContext(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function sameAtom(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

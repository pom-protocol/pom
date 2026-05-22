import { hashText, meaningHash } from "./proof.js";

export function createProofBatch(packets) {
  if (!packets.length) throw new Error("proof batch requires at least one packet");

  const leaves = packets.map((packet) => ({
    id: packet.id,
    meaningHash: meaningHash(packet)
  }));

  const tree = buildTree(leaves.map((leaf) => leaf.meaningHash));

  return {
    batch: "pom-batch:v1",
    root: tree.at(-1)[0],
    leaves,
    size: leaves.length
  };
}

export function createInclusionProof(batch, packetId) {
  const index = batch.leaves.findIndex((leaf) => leaf.id === packetId);
  if (index === -1) throw new Error(`packet is not in batch: ${packetId}`);

  const levels = buildTree(batch.leaves.map((leaf) => leaf.meaningHash));
  const path = [];
  let cursor = index;

  for (let level = 0; level < levels.length - 1; level += 1) {
    const sibling = cursor % 2 === 0 ? cursor + 1 : cursor - 1;
    const siblingHash = levels[level][sibling] ?? levels[level][cursor];
    path.push({
      side: cursor % 2 === 0 ? "right" : "left",
      hash: siblingHash
    });
    cursor = Math.floor(cursor / 2);
  }

  return {
    packetId,
    leaf: batch.leaves[index].meaningHash,
    root: batch.root,
    path
  };
}

export function verifyInclusionProof(proof) {
  let current = proof.leaf;

  for (const step of proof.path) {
    current = step.side === "right"
      ? parentHash(current, step.hash)
      : parentHash(step.hash, current);
  }

  return current === proof.root;
}

function buildTree(leaves) {
  const levels = [leaves];
  let current = leaves;

  while (current.length > 1) {
    const next = [];
    for (let index = 0; index < current.length; index += 2) {
      next.push(parentHash(current[index], current[index + 1] ?? current[index]));
    }
    levels.push(next);
    current = next;
  }

  return levels;
}

function parentHash(left, right) {
  return hashText("b", `${left}|${right}`);
}

import { runPomRuntimeSession } from "./runtime.js";

const session = runPomRuntimeSession();

console.log("POM RUNTIME");
console.log(JSON.stringify({
  runtime: session.runtime,
  transport: session.transport,
  hopCount: session.hops.length,
  batchRoot: session.batch.root,
  conflicts: session.conflicts,
  hops: session.hops.map((hop) => ({
    actor: hop.actor,
    transport: hop.transport,
    meaningHash: hop.envelope.meaningHash
  }))
}, null, 2));

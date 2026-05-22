#!/usr/bin/env node
import {
  compileControlledEnglish,
  createEnvelope,
  decodeP1,
  decodeP2,
  verifyEnvelope
} from "./index.js";

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
  } else if (command === "compile") {
    compileCommand(args);
  } else if (command === "verify") {
    verifyCommand(args);
  } else if (command === "decode") {
    decodeCommand(args);
  } else {
    throw new Error(`unknown command: ${command}`);
  }
} catch (error) {
  console.error(`POM error: ${error.message}`);
  process.exit(1);
}

function compileCommand(args) {
  const useP2 = args.includes("--p2");
  const input = args.filter((arg) => arg !== "--p2").join(" ");
  if (!input) throw new Error("compile requires controlled English input");
  const packet = compileControlledEnglish(input);
  const envelope = createEnvelope(packet, [], { transport: useP2 ? "P2" : "P1" });
  printJson({ packet, envelope });
}

function verifyCommand(args) {
  const transport = args.join(" ");
  if (!transport) throw new Error("verify requires a P1 or P2 transport string");
  const packet = decodeTransport(transport);
  const matchingEnvelope = createEnvelope(packet, [], { transport: transport.startsWith("P2|") ? "P2" : "P1" });
  printJson({ packet, envelope: matchingEnvelope, verification: verifyEnvelope(packet, matchingEnvelope) });
}

function decodeCommand(args) {
  const transport = args.join(" ");
  if (!transport) throw new Error("decode requires a P1 or P2 transport string");
  printJson({ packet: decodeTransport(transport) });
}

function printHelp() {
  console.log(`Proof of Meaning CLI

Usage:
  pom compile "<controlled English>"
  pom compile --p2 "<controlled English>"
  pom decode 'P1 $p-001 @scout !a door=open %91 ~obs #room=A'
  pom decode 'P2|p-001|scout|a|door|%3D|open||91|obs|room=A|||'
  pom verify 'P1 $p-001 @scout !a door=open %91 ~obs #room=A'

Examples:
  pom compile "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A."
`);
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function decodeTransport(transport) {
  if (transport.startsWith("P2|")) return decodeP2(transport);
  return decodeP1(transport);
}

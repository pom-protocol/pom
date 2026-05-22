import { compileControlledEnglish } from "./compiler.js";
import { createEnvelope } from "./proof.js";

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.error("usage: node src/compile-cli.js \"Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A.\"");
  process.exit(1);
}

const packet = compileControlledEnglish(input);
const envelope = createEnvelope(packet);

console.log(JSON.stringify({ packet, envelope }, null, 2));

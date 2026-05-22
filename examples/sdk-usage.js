import {
  compile,
  prove,
  verify,
  MeaningLedger
} from "../src/index.js";

const packet = compile(
  "Agent scout asserts that door is open based on camera 12 at 14:03 with 91% confidence. Observe next. Context room A."
);

const envelope = prove(packet);
const ledger = new MeaningLedger();
const result = ledger.add(packet);

console.log(JSON.stringify({
  transport: envelope.transport,
  meaningHash: envelope.meaningHash,
  verification: verify(packet, envelope),
  ledger: result
}, null, 2));

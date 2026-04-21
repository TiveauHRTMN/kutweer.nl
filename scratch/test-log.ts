import { logAgentAction } from "../src/lib/agent-logger";

async function testLog() {
  console.log("Sending test log as 'Hermes'...");
  await logAgentAction(
    "Hermes",
    "system_check",
    "MANUELE TEST LOG: De machine ontwaakt.",
    { source: "scratch-script", environment: "local" }
  );
  console.log("Done. Check the cockpit now.");
}

testLog();

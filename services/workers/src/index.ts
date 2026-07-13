import { previewResolvedRules, runStockholmRulePipelineSimulation } from "./stockholm-rule-pipeline";
import { syncOfficialTariffSnapshotFromRawHtml } from "./stockholm-source-parser";
import { refreshStockholmOfficialSourcePages } from "./stockholm-source-refresh";

const registeredJobs = [
  "restriction-reminders",
  "street-cleaning-alerts",
  "subscription-entitlement-sync",
  "stockholm-rule-pipeline-simulation"
];

async function main() {
  const command = process.argv[2] ?? "list";

  if (command === "stockholm-rule-pipeline") {
    await runStockholmRulePipelineSimulation();
    return;
  }

  if (command === "preview-stockholm-rules") {
    previewResolvedRules();
    return;
  }

  if (command === "stockholm-source-refresh") {
    await refreshStockholmOfficialSourcePages();
    return;
  }

  if (command === "stockholm-source-sync") {
    const snapshot = await syncOfficialTariffSnapshotFromRawHtml();
    console.log(
      `[workers] synced official tariff snapshot with ${snapshot.tariffAreas.length} parsed tariff areas.`
    );
    return;
  }

  for (const job of registeredJobs) {
    console.log(`[workers] registered job: ${job}`);
  }
}

void main();

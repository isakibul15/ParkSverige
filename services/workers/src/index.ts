const registeredJobs = [
  "restriction-reminders",
  "street-cleaning-alerts",
  "subscription-entitlement-sync"
];

for (const job of registeredJobs) {
  console.log(`[workers] registered job: ${job}`);
}


import type {
  ParkingRuleSnapshot,
  ParkingRuleSource,
  ResolvedParkingRule
} from "@parksverige/shared-types";

type ZoneRuleBaseline = ParkingRuleSnapshot & {
  source: ParkingRuleSource;
};

type ZoneRuleOverride = {
  patch: Partial<ParkingRuleSnapshot>;
  source: ParkingRuleSource;
  resolutionNotes: string[];
};

const stockholmTariffSource: ParkingRuleSource = {
  id: "stockholm-tariff-2026",
  label: "Stockholm tariff area baseline",
  kind: "official_tariff",
  publisher: "Stockholms stad",
  sourceUrl: "https://parkering.stockholm/betala-parkering/taxeomraden-avgifter/",
  checkedAt: "2026-07-11T20:15:00Z",
  note: "Official tariff baseline. Street signage remains the final authority."
};

const stockholmRuleSource: ParkingRuleSource = {
  id: "stockholm-rules-2026",
  label: "Stockholm parking rules",
  kind: "local_regulation",
  publisher: "Stockholms stad",
  sourceUrl: "https://parkering.stockholm/parkeringsregler/",
  checkedAt: "2026-07-11T20:16:00Z",
  note: "Used as the municipal rule reference layer for explanatory copy."
};

const kthOverrideSource: ParkingRuleSource = {
  id: "kth-valhallavagen-local-override",
  label: "KTH local sign override",
  kind: "sign_override",
  publisher: "ParkSverige prototype curation",
  checkedAt: "2026-07-11T19:24:00Z",
  note: "Driver-confirmed local timing for the KTH Valhallavagen edge used until live sign ingestion exists."
};

const zoneRuleBaselines: Record<string, ZoneRuleBaseline> = {
  zone_sveavagen_01: {
    zoneId: "zone_sveavagen_01",
    parkingAllowed: true,
    maxDurationMinutes: 120,
    feeRequired: true,
    permitRequired: false,
    scheduleLabel: "Mon-Fri 08:00-18:00",
    streetCleaningLabel: "Tuesday 00:00-06:00",
    priceLabel: "25 SEK / h",
    sourceUpdatedAt: "2026-07-11T18:53:00Z",
    source: stockholmRuleSource
  },
  zone_kungsholmen_02: {
    zoneId: "zone_kungsholmen_02",
    parkingAllowed: true,
    maxDurationMinutes: 240,
    feeRequired: true,
    permitRequired: false,
    scheduleLabel: "Taxa 2 visitor parking",
    streetCleaningLabel: "Thursday 00:00-06:00",
    priceLabel: "31 SEK / h daytime · 20 SEK / h off-peak",
    sourceUpdatedAt: "2026-07-11T20:15:00Z",
    source: stockholmTariffSource
  },
  zone_kth_03: {
    zoneId: "zone_kth_03",
    parkingAllowed: true,
    feeRequired: true,
    permitRequired: false,
    scheduleLabel: "Taxa 3 visitor parking",
    streetCleaningLabel: "Wednesday 00:00-06:00",
    priceLabel: "20 SEK / h weekdays 07:00-19:00",
    sourceUpdatedAt: "2026-07-11T20:15:00Z",
    source: stockholmTariffSource
  }
};

const zoneRuleOverrides: Partial<Record<string, ZoneRuleOverride>> = {
  zone_kth_03: {
    patch: {
      scheduleLabel: "Daily 07:00-19:00 paid, free outside these hours",
      priceLabel: "Fee 07:00-19:00 · free after 19:00",
      sourceUpdatedAt: "2026-07-11T19:24:00Z"
    },
    source: kthOverrideSource,
    resolutionNotes: [
      "Official Stockholm tariff data is used as the baseline.",
      "The KTH zone currently applies a local override because on-street signage can be stricter or more specific than area tariffs.",
      "This override should be replaced by municipality sign-level ingestion in a later data phase."
    ]
  }
};

export function resolveStockholmRule(zoneId: string): ResolvedParkingRule | null {
  const baseline = zoneRuleBaselines[zoneId];

  if (!baseline) {
    return null;
  }

  const { source, ...baselineRule } = baseline;
  const override = zoneRuleOverrides[zoneId];

  if (!override) {
    return {
      ...baselineRule,
      resolutionStrategy: "official_baseline_with_local_override",
      sources: [source],
      resolutionNotes: [
        "Rule is currently derived from Stockholm municipality tariff and rule references.",
        "Street signage should still be treated as the final authority for payment and timing."
      ]
    };
  }

  return {
    ...baselineRule,
    ...override.patch,
    resolutionStrategy: "official_baseline_with_local_override",
    sources: [source, override.source],
    resolutionNotes: override.resolutionNotes
  };
}

export const parkingRules: Record<string, ResolvedParkingRule> = Object.fromEntries(
  Object.keys(zoneRuleBaselines).map((zoneId) => [zoneId, resolveStockholmRule(zoneId)])
) as Record<string, ResolvedParkingRule>;

export const zoneRuleFeatures: Record<string, string[]> = {
  zone_sveavagen_01: [
    "Fast pickup zone",
    "Great for short errands",
    "Medium availability after work"
  ],
  zone_kungsholmen_02: [
    "Short walk to destination",
    "Low enforcement complexity",
    "Ideal after 19:00"
  ],
  zone_kth_03: ["Campus-side parking", "Paid until 19:00", "Free overnight window"]
};

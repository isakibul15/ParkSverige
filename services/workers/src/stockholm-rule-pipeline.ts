import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  parkingRules,
  parkingZones,
  searchResults,
  zoneRuleFeatures
} from "../../../packages/prototype-data/src/index";
import type { ResolvedParkingRule } from "../../../packages/shared-types/src/index";
import {
  buildTariffPriceSummary,
  loadStockholmSourceSnapshots
} from "./stockholm-source-parser";

interface BronzeReferenceSnapshot {
  ingestion_batch_id: string;
  source_id: string;
  source_url: string;
  source_checked_at: string;
  content_format: "json";
  raw_payload: string;
  payload_sha256: string;
  ingested_at: string;
}

interface SilverZoneRuleCandidate {
  zone_id: string;
  city_slug: string;
  candidate_kind: string;
  schedule_label: string;
  price_label?: string;
  fee_required: boolean;
  permit_required: boolean;
  max_duration_minutes?: number;
  precedence_rank: number;
  source_label: string;
  source_url?: string;
  source_checked_at: string;
  normalized_at: string;
}

interface GoldZoneRuleResolution {
  zone_id: string;
  external_zone_key: string;
  city_slug: string;
  resolution_strategy: string;
  effective_schedule_label: string;
  effective_price_label?: string;
  fee_required: boolean;
  permit_required: boolean;
  max_duration_minutes?: number;
  primary_source_kind: string;
  primary_source_label: string;
  secondary_source_label?: string;
  rule_sources_json: string;
  resolution_notes_json: string;
  source_updated_at: string;
  published_at: string;
}

function stableHash(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function getZoneAlias(zoneId: string) {
  return searchResults.find((result) => result.zoneId === zoneId)?.title ?? zoneId;
}

const zoneTariffAreaMap: Partial<Record<string, string>> = {
  zone_kungsholmen_02: "2",
  zone_kth_03: "3"
};

function buildBronzeSnapshots(
  now: string,
  batchId: string,
  snapshots: Awaited<ReturnType<typeof loadStockholmSourceSnapshots>>
): BronzeReferenceSnapshot[] {
  return [
    {
      ingestion_batch_id: batchId,
      source_id: snapshots.tariffs.sourceId,
      source_url: snapshots.tariffs.sourceUrl,
      source_checked_at: snapshots.tariffs.checkedAt,
      content_format: "json",
      raw_payload: JSON.stringify(snapshots.tariffs),
      payload_sha256: stableHash(JSON.stringify(snapshots.tariffs)),
      ingested_at: now
    },
    {
      ingestion_batch_id: batchId,
      source_id: snapshots.rules.sourceId,
      source_url: snapshots.rules.sourceUrl,
      source_checked_at: snapshots.rules.checkedAt,
      content_format: "json",
      raw_payload: JSON.stringify(snapshots.rules),
      payload_sha256: stableHash(JSON.stringify(snapshots.rules)),
      ingested_at: now
    },
    {
      ingestion_batch_id: batchId,
      source_id: snapshots.overrides.sourceId,
      source_url: "internal://parksverige/stockholm/sign-overrides",
      source_checked_at: snapshots.overrides.checkedAt,
      content_format: "json",
      raw_payload: JSON.stringify(snapshots.overrides),
      payload_sha256: stableHash(JSON.stringify(snapshots.overrides)),
      ingested_at: now
    }
  ];
}

function buildSilverCandidates(
  now: string,
  snapshots: Awaited<ReturnType<typeof loadStockholmSourceSnapshots>>
): SilverZoneRuleCandidate[] {
  const officialTariffCandidates = parkingZones.flatMap((zone) => {
    const tariffCode = zoneTariffAreaMap[zone.id];
    const tariffArea = snapshots.tariffs.tariffAreas.find((entry) => entry.code === tariffCode);

    if (!tariffArea) {
      return [];
    }

    return [
      {
        zone_id: zone.id,
        city_slug: "stockholm",
        candidate_kind: "official_tariff",
        schedule_label: `${tariffArea.label} visitor parking`,
        price_label: buildTariffPriceSummary(tariffArea).join(" · "),
        fee_required: true,
        permit_required: false,
        precedence_rank: 1,
        source_label: "Stockholm tariff area baseline",
        source_url: snapshots.tariffs.sourceUrl,
        source_checked_at: snapshots.tariffs.checkedAt,
        normalized_at: now
      }
    ];
  });

  const ruleReferenceCandidates = snapshots.rules.zoneReferences.map((reference) => ({
    zone_id: reference.zoneId,
    city_slug: "stockholm",
    candidate_kind: "local_regulation",
    schedule_label: reference.scheduleLabel,
    price_label: reference.priceLabel,
    fee_required: true,
    permit_required: false,
    max_duration_minutes: reference.maxDurationMinutes,
    precedence_rank: 1,
    source_label: "Stockholm parking rules",
    source_url: snapshots.rules.sourceUrl,
    source_checked_at: snapshots.rules.checkedAt,
    normalized_at: now
  }));

  const overrideCandidates = snapshots.overrides.overrides.map((override) => ({
    zone_id: override.zoneId,
    city_slug: "stockholm",
    candidate_kind: "sign_override",
    schedule_label: override.scheduleLabel,
    price_label: override.priceLabel,
    fee_required: override.feeRequired,
    permit_required: override.permitRequired,
    precedence_rank: 2,
    source_label: override.sourceLabel,
    source_url: "internal://parksverige/stockholm/sign-overrides",
    source_checked_at: snapshots.overrides.checkedAt,
    normalized_at: now
  }));

  const resolvedSourceCandidates = Object.values(parkingRules).flatMap((rule) =>
    rule.sources.map((source, index) => ({
      zone_id: rule.zoneId,
      city_slug: "stockholm",
      candidate_kind: source.kind,
      schedule_label:
        index === 0 && rule.sources.length > 1 ? "Baseline candidate before override" : rule.scheduleLabel,
      price_label: rule.priceLabel,
      fee_required: rule.feeRequired,
      permit_required: rule.permitRequired,
      max_duration_minutes: rule.maxDurationMinutes,
      precedence_rank: index + 1,
      source_label: source.label,
      source_url: source.sourceUrl,
      source_checked_at: source.checkedAt ?? now,
      normalized_at: now
    }))
  );

  const merged = [...officialTariffCandidates, ...ruleReferenceCandidates, ...overrideCandidates];
  const seen = new Set(merged.map((candidate) => `${candidate.zone_id}:${candidate.candidate_kind}:${candidate.precedence_rank}`));

  return [
    ...merged,
    ...resolvedSourceCandidates.filter(
      (candidate) =>
        !seen.has(`${candidate.zone_id}:${candidate.candidate_kind}:${candidate.precedence_rank}`)
    )
  ];
}

function buildGoldResolutions(now: string): GoldZoneRuleResolution[] {
  return Object.values(parkingRules).map((rule) => ({
    zone_id: rule.zoneId,
    external_zone_key: rule.zoneId,
    city_slug: "stockholm",
    resolution_strategy: rule.resolutionStrategy,
    effective_schedule_label: rule.scheduleLabel,
    effective_price_label: rule.priceLabel,
    fee_required: rule.feeRequired,
    permit_required: rule.permitRequired,
    max_duration_minutes: rule.maxDurationMinutes,
    primary_source_kind: rule.sources[0]?.kind ?? "curated_override",
    primary_source_label: rule.sources[0]?.label ?? "Unknown source",
    secondary_source_label: rule.sources[1]?.label,
    rule_sources_json: JSON.stringify(rule.sources),
    resolution_notes_json: JSON.stringify(rule.resolutionNotes),
    source_updated_at: rule.sourceUpdatedAt ?? now,
    published_at: now
  }));
}

function buildServingExport(now: string): Array<Record<string, string | boolean | number | undefined>> {
  return Object.values(parkingRules).map((rule) => ({
    zone_id: rule.zoneId,
    external_zone_key: rule.zoneId,
    zone_name: getZoneAlias(rule.zoneId),
    city_slug: "stockholm",
    parking_allowed: rule.parkingAllowed,
    fee_required: rule.feeRequired,
    permit_required: rule.permitRequired,
    max_duration_minutes: rule.maxDurationMinutes,
    price_label: rule.priceLabel,
    restriction_label: rule.scheduleLabel,
    source_updated_at: rule.sourceUpdatedAt ?? now,
    published_at: now
  }));
}

async function writeJson(outputPath: string, value: unknown) {
  await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function runStockholmRulePipelineSimulation() {
  const now = new Date().toISOString();
  const batchId = `stockholm_${now.slice(0, 10).replaceAll("-", "")}`;
  const outputDir = path.resolve(
    process.cwd(),
    "../../data-platform/databricks/sample-output/stockholm"
  );

  await mkdir(outputDir, { recursive: true });

  const snapshots = await loadStockholmSourceSnapshots();
  const bronzeSnapshots = buildBronzeSnapshots(now, batchId, snapshots);
  const silverCandidates = buildSilverCandidates(now, snapshots);
  const goldResolutions = buildGoldResolutions(now);
  const servingExport = buildServingExport(now);

  await Promise.all([
    writeJson(path.join(outputDir, "bronze-reference-snapshots.json"), bronzeSnapshots),
    writeJson(path.join(outputDir, "silver-zone-rule-candidates.json"), silverCandidates),
    writeJson(path.join(outputDir, "gold-zone-rule-resolution.json"), goldResolutions),
    writeJson(path.join(outputDir, "gold-zone-rule-export.json"), servingExport)
  ]);

  console.log("[workers] wrote Stockholm rule pipeline simulation files:");
  console.log(`- ${path.join(outputDir, "bronze-reference-snapshots.json")}`);
  console.log(`- ${path.join(outputDir, "silver-zone-rule-candidates.json")}`);
  console.log(`- ${path.join(outputDir, "gold-zone-rule-resolution.json")}`);
  console.log(`- ${path.join(outputDir, "gold-zone-rule-export.json")}`);
}

export function previewResolvedRules() {
  const entries = Object.values(parkingRules).map((rule: ResolvedParkingRule) => ({
    zoneId: rule.zoneId,
    strategy: rule.resolutionStrategy,
    price: rule.priceLabel,
    restriction: rule.scheduleLabel,
    sources: rule.sources.map((source) => source.label).join(" + ")
  }));

  console.table(entries);
}

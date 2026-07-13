import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface TariffWindowSnapshot {
  dayType: string;
  startLocalTime: string;
  endLocalTime: string;
  priceMinorSek: number;
  priceLabel: string;
}

export interface TariffAreaSnapshot {
  code: string;
  label: string;
  visitorParking: TariffWindowSnapshot[];
}

export interface OfficialTariffSnapshot {
  sourceId: string;
  sourceUrl: string;
  checkedAt: string;
  pageUpdatedAt: string;
  notes: string[];
  tariffAreas: TariffAreaSnapshot[];
}

export interface OfficialRuleSnapshot {
  sourceId: string;
  sourceUrl: string;
  checkedAt: string;
  rules: Array<{
    ruleId: string;
    scope: string;
    parkingAllowed: boolean;
    streetCleaning: boolean;
    restrictionLabel: string;
  }>;
  zoneReferences: Array<{
    zoneId: string;
    label: string;
    scheduleLabel: string;
    priceLabel: string;
    maxDurationMinutes?: number;
  }>;
}

export interface SignOverrideSnapshot {
  sourceId: string;
  checkedAt: string;
  overrides: Array<{
    overrideId: string;
    zoneId: string;
    locationLabel: string;
    scheduleLabel: string;
    priceLabel?: string;
    feeRequired: boolean;
    permitRequired: boolean;
    sourceLabel: string;
    sourceNote?: string;
  }>;
}

export interface ParsedStockholmSources {
  tariffs: OfficialTariffSnapshot;
  rules: OfficialRuleSnapshot;
  overrides: SignOverrideSnapshot;
}

interface RawSnapshotMetadata {
  sourceId: string;
  sourceUrl: string;
  checkedAt: string;
  contentType?: string | null;
  contentLengthBytes?: number;
  markersVerified?: string[];
}

const snapshotDir = path.resolve(
  process.cwd(),
  "../../data-platform/databricks/source-snapshots/stockholm"
);

const rawSnapshotDir = path.join(snapshotDir, "raw");

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#xE5;|&aring;/g, "å")
    .replace(/&#xF6;|&ouml;/g, "ö")
    .replace(/&#xE4;|&auml;/g, "ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Aring;/g, "Å")
    .replace(/&ndash;/g, "-")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatTime(hours: string, minutes: string) {
  return `${hours}:${minutes}`;
}

function parseMinorSek(value: string) {
  return Math.round(Number(value.replace(",", ".")) * 100);
}

function normalizeDayType(label: string) {
  const normalized = decodeHtmlEntities(label).toLowerCase();

  if (normalized.includes("vardagar utom vardag före sön- och helgdag")) {
    return "weekday";
  }

  if (normalized.includes("vardag före sön- och helgdag")) {
    return "pre_holiday_weekday";
  }

  if (normalized.includes("sön- och helgdag")) {
    return "holiday";
  }

  if (normalized.includes("övrig tid")) {
    return "off_peak";
  }

  return normalized
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractVisitorParkingItems(sectionHtml: string) {
  const visitorMatch = sectionHtml.match(
    /<h3>Bes(?:&ouml;|&#xF6;)ksparkering<\/h3>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i
  );

  if (!visitorMatch) {
    return [];
  }

  return [...visitorMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((match) =>
    decodeHtmlEntities(match[1])
  );
}

function parseVisitorParkingWindows(items: string[]): TariffWindowSnapshot[] {
  const windows: TariffWindowSnapshot[] = [];

  for (const item of items) {
    const timedWindowMatch = item.match(
      /^(.+?):\s*([\d,]+)\s+kronor per timme,\s*mellan klockan\s+(\d{2})\.(\d{2})\s+och\s+(\d{2})\.(\d{2})\.(?:\s*Övrig tid\s+([\d,]+)\s+kronor per timme\.)?$/i
    );

    if (timedWindowMatch) {
      const [, dayLabel, primaryPrice, startHour, startMinute, endHour, endMinute, offPeakPrice] =
        timedWindowMatch;
      const dayType = normalizeDayType(dayLabel);
      const startLocalTime = formatTime(startHour, startMinute);
      const endLocalTime = formatTime(endHour, endMinute);

      windows.push({
        dayType,
        startLocalTime,
        endLocalTime,
        priceMinorSek: parseMinorSek(primaryPrice),
        priceLabel: `${primaryPrice.replace(",", ".")} SEK / h`
      });

      if (offPeakPrice) {
        windows.push({
          dayType: `${dayType}_off_peak`,
          startLocalTime: endLocalTime,
          endLocalTime: startLocalTime,
          priceMinorSek: parseMinorSek(offPeakPrice),
          priceLabel: `${offPeakPrice.replace(",", ".")} SEK / h`
        });
      }

      continue;
    }

    const freeWindowMatch = item.match(/^(.+?):\s*Ingen avgift\.?$/i);

    if (freeWindowMatch) {
      const [, dayLabel] = freeWindowMatch;
      const primaryWindow = windows[0];

      windows.push({
        dayType: normalizeDayType(dayLabel),
        startLocalTime: primaryWindow?.endLocalTime ?? "19:00",
        endLocalTime: primaryWindow?.startLocalTime ?? "07:00",
        priceMinorSek: 0,
        priceLabel: "Ingen avgift"
      });
    }
  }

  return windows;
}

function parseTariffAreasFromHtml(html: string): TariffAreaSnapshot[] {
  const sectionRegex =
    /<h2>Taxeomr(?:&aring;|&#xE5;)de\s+(\d+)<\/h2>([\s\S]*?)(?=<h2>Taxeomr(?:&aring;|&#xE5;)de\s+\d+<\/h2>|<h2>Vid centrum|<h2>Parkeringsskiva|<h2>Betala parkering)/gi;

  const areas: TariffAreaSnapshot[] = [];

  for (const match of html.matchAll(sectionRegex)) {
    const [, code, sectionHtml] = match;
    const visitorParking = parseVisitorParkingWindows(extractVisitorParkingItems(sectionHtml));

    if (!visitorParking.length) {
      continue;
    }

    areas.push({
      code,
      label: `Taxeområde ${code}`,
      visitorParking
    });
  }

  return areas;
}

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(snapshotDir, fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function readRawSnapshot(fileBaseName: string) {
  const [html, metadataRaw] = await Promise.all([
    readFile(path.join(rawSnapshotDir, `${fileBaseName}.html`), "utf8"),
    readFile(path.join(rawSnapshotDir, `${fileBaseName}.metadata.json`), "utf8")
  ]);

  return {
    html,
    metadata: JSON.parse(metadataRaw) as RawSnapshotMetadata
  };
}

function extractUpdatedDate(html: string) {
  const updatedMatch = decodeHtmlEntities(html).match(/Uppdaterad\s+(\d{4}-\d{2}-\d{2})/);
  return updatedMatch?.[1] ? `${updatedMatch[1]}T00:00:00Z` : new Date().toISOString();
}

export async function syncOfficialTariffSnapshotFromRawHtml() {
  const { html, metadata } = await readRawSnapshot("official-tariffs.page");

  const structuredSnapshot: OfficialTariffSnapshot = {
    sourceId: metadata.sourceId,
    sourceUrl: metadata.sourceUrl,
    checkedAt: metadata.checkedAt,
    pageUpdatedAt: extractUpdatedDate(html),
    notes: [
      "Stockholm has five main tariff areas.",
      "Street signage on site decides the final applicable fee."
    ],
    tariffAreas: parseTariffAreasFromHtml(html)
  };

  await writeFile(
    path.join(snapshotDir, "official-tariffs.snapshot.json"),
    `${JSON.stringify(structuredSnapshot, null, 2)}\n`,
    "utf8"
  );

  return structuredSnapshot;
}

export async function loadStockholmSourceSnapshots(): Promise<ParsedStockholmSources> {
  const [tariffs, rules, overrides] = await Promise.all([
    readJsonFile<OfficialTariffSnapshot>("official-tariffs.snapshot.json"),
    readJsonFile<OfficialRuleSnapshot>("official-rules.snapshot.json"),
    readJsonFile<SignOverrideSnapshot>("sign-overrides.seed.json")
  ]);

  return {
    tariffs,
    rules,
    overrides
  };
}

export function buildTariffPriceSummary(area: TariffAreaSnapshot) {
  return area.visitorParking.map(
    (window) => `${window.priceLabel} ${window.startLocalTime}-${window.endLocalTime}`
  );
}

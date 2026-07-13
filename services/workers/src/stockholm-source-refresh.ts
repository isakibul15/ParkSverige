import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const tariffUrl = "https://parkering.stockholm/betala-parkering/taxeomraden-avgifter/";
const rulesUrl = "https://parkering.stockholm/parkeringsregler/";

interface RefreshedPageMetadata {
  sourceId: string;
  sourceUrl: string;
  checkedAt: string;
  contentType: string | null;
  contentLengthBytes: number;
  markersVerified: string[];
}

function verifyMarkers(html: string, markers: string[]) {
  return markers.filter((marker) => html.includes(marker));
}

async function fetchPage(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "ParkSverigePrototype/0.1 (+local-source-refresh)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  return {
    html,
    contentType: response.headers.get("content-type")
  };
}

async function writeSnapshotFiles(
  fileBaseName: string,
  metadata: RefreshedPageMetadata,
  html: string
) {
  const outputDir = path.resolve(
    process.cwd(),
    "../../data-platform/databricks/source-snapshots/stockholm/raw"
  );

  await mkdir(outputDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(outputDir, `${fileBaseName}.html`), html, "utf8"),
    writeFile(
      path.join(outputDir, `${fileBaseName}.metadata.json`),
      `${JSON.stringify(metadata, null, 2)}\n`,
      "utf8"
    )
  ]);
}

export async function refreshStockholmOfficialSourcePages() {
  const checkedAt = new Date().toISOString();
  const [tariffPage, rulesPage] = await Promise.all([fetchPage(tariffUrl), fetchPage(rulesUrl)]);

  const tariffMarkers = verifyMarkers(tariffPage.html, [
    "Taxeområde 2",
    "Taxeområde 3",
    "Observera att det är skyltningen på gatan som avgör vilken avgift du ska betala."
  ]);

  const rulesMarkers = verifyMarkers(rulesPage.html, [
    "Parkeringsregler",
    "Betala parkering",
    "Stockholms stad"
  ]);

  await Promise.all([
    writeSnapshotFiles(
      "official-tariffs.page",
      {
        sourceId: "stockholm_tariff_areas",
        sourceUrl: tariffUrl,
        checkedAt,
        contentType: tariffPage.contentType,
        contentLengthBytes: Buffer.byteLength(tariffPage.html, "utf8"),
        markersVerified: tariffMarkers
      },
      tariffPage.html
    ),
    writeSnapshotFiles(
      "official-rules.page",
      {
        sourceId: "stockholm_parking_rules",
        sourceUrl: rulesUrl,
        checkedAt,
        contentType: rulesPage.contentType,
        contentLengthBytes: Buffer.byteLength(rulesPage.html, "utf8"),
        markersVerified: rulesMarkers
      },
      rulesPage.html
    )
  ]);

  console.log("[workers] refreshed official Stockholm source pages:");
  console.log("- data-platform/databricks/source-snapshots/stockholm/raw/official-tariffs.page.html");
  console.log("- data-platform/databricks/source-snapshots/stockholm/raw/official-tariffs.page.metadata.json");
  console.log("- data-platform/databricks/source-snapshots/stockholm/raw/official-rules.page.html");
  console.log("- data-platform/databricks/source-snapshots/stockholm/raw/official-rules.page.metadata.json");
}

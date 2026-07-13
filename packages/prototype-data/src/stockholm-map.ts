import type { ParkingMapOverlay, ParkingRuleSource } from "@parksverige/shared-types";

const stockholmTariffOverlaySource: ParkingRuleSource = {
  id: "stockholm-official-tariff-overlay-2026",
  label: "Stockholm official tariff overlay",
  kind: "official_tariff",
  publisher: "Stockholms stad",
  sourceUrl: "https://parkering.stockholm/betala-parkering/taxeomraden-avgifter/",
  checkedAt: "2026-07-11T21:52:28.811Z",
  note: "Official Stockholm WMS tariff overlays published by the city and surfaced in the premium prototype."
};

const stockholmWmsUrl =
  "https://openstreetgs.stockholm.se/geoservice/api/717ec6af-49f9-4774-84da-35b8cb713dc5/wms";

function createTariffOverlay(areaCode: string): ParkingMapOverlay {
  return {
    id: `stockholm-tariff-overlay-${areaCode}`,
    city: "stockholm",
    label: `Taxeområde ${areaCode}`,
    areaCode,
    kind: "tile_wms",
    url: stockholmWmsUrl,
    layers: [`ltfr:LTFR_TAXA_${areaCode}_VIEW`],
    version: "1.1.1",
    format: "image/png",
    styles: "sld-slk-ltfr-taxa",
    transparent: true,
    opacity: 0.44,
    minZoom: 2,
    maxZoom: 19,
    attribution: "Stockholms stad tariff overlays",
    source: stockholmTariffOverlaySource
  };
}

export const stockholmOfficialTariffOverlays = ["1", "2", "3", "4", "5"].map(
  createTariffOverlay
);

export function getTariffOverlayForArea(areaCode?: string) {
  if (!areaCode) {
    return null;
  }

  return stockholmOfficialTariffOverlays.find((overlay) => overlay.areaCode === areaCode) ?? null;
}

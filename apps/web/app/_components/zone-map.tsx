"use client";

import { Fragment, useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Pane,
  TileLayer,
  Tooltip,
  WMSTileLayer,
  ZoomControl,
  useMap
} from "react-leaflet";
import type { ParkingMapOverlay, ParkingZoneSummary } from "@parksverige/shared-types";

interface ZoneMapProps {
  mapOverlays?: ParkingMapOverlay[];
  zones: ParkingZoneSummary[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
}

const stockholmCenter: [number, number] = [59.3346, 18.0632];

function MapViewportSync({ selectedZone }: { selectedZone?: ParkingZoneSummary }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedZone) {
      return;
    }

    map.flyTo([selectedZone.centroid.lat, selectedZone.centroid.lng], 15, {
      animate: true,
      duration: 0.85
    });
  }, [map, selectedZone]);

  return null;
}

function markerColor(availability: ParkingZoneSummary["availability"]) {
  switch (availability) {
    case "high":
      return "#27d9a1";
    case "medium":
      return "#f2af43";
    case "low":
      return "#f06f69";
    default:
      return "#79d5df";
  }
}

export function ZoneMap({ mapOverlays = [], zones, selectedZoneId, onSelectZone }: ZoneMapProps) {
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
  const center: [number, number] = selectedZone
    ? [selectedZone.centroid.lat, selectedZone.centroid.lng]
    : stockholmCenter;
  const zoneAreaCodes = new Set(
    zones
      .map((zone) => zone.tariffAreaCode)
      .filter((areaCode): areaCode is string => Boolean(areaCode))
  );
  const visibleOverlays = mapOverlays.filter(
    (overlay) => overlay.areaCode && zoneAreaCodes.has(overlay.areaCode)
  );
  const selectedAreaCode = selectedZone?.tariffAreaCode;

  return (
    <MapContainer
      center={center}
      className="leaflet-map"
      scrollWheelZoom
      preferCanvas
      zoom={13}
      zoomControl={false}
    >
      <MapViewportSync selectedZone={selectedZone} />
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <Pane name="official-tariffs-pane" style={{ zIndex: 420 }}>
        {visibleOverlays.map((overlay) => {
          const isSelectedOverlay = overlay.areaCode === selectedAreaCode;

          return (
            <WMSTileLayer
              attribution={overlay.attribution}
              format={overlay.format}
              key={overlay.id}
              layers={overlay.layers.join(",")}
              maxZoom={overlay.maxZoom}
              minZoom={overlay.minZoom}
              opacity={isSelectedOverlay ? overlay.opacity : Math.max(overlay.opacity * 0.38, 0.12)}
              pane="official-tariffs-pane"
              styles={overlay.styles}
              transparent={overlay.transparent}
              url={overlay.url}
              version={overlay.version}
            />
          );
        })}
      </Pane>
      <Pane name="stockholm-labels-pane" style={{ zIndex: 640 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
          opacity={0.9}
          pane="stockholm-labels-pane"
          subdomains="abcd"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />
      </Pane>

      {zones.map((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const fillColor = markerColor(zone.availability);

        return (
          <Fragment key={zone.id}>
            {isSelected ? (
              <CircleMarker
                center={[zone.centroid.lat, zone.centroid.lng]}
                fillColor={fillColor}
                fillOpacity={0.18}
                pathOptions={{
                  color: fillColor,
                  opacity: 0.32,
                  weight: 1
                }}
                radius={28}
              />
            ) : null}
            <CircleMarker
              center={[zone.centroid.lat, zone.centroid.lng]}
              eventHandlers={{
                click: () => onSelectZone(zone.id)
              }}
              fillColor={fillColor}
              fillOpacity={isSelected ? 0.98 : 0.82}
              pathOptions={{
                color: isSelected ? "#f4fdff" : fillColor,
                weight: isSelected ? 3 : 1
              }}
              radius={isSelected ? 14 : 11}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={isSelected}>
                {zone.name}
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}

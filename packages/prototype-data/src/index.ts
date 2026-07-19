import type {
  AuthSession,
  AuthUser,
  FavoriteLocation,
  NearbyParkingResponse,
  ParkingZoneSummary,
  SearchResult,
  UserVehicle,
  ZoneDetail
} from "@parksverige/shared-types";
import { parkingRules, zoneRuleFeatures } from "./stockholm-rules";
import { stockholmOfficialTariffOverlays } from "./stockholm-map";

export interface PrototypeAlert {
  title: string;
  detail: string;
  time: string;
}

export const demoUser: AuthUser = {
  id: "user_stockholm_001",
  email: "driver@parksverige.se",
  firstName: "Alex",
  city: "stockholm"
};

export const demoSession: AuthSession = {
  accessToken: "stub-access-token",
  refreshToken: "stub-refresh-token",
  expiresInSeconds: 3600
};

export const demoVehicles: UserVehicle[] = [
  {
    id: "veh_1",
    licensePlate: "ABC123",
    country: "SE",
    vehicleType: "car",
    nickname: "City Car"
  },
  {
    id: "veh_2",
    licensePlate: "EV2026",
    country: "SE",
    vehicleType: "ev",
    nickname: "Weekend EV"
  }
];

const baseParkingZones: ParkingZoneSummary[] = [
  {
    id: "zone_sveavagen_01",
    city: "stockholm",
    name: "Sveavagen North",
    centroid: { lat: 59.3456, lng: 18.0498 },
    tariffAreaCode: "2",
    availability: "medium",
    feeRequired: true,
    permitRequired: false,
    updatedAt: "2026-07-11T19:12:00Z"
  },
  {
    id: "zone_kungsholmen_02",
    city: "stockholm",
    name: "Kungsholmen Waterfront",
    centroid: { lat: 59.3312, lng: 18.0268 },
    tariffAreaCode: "2",
    availability: "high",
    feeRequired: true,
    permitRequired: false,
    updatedAt: "2026-07-11T19:18:00Z"
  },
  {
    id: "zone_kth_03",
    city: "stockholm",
    name: "KTH Valhallavagen Edge",
    centroid: { lat: 59.3489, lng: 18.0717 },
    tariffAreaCode: "3",
    availability: "low",
    feeRequired: true,
    permitRequired: false,
    updatedAt: "2026-07-11T19:09:00Z"
  }
];

export const parkingZones: ParkingZoneSummary[] = baseParkingZones.map((zone) => {
  const resolvedRule = parkingRules[zone.id];

  if (!resolvedRule) {
    return zone;
  }

  return {
    ...zone,
    feeRequired: resolvedRule.feeRequired,
    permitRequired: resolvedRule.permitRequired
  };
});

export const zoneDetails: Record<string, ZoneDetail> = {
  zone_sveavagen_01: {
    zone: parkingZones[0],
    rule: parkingRules.zone_sveavagen_01,
    features: zoneRuleFeatures.zone_sveavagen_01
  },
  zone_kungsholmen_02: {
    zone: parkingZones[1],
    rule: parkingRules.zone_kungsholmen_02,
    features: zoneRuleFeatures.zone_kungsholmen_02
  },
  zone_kth_03: {
    zone: parkingZones[2],
    rule: parkingRules.zone_kth_03,
    features: zoneRuleFeatures.zone_kth_03
  }
};

export const searchResults: SearchResult[] = [
  {
    id: "search_kth",
    type: "landmark",
    title: "KTH Royal Institute of Technology",
    subtitle: "Valhallavagen edge with paid daytime parking",
    coordinates: { lat: 59.3489, lng: 18.0717 },
    zoneId: "zone_kth_03",
    availability: "low"
  },
  {
    id: "search_sveavagen",
    type: "street",
    title: "Sveavagen",
    subtitle: "Fast errand parking with 2 hour window",
    coordinates: { lat: 59.3446, lng: 18.0544 },
    zoneId: "zone_sveavagen_01",
    availability: "medium"
  },
  {
    id: "search_kungsholmen",
    type: "area",
    title: "Kungsholmen",
    subtitle: "High evening availability with cleaner rule profile",
    coordinates: { lat: 59.3311, lng: 18.0315 },
    zoneId: "zone_kungsholmen_02",
    availability: "high"
  }
];

export const nearbyParking: NearbyParkingResponse = {
  area: "Central Stockholm",
  updatedAt: "2026-07-11T19:18:00Z",
  zones: parkingZones,
  mapOverlays: stockholmOfficialTariffOverlays
};

export const favoriteLocations: FavoriteLocation[] = [
  {
    id: "fav_home",
    type: "area",
    label: "Home routine: Kungsholmen",
    areaName: "Kungsholmen"
  },
  {
    id: "fav_work",
    type: "zone",
    label: "Work backup: Sveavagen North",
    zoneId: "zone_sveavagen_01"
  },
  {
    id: "fav_campus",
    type: "zone",
    label: "KTH evening alert",
    zoneId: "zone_kth_03"
  }
];

export const prototypeAlerts: PrototypeAlert[] = [
  {
    title: "Street cleaning tomorrow",
    detail: "Sveavagen North closes at 00:00 for cleaning.",
    time: "18h"
  },
  {
    title: "Restriction starts soon",
    detail: "KTH Valhallavagen Edge switches into paid hours at 07:00.",
    time: "30m"
  },
  {
    title: "Availability opening",
    detail: "Kungsholmen Waterfront is trending upward after 19:00.",
    time: "Live"
  }
];

export function getZoneDetail(zoneId: string) {
  return zoneDetails[zoneId] ?? null;
}

export function searchParking(query?: string) {
  if (!query) {
    return searchResults;
  }

  const normalized = query.trim().toLowerCase();

  return searchResults.filter((result) =>
    `${result.title} ${result.subtitle}`.toLowerCase().includes(normalized)
  );
}

export { parkingRules, resolveStockholmRule, zoneRuleFeatures } from "./stockholm-rules";
export { getTariffOverlayForArea, stockholmOfficialTariffOverlays } from "./stockholm-map";

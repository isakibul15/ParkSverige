export type AvailabilityLevel = "high" | "medium" | "low" | "unknown";
export type VehicleType = "car" | "motorcycle" | "van" | "ev";
export type SearchEntityType = "zone" | "street" | "area" | "landmark";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParkingZoneSummary {
  id: string;
  city: "stockholm";
  name: string;
  centroid: Coordinates;
  tariffAreaCode?: string;
  availability: AvailabilityLevel;
  feeRequired: boolean;
  permitRequired: boolean;
  updatedAt: string;
}

export interface ParkingRuleSnapshot {
  zoneId: string;
  parkingAllowed: boolean;
  maxDurationMinutes?: number;
  feeRequired: boolean;
  permitRequired: boolean;
  scheduleLabel: string;
  streetCleaningLabel?: string;
  priceLabel?: string;
  sourceUpdatedAt?: string;
}

export type ParkingRuleSourceKind =
  | "official_tariff"
  | "local_regulation"
  | "sign_override"
  | "curated_override";

export interface ParkingRuleSource {
  id: string;
  label: string;
  kind: ParkingRuleSourceKind;
  publisher: string;
  sourceUrl?: string;
  checkedAt?: string;
  note?: string;
}

export interface ResolvedParkingRule extends ParkingRuleSnapshot {
  resolutionStrategy: "official_baseline_with_local_override" | "curated_demo";
  sources: ParkingRuleSource[];
  resolutionNotes: string[];
}

export interface ParkingMapOverlay {
  id: string;
  city: "stockholm";
  label: string;
  areaCode?: string;
  kind: "tile_wms";
  url: string;
  layers: string[];
  version: string;
  format: string;
  styles?: string;
  transparent: boolean;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
  source: ParkingRuleSource;
}

export interface UserVehicle {
  id: string;
  licensePlate: string;
  country: string;
  vehicleType: VehicleType;
  nickname?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  city: "stockholm";
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface FavoriteLocation {
  id: string;
  type: "zone" | "area";
  label: string;
  zoneId?: string;
  areaName?: string;
}

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  coordinates: Coordinates;
  zoneId?: string;
  availability?: AvailabilityLevel;
}

export interface NearbyParkingResponse {
  area: string;
  updatedAt: string;
  zones: ParkingZoneSummary[];
  mapOverlays: ParkingMapOverlay[];
}

export interface ZoneDetail {
  zone: ParkingZoneSummary;
  rule: ResolvedParkingRule;
  features: string[];
}

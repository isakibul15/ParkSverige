import type {
  AuthSession,
  AuthUser,
  FavoriteLocation,
  NearbyParkingResponse,
  SearchResult,
  UserVehicle,
  ZoneDetail
} from "@parksverige/shared-types";
import type { PrototypeAlert } from "@parksverige/prototype-data";

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
  onboardingState?: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.url}`);
  }

  return response.json() as Promise<T>;
}

export async function postJson<T>(input: string, body: unknown): Promise<T> {
  const response = await fetch(input, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return parseJson<T>(response);
}

export async function getJson<T>(input: string): Promise<T> {
  const response = await fetch(input);
  return parseJson<T>(response);
}

export async function loginDemoUser() {
  return postJson<AuthResponse>("/api/auth/login", {
    email: "driver@parksverige.se",
    password: "demo-password"
  });
}

export async function fetchVehicles() {
  return getJson<{ items: UserVehicle[] }>("/api/vehicles");
}

export async function fetchNearbyParking() {
  return getJson<NearbyParkingResponse>("/api/parking/nearby");
}

export async function fetchFavorites() {
  return getJson<{ items: FavoriteLocation[] }>("/api/favorites");
}

export async function fetchAlerts() {
  return getJson<{ items: PrototypeAlert[] }>("/api/notifications/alerts");
}

export async function fetchSearchResults(query?: string) {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
  return getJson<{ items: SearchResult[] }>(`/api/parking/search${suffix}`);
}

export async function fetchZoneDetail(zoneId: string) {
  return getJson<ZoneDetail>(`/api/parking/zones/${zoneId}`);
}

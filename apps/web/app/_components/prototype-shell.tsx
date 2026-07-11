"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import type {
  AuthUser,
  FavoriteLocation,
  NearbyParkingResponse,
  ParkingZoneSummary,
  SearchResult,
  UserVehicle,
  ZoneDetail
} from "@parksverige/shared-types";
import type { PrototypeAlert } from "@parksverige/prototype-data";
import {
  fetchAlerts,
  fetchFavorites,
  fetchNearbyParking,
  fetchSearchResults,
  fetchVehicles,
  fetchZoneDetail,
  loginDemoUser
} from "../_lib/api";

type ViewKey = "overview" | "map" | "search" | "favorites" | "premium";

const ZoneMap = dynamic(
  () => import("./zone-map").then((module) => module.ZoneMap),
  {
    ssr: false,
    loading: () => <div className="map-loading">Loading live map…</div>
  }
);

const topMetrics = [
  {
    label: "Coverage",
    value: "3,240",
    detail: "Stockholm parking zones indexed"
  },
  {
    label: "Prediction",
    value: "91%",
    detail: "Rule confidence for curated areas"
  },
  {
    label: "Retention Loop",
    value: "Plus",
    detail: "Alerts, routines, and favorites"
  }
] as const;

const views: Array<{ key: ViewKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "map", label: "Map" },
  { key: "search", label: "Search" },
  { key: "favorites", label: "Favorites" },
  { key: "premium", label: "Premium" }
];

const productVersions = [
  {
    name: "Version 0",
    subtitle: "Foundation",
    detail: "Monorepo, shared contracts, data-platform skeleton, and delivery standards."
  },
  {
    name: "Version 1",
    subtitle: "Stockholm MVP",
    detail: "Map, search, rules, favorites, vehicles, and synced parking intelligence."
  },
  {
    name: "Version 1.5",
    subtitle: "Premium",
    detail: "Smart alerts, unlimited favorites, routines, and subscription entitlements."
  }
] as const;

const workstreams = [
  "Serving schema for PostgreSQL + PostGIS",
  "NestJS API modules for auth, vehicles, parking, and search",
  "Shared contracts for zones, rules, sessions, and subscriptions",
  "Interactive web prototype aligned to premium product direction"
] as const;

function getAvailabilityLabel(level: ZoneDetail["zone"]["availability"]) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function getRuleSummary(selectedZone: ZoneDetail | null) {
  if (!selectedZone) {
    return "Loading";
  }

  const priceLabel = selectedZone.rule.priceLabel?.toLowerCase() ?? "";

  if (
    selectedZone.rule.scheduleLabel.toLowerCase().includes("free outside") ||
    priceLabel.includes("free after")
  ) {
    return "Paid daytime, free overnight";
  }

  return `${selectedZone.rule.feeRequired ? "Paid" : "Free"}, max ${
    selectedZone.rule.maxDurationMinutes
      ? `${selectedZone.rule.maxDurationMinutes / 60}h`
      : "flex"
  }`;
}

function getRuleSourceSummary(selectedZone: ZoneDetail | null) {
  if (!selectedZone) {
    return "Loading source";
  }

  return selectedZone.rule.sources.map((source) => source.label).join(" + ");
}

function getTariffAreaLabel(selectedZone: ZoneDetail | null) {
  if (!selectedZone?.zone.tariffAreaCode) {
    return "Local sign context";
  }

  return `Taxeområde ${selectedZone.zone.tariffAreaCode}`;
}

export function PrototypeShell() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [nearby, setNearby] = useState<NearbyParkingResponse | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [alerts, setAlerts] = useState<PrototypeAlert[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneDetail | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("Kungsholmen");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [shouldFocusWorkspace, setShouldFocusWorkspace] = useState(false);
  const workspaceRef = useRef<HTMLElement | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    async function loadInitialData() {
      const [authData, vehiclesData, nearbyData, favoriteData, alertData, searchData] =
        await Promise.all([
          loginDemoUser(),
          fetchVehicles(),
          fetchNearbyParking(),
          fetchFavorites(),
          fetchAlerts(),
          fetchSearchResults()
        ]);

      setAuthUser(authData.user);
      setVehicles(vehiclesData.items);
      setNearby(nearbyData);
      setFavorites(favoriteData.items);
      setAlerts(alertData.items);
      setSearchResults(searchData.items);

      const firstZoneId = nearbyData.zones[0]?.id ?? searchData.items[0]?.zoneId;

      if (firstZoneId) {
        const zone = await fetchZoneDetail(firstZoneId);
        setSelectedZone(zone);
        setSelectedSearchId(searchData.items.find((item) => item.zoneId === firstZoneId)?.id ?? "");
      }
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    async function loadSearch() {
      setIsLoadingSearch(true);
      try {
        const searchData = await fetchSearchResults(deferredSearchQuery);
        setSearchResults(searchData.items);

        if (
          searchData.items[0]?.id &&
          !searchData.items.find((item) => item.id === selectedSearchId)
        ) {
          setSelectedSearchId(searchData.items[0].id);
        }
      } finally {
        setIsLoadingSearch(false);
      }
    }

    void loadSearch();
  }, [deferredSearchQuery, selectedSearchId]);

  useEffect(() => {
    const activeResult =
      searchResults.find((result) => result.id === selectedSearchId) ?? searchResults[0];

    const zoneId = activeResult?.zoneId;

    if (!zoneId) {
      return;
    }

    const resolvedZoneId: string = zoneId;

    async function loadZone() {
      const zone = await fetchZoneDetail(resolvedZoneId);
      setSelectedZone(zone);
    }

    void loadZone();
  }, [searchResults, selectedSearchId]);

  useEffect(() => {
    if (!shouldFocusWorkspace) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    setShouldFocusWorkspace(false);

    return () => window.cancelAnimationFrame(frame);
  }, [activeView, shouldFocusWorkspace]);

  const activeSearch =
    searchResults.find((result) => result.id === selectedSearchId) ?? searchResults[0] ?? null;
  const isWorkspaceFirst = activeView === "map" || activeView === "search";
  const activeMapOverlay =
    nearby?.mapOverlays.find((overlay) => overlay.areaCode === selectedZone?.zone.tariffAreaCode) ??
    null;

  function activateView(view: ViewKey, options?: { focusWorkspace?: boolean }) {
    startTransition(() => {
      setActiveView(view);
      setShouldFocusWorkspace(options?.focusWorkspace ?? false);
    });
  }

  function handleZoneSelection(zoneId: string, zones: ParkingZoneSummary[]) {
    const match = searchResults.find((result) => result.zoneId === zoneId);

    if (match) {
      setSelectedSearchId(match.id);
      return;
    }

    const zone = zones.find((entry) => entry.id === zoneId);
    if (zone) {
      setSelectedZone((previous) =>
        previous && previous.zone.id === zone.id
          ? previous
          : {
              zone,
              rule: previous?.rule ?? {
                zoneId: zone.id,
                parkingAllowed: true,
                feeRequired: zone.feeRequired,
                permitRequired: zone.permitRequired,
                scheduleLabel: "Loading rule details",
                resolutionStrategy: "curated_demo",
                sources: [],
                resolutionNotes: ["Loading source details for the selected zone."]
              },
              features: previous?.features ?? []
            }
      );
    }
  }

  const heroSection = (
    <section className={`hero-shell ${isWorkspaceFirst ? "hero-shell-secondary" : ""}`}>
      <section className={`hero ${isWorkspaceFirst ? "hero-compact" : ""}`}>
        <div className="hero-copy">
          <p className="eyebrow">Dark Premium Prototype</p>
          <h1>Know exactly where to park before Stockholm tells you no.</h1>
          <p className="lede">
            A high-trust parking product for drivers who want fast answers, premium map clarity,
            and proactive reminders instead of frustration.
          </p>

          <div className="hero-actions">
            <button
              className="primary-action"
              onClick={() => activateView("map", { focusWorkspace: true })}
              type="button"
            >
              Open map flow
            </button>
            <button
              className="secondary-action"
              onClick={() => activateView("premium", { focusWorkspace: true })}
              type="button"
            >
              View premium flow
            </button>
          </div>

          <div className="metrics-row">
            {topMetrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <p className="metric-label">{metric.label}</p>
                <h3>{metric.value}</h3>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Command Center</p>
              <h2>Tonight&apos;s best parking window</h2>
            </div>
            <div className="map-badge">{nearby?.area ?? "Loading area"}</div>
          </div>

          <div className="route-card">
            <div>
              <p className="route-label">Recommended area</p>
              <h3>{selectedZone?.zone.name ?? "Loading zone"}</h3>
            </div>
            {selectedZone ? (
              <span className={`availability-tag availability-${selectedZone.zone.availability}`}>
                {getAvailabilityLabel(selectedZone.zone.availability)}
              </span>
            ) : null}
          </div>

          <div className="panel-grid">
            <div className="mini-panel">
              <p className="mini-label">Parking rule</p>
              <strong>{getRuleSummary(selectedZone)}</strong>
            </div>
            <div className="mini-panel">
              <p className="mini-label">Best arrival</p>
              <strong>19:10 - 20:00</strong>
            </div>
            <div className="mini-panel">
              <p className="mini-label">Walking distance</p>
              <strong>6 min</strong>
            </div>
            <div className="mini-panel">
              <p className="mini-label">Permit risk</p>
              <strong>{selectedZone?.rule.permitRequired ? "High" : "Low"}</strong>
            </div>
          </div>
        </aside>
      </section>
    </section>
  );

  const experienceSection = (
    <section
      className={`experience-grid ${isWorkspaceFirst ? "experience-grid-focus" : ""}`}
      ref={workspaceRef}
    >
      <section className="workspace-shell">
        <div className="workspace-topbar">
          <div>
            <p className="eyebrow">Interactive Flow</p>
            <h2>{views.find((view) => view.key === activeView)?.label} workspace</h2>
          </div>
          <div className="map-toolbar">
            <span className="toolbar-chip">City: Stockholm</span>
            <span className="toolbar-chip">
              {nearby ? `Updated ${nearby.updatedAt.slice(11, 16)}` : "Loading"}
            </span>
          </div>
        </div>

        {activeView === "overview" && (
          <div className="interactive-grid interactive-grid-overview">
            <article className="card interactive-card">
              <p className="eyebrow">Driver session</p>
              <h3>{authUser ? `${authUser.firstName} is signed in` : "Signing in demo user..."}</h3>
              <p className="drawer-copy">
                {authUser
                  ? `${authUser.email} · ${vehicles.length} vehicles synced through backend-shaped routes.`
                  : "Authenticating against /api/auth/login"}
              </p>
              <div className="vehicle-list">
                {vehicles.map((vehicle) => (
                  <div className="vehicle-card" key={vehicle.id}>
                    <strong>{vehicle.nickname ?? vehicle.licensePlate}</strong>
                    <p>
                      {vehicle.licensePlate} · {vehicle.vehicleType.toUpperCase()} · {vehicle.country}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card interactive-card">
              <p className="eyebrow">Mission Control</p>
              <h3>What makes this feel premium</h3>
              <ul className="list">
                <li>Map-first workflow with low-friction decision making.</li>
                <li>Rule clarity before payment or navigation distractions.</li>
                <li>Subscription value centered on alerts and saved routines.</li>
                <li>Shared platform logic for future web and mobile sync.</li>
              </ul>
            </article>

            <article className="card interactive-card overview-span">
              <p className="eyebrow">High-value alerts</p>
              <div className="alert-list">
                {alerts.map((alert) => (
                  <article className="alert-card" key={alert.title}>
                    <div>
                      <h3>{alert.title}</h3>
                      <p>{alert.detail}</p>
                    </div>
                    <span className="alert-time">{alert.time}</span>
                  </article>
                ))}
              </div>
            </article>
          </div>
        )}

        {activeView === "map" && (
          <div className="interactive-stack">
            <article className="card map-shell">
              <div className="map-head">
                <div>
                  <p className="eyebrow">Map Experience</p>
                  <h3>Official Stockholm overlays with premium decision clarity.</h3>
                </div>
                <div className="map-toolbar">
                  <span className="toolbar-chip">
                    {activeMapOverlay ? `${activeMapOverlay.label} live` : "Official overlay loading"}
                  </span>
                  <span className="toolbar-chip">Zones: {nearby?.zones.length ?? 0}</span>
                </div>
              </div>

              <div className="map-workspace-grid">
                <div className="map-stage">
                  <div className="map-canvas">
                    {nearby ? (
                      <ZoneMap
                        mapOverlays={nearby.mapOverlays}
                        onSelectZone={(zoneId) => handleZoneSelection(zoneId, nearby.zones)}
                        selectedZoneId={selectedZone?.zone.id}
                        zones={nearby.zones}
                      />
                    ) : (
                      <div className="map-loading">Loading live map…</div>
                    )}
                  </div>

                  <div className="map-status-row">
                    <span className="map-status-badge">Free dark basemap</span>
                    <p className="map-status-copy">
                      {activeMapOverlay
                        ? `${activeMapOverlay.label} is rendered from Stockholm's official tariff overlay service on top of a free premium basemap.`
                        : "Official Stockholm tariff overlays are loading for the selected area."}
                    </p>
                  </div>
                </div>

                {selectedZone ? (
                  <aside className="map-detail-rail">
                    <div>
                      <p className="drawer-label">Selected zone</p>
                      <h3>{selectedZone.zone.name}</h3>
                      <p className="drawer-copy">
                        {selectedZone.features[0]}, {selectedZone.features[1].toLowerCase()}, and{" "}
                        {selectedZone.features[2].toLowerCase()}.
                      </p>
                      <p className="drawer-note">
                        Source: {getRuleSourceSummary(selectedZone)}.{" "}
                        {selectedZone.rule.resolutionNotes[0] ??
                          "Municipality-backed live feeds will replace curated prototype logic in the next data phase."}
                      </p>
                    </div>

                    <div className="map-stat-grid">
                      <div>
                        <span>Tariff layer</span>
                        <strong>{getTariffAreaLabel(selectedZone)}</strong>
                      </div>
                      <div>
                        <span>Availability</span>
                        <strong>{getAvailabilityLabel(selectedZone.zone.availability)}</strong>
                      </div>
                      <div>
                        <span>Price</span>
                        <strong>{selectedZone.rule.priceLabel}</strong>
                      </div>
                      <div>
                        <span>Restriction</span>
                        <strong>{selectedZone.rule.scheduleLabel}</strong>
                      </div>
                    </div>

                    <div className="map-zone-switcher">
                      <p className="drawer-label">Jump between nearby zones</p>
                      <div className="map-zone-list">
                        {nearby?.zones.map((zone) => (
                          <button
                            className={`map-zone-chip ${
                              zone.id === selectedZone.zone.id ? "map-zone-chip-active" : ""
                            }`}
                            key={zone.id}
                            onClick={() => handleZoneSelection(zone.id, nearby.zones)}
                            type="button"
                          >
                            <span>{zone.name}</span>
                            <small>{zone.tariffAreaCode ? `Taxa ${zone.tariffAreaCode}` : "Local"}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>
                ) : null}
              </div>
            </article>
          </div>
        )}

        {activeView === "search" && (
          <div className="interactive-grid interactive-grid-search">
            <article className="card interactive-card">
              <p className="eyebrow">Search flow</p>
              <div className="search-shell">
                <label className="search-input-shell" htmlFor="parking-search">
                  <span className="search-prefix">⌘K</span>
                  <input
                    className="search-input"
                    id="parking-search"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    value={searchQuery}
                  />
                </label>
                <div className="search-helper-row">
                  <span>{isLoadingSearch ? "Searching..." : `${searchResults.length} results`}</span>
                  <span>Live from backend-shaped routes</span>
                </div>
                <div className="search-result-list">
                  {searchResults.map((result) => (
                    <button
                      className={`search-result-card ${
                        selectedSearchId === result.id ? "search-result-card-active" : ""
                      }`}
                      key={result.id}
                      onClick={() => setSelectedSearchId(result.id)}
                      type="button"
                    >
                      <div>
                        <strong>{result.title}</strong>
                        <p>{result.subtitle}</p>
                      </div>
                      <span className={`availability-pill availability-${result.availability}`}>
                        {result.availability}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="card interactive-card">
              <p className="eyebrow">Search preview</p>
              <h3>{selectedZone?.zone.name ?? activeSearch?.title ?? "Loading"}</h3>
              <p className="drawer-copy">
                {selectedZone
                  ? `${selectedZone.rule.scheduleLabel} · ${selectedZone.rule.priceLabel} · updated ${selectedZone.zone.updatedAt.slice(11, 16)}`
                  : "Select a result to preview the parking zone."}
              </p>
              <div className="feature-pills">
                {selectedZone?.features.map((feature) => (
                  <span className="feature-pill" key={feature}>
                    {feature}
                  </span>
                ))}
              </div>
              <button
                className="primary-action"
                onClick={() => activateView("map", { focusWorkspace: true })}
                type="button"
              >
                Open selected zone
              </button>
            </article>
          </div>
        )}

        {activeView === "favorites" && (
          <div className="interactive-grid">
            <article className="card interactive-card">
              <p className="eyebrow">Saved routines</p>
              <div className="favorites-list">
                {favorites.map((favorite) => (
                  <button
                    className="favorite-card"
                    key={favorite.id}
                    onClick={() => {
                      const match = searchResults.find((result) => result.zoneId === favorite.zoneId);
                      if (match) {
                        setSelectedSearchId(match.id);
                        activateView("map", { focusWorkspace: true });
                      }
                    }}
                    type="button"
                  >
                    <div>
                      <strong>{favorite.label}</strong>
                      <p>{favorite.type === "area" ? favorite.areaName : favorite.zoneId}</p>
                    </div>
                    <span className="favorite-arrow">↗</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="card interactive-card">
              <p className="eyebrow">Why favorites matter</p>
              <ul className="list">
                <li>Saved places become the foundation for premium weekly retention.</li>
                <li>Commute routines create proactive reminders instead of passive lookups.</li>
                <li>Household or fleet plans can grow from this same favorite model later.</li>
              </ul>
            </article>
          </div>
        )}

        {activeView === "premium" && (
          <div className="interactive-grid interactive-grid-premium">
            <article className="card premium-card">
              <p className="eyebrow">Premium Layer</p>
              <h3>Subscription that feels alive every week.</h3>
              <ul className="list premium-list">
                <li>Smart alerts before restrictions begin</li>
                <li>Unlimited favorite places and commute routines</li>
                <li>Priority parking suggestions by time window</li>
                <li>Saved city packs for confident repeat use</li>
              </ul>
              <button className="primary-action full-width" type="button">
                Explore Plus
              </button>
            </article>

            <article className="card interactive-card">
              <p className="eyebrow">Plan architecture</p>
              <div className="pricing-grid">
                <div className="pricing-card">
                  <span className="pricing-tier">Free</span>
                  <strong>Rules + basic search</strong>
                  <p>Enough for trust-building and first-use activation.</p>
                </div>
                <div className="pricing-card pricing-card-accent">
                  <span className="pricing-tier">Plus</span>
                  <strong>Alerts + routines + favorites</strong>
                  <p>The first real recurring value layer.</p>
                </div>
                <div className="pricing-card">
                  <span className="pricing-tier">Family</span>
                  <strong>Shared drivers and vehicles</strong>
                  <p>Built on the same sync and favorites foundation.</p>
                </div>
              </div>
            </article>
          </div>
        )}
      </section>

      <aside className="sidebar-stack">
        <article className="card content-card">
          <p className="eyebrow">Execution</p>
          <h2>Current build workstreams</h2>
          <ul className="list">
            {workstreams.map((workstream) => (
              <li key={workstream}>{workstream}</li>
            ))}
          </ul>
        </article>

        <article className="card content-card">
          <p className="eyebrow">Release Plan</p>
          <h2>Product versions</h2>
          <div className="version-stack">
            {productVersions.map((version) => (
              <article className="version-card" key={version.name}>
                <p className="version-name">{version.name}</p>
                <h3>{version.subtitle}</h3>
                <p>{version.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">P</div>
          <div>
            <p className="brand-name">ParkSverige</p>
            <p className="brand-subtitle">Premium parking intelligence for Stockholm</p>
          </div>
        </div>

        <nav className="topnav" aria-label="Primary">
          {views.map((view) => (
            <button
              className={`nav-chip ${activeView === view.key ? "nav-chip-active" : ""}`}
              key={view.key}
              onClick={() =>
                activateView(view.key, { focusWorkspace: view.key !== "overview" })
              }
              type="button"
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <span className="status-dot" />
          <span className="topbar-label">Prototype online</span>
        </div>
      </header>

      {isWorkspaceFirst ? experienceSection : heroSection}
      {isWorkspaceFirst ? heroSection : experienceSection}
    </main>
  );
}

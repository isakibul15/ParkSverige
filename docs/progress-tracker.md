# ParkSverige Progress Tracker

Use this file as the single place to track delivery progress.

## Version Status

- [ ] Version 0: Foundation
- [ ] Version 1: Stockholm MVP
- [ ] Version 1.5: Premium Subscription Release
- [ ] Version 2: Multi-City Sweden
- [ ] Version 3: Smart Parking Platform

## Phase 0: Discovery and Foundation

- [x] Finalize architecture decisions
- [x] Finalize design direction and UX principles
- [x] Define monorepo structure
- [x] Define API contract strategy
- [x] Define Databricks bronze/silver/gold model
- [x] Define PostgreSQL + PostGIS serving schema
- [ ] Set up CI/CD and environments

## Phase 1: Data Platform and Backend Core

- [ ] Ingest Stockholm municipality datasets
- [ ] Normalize rule data in Databricks
- [ ] Publish serving tables to PostgreSQL
- [x] Build auth module
- [x] Build vehicles module
- [x] Build parking zones module
- [x] Build parking rules module
- [x] Build search module
- [ ] Publish OpenAPI docs

## Phase 2: Web MVP

- [ ] Build onboarding and auth flows
- [x] Build premium map experience
- [x] Build search and filter flows
- [x] Build zone details rail
- [x] Build favorites
- [ ] Build profile and vehicle management
- [ ] Connect analytics events

## Phase 3: Mobile MVP

- [ ] Set up Expo app
- [ ] Reuse shared types and API client
- [ ] Build mobile map and search
- [ ] Build offline cache support
- [ ] Build push notification flow
- [ ] Complete iOS and Android QA

## Phase 4: Subscription and Retention

- [ ] Define entitlements model
- [ ] Build billing and subscription state
- [ ] Add smart alerts
- [ ] Add unlimited favorites for premium
- [ ] Add commute routines
- [ ] Add subscription conversion analytics

## Phase 5: Multi-City and Intelligence

- [ ] Add city onboarding framework
- [ ] Add Gothenburg support
- [ ] Add Malmo support
- [ ] Add multilingual support
- [ ] Improve availability prediction
- [ ] Build admin data QA tools

## Current Snapshot

- Current version: `Version 0` in progress, with early `Version 1` web MVP work already started
- Current phase: `Phase 2` web MVP prototyping on top of completed foundation work
- Completed this week:
  - monorepo foundation and shared package structure
  - PostgreSQL + PostGIS serving schema draft
  - backend stub modules for auth, vehicles, parking zones, parking rules, and search
  - dark premium interactive web prototype
  - route-backed web data layer
  - sticky premium navigation and improved OSM map interaction polish
  - curated KTH rule copy aligned to the driver-confirmed 07:00-19:00 paid window
  - source-aware Stockholm rule resolver with official baseline plus local override support
  - workspace-first UX flow so map and search no longer feel buried below the intro section
  - Databricks-ready Stockholm ingestion slice for bronze, silver, gold, and QA scaffolding
  - local worker-based Stockholm pipeline simulator for bronze, silver, and gold sample outputs
  - first parser layer for Stockholm source snapshots feeding the local ingestion simulation
  - official Stockholm source refresh command for local raw HTML snapshot capture
  - automatic tariff snapshot sync from fetched Stockholm HTML
  - official Stockholm tariff overlays wired into the premium web map with a free dark basemap
  - side-by-side map detail rail so zone context stays visible without scrolling below the map
- Blockers:
  - CI/CD and environment automation are not set up yet
  - mobile workspace is still intentionally excluded from active root installs
  - web prototype routes are not yet connected to the NestJS backend runtime
- Next milestone:
  - ingest municipality tariff and sign-level data into Databricks and replace local overrides progressively
- Risks:
  - prototype data is still mocked
  - no production auth flow or persistence yet
  - mobile parity has not started beyond scaffolding

## Weekly Review Template

- Current version:
- Current phase:
- Completed this week:
- Blockers:
- Next milestone:
- Risks:

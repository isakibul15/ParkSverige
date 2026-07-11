# ParkSverige

ParkSverige is a premium parking intelligence platform designed for drivers in Sweden. The product starts with Stockholm and helps users understand where they can legally park, what rules apply, when restrictions begin, and how likely an area is to have space available.

The long-term goal is to support:

- Web
- iOS
- Android
- Future B2B and fleet experiences

## Product Direction

The product is being planned as a scalable, subscription-ready platform with:

- A high-quality map-first user experience
- Shared product logic across web and mobile
- Databricks for ingestion, ETL, analytics, and prediction
- PostgreSQL + PostGIS as the real-time serving database
- A modular backend that can grow from MVP to multi-city scale

## Planning Docs

- [Architecture and Roadmap](docs/architecture-roadmap.md)
- [Progress Tracker](docs/progress-tracker.md)

## Recommended Target Repository Shape

As implementation begins, this repo should evolve toward a monorepo with a clear separation between apps, shared packages, backend services, and data-platform work:

```text
apps/
  web/
  mobile/
services/
  api/
  workers/
packages/
  design-system/
  api-client/
  shared-types/
  config/
data-platform/
  databricks/
infra/
  azure/
docs/
```

## Current Status

The current repository is intentionally lightweight. The next milestone is to establish the foundational architecture, design system, and delivery plan before implementation accelerates.

# Local Setup Guide

This guide is the fastest way to see the first prototype on your own machine.

## 1. What you need

Already available on your machine:

- Node.js `v22.9.0`
- npm `11.6.4`

You do not need right now:

- Mapbox
- Databricks account
- Azure account
- Google Maps account

## 2. Why `pnpm` failed

Your `pnpm` failure is coming from Corepack signature verification, not from the ParkSverige codebase.

Instead of spending time fixing that first, this project is now configured to work with `npm` workspaces.

## 3. Install dependencies

From the project root:

```bash
cd "/Users/md.sakibulislam/Desktop/Personal Projects/ParkSverige"
npm install
```

## 4. Run the first web prototype

```bash
npm run dev -w @parksverige/web
```

Then open:

- [http://localhost:3000](http://localhost:3000)

## 5. Optional full-repo dev mode later

When more services are wired up, you will also be able to run:

```bash
npm run dev
```

Note:

- the mobile app is intentionally excluded from the root workspace install for now
- this avoids an Expo peer dependency conflict while we focus on getting the web prototype visible first

## 6. Run the Stockholm pipeline simulation

This does not require Databricks yet. It generates local bronze, silver, and gold sample outputs from the current Stockholm rule resolver.

```bash
npm run stockholm:simulate -w @parksverige/workers
```

Preview the current resolved rules:

```bash
npm run stockholm:preview -w @parksverige/workers
```

Refresh raw official source pages locally:

```bash
npm run stockholm:refresh-sources -w @parksverige/workers
```

Rebuild the structured tariff snapshot from the refreshed official HTML:

```bash
npm run stockholm:sync-sources -w @parksverige/workers
```

## 7. Free map path

The first visible prototype uses a free OpenStreetMap-based setup.

Current environment values:

```bash
NEXT_PUBLIC_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors
```

Notes:

- this is good for local development and light prototype work
- it is not suitable for offline downloads
- it is not suitable for heavy production traffic

## 8. If `npm install` fails

Try these in order:

```bash
npm cache verify
npm install
```

If that still fails:

```bash
rm -rf node_modules package-lock.json
npm install
```

Only do the cleanup step if `npm install` actually fails.

## 9. What you need to do personally

Right now, very little:

- run `npm install`
- run `npm run dev -w @parksverige/web`
- open the browser and review the first prototype
- optionally run `npm run stockholm:simulate -w @parksverige/workers`

## 10. What comes next

After the first prototype is visible, the next steps are:

- build a real interactive map screen
- add mocked search and parking detail flows
- connect the web UI to the API stubs
- later add real database and data ingestion

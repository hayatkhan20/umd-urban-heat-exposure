# UMD HeatShield

**Building-scale heat exposure and tree-shade decision support**

Powered by FortyGuard temperature intelligence.

Live demo URL: **TODO**

Three-minute video URL: **TODO**

Analytical repository: <https://github.com/hayatkhan20/umd-urban-heat-exposure>

## Project Overview

UMD HeatShield is a single-page React dashboard for exploring building-scale heat exposure at the University of Maryland, College Park. It combines cached FortyGuard 60 m ambient-temperature estimates with building geometry, solar exposure, tree canopy, canopy distance and summer LAI.

The goal is simple: help campus teams see where heat-exposed buildings may need attention first and where preliminary shade interventions are worth field-checking.

## Problem Statement

Buildings experience heat differently. A building with little nearby vegetation and high solar exposure may need intervention more urgently than a shaded building nearby. General campus-wide temperature maps do not explain which buildings receive direct sunlight, which benefit from trees, or where new shade could be most useful.

## Intended Users

- Campus facilities teams: identify buildings that may need cool roofs, facade shading or operational attention.
- Sustainability and landscape teams: screen locations where additional trees could improve shade.
- Urban and resilience planners: compare heat, vegetation and building exposure in one decision layer.
- Researchers and students: explore relationships between temperature, solar exposure, canopy and LAI.

## Analysis Workflow

1. Define the campus using the UMD analysis boundary.
2. Measure buildings using footprints and height attributes.
3. Measure vegetation using canopy height, tree-to-building distance and summer LAI.
4. Follow the sun at 09:00, 12:00, 15:00 and 18:00 to estimate direct roof and facade exposure.
5. Add FortyGuard 60 m ambient-temperature estimates for the same four times.
6. Prioritize action by combining temperature, solar exposure and vegetation deficit.

## Application Features

- Sticky single-page navigation with mobile menu.
- Interactive React Leaflet map centered on UMD College Park.
- Temperature, solar exposure, heat-priority and planting-screening map modes.
- Time switching for 09:00, 12:00, 15:00 and 18:00 temperatures.
- Building and candidate-zone popups with formatted values and missing-data handling.
- Recharts summaries for temperature, building-envelope exposure and correlation results.
- Responsive figure panels with larger modal view.
- Clear recommendations, limitations and data-source notes.

## Technology Stack

- React + Vite + JavaScript
- React Leaflet + Leaflet
- Recharts
- Plain CSS
- Node data-preparation script using `proj4` and TopoJSON-based simplification

No backend, database, authentication system or API proxy is used.

## Data Sources

- FortyGuard Temperature API - 60 m ambient-temperature estimates
- Overture Maps - building footprints and heights
- NAIP imagery and NAIP canopy-height model
- Sentinel-2 - summer LAI
- Solar-position calculations
- University of Maryland analysis boundary

All FortyGuard API results used by the dashboard are cached in the analytical repository. The public dashboard does not expose a FortyGuard API key and does not repeatedly call the API.

## Verified FortyGuard API Request and Response Evidence

Source inspected: `notebooks/06_fortyguard_heat_priority.ipynb` in the analytical repository.

The notebook reads the API key from Colab Secrets and sends this request structure for each analysis time. The API key is redacted here. The `polygon_coordinates` value is generated from `data/umd_boundary_final.geojson`, simplified to 37 boundary vertices in the notebook, and is not expanded here to keep this README readable.

```python
SUBMIT_URL = "https://api.fortyguard.com/v1/heatmap"
STATUS_BASE_URL = "https://api.fortyguard.com/v1/status"

HEADERS = {
    "api-key": API_KEY,
    "Content-Type": "application/json"
}

payload = {
    "polygon_aoi": {
        "type": "Polygon",
        "coordinates": polygon_coordinates
    },
    "date_time": {
        "start_date": "2026-08-29",
        "start_time": "15:00",
        "filter_type": 1
    },
    "granularity": 60
}

response = requests.post(
    SUBMIT_URL,
    headers=HEADERS,
    json=payload,
    timeout=120
)

activity_id = response.json()["data"]["activity_id"]
```

Real sanitized response evidence printed by Notebook 6 for the 15:00 request:

```text
1500 submission HTTP status: 200
1500 activity ID: e9534443-2dba-4a69-b540-297266acd769
1500: Processing
1500: Completed
1500 temperature tiles: 3022
```

Notebook 6 also validates the combined cached output:

```text
Total records: 12088
CRS: EPSG:4326
Columns:
['geometry', 'tile_id', 'average_temperature', 'min_temperature', 'max_temperature', 'analysis_date', 'analysis_time', 'time_code']
```

TODO: If the final hackathon submission requires the full raw JSON body returned by the FortyGuard submit endpoint, add a sanitized copy from the private/raw notebook output. The public analytical repository and notebook output verify the request structure and returned activity IDs, but do not publish the complete submit-response JSON.

## Data Preparation

The analytical workflow uses EPSG:26918 for projected calculations, while Leaflet requires longitude/latitude coordinates. The prep script detects whether each source GeoJSON is already in longitude/latitude and reprojects from EPSG:26918 only when needed.

The script `scripts/prepare-data.mjs`:

- Reads local source copies when present, otherwise downloads the verified source files from GitHub.
- Detects whether coordinates are already longitude/latitude.
- Reprojects EPSG:26918 coordinates to EPSG:4326 using `proj4` when the coordinates are not already longitude/latitude.
- Keeps only the fields used by the dashboard.
- Simplifies building geometry at about 0.75 m and candidate zones at about 2 m after reprojection while preserving shared topology through TopoJSON.
- Writes `public/data/umd_buildings_web.geojson`.
- Writes `public/data/umd_candidate_zones_web.geojson`.
- Downloads the three verified figure PNGs into `public/figures/`.
- Skips work when valid prepared files already exist.

To force a refresh:

```powershell
npm run prepare:data -- --force
```

## Local Setup

```powershell
cd "C:\Users\hanif\Desktop\Masters\icodeGoru\Hackathon\FortyGuard\Working\FGApp"
npm install
npm run dev
```

`npm run dev` automatically runs data preparation first.

## Production Build

```powershell
npm run build
```

The production build is written to `dist/`.

Optional local production preview:

```powershell
npm run preview
```

## Vercel Deployment

1. Push this `FGApp` project to a GitHub repository.
2. In Vercel, import the repository.
3. Use the Vite defaults:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Do not add a FortyGuard API key. The dashboard uses cached public outputs only.
5. Deploy. Vercel will run `prebuild`, which prepares the web GeoJSON and figures.

A custom `vercel.json` is not required for this single-page Vite app.

## Repository Structure

```text
FGApp/
├── public/
│   ├── data/
│   ├── figures/
│   └── favicon.svg
├── scripts/
│   └── prepare-data.mjs
├── src/
│   ├── components/
│   ├── data/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

## Results Summary

- 3,694 buildings analysed.
- 30.746°C average building temperature at 15:00.
- 30.195°C average building temperature at 18:00.
- 53.39% four-time area-weighted mean direct building-envelope exposure.
- 739 Very High priority buildings in the full priority classification.
- 638 eligible source buildings used for planting-zone screening after the building-size filter.
- 308 candidate zones.
- 1.254 km² final candidate-zone area.
- 41.22% existing canopy coverage.
- 13.77 m mean canopy height.

The 739 Very High priority buildings and the 638 planting-screening source buildings are different counts and should not be treated as interchangeable.

## Limitations

- The analysis represents one hot summer day: 29 August 2026.
- FortyGuard values represent 60 m ambient-temperature estimates, not roof or wall surface temperature.
- Statistical relationships are descriptive and do not prove causation.
- Candidate planting zones do not yet exclude roads, parking, utilities, land ownership or other engineering constraints.
- Additional days and field observations would strengthen validation.

## AI-Use Disclosure

OpenAI Codex was used to create the React dashboard, data-preparation script and README wording. The analytical results, GeoJSON layers and figures come from the analytical repository linked above. No dummy data was added.

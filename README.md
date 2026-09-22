# SATQUERY — ISRO Earth Observation & Satellite Intelligence Platform

> **Mission**: High-precision satellite imagery intelligence console engineered for ISRO (Indian Space Research Organisation) Earth Observation analysts. Enables natural language queries over multispectral satellite data, automated object detection, and visual evidence extraction.

---

## 🛰️ Architecture & Viewport Layout

SATQUERY is structured around a **zero-scroll mission console layout**. All primary controls, live imagery, AI analytical evidence, and query interfaces are simultaneously visible in a single **100vh viewport** (`overflow: hidden`).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 APP SHELL (100vh)                                                │
├───────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┤
│               │ HEADER (50px): "👋 Good morning, User" | ISRO Mission Subtitle | 🔔 | PFP Avatar                 │
│               ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│   SIDEBAR     │ METADATA STRIP (38px): Sentinel-2 (Optical) | Date | Lat/Lng | Resolution (10m) | Cloud Cover    │
│   (215px)     ├────────────────────────────────────────────────────────────────┬─────────────────────────────────┤
│               │                   WORKSPACE GRID (Flex 1 1 auto)               │                                 │
│ • SATQUERY    │ ┌────────────────────────────────────────────────────────────┐ │   RIGHT PANEL (345px)           │
│   Brand       │ │ MAP CONTAINER (Flex: 1 1 auto, min-height: 240px)          │ │                                 │
│ • ISRO Badge  │ │ - Real Leaflet.js Interactive Satellite Map (Esri/Carto)   │ │ • Tabs: AI Response | Trace     │
│ • Navigation  │ │ - Left Toolbar: Select, Box, Circle, Polygon, Layers       │ │ • 142 Buildings Detected Card   │
│ • Quick       │ │ - Top-Right: Mumbai Location Badge                         │ │ • Stats: Count, Confidence      │
│   Actions     │ │ - Bottom HUD: North Arrow, Coordinates, Zoom, Live Stream  │ │ • Visual Evidence Thumbnail     │
│ • AI Status   │ ├────────────────────────────────────────────────────────────┤ │ • Key Insights Collapsible      │
│ • Settings    │ │ ASK SATQUERY PANEL (185px fixed height)                    │ │ • Action Buttons (Report /      │
│               │ │ ┌───────────────────────────┬────────────────────────────┐ │ │   Workspace)                    │
│               │ │ │ Q&A Prompt Input & Mic    │ Upload Imagery Dropzone    │ │ │                                 │
│               │ │ │ Try Asking Pills          │ Analysis Type Radios       │ │ │ (Powered By banner REMOVED)     │
│               │ │ └───────────────────────────┴────────────────────────────┘ │ │                                 │
│               │ └────────────────────────────────────────────────────────────┘ │                                 │
└───────────────┴────────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

---

## 🎨 Design System: Warm "Instrument Panel" Light Theme

When updating or extending SATQUERY, adhere strictly to the physical instrument panel design system:

### 1. Palette Tokens (Exact CSS Variables)
- `--bg: #F3EEE4` (warm schematic-paper background, not pure white)
- `--panel: #FBF8F1` (card/panel surface, slightly lighter than bg)
- `--ink: #2A2622` (primary text — warm near-black)
- `--ink-dim: #6B6357` (secondary text)
- `--line: #D8CFBE` (borders — warm grey-tan)
- `--accent: #E86A1C` (ISRO saffron — reserved for active states only)
- `--accent-dim: #F4D8B8` (accent's pale tint for subtle fills)
- `--good: #3F7D5C` (confidence/success, muted olive-green)
- `--warn: #B8842E` (uncertain/caution, muted amber)

### 2. Accent Discipline (Critical)
- `--accent` is strictly for **ACTIVE/SELECTED** states only (e.g. current map tool, active tab, active mode toggle, live status indicators).
- **Never** use `--accent` as a general background color or decoration.
- Default buttons and panels read in `--ink` and `--line`.

### 3. Component Treatment: Physical Instrument Keys
- **Buttons**: Flat fill, no gradients, raised physical key shadow (`0 1px 2px rgba(42,38,34,0.15)`). Active/pressed states invert to an inset shadow (`inset 0 1px 3px rgba(42,38,34,0.25)`).
- **Radius Hierarchy**: 4px for action buttons, 10px for container cards.
- **Toggles**: Styled as physical rocker/slide switches with recessed tracks (`inset 0 1px 2px rgba(42,38,34,0.12)`) and raised active thumbs.
- **LED Indicators**: Single earned soft glow only on actual LED status dots (`AI Engine Online`, `Live Tile Stream`). All other elements are matte/flat.

### 3. Header Constraints
- Header must feature **"Good morning, User"** (or contextual time greeting), ISRO mission subtitle, notification bell, and user avatar.
- **Do NOT place a search bar in the header.**

### 4. Pinned "Ask SatQuery" Panel
- Located directly below the interactive map in the center column.
- Features:
  - Natural language input bar with image attachment icon, voice microphone button, and circular send button.
  - Suggestion pills: `Count buildings`, `Find water bodies`, `Compare changes`, `Describe this area`, `Find roads`, `Analyze vegetation`.
  - Right sub-panel: Drag-and-drop imagery upload zone (GeoTIFF, TIFF, PNG, JPEG) and Analysis Type selector (`Single Image`, `Two Dates`, `Optical + SAR`).

---

## 🗺️ Map Engine & Satellite Imagery Data

### What map is currently loaded?
The interactive map in `src/components/MapPanel.jsx` uses **React-Leaflet** with three switchable tile services:

1. **Primary Satellite Layer (Active Default)**:
   - **Provider**: **Esri World Imagery (ArcGIS World Imagery)**
   - **Tile URL**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
   - **Sources**: Composite mosaic from Maxar / DigitalGlobe, CNES / Airbus Pleiades, Earthstar Geographics, and USGS.
   - **Resolution**: Sub-meter (0.3m – 0.5m) in major urban centers (e.g., Mumbai, Delhi, Bengaluru) and 15m global coverage.
   - **Is it updated / real-time?**:
     - Global satellite tile layers like Esri, Google Satellite, and Mapbox are **not real-time streaming feeds**. They are curated, cloud-free, color-balanced composite mosaics.
     - **Currency**: For high-density metropolitan areas like Mumbai, the imagery is generally updated on a **1 to 2-year cadence** (typically 2022–2024 vintage).
     - **For Live ISRO Operational Feeds**: Direct real-time passes are accessed through ISRO's **Bhuvan WMS** or **Sentinel-2 L2A / Landsat-9** 5-day revisit APIs (see integration guide below).

2. **Dark Matter Layer**:
   - **Provider**: CartoDB Dark Matter
   - **Tile URL**: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

3. **Topographic Layer**:
   - **Provider**: OpenTopoMap
   - **Tile URL**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`

### Connecting Live ISRO Bhuvan or Copernicus APIs
To connect real-time ISRO imagery feeds, update `MapPanel.jsx` with WMS tile layers:
```js
// Example ISRO Bhuvan WMS endpoint:
// https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms
// Example Copernicus Sentinel-2 L2A via Sentinel Hub:
// https://services.sentinel-hub.com/ogc/wms/{INSTANCE_ID}
```

---

## 📁 Component Directory (`src/components/`)

| Component | Responsibility |
|---|---|
| `Sidebar.jsx` | Brand emblem, ISRO mission badge, navigation links, quick analysis actions, AI engine status pill, and settings link. |
| `Header.jsx` | Contextual greeting ("Good morning, User"), ISRO platform status, notification bell with unread dot, user avatar profile, and View Mode toggle (Map Console vs Centered AI Chat). |
| `MetadataStrip.jsx` | Telemetry bar displaying current satellite mission (Sentinel-2 L2A), acquisition date, lat/long coordinates, spatial resolution (10m), and cloud cover percentage. |
| `MapPanel.jsx` | Real Leaflet.js interactive map with drawing tool toggles (pointer, bounding box, radius, polygon), layer switcher, top-right region badge, and bottom HUD with live coordinate tracker. |
| `AskPanel.jsx` | 2-column Q&A and imagery ingestion panel directly beneath the map: query input, quick suggestion pills, drag-and-drop file upload, and analysis type radio selector. |
| `RightPanel.jsx` | Analytics pane with `AI Response` & `Execution Trace` tabs, detected structures summary, confidence metric, visual evidence thumbnail with bounding boxes, key insights, and action buttons. |

---

## 🛠️ Tech Stack & Scripts

- **Framework**: React 19 + Vite 8
- **Icons**: Lucide React (`lucide-react`)
- **Mapping**: Leaflet 1.9 + React-Leaflet 5
- **Styling**: Vanilla CSS Design System (`src/index.css`)
- **Fonts**: Google Fonts (`Plus Jakarta Sans` for UI, `JetBrains Mono` for coordinates & telemetry)

### Development Scripts
```bash
# Start local development server (typically port 5173 or 5174)
npm run dev

# Production build check
npm run build

# Preview build locally
npm run preview
```

---

## 🤖 Instructions for AI Agents Editing This Repository

1. **Preserve the Layout Balance**: Do not increase the height of `AskPanel` or `Header` in a way that forces the `.workspace-grid` or `body` to display scrollbars.
2. **Coordinate Synchronization**: The coordinate state lives in `App.jsx` (`coords`) and is updated by `MapPanel`'s `onLocationChange` callback to keep `MetadataStrip` and the map HUD synchronized.
3. **Never Re-introduce the Earth Banner**: The user explicitly requested removing the bottom right "Powered by Advanced Vision-Language Models" earth banner widget to give the analytical cards maximum breathing room.
4. **CSS Token Consistency**: Always use CSS variables (`var(--bg-card)`, `var(--tech-blue)`, `var(--border-dark)`) instead of hardcoding random hex colors.

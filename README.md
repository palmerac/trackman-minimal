# Trackman Minimal

A streamlined, zero-bloat Chrome extension to capture and export Trackman golf shot data and portal sessions directly to CSV.

> *Forked and adapted from [`criticalberne/TrackPull`](https://github.com/criticalberne/TrackPull) under the [MIT License](LICENSE).*

---

## What Makes this "Minimal"?

This fork is designed for golfers and analysts who want clean, fast CSV exports without unnecessary UI clutter, extra background overhead, or AI prompt tooling:

1. **Club Face Impact Metrics (PR #12):**
   - Incorporates the GraphQL stroke measurement improvements from [`criticalberne/TrackPull#12`](https://github.com/criticalberne/TrackPull/pull/12).
   - Adds `impactOffset` and `impactHeight` (in mm) to portal queries so range sessions, shot analysis, combine tests, and virtual sessions include face contact location.
2. **Locked Export Settings (Zero Clutter):**
   - Automatically locked to standard units: **mph** (speed), **yards** (distance), and **Mat** (hitting surface).
   - Removed redundant unit and surface dropdown selectors from the popup UI.
3. **No Settings / Options Page:**
   - Removed the separate options page (`options.html` / `options.js`) and popup gear icon, trimming ~80 KB of dead code and simplifying the extension lifecycle.
4. **Single-Purpose CSV Export:**
   - Removed the "Copy TSV" button and clipboard prompt-generation features. Focuses strictly on downloading clean, structured CSV files.
5. **Bulk Import Clear Action:**
   - Added a dedicated **Clear** button to the portal session importer to purge local bulk snapshots, reset activity row buttons back to "Import", and enable checkboxes for fresh exports.

---

## Installation

### Clone and Build

1. Clone the repository:
   ```bash
   git clone https://github.com/aaronpalmer/trackman-minimal.git
   cd trackman-minimal
   ```
2. Install dependencies and build the extension:
   ```bash
   npm install
   npm run build
   ```
3. In Google Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `dist/` directory inside this repository

---

## Usage

### 1. From a Trackman Report (Automatic)
1. Open any Trackman report URL (e.g. `web-dynamic-reports.trackmangolf.com/...`).
2. The extension automatically intercepts the shot data in the background.
3. Click the **Trackman Minimal** toolbar icon to view your shot count.
4. Click **Export CSV** to download your session file.

### 2. From Trackman Portal Sessions (Bulk Export)
1. Log into your account at [portal.trackmangolf.com](https://portal.trackmangolf.com).
2. Open the extension popup and click **Grant Access** (one-time permission for portal access).
3. Navigate to `portal.trackmangolf.com/player/activities`.
4. Open the extension popup to view your recent sessions (Course Play, Virtual Range, Shot Analysis, Combine).
5. Select specific sessions or click **Import all**.
6. Click **Export CSV** to download a single, unified CSV file with all shots and sessions combined.
7. Click **Clear** whenever you want to reset the imported state and clear stored session snapshots.

---

## Exported Columns

The CSV export contains complete shot delivery, launch, distance, and impact data:

| Group | Metrics |
|---|---|
| **Metadata** | Session Date, Report ID, Activity Type, Club, Shot #, Type |
| **Speed & Efficiency** | Club Speed (mph), Ball Speed (mph), Smash Factor |
| **Club Delivery** | Attack Angle (°), Club Path (°), Face Angle (°), Face To Path (°), Swing Direction, Dynamic Loft (°), Dynamic Lie (°), Swing Plane (°) |
| **Launch & Spin** | Launch Angle (°), Launch Direction (°), Spin Rate (rpm), Spin Axis, Spin Loft |
| **Distance & Flight** | Carry (yds), Total (yds), Carry Side (yds), Total Side (yds), Max Height (yds), Landing Angle (°), Hang Time (s) |
| **Impact Location** | Impact Height (mm), Impact Offset (mm) |

---

## Development & Testing

```bash
# Run Vitest test suite (338 tests)
npm test

# Run TypeScript typecheck
npm run typecheck

# Build bundle into dist/
npm run build
```

---

## License

This project is licensed under the [MIT License](LICENSE).
- Original work Copyright (c) 2026 criticalberne
- Modifications Copyright (c) 2026 Aaron Palmer

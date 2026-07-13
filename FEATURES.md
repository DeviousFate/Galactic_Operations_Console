# Galactic Operations Console: Current Feature Log

This document records the features currently implemented in the Foundry VTT module package. It distinguishes runtime functionality from source data and maintenance utilities.

## Runtime Package

- **Module:** `star-log-imperial` / **Galactic Operations Console**
- **Foundry support:** minimum v12, verified through v13.
- **Launch methods:** scene-control entry, `Ctrl+L`, the persistent quick-access panel, or `GalacticOperationsConsole.open()` from a macro.
- **Dashboard sections:** Ops, Intel, Systems, and GM-only ISB CONF.
- **Layout:** movable and resizable Foundry application with responsive dashboard panels.

## Player Operations

### Ops: Mission Execution

- Displays the current mission theater from synchronized live location data: planet, grid, sector, region, and applicable restriction status.
- Shows the GM-authored Mission Orders as a read-only briefing.
- Provides a current-location tactical scan, subject to NavData and restricted-system authorization checks.
- Sector Reconnaissance assigns one persistent empty, low, standard, or high traffic profile to each scanned non-restricted grid. The profile can include Imperial routine patrol activity, with materially higher encounter chances near major hyperlanes and restricted grids; it repeats unchanged while the vessel remains in that grid and clears when the ship departs.
- Supports a player preference to suppress map indicators.

### Intel: Target Analysis

- Searches planetary records by designation and opens an independent planet dossier popup.
- Loads matching planet images from `Planet_Images`; when no matching image is available, reports **Intelligence Database Incomplete**.
- Keeps the latest dossier available for recall after its popup is closed.
- Centers and focuses the galaxy map on an identified planet, then resets to the full map after leaving Intel.
- Provides the party NavData Library readout, including granted planet, sector, grid, and region access.

### Systems: Vessel Control

- Can be linked by a GM to a Foundry Vehicle Actor using its UUID.
- Reads vessel information and qualifying inventory entries for armor, hyperdrives, shields, stealth drives, and cloaking equipment. Hyperdrive Slot entries consolidate to the lowest Main Hyperdrive Class, while Backup Hyperdrive entries consolidate to the highest Backup Hyperdrive Class.
- Does not use Starship Actions to populate vessel systems.
- Shows Deception Systems controls only when the selected vessel has qualifying stealth or cloaking equipment.
- Synchronizes the stealth-state control to all connected clients.

### Systems: NaviComputer

- Plots hyperspace routes between known planetary destinations using the NavData grid.
- Calculates grid-by-grid routing, regional base travel, realspace legs, hyperdrive-class adjustments, major-hyperlane effects, total travel time, and fuel required.
- Rounds required fuel upward to the next whole unit.
- Supports direct transit and restricted-grid avoidance protocols.
- Prevents unauthorized direct navigation to restricted systems; eligible clearance-code prompts can authorize a route.
- Draws and clears a proposed transit route and destination marker on the map.
- Engaging transit synchronizes the party location and updates the locked party-position marker.

## Galaxy Map

- Uses the static galaxy map in `assets/GFFA-high.jpg` with a calibrated 23-column by 22-row grid overlay.
- Supports right-click drag panning, double-click zoom in at the cursor grid, and double-click zoom out from a zoomed state.
- Shows a grid-aligned focused-location marker, a party triangulation marker, planned transit line, hyperlane/restriction markers, and delayed grid-hover identification.
- Keeps the party marker below planet-dossier popups.
- Can apply opaque limited-information fog to grids for which the party lacks NavData; the GM controls this with the world-level **Enable NavData Map Fog** setting, disabled by default. The separate **Restrict Tier Map Vision** setting controls whether Tier 3+ grids remain visually hidden before clearance; both settings affect only the map and default to disabled. Restricted navigation and analysis authorization remain enforced.
- The GM can unlock grid alignment controls; normal users cannot move the party marker or alter calibration.

## Restricted Navigation and NavData

- Provides restriction tiers 0 through 5, their associated systems, public-facing status, and authorization state.
- Restriction markers and tier information are visible only when the associated authorization permits them.
- Restriction Tier 3, 4, and 5 destinations require acceptance of the matching clearance-code tier before access is granted.
- Includes fifteen generated clearance codes in `Clearance Codes.txt`: five per restricted tier (3, 4, and 5).
- NavData can be distributed by planet, sector, grid, or region from the GM interface.
- NavData package choices restrict designation scope to valid package/designation combinations.
- CSV import normalizes blank or malformed (`|`) sector fields to the first listed planet in the same grid plus ` Sector`, without replacing existing valid sector labels.

## Warnings and Communications

- Loads system-specific warning material from `Warnings.txt`.
- Triggers first-visit warning popups for configured systems.
- Gives GMs manual Grade 1 through Grade 5 warning controls.
- Stores and displays live hails in the GM-only ISB CONF log, using ISD naming data where configured.
- Provides a persistent commlink quick-access control. GM activation alerts clients by making the commlink blink; the commlink retains its GM right-click alert behavior.

## GM: ISB CONF

- Denies non-GM users access with a non-collapsible clearance screen.
- Uses collapsed-by-default sections for GM controls.
- Allows editing the Mission Orders briefing and synchronizes it to Ops.
- Provides restriction-tier authorization toggles, restriction details, and manual warning activation.
- Provides NavData distribution controls and live-hail monitoring.
- Generates or refreshes GM-only Foundry journal entries for station approach briefings.
- Generates or refreshes the GM-only **Imperial Fleet Disposition** journal, with a classified page for every restricted system including tier rationale, assigned fleet composition, and engagement protocol.
- Includes system diagnostics for NavData, warnings, clearance codes, assets, active GM, and socket status.
- Provides mission-control, vessel, map-grid alignment, and station-journal administration.

## Startup and Quick Access

- Displays a per-login startup sequence unless a user opts out through module settings.
- Uses timed terminal text, error/retry states, and Imperial-to-Rebel holographic image transitions.
- Keeps the popup dimensions stable during the sequence.
- Supplies a persistent vertical quick-access panel for Commlink, Mission Status, AstroNav, Target Intel, Ship Systems, and Transmissions.
- GMs also receive direct ISB CONF access from the quick-access panel.
- A client-side setting can hide the quick-access panel.

## Synchronization and Persistence

- Uses Foundry sockets and module settings to synchronize live location, vessel/deception state, warnings, hails, commlink alerts, NavData, restriction access, and mission data across GM and player clients.
- Persists grid calibration, restricted-tier access, selected primary vessel, warning visitation, NavData grants, and generated station-journal state in Foundry settings.

## Runtime Data and Assets

The following files are required or consumed by runtime features:

- `SW Grid Coords.csv`: planetary names, grids, sectors, regions, and optional precise coordinates.
- `Planet_Images/`: planet dossier imagery.
- `Warnings.txt`: warning and first-visit content.
- `ISD Names.txt`: live-hail vessel naming data.
- `Clearance Codes.txt`: Tier 3-5 clearance codes.
- `assets/`: galaxy map, quick-access images, holographic widgets, and related interface assets.
- `scripts/modules/station-data.js`: canonical station descriptor data used for Foundry journal generation.

## Development and Maintenance

- Source modules are separated into state synchronization, routing, map UI, clearance, warnings, journals, startup sequence, mission control, planet intel, NavData, and station data.
- `scripts/build-module.js` assembles those modules and `scripts/imperial-star-log.js` into the runtime bundle `scripts/galactic-operations-console.js` referenced by `module.json`.
- Automated Node tests cover clearance, navigation routing, NavData normalization, startup timing, and station-data behavior.

Run before packaging a code change:

```powershell
npm.cmd run build
npm.cmd test
node --check scripts/galactic-operations-console.js
```

## Non-Runtime Records and Utilities

- `Wookieepedia Sector Matches.csv` and `Wookieepedia Sector Unresolved.csv` are research/audit records; they are not loaded by Foundry at runtime.
- `scripts/survey-wookieepedia-sectors.js` generates the current Wookieepedia sector audit reports.
- `scripts/survey-wookieepedia-sector-stubs.js` is a legacy research utility. Its former report outputs were intentionally removed and it is not part of the runtime module.
- `dashboard.html` is a standalone local-preview surface; Foundry renders `templates/dashboard.hbs`.
- `Planet Compendium.pdf`, `Cropped_Planet_Compendium.pdf`, `extract_planets.py`, and `crop_compendium.py` support source-data preparation rather than runtime behavior.
- `Station Read-Aloud Descriptors.md` intentionally points to the canonical `station-data.js` data instead of duplicating it.

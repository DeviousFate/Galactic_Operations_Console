(() => {
    "use strict";

    const MODULE_ID = "star-log-imperial";
    const moduleRoot = `modules/${MODULE_ID}`;
    const localPreview = Boolean(window.ISL_DEV_BUILD);
    const assetRoot = localPreview ? "" : `${moduleRoot}/`;
    const templatePath = `${moduleRoot}/templates/dashboard.hbs`;
    const imageBasePath = `${assetRoot}Planet_Images/`;
    const gridCoordinateCsvPaths = [
        `${assetRoot}SW%20Grid%20Coords.csv`,
        `${assetRoot}Star%20Wars%20Galaxy%20Map%20Grid%20Coordinates%20-%20planets.csv`
    ];
    const warningDefinitionsPath = `${assetRoot}Warnings.txt`;
    const isdNamesPath = `${assetRoot}ISD%20Names.txt`;
    const clearanceCodesPath = `${assetRoot}Clearance%20Codes.txt`;
    const QUICK_ACCESS_BUTTONS = [
        { action: "commlink", label: "Commlink", icon: "Phone.png" },
        { action: "mission-status", label: "Mission Status", icon: "Reminders.png" },
        { action: "astronav", label: "AstroNav", icon: "Maps-3.png" },
        { action: "target-intel", label: "Target Intel", icon: "Notes.png" },
        { action: "ship-systems", label: "Ship Systems", icon: "Shortcuts.png" },
        { action: "transmissions", label: "Transmissions", icon: "News.png" }
    ];
    const DEFAULT_LOCATION_NAME = "TATOOINE";
    const DEFAULT_SHIP_GRID = "R16";
    const DEFAULT_SHIP_TRANSPONDER = "The Rust-Wake";
    const DEFAULT_LIVE_STATE = {
        location: DEFAULT_LOCATION_NAME,
        shipGrid: DEFAULT_SHIP_GRID
    };
    const SCAN_LOCATION_NAME = "DAGOBAH";
    const MAP_GRID_COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVW".split("");
    const DEFAULT_MAP_GRID_CALIBRATION = {
        left: 0.06,
        top: 0.1009,
        width: 0.9213,
        height: 0.8796,
        rows: 22
    };
    const GRID_EDIT_MIN_SIZE = 0.02;
    const HYPERLANE_ADJACENT_GRID_DISTANCE = 1;
    const GRID_COORDINATE_ALIASES = {
        "NAL HUTTA": "NAL HUTTA & NAR SHADDAA",
        "NAR SHADDAA": "NAL HUTTA & NAR SHADDAA",
        "MON CALA": "MON CALAMARI",
        "MORABAND": "KORRIBAN",
        "KORRIBAN MORABAND": "KORRIBAN",
        "HORUZ": "HORUZ DESPAYRE",
        "DESPAYRE": "HORUZ DESPAYRE"
    };
    const GRID_COORDINATE_OVERRIDES = {
        CORUSCANT: {
            Planet: "Coruscant",
            Grid: "L10",
            MapPosition: "K9/K10/L9/L10 intersection",
            Sector: "",
            Region: "Core"
        }
    };
    const ZOOM_MIN = 100;
    const ZOOM_MAX = 150;
    const ZOOM_STEP = 10;
    const PLANET_FOCUS_ZOOM = 180;
    const CURSOR_GRID_ZOOM = 250;
    const HYPERSPACE_REGION_ALIASES = {
        "DEEP CORE": "Deep Core",
        CORE: "Core",
        COLONIES: "Colonies",
        "INNER RIM": "Inner Rim",
        "EXPANSION REGION": "Expansion Region",
        "EXPANSION REGIONS": "Expansion Region",
        "MID RIM": "Mid Rim",
        "OUTER RIM": "Outer Rim",
        "HUTT SPACE": "Outer Rim",
        "WILD SPACE": "Wild Space",
        "UNKNOWN REGION": "Unknown Regions",
        "UNKNOWN REGIONS": "Unknown Regions",
        UNCHARTED: "Unknown Regions"
    };
    const ASTRONAV_REALSPACE_OPTIONS = {
        "safe-jump": {
            label: "Orbit to safe hyperspace jump distance",
            display: "1 minute",
            minHours: 1 / 60,
            maxHours: 1 / 60
        },
        "surface-orbit": {
            label: "Surface of planet to orbit",
            display: "1-5 minutes",
            minHours: 1 / 60,
            maxHours: 5 / 60
        },
        moon: {
            label: "Orbit to planet's moon",
            display: "10-30 minutes",
            minHours: 10 / 60,
            maxHours: 30 / 60
        },
        "same-system": {
            label: "Orbit to another planet in the same system",
            display: "2-6 hours",
            minHours: 2,
            maxHours: 6
        },
        "outer-edge": {
            label: "Orbit to outer edge of system",
            display: "12-24 hours",
            minHours: 12,
            maxHours: 24
        },
        none: {
            label: "None / already at jump point",
            display: "0 hours",
            minHours: 0,
            maxHours: 0
        }
    };
    const HYPERSPACE_REGION_TRAVEL_HOURS = {
        "Deep Core": {
            "Deep Core": 12,
            Core: 18,
            Colonies: 24,
            "Inner Rim": 48,
            "Expansion Region": 72,
            "Mid Rim": 96,
            "Outer Rim": 120,
            "Wild Space": 144,
            "Unknown Regions": 168
        },
        Core: {
            "Deep Core": 24,
            Core: 6,
            Colonies: 24,
            "Inner Rim": 36,
            "Expansion Region": 60,
            "Mid Rim": 84,
            "Outer Rim": 96,
            "Wild Space": 120,
            "Unknown Regions": 144
        },
        Colonies: {
            "Deep Core": 48,
            Core: 24,
            Colonies: 12,
            "Inner Rim": 24,
            "Expansion Region": 48,
            "Mid Rim": 72,
            "Outer Rim": 96,
            "Wild Space": 120,
            "Unknown Regions": 96
        },
        "Inner Rim": {
            "Deep Core": 72,
            Core: 36,
            Colonies: 24,
            "Inner Rim": 18,
            "Expansion Region": 24,
            "Mid Rim": 48,
            "Outer Rim": 72,
            "Wild Space": 96,
            "Unknown Regions": 72
        },
        "Expansion Region": {
            "Deep Core": 96,
            Core: 60,
            Colonies: 48,
            "Inner Rim": 24,
            "Expansion Region": 24,
            "Mid Rim": 24,
            "Outer Rim": 48,
            "Wild Space": 72,
            "Unknown Regions": 96
        },
        "Mid Rim": {
            "Deep Core": 120,
            Core: 84,
            Colonies: 72,
            "Inner Rim": 48,
            "Expansion Region": 24,
            "Mid Rim": 36,
            "Outer Rim": 24,
            "Wild Space": 48,
            "Unknown Regions": 72
        },
        "Outer Rim": {
            "Deep Core": 144,
            Core: 96,
            Colonies: 96,
            "Inner Rim": 72,
            "Expansion Region": 48,
            "Mid Rim": 24,
            "Outer Rim": 48,
            "Wild Space": 24,
            "Unknown Regions": 60
        },
        "Wild Space": {
            "Deep Core": 168,
            Core: 120,
            Colonies: 120,
            "Inner Rim": 96,
            "Expansion Region": 72,
            "Mid Rim": 48,
            "Outer Rim": 24,
            "Wild Space": 12,
            "Unknown Regions": 120
        },
        "Unknown Regions": {
            "Deep Core": 192,
            Core: 144,
            Colonies: 96,
            "Inner Rim": 72,
            "Expansion Region": 60,
            "Mid Rim": 72,
            "Outer Rim": 96,
            "Wild Space": 120,
            "Unknown Regions": 48
        }
    };
    const HYPERLANE_NODE_ALIASES = {
        FOLLESS: "FORLESS",
        BADOMEER: "BANDOMEER",
        BODGEN: "BOGDEN"
    };
    const MAJOR_GALACTIC_HYPERLANES = [
        {
            id: "H1",
            name: "Perlemian Trade Route",
            legs: [
                ["CORUSCANT", "L10", "ALSAKAN", "L9", 3.6],
                ["ALSAKAN", "L9", "ANAXES", "L9", 3.6],
                ["ANAXES", "L9", "BRENTAAL", "L9", 3.6],
                ["BRENTAAL", "L9", "YABOL OPA", "M9", 9.6],
                ["YABOL OPA", "M9", "CASTELL", "M9", 6],
                ["CASTELL", "M9", "VURDON KA", "M9", 4.8],
                ["VURDON KA", "M9", "CHAZWA", "N8", 6]
            ]
        },
        {
            id: "H2",
            name: "Corellian Run",
            legs: [
                ["CORUSCANT", "L10", "IXTLAR", "L10", 6],
                ["IXTLAR", "L10", "CORELLIA", "M11", 36],
                ["CORELLIA", "M11", "TINNEL", "M12", 6],
                ["TINNEL", "M12", "LORONAR", "M12", 4.8],
                ["LORONAR", "M12", "BYBLOS", "M12", 3.6],
                ["BYBLOS", "M12", "ISENN", "N13", 8.4]
            ]
        },
        {
            id: "H3",
            name: "Corellian Trade Spine",
            legs: [
                ["CORELLIA", "M11", "DURO", "M11", 1],
                ["DURO", "M11", "KELADA", "M13", 25.2],
                ["KELADA", "M13", "FORLESS", "M14", 7.2],
                ["FORLESS", "M14", "BESTINE", "M14", 2.4],
                ["BESTINE", "M14", "MECHIS", "L14", 8.4],
                ["MECHIS", "L14", "YAGDHUL", "L14", 3.6],
                ["YAGDHUL", "L14", "HARRIN", "L15", 1.2],
                ["KINYEN", "L15", "BOMIS KOORI", "K16", 36],
                ["BOMIS KOORI", "K16", "KRISELIST", "K17", 2.4],
                ["KRISELIST", "K17", "KAAL", "K17", 6],
                ["KAAL", "K17", "JIROCH", "K17", 4.8],
                ["JIROCH", "K17", "MUGAAR", "K18", 4.8],
                ["MUGAAR", "K18", "GERRENTHUM", "K18", 3.6],
                ["GERRENTHUM", "K18", "ISDE NAHA", "K18", 7.2],
                ["ISDE NAHA", "K18", "BERROLS DONN", "K19", 4.8],
                ["BERROLS DONN", "K19", "MANPHA", "K20", 12],
                ["MANPHA", "K20", "TERMINUS", "K20", 10.8]
            ]
        },
        {
            id: "H4",
            name: "Rimma Trade Route",
            legs: [
                ["ABREGADO RAE", "L13", "DENTAAL", "L13", 1.2],
                ["DENTAAL", "L13", "GIJU", "L13", 4.8],
                ["GIJU", "L13", "GHORMAN", "L14", 9.6],
                ["GHORMAN", "L14", "THYFERRA", "L14", 10.8],
                ["THYFERRA", "L14", "YAGDHUL", "L14", 6],
                ["YAGDHUL", "L14", "WROONA", "L15", 3.6],
                ["WROONA", "L15", "VANDELHELM", "M15", 12],
                ["VANDELHELM", "M15", "WOOSTRI", "M16", 6],
                ["WOOSTRI", "M16", "VONDARC", "M16", 8.4],
                ["VONDARC", "M16", "SULLUST", "M17", 13.2],
                ["SULLUST", "M17", "ERIADU", "M18", 8.4],
                ["ERIADU", "M18", "CLAKDOR", "M18", 3.6],
                ["CLAKDOR", "M18", "TRITON", "M18", 1.2],
                ["TRITON", "M18", "SLUIS VAN", "M19", 4.8],
                ["SLUIS VAN", "M19", "KARIDEPH", "M20", 18]
            ]
        },
        {
            id: "H5",
            name: "Hydian Way",
            legs: [
                ["BANDOMEER", "O6", "CORSIN", "M7", 27.6],
                ["CORSIN", "M7", "BOGDEN", "M8", 18],
                ["BOGDEN", "M8", "PAQUALIS", "L8", 3.6],
                ["PAQUALIS", "L8", "DREARIA", "L8", 3.6],
                ["DREARIA", "L8", "CHAMPALA", "L8", 2.4],
                ["CHAMPALA", "L8", "UVIUY EXEN", "L9", 7.2],
                ["UVIUY EXEN", "L9", "BRENTAAL", "L9", 8.4],
                ["BRENTAAL", "L9", "SKAKO", "L9", 3.6],
                ["SKAKO", "L9", "FEDALLE", "M10", 16.8],
                ["FEDALLE", "M10", "BELLASSA", "M11", 15.6],
                ["BELLASSA", "M11", "EXODEEN", "N12", 9.6],
                ["MALASTARE", "N16", "DARKKNELL", "M17", 13.2],
                ["DARKKNELL", "M17", "ERIADU", "M18", 12],
                ["ERIADU", "M18", "SHUMAVAR", "L19", 14.4],
                ["RUTAN", "L20", "TERMINUS", "K20", 18],
                ["TERMINUS", "K20", "IMYNUSOPH", "J21", 10.8]
            ]
        }
    ];
    const MISSION_BRIEF_SETTING_KEY = "missionBrief";
    const LEGACY_OPS_SETTING_KEY = "opsData";
    const LIVE_STATE_SETTING_KEY = "liveState";
    const STEALTH_SYSTEMS_SETTING_KEY = "stealthSystemsEngaged";
    const GRID_ALIGNMENT_SETTING_KEY = "gridAlignment";
    const GRID_ALIGNMENT_UNLOCKED_SETTING_KEY = "gridAlignmentUnlocked";
    const RESTRICTION_TIER_ACCESS_SETTING_KEY = "restrictionTierAccess";
    const NAV_DATA_SETTING_KEY = "navData";
    const MAP_INDICATORS_HIDDEN_SETTING_KEY = "mapIndicatorsHidden";
    const WARNING_SYSTEM_VISITS_SETTING_KEY = "warningSystemVisits";
    const LIVE_HAIL_LOG_SETTING_KEY = "liveHailLog";
    const COMMLINK_ALERT_SETTING_KEY = "commlinkAlertActive";
    const STATION_JOURNAL_FOLDER_NAME = "Galactic Operations Console - Station Briefings";
    const STATION_JOURNAL_FLAG = "stationBriefing";
    const STATION_JOURNAL_MANIFEST_SETTING_KEY = "stationJournalManifestVersion";
    const STATION_JOURNAL_MANIFEST_VERSION = 1;
    const SOCKET_NAME = `module.${MODULE_ID}`;
    const STATION_JOURNAL_DESCRIPTORS = [
        {
            name: "Azzameen Station",
            grid: "N17",
            sector: "Garis sector",
            region: "Outer Rim",
            descriptor: "A modest trading station turns slowly against the stars, its docking arms crowded with practical freighters rather than warships. The place feels lived in: patched hull plates, warm windows, and the quiet confidence of a family business that has survived by knowing every route worth taking.",
            source: "Azzameen family headquarters and trading-company base."
        },
        {
            name: "Bannistar Station",
            grid: "O15",
            sector: "Hevvrol",
            region: "Mid Rim",
            descriptor: "Bannistar is less a station than a forest of fuel tanks suspended in space. Elevated walkways spider between enormous cylindrical reservoirs, while refinery glow and vapor plumes stain the darkness below a hard Imperial command deck.",
            source: "Imperial refueling station with linked fuel tanks, elevated walkways, refineries, and a command center."
        },
        {
            name: "Colonial Station Cam'co",
            grid: "F8",
            sector: "Chiss Ascendancy",
            region: "Unknown Regions",
            descriptor: "The navigation name is misleading: Colonial Station Cam'co is a settled terrestrial world, seen below as an orderly pattern of pale structures and carefully measured landing fields. Nothing is wasted in its design; the whole colony carries the reserved, disciplined character of Chiss space.",
            source: "Terrestrial Chiss world in the Unknown Regions; homeworld of the Chiss caregiver Thalias."
        },
        {
            name: "Colonial Station Chaf",
            grid: "F9",
            sector: "Chiss Ascendancy",
            region: "Unknown Regions",
            descriptor: "Colonial Station Chaf resolves below as a terrestrial Chiss colony, its most prominent silhouette a regimented field of long-range relay towers. Navigation lights flash in deliberate sequence, as though the planet itself is passing messages across the dark.",
            source: "Terrestrial Chiss world and part of a communications triad."
        },
        {
            name: "Denarii Station",
            grid: "P6",
            sector: "Gordian Reach",
            region: "Outer Rim",
            descriptor: "The Denarii system is a ghost-lit graveyard of old science: habitation drums and laboratory modules hanging in the charged haze of an ionized stellar remnant. Instrument windows blink with obsolete readings, and every hull surface crackles with pale static.",
            source: "Abandoned laboratory and habitation modules in the ionized remains of the Denarii system."
        },
        {
            name: "Dravian Station",
            grid: "N18",
            sector: "Tamarin",
            region: "Outer Rim",
            descriptor: "Dravian Starport is a bright, crowded oasis in deep space. Casino marquees and hotel windows shine from a sprawling civilian platform, while freighters, couriers, and ships that prefer not to be noticed pass through its busy docking rings.",
            source: "A remote smuggler haven between Cotellier and Syned, with casinos, hotels, restaurants, and freight businesses."
        },
        {
            name: "Junkfort Station",
            grid: "T8",
            sector: "Tharin",
            region: "Outer Rim",
            descriptor: "Junkfort looks assembled rather than built. Salvaged hulls, mismatched docking collars, and patched air tunnels form a crooked little city where every bay advertises repairs, modifications, or a service best discussed off the record.",
            source: "Shadowport at a hyperlane nexus known for illicit modifications and spice trade."
        },
        {
            name: "Kemal Station",
            grid: "R16",
            sector: "Arkanis",
            region: "Outer Rim",
            descriptor: "Kemal hangs above a damp, fog-shrouded moon, with a gas giant filling half the sky beyond its docks. The approach is busy but cautious: merchant lights, smuggler transponders, and local traffic all drift through the same wet silver haze.",
            source: "A foggy terrestrial moon on the Triellus route, used by merchants and smugglers near Hutt influence."
        },
        {
            name: "Koda Station",
            grid: "I18",
            sector: "Wazta",
            region: "Outer Rim",
            descriptor: "Koda is a small, worn spaceport at the end of nowhere, busy enough to be interesting and shabby enough to be overlooked. Salvage crates crowd its bays, and the battered sign for The End of the World cantina promises a drink, a rumor, and trouble in equal measure.",
            source: "Backwater spaceport at the end of the Koda Spur, visited by farmhands, smugglers, and salvage buyers."
        },
        {
            name: "Kolanda Station",
            grid: "S14",
            sector: "Yminis",
            region: "Outer Rim",
            descriptor: "Kolanda Station sits over Latharra with the air of a place that remembers violence. Its old landing platforms are scarred and over-reinforced, and the guarded silence around them suggests that some local history is still too dangerous to discuss openly.",
            source: "A station on Hutt-affiliated Latharra, where Imperial forces massacred Rebel soldiers during the Galactic Civil War."
        },
        {
            name: "Petabys Station",
            grid: "J16",
            sector: "Halm",
            region: "Mid Rim",
            descriptor: "Petabys presents a hard, martial silhouette: gun emplacements, armored docking throats, and fighter bays built to defend a station that no longer admits what it used to be. Beyond the weapons, market lights and discreet cargo traffic hint that its defenses now protect profitable secrets.",
            source: "Former FireStar orbital-defense facility converted to a black-market station while retaining its defenses and fighter bays."
        },
        {
            name: "Pondut Station",
            grid: "S4",
            sector: "Corporate Sector",
            region: "Outer Rim",
            descriptor: "Pondut is an immense corporate research platform, all modular laboratories, cargo holds, and sensor arrays. Its clean geometric surfaces feel more industrial than welcoming, while old security emplacements make it clear that valuable experiments once took place behind those sealed bulkheads.",
            source: "An XQ2 Galactic Electronics research station associated with magnetic-pulse weapons research and later seized by Imperial forces."
        },
        {
            name: "Pusat Station",
            grid: "R8",
            sector: "Bortele",
            region: "Mid Rim",
            descriptor: "Pusat Station is a plain, functional waypoint whose value is its location rather than its comfort. Sparse running lights mark compact docking structures and long-range beacons, giving travelers in the Halla sector a dependable place to refuel, resupply, and move on.",
            source: "Published material identifies the Pusat Station system and its Mid Rim location; this visual presentation is a GM interpretation."
        },
        {
            name: "Rimcee Station",
            grid: "J3",
            sector: "Braxant",
            region: "Outer Rim",
            descriptor: "Rimcee Station is an Imperial military holdfast in miniature: severe angles, shuttered viewports, and docking bays watched by more guns than traffic requires. The airlocks have the impersonal feel of a prison intake, where every visitor is already suspected of something.",
            source: "Imperial Remnant station and political-prison site in the Rimcee system."
        },
        {
            name: "Station 88",
            grid: "J7",
            sector: "Vorc",
            region: "Mid Rim",
            descriptor: "Station 88 is a major deep-space port, large enough to feel like several cities bolted together around a central traffic spine. Arriving ships pass through dense lanes of cargo, passenger liners, and patrol craft, all converging on a crossroads important enough to have attracted galactic powers.",
            source: "Large strategic spaceport in the Vorc sector, founded by a four-system alliance and contested during the Clone Wars."
        },
        {
            name: "Telkur Station",
            grid: "O9",
            sector: "Hapes Cluster",
            region: "Inner Rim",
            descriptor: "Telkur emerges from the Transitory Mists only at the last moment, a dim cluster of docks and a small cantina hidden inside ionized cloud. The haze swallows scanners and distance alike, leaving every approaching ship with the uneasy sense that it has arrived somewhere it was never meant to find.",
            source: "Deep-space station hidden in the Hapan Transitory Mists, with a cantina."
        },
        {
            name: "Torn Station",
            grid: "P10",
            sector: "Terr'skiar",
            region: "Mid Rim",
            descriptor: "Torn Station is a rough refueling stop tucked among tumbling asteroids and comet trails. Its fuel lines and battered docking rigs are surrounded by hideouts, cold-running ships, and crews who have learned to keep both their cargo and their questions private.",
            source: "Refueling station in an asteroid-and-comet-filled system, used by slavers, pirates, and smugglers."
        },
        {
            name: "Void Station",
            grid: "R14",
            sector: "Dohlbani",
            region: "Mid Rim",
            descriptor: "Void Station is an asteroid palace: polished galleries and expensive lights carved into raw stone, with private berths hidden behind armored doors. It looks like a resort from a distance, but the guarded docks and watchful staff make it clear that information is the real luxury sold here.",
            source: "Palace-like asteroid station and resort, home to information broker Jib Kopatha."
        }
    ];
    const RESTRICTION_TIERS = [
        {
            id: 5,
            label: "CLASS-A BLACK SITES (EXPUNGED)",
            clearance: "OMEGA-RED",
            accessLabel: "Moff / Grand Inquisitor level",
            sitrep: "Coordinates deleted from standard navicomputers. Unauthorized arrival triggers automated turbolaser batteries and immediate destruction.",
            defaultAccess: false,
            planets: [
                { name: "Byss", grid: "K11", status: "THE EMPEROR'S SANCTUARY. Deep Core hazard. Unstable hyperlanes. Garrisoned by the Imperial Royal Guard." },
                { name: "Prakith", grid: "K10", status: "INQUISITORIUS FORTRESS. Deep Core Citadel. High concentration of Purge Troopers and holding blocks." },
                { name: "Despayre", grid: "L5", aliases: ["Horuz", "Horuz (Despayre)"], status: "PROJECT CELESTIAL. Atrivis sector penal colony. Orbital construction yards detected. Absolute interdiction." },
                { name: "Ilum", grid: "G7", status: "RESOURCE EXTRACTION. Sector heavily militarized. Extreme surface fracturing due to mechanized trench-mining. Freezing hazards." },
                { name: "Scarif", grid: "S15", status: "CITADEL DEVELOPMENT. Planetary deflector shield in early construction phases. Total airspace interdiction." },
                { name: "Eadu", grid: "U10", status: "ENERGY CONVERSION LAB. Perpetual storm hazards. Extreme flight difficulty required to reach canyon-based kyber refineries." }
            ]
        },
        {
            id: 4,
            label: "QUARANTINE / ANOMALOUS SECTORS",
            clearance: "INQUISITORIUS OVERRIDE",
            accessLabel: "Inquisitorius override",
            sitrep: "Quarantined to protect Imperial secrets, suppress anomalous cults, or contain dangerous archaeological sites.",
            defaultAccess: false,
            planets: [
                { name: "Mustafar", grid: "L19", status: "LORD VADER'S DOMAIN. Volcanic hazards. Airspace completely restricted. Moon of Nur heavily fortified." },
                { name: "Kamino", grid: "S15", status: "ERADICATED / GRAVEYARD. Tipoca City destroyed. Imperial cruisers actively patrol the ruins to prevent salvage operations." },
                { name: "Korriban (Moraband)", grid: "R5", aliases: ["Korriban", "Moraband"], status: "HERITAGE QUARANTINE. Ancient tombs sealed. Skeleton garrison stationed to execute scavengers." },
                { name: "Ossus", grid: "R6", status: "HERITAGE QUARANTINE. Ruins of Jedi library heavily monitored to ambush returning survivors." },
                { name: "Dantooine", grid: "L4", status: "BAITED TRAP. Imperial garrison stationed over former Jedi Enclave." }
            ]
        },
        {
            id: 3,
            label: "EXTREME INTERDICTION / MARTIAL LAW",
            clearance: "NOVA-GOLD",
            accessLabel: "Sector Governor",
            sitrep: "Standard systems currently undergoing brutal pacification. Massive planetary garrisons and orbital blockades in effect.",
            defaultAccess: false,
            planets: [
                { name: "Geonosis", grid: "R16", status: "POPULATION STERILIZED. Radioactive surface hazards. Orbit highly restricted to conceal massive orbital construction rings." },
                { name: "Kashyyyk", grid: "P9", status: "SPECIES ENSLAVEMENT. Total blockade. Wookiees utilized for Imperial logging and heavy construction. Suspended detention cages widespread." },
                { name: "Mon Cala", grid: "U6", aliases: ["Mon Calamari"], status: "ORBITAL SEIZURE. Shipyards nationalized. Imperial garrisons occupy aquatic cities. Heavy local insurgent activity." },
                { name: "Ryloth", grid: "R17", status: "DOONIUM STRIP-MINING. Heavy planetary blockade. Twi'lek population subjugated. High insurgent threat." },
                { name: "Utapau", grid: "N19", status: "PUNITIVE OCCUPATION. Sinkhole cities occupied. Imperial checkpoints choke all vertical shafts and landing pads." }
            ]
        },
        {
            id: 2,
            label: "STRATEGIC NAVAL ASSETS",
            clearance: "NAVAL LOGISTICS CLEARANCE",
            accessLabel: "Naval logistics clearance",
            sitrep: "Heavy industrial shipyards. Airspace saturated with TIE patrols, Star Destroyers, and customs checkpoints.",
            defaultAccess: false,
            planets: [
                { name: "Kuat", grid: "M10", status: "DRIVE YARDS ACTIVE. Encircled by a massive artificial orbital ring. Labyrinthine security checkpoints." },
                { name: "Fondor", grid: "L13", status: "ORBITAL DRYDOCKS ACTIVE. Major staging ground for Imperial fleet refitting. Dense sensor nets." }
            ]
        },
        {
            id: 1,
            label: "PENAL / EXPLOITATION",
            clearance: "CHAIN-CODE VERIFICATION",
            accessLabel: "Chain-code verification",
            sitrep: "Hostile environments utilized for cheap labor and resource extraction. Transit restricted to prison transports and guard rotations.",
            defaultAccess: false,
            planets: [
                { name: "Mimban", grid: "O12", status: "ACTIVE WARZONE / MINING. Perpetual mud and trench warfare. Heavy Imperial walker patrols securing hyperbaride claims." },
                { name: "Wobani", grid: "R8", status: "LABOR CAMP. Desolate agricultural world converted into sprawling prison complexes." }
            ]
        },
        {
            id: 0,
            label: "IMPERIAL CENTER",
            clearance: "STANDARD CORE CIVILIAN",
            accessLabel: "Heavy monitoring",
            sitrep: "Seat of Imperial Power.",
            defaultAccess: true,
            planets: [
                { name: "Coruscant", grid: "L10", mapPosition: "K9/K10/L9/L10 intersection", status: "SECURE. Civilian travel permitted in upper levels. Lower levels heavily policed. Imperial Palace restricted and defended by extreme anti-aircraft batteries." }
            ]
        }
    ];
    const IMPERIAL_STRONGHOLD_GRIDS = new Set([
        "K10",
        "K11",
        "G7",
        "L19",
        "L10",
        "S15",
        "U10"
    ]);
    const DEFAULT_MISSION_BRIEF = [
        "Objective: Reconnaissance of Rebel Outpost",
        "Priority: High",
        "Timeframe: 48 hours",
        "Notes: Avoid detection. Report any anomalies."
    ].join("\n");
    const CODEX_STARTUP_LINES = [
        "> Local HoloNet node: encrypted.",
        "> ISB security layer: detected.",
        "> Bypassing Imperial firewalls...",
        "> Failed. Retrying...",
        "> Override success.",
        "> Accessing Rebel frequencies...",
        `> Connection established // frequency: ${DEFAULT_SHIP_TRANSPONDER}.`
    ];
    const CODEX_ACCESS_GRANTED_LINE = "SYSTEM ACCESS GRANTED";
    const CODEX_STARTUP_DISPLAY_DURATION_MS = 25_000;
    const CODEX_STARTUP_INITIAL_DELAY_MS = 350;
    const CODEX_STARTUP_TYPE_DELAY_MS = 18;
    const CODEX_STARTUP_ELLIPSIS_TYPE_DELAY_MS = 160;
    const CODEX_STARTUP_ELLIPSIS_REPEAT_DELAY_MS = 100;
    const CODEX_STARTUP_REPLACEMENT_FADE_MS = 260;
    const CODEX_STARTUP_INLINE_RESULT_DWELL_MS = 620;
    const CODEX_STARTUP_INLINE_REPLACEMENTS = {
        0: "> Encryption bypass: complete.",
        1: "> Authentication spoof: complete."
    };

    const planetImageFiles = [
        "ALDERAAN (DESTROYED).png",
        "ALDERAAN.png",
        "ALEEN.png",
        "ARBOOINE.png",
        "ARDA I.png",
        "ATOLLON.png",
        "AURATERA.png",
        "AUREA.png",
        "BARDOTTA.png",
        "BESPIN.png",
        "BOTHAWUI.png",
        "BYBLOS.png",
        "BYSS.png",
        "CATO NEIMOIDIA.png",
        "CEREA.png",
        "CHANDRILA.png",
        "CHOLGANNA.png",
        "CORELLIA.png",
        "CORFAI.png",
        "CORUSCANT.png",
        "DAGOBAH.png",
        "DATHOMIR.png",
        "DEVARON.png",
        "DORIN.png",
        "DRALL.png",
        "DURO.png",
        "EMPRESS TETA.png",
        "FONDOR.png",
        "FROZ.png",
        "HOTH.png",
        "IKTOTCH.png",
        "ILUM.png",
        "JAGOMIR.png",
        "JEDHA.png",
        "KESSEL.png",
        "KINTAN.png",
        "KINYEN.png",
        "KLATOOINE.png",
        "KOWAK.png",
        "KUAT.png",
        "KWENN SPACE.png",
        "LOTHAL.png",
        "MON CALAMARI.png",
        "MORABAND.png",
        "NABOO.png",
        "NAL HUTTA.png",
        "NAR SHADDAA.png",
        "NUBIA.png",
        "ORD GIMMEL.png",
        "ORD MANTELL.png",
        "ORD RADAMA.png",
        "OSSUS.png",
        "RAXUS PRIME.png",
        "RYLOTH.png",
        "SACORRIA.png",
        "SAKI.png",
        "SALEUCAMI.png",
        "SELONIA.png",
        "SRILUUR.png",
        "SULLUST.png",
        "TATOOINE.png",
        "THE WHEEL.png",
        "THYFERRA.png",
        "TOYDARIA.png",
        "TRALUS.png",
        "VAGRAN.png",
        "VARL.png",
        "VLEMOTH PORT.png",
        "VODRAN.png",
        "WEIK.png",
        "XORRN.png",
        "XYQUINE II.png",
        "YAVIN IV.png",
        "YLESIA.png"
    ];

    const planetAliases = {
        "ARDA 1": "ARDA I",
        "XYQUINE 2": "XYQUINE II",
        "YAVIN 4": "YAVIN IV"
    };

    const planetRecords = planetImageFiles.map((fileName) => ({
        fileName,
        name: fileName.replace(/\.png$/i, "")
    }));

    const planetImageByName = planetRecords.reduce((records, record) => {
        records[normalizePlanetName(record.name)] = record.fileName;
        return records;
    }, {});
    const restrictionTierByPlanetName = buildRestrictionTierByPlanetName();
    const restrictionTierByGrid = buildRestrictionTierByGrid();
    const restrictedGridEntries = buildRestrictedGridEntries();
    const restrictedGridEntryByGrid = new Map(restrictedGridEntries.map((entry) => [entry.grid, entry]));

    let starLogApp;
    let ImperialStarLogApp;
    let gridCoordinateRecordsPromise;
    let gridCoordinateRecords = [];
    let gridCoordinateByName = {};
    let gridCoordinateByGrid = {};
    let gridRegionByGrid = {};
    let gridRegionCoordinates = [];
    let clearanceCodesPromise;
    let activeGridAlignmentEdit = null;
    let activeRouteMarkerDrag = null;
    let activeMapPan = null;
    let pendingMapClick = null;
    let codexStartupPlayed = false;
    let lastTransmissionPayload = null;
    const navigationClearanceKeys = new Set();

    function getTemplateData() {
        return {
            assetRoot,
            isGM: Boolean(game.user?.isGM),
            missionBrief: getMissionBrief(),
            liveState: getLiveState(),
            stealthSystemsEngaged: getStealthSystemsEngaged(),
            gridCalibration: getGridCalibrationTemplateData(),
            gridAlignmentUnlocked: getGridAlignmentUnlocked(),
            restrictionTierAccess: getRestrictionTierAccessTemplateData(),
            navData: getNavData(),
            mapIndicatorsHidden: getMapIndicatorsHidden(),
            planets: planetRecords.map((record) => record.name)
        };
    }

    function normalizePlanetName(value) {
        return String(value ?? "")
            .trim()
            .toUpperCase()
            .replace(/\.(PNG)$/i, "")
            .replace(/[()]/g, " ")
            .replace(/[._-]+/g, " ")
            .replace(/\s+/g, " ");
    }

    function buildRestrictionTierByPlanetName() {
        const records = {};

        RESTRICTION_TIERS.forEach((tier) => {
            tier.planets.forEach((planet) => {
                [planet.name, ...(planet.aliases ?? [])].forEach((name) => {
                    records[normalizePlanetName(name)] = { tier, planet };
                });
            });
        });

        return records;
    }

    function buildRestrictionTierByGrid() {
        const records = {};

        RESTRICTION_TIERS.forEach((tier) => {
            tier.planets.forEach((planet) => {
                const grid = normalizeGrid(planet.grid);
                if (!grid) return;

                const current = records[grid];
                if (!current || tier.id > current.tier.id) {
                    records[grid] = { tier, planet };
                }
            });
        });

        return records;
    }

    function buildRestrictedGridEntries() {
        const records = {};

        RESTRICTION_TIERS.forEach((tier) => {
            tier.planets.forEach((planet) => {
                const grid = normalizeGrid(planet.grid);
                if (!grid) return;

                if (!records[grid]) {
                    records[grid] = {
                        grid,
                        tier,
                        stronghold: false,
                        restrictions: [],
                        planets: []
                    };
                }

                if (tier.id > records[grid].tier.id) {
                    records[grid].tier = tier;
                }

                const stronghold = isImperialStrongholdRestriction(grid, tier);
                records[grid].restrictions.push({ tier, planet, stronghold });
                records[grid].stronghold ||= stronghold;
                records[grid].planets.push(planet.name);
            });
        });

        return Object.values(records);
    }

    function isImperialStrongholdRestriction(grid, tier) {
        if (!IMPERIAL_STRONGHOLD_GRIDS.has(grid) || !tier) return false;
        if (tier.id === 5) return true;
        return (grid === "L19" && tier.id === 4) || (grid === "L10" && tier.id === 0);
    }

    function encodedImagePath(fileName) {
        return imageBasePath + fileName.split("/").map(encodeURIComponent).join("/");
    }

    function cleanupDashboardResources(root) {
        const dashboard = root?.querySelector?.(".isl-dashboard") ?? root;
        dashboard?._islResizeObserver?.disconnect();
        if (dashboard) delete dashboard._islResizeObserver;
    }

    function activateDashboardListeners(root) {
        const dashboard = root?.querySelector?.(".isl-dashboard") ?? root;
        if (!dashboard) return;

        cleanupDashboardResources(dashboard);

        dashboard.querySelectorAll("[data-tab-target]").forEach((button) => {
            button.addEventListener("click", () => activateTab(dashboard, button.dataset.tabTarget));
        });

        dashboard.querySelectorAll("[data-ship-tab-target]").forEach((button) => {
            button.addEventListener("click", () => activateShipTab(dashboard, button.dataset.shipTabTarget));
        });

        const missionForm = dashboard.querySelector("#isl-confidential-form");
        const missionField = dashboard.querySelector("[data-mission-field]");
        const gridAlignmentForm = dashboard.querySelector("#isl-grid-alignment-form");
        const gridAlignmentToggle = dashboard.querySelector("[data-grid-alignment-unlocked]");
        const restrictionTierToggles = dashboard.querySelectorAll("[data-restriction-tier-toggle]");
        const navDataForm = dashboard.querySelector("#isl-navdata-form");
        const locationForm = dashboard.querySelector("#isl-location-form");
        const locationInput = dashboard.querySelector("#isl-location-input");
        const astroNavForm = dashboard.querySelector("#isl-astronav-form");
        const clearanceForm = dashboard.querySelector("#isl-clearance-form");
        const stealthButton = dashboard.querySelector("[data-action='toggle-stealth']");
        const mapStage = dashboard.querySelector("#isl-map-stage");
        const routeToken = dashboard.querySelector("#isl-route-token");
        const mapIndicatorsToggle = dashboard.querySelector("[data-map-indicators-hidden]");
        const form = dashboard.querySelector("#isl-planet-form");
        const input = dashboard.querySelector("#isl-planet-input");
        const image = dashboard.querySelector("#isl-planet-image");
        const popupBody = dashboard.querySelector(".isl-planet-popup-body");
        const popupHeader = dashboard.querySelector(".isl-planet-popup-header");

        missionForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveMissionBriefFromDashboard(dashboard);
        });

        missionField?.addEventListener("input", () => {
            updateMissionStaticText(dashboard, missionField.value);
            setMissionStatus(dashboard, "Unsaved mission orders.", "dirty");
        });

        dashboard.querySelector("[data-action='reset-mission']")?.addEventListener("click", () => {
            applyMissionBriefToDashboard(dashboard, DEFAULT_MISSION_BRIEF);
            setMissionStatus(dashboard, "Default mission orders staged. Save to publish.", "dirty");
        });

        gridAlignmentForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveGridAlignmentFromDashboard(dashboard);
        });

        gridAlignmentForm?.querySelectorAll("[data-grid-alignment-field]").forEach((field) => {
            field.addEventListener("input", () => {
                const alignment = collectGridAlignmentFromDashboard(dashboard);
                applyGridCalibrationToDashboard(dashboard, alignment, { updateFields: false });
                setGridAlignmentStatus(dashboard, "Unsaved grid alignment.", "dirty");
            });
        });

        gridAlignmentToggle?.addEventListener("change", () => {
            setGridAlignmentUnlockedFromDashboard(dashboard, gridAlignmentToggle.checked, { persist: true });
        });

        dashboard.querySelector("[data-action='reset-grid-alignment']")?.addEventListener("click", () => {
            applyGridCalibrationToDashboard(dashboard, DEFAULT_MAP_GRID_CALIBRATION);
            setGridAlignmentStatus(dashboard, "Default grid alignment staged. Save to publish.", "dirty");
        });

        restrictionTierToggles.forEach((toggle) => {
            toggle.addEventListener("change", () => updateRestrictionTierAccessFromDashboard(dashboard, toggle));
        });

        navDataForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            updateNavDataFromDashboard(dashboard);
        });

        mapIndicatorsToggle?.addEventListener("change", () => {
            setMapIndicatorsHiddenFromDashboard(dashboard, mapIndicatorsToggle.checked);
        });

        locationForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            setCurrentLocationFromDashboard(dashboard, locationInput?.value ?? DEFAULT_LOCATION_NAME);
        });

        astroNavForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            calculateAstroNavRoute(dashboard);
        });

        clearanceForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            submitNavigationClearanceCode(dashboard);
        });

        dashboard.querySelector("[data-action='astronav-current-grid']")?.addEventListener("click", () => {
            setAstroNavOriginGrid(dashboard, dashboard.dataset.shipGrid || getLiveState().shipGrid);
            setAstroNavStatus(dashboard, "Current vessel position staged.", "");
        });

        dashboard.querySelector("[data-action='astronav-place-route']")?.addEventListener("click", () => beginMapRoutePlacement(dashboard));
        dashboard.querySelector("[data-action='astronav-clear-route']")?.addEventListener("click", () => clearMapRoute(dashboard));
        dashboard.querySelector("[data-action='astronav-engage-transit']")?.addEventListener("click", () => engageAstroNavTransit(dashboard));

        dashboard.querySelector("[data-action='scan-sector']")?.addEventListener("click", () => scanSector(dashboard));
        dashboard.querySelector("[data-action='close-planet-popup']")?.addEventListener("click", () => closePlanetPopup(dashboard));
        dashboard.querySelector("[data-action='close-transmission-popup']")?.addEventListener("click", () => closeTransmissionPopup(dashboard));
        dashboard.querySelector("[data-action='close-clearance-popup']")?.addEventListener("click", () => closeNavigationClearancePopup(dashboard));
        dashboard.querySelectorAll("[data-action='trigger-warning-grade']").forEach((button) => {
            button.addEventListener("click", () => triggerManualWarningGrade(dashboard, button.dataset.warningGrade));
        });
        dashboard.querySelector("[data-action='generate-station-journals']")?.addEventListener("click", () => {
            generateStationJournalsFromDashboard(dashboard);
        });
        stealthButton?.addEventListener("click", () => toggleStealthSystems(dashboard));
        mapStage?.addEventListener("pointerdown", (event) => beginMapPan(dashboard, event));
        mapStage?.addEventListener("pointermove", updateMapPan);
        mapStage?.addEventListener("pointerup", endMapPan);
        mapStage?.addEventListener("pointercancel", endMapPan);
        mapStage?.addEventListener("contextmenu", (event) => event.preventDefault());
        mapStage?.addEventListener("click", (event) => queueMapStageClick(dashboard, event));
        mapStage?.addEventListener("dblclick", (event) => zoomMapAtCursorGrid(dashboard, event));
        routeToken?.addEventListener("pointerdown", (event) => beginRouteMarkerDrag(dashboard, event));
        routeToken?.addEventListener("pointermove", updateRouteMarkerDrag);
        routeToken?.addEventListener("pointerup", endRouteMarkerDrag);
        routeToken?.addEventListener("pointercancel", endRouteMarkerDrag);
        routeToken?.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        initializeGridAlignmentEditor(dashboard);
        renderLiveHailLog(dashboard);

        popupHeader?.addEventListener("pointerdown", (event) => beginPlanetPopupDrag(dashboard, event));
        popupBody?.addEventListener("wheel", (event) => zoomPlanetAtCursor(dashboard, event), { passive: false });

        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                if (!dashboard.isConnected) {
                    cleanupDashboardResources(dashboard);
                    return;
                }

                layoutPlanetPopup(dashboard);
            });
            resizeObserver.observe(dashboard);
            dashboard._islResizeObserver = resizeObserver;
        }

        initializeMapPanel(dashboard);
        applyGridCalibrationToDashboard(dashboard, getGridCalibration());
        initializeLocationPanel(dashboard);
        updateStealthControls(dashboard, getStealthSystemsEngaged());
        applyRestrictionTierAccessToDashboard(dashboard, getRestrictionTierAccess());
        applyMapIndicatorsHiddenToDashboard(dashboard, getMapIndicatorsHidden());
        playCodexStartup(dashboard);

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            showPlanetRecord(dashboard, input?.value ?? "");
        });

        dashboard.querySelector("[data-action='recall-planet-record']")?.addEventListener("click", () => {
            const lastRecord = dashboard.dataset.lastPlanetRecord;
            if (lastRecord) showPlanetRecord(dashboard, lastRecord);
        });
    }

    function activateTab(dashboard, tabId) {
        const wasPlanetTabActive = dashboard.querySelector("#isl-planet-tab")?.classList.contains("active");
        dashboard.querySelectorAll("[data-tab-target]").forEach((button) => {
            const isActive = button.dataset.tabTarget === tabId;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        dashboard.querySelectorAll(".isl-tab-panel").forEach((panel) => {
            panel.classList.toggle("active", panel.id === tabId);
        });

        if (wasPlanetTabActive && tabId !== "isl-planet-tab") clearPlanetMapFocus(dashboard);
    }

    function activateShipTab(dashboard, tabId) {
        dashboard.querySelectorAll("[data-ship-tab-target]").forEach((button) => {
            const isActive = button.dataset.shipTabTarget === tabId;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        dashboard.querySelectorAll(".isl-ship-tab-panel").forEach((panel) => {
            panel.classList.toggle("active", panel.id === tabId);
        });
    }

    function focusDashboardView(tabId, shipTabId, onReady) {
        openStarLog();

        let attempts = 0;
        const focus = () => {
            const dashboard = document.querySelector(".imperial-star-log-app .isl-dashboard");
            if (!dashboard) {
                attempts += 1;
                if (attempts < 12) requestAnimationFrame(focus);
                return;
            }

            activateTab(dashboard, tabId);
            if (shipTabId) activateShipTab(dashboard, shipTabId);
            onReady?.(dashboard);
        };

        requestAnimationFrame(focus);
    }

    function openQuickAccessView(action) {
        switch (action) {
            case "mission-status":
                focusDashboardView("isl-ops-tab");
                return;
            case "astronav":
                focusDashboardView("isl-ship-tab", "isl-astronav-panel");
                return;
            case "target-intel":
                focusDashboardView("isl-planet-tab", null, (dashboard) => {
                    const lastRecord = dashboard.dataset.lastPlanetRecord;
                    if (lastRecord) showPlanetRecord(dashboard, lastRecord);
                });
                return;
            case "ship-systems":
                focusDashboardView("isl-ship-tab", "isl-ship-systems-panel");
                return;
            case "transmissions":
                focusDashboardView("isl-ops-tab", null, openLatestTransmission);
                return;
            default:
                openStarLog();
        }
    }

    function initializeMapPanel(dashboard) {
        renderGridOverlay(dashboard, getGridCalibration());
        setShipGridOnDashboard(dashboard, getLiveState().shipGrid);
        applyGridAlignmentUnlockedToDashboard(dashboard, getGridAlignmentUnlocked());
    }

    function getGridCalibration() {
        let savedAlignment = null;

        try {
            savedAlignment = game.settings.get(MODULE_ID, GRID_ALIGNMENT_SETTING_KEY);
        } catch (error) {
            savedAlignment = null;
        }

        return sanitizeGridCalibration(savedAlignment || DEFAULT_MAP_GRID_CALIBRATION);
    }

    function getGridAlignmentUnlocked() {
        try {
            return Boolean(game.settings.get(MODULE_ID, GRID_ALIGNMENT_UNLOCKED_SETTING_KEY));
        } catch (error) {
            return false;
        }
    }

    function sanitizeGridCalibration(calibration) {
        const left = clampNumber(calibration?.left, 0, 0.99, DEFAULT_MAP_GRID_CALIBRATION.left);
        const top = clampNumber(calibration?.top, 0, 0.99, DEFAULT_MAP_GRID_CALIBRATION.top);
        const width = clampNumber(calibration?.width, 0.01, 1, DEFAULT_MAP_GRID_CALIBRATION.width);
        const height = clampNumber(calibration?.height, 0.01, 1, DEFAULT_MAP_GRID_CALIBRATION.height);
        const rows = Math.round(clampNumber(calibration?.rows, 1, 30, DEFAULT_MAP_GRID_CALIBRATION.rows));

        return {
            left,
            top,
            width: Math.min(width, 1 - left),
            height: Math.min(height, 1 - top),
            rows
        };
    }

    function clampNumber(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(max, Math.max(min, number));
    }

    function getGridCalibrationTemplateData() {
        const calibration = getGridCalibration();

        return {
            leftPercent: formatCalibrationPercent(calibration.left),
            topPercent: formatCalibrationPercent(calibration.top),
            widthPercent: formatCalibrationPercent(calibration.width),
            heightPercent: formatCalibrationPercent(calibration.height),
            rows: calibration.rows,
            columns: MAP_GRID_COLUMNS.length,
            firstColumn: MAP_GRID_COLUMNS[0],
            lastColumn: MAP_GRID_COLUMNS[MAP_GRID_COLUMNS.length - 1]
        };
    }

    function formatCalibrationPercent(value) {
        return Number((value * 100).toFixed(2));
    }

    function collectGridAlignmentFromDashboard(dashboard) {
        const current = getGridCalibration();
        const next = { ...current };

        dashboard.querySelectorAll("[data-grid-alignment-field]").forEach((field) => {
            const key = field.dataset.gridAlignmentField;
            const value = Number(field.value);
            if (!Number.isFinite(value)) return;

            if (key === "rows") next.rows = value;
            else next[key] = value / 100;
        });

        return sanitizeGridCalibration(next);
    }

    function applyGridCalibrationToDashboard(dashboard, calibration, { updateFields = true } = {}) {
        const nextCalibration = sanitizeGridCalibration(calibration);
        renderGridOverlay(dashboard, nextCalibration);
        positionGridEditLayer(dashboard, nextCalibration);
        setShipGridOnDashboard(dashboard, dashboard.dataset.shipGrid || "R16", nextCalibration);
        refreshMapRouteOverlay(dashboard, nextCalibration);
        setPlanetFocusIndicator(dashboard, dashboard.dataset.focusedPlanetGrid, nextCalibration);

        if (updateFields) {
            setGridAlignmentFields(dashboard, nextCalibration);
        }
    }

    function setGridAlignmentFields(dashboard, calibration) {
        const values = {
            left: formatCalibrationPercent(calibration.left),
            top: formatCalibrationPercent(calibration.top),
            width: formatCalibrationPercent(calibration.width),
            height: formatCalibrationPercent(calibration.height),
            rows: calibration.rows
        };

        dashboard.querySelectorAll("[data-grid-alignment-field]").forEach((field) => {
            const value = values[field.dataset.gridAlignmentField];
            if (value !== undefined) field.value = value;
        });
    }

    function initializeGridAlignmentEditor(dashboard) {
        const editLayer = dashboard.querySelector("#isl-grid-edit-layer");
        if (!editLayer) return;

        editLayer.addEventListener("pointerdown", (event) => beginGridAlignmentEdit(dashboard, event));
        editLayer.addEventListener("pointermove", updateGridAlignmentEdit);
        editLayer.addEventListener("pointerup", endGridAlignmentEdit);
        editLayer.addEventListener("pointercancel", endGridAlignmentEdit);
        editLayer.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    }

    function applyGridAlignmentUnlockedToDashboard(dashboard, unlocked) {
        const canUnlock = Boolean(game.user?.isGM && unlocked);
        dashboard.classList.toggle("isl-grid-alignment-unlocked", canUnlock);

        dashboard.querySelectorAll("[data-grid-alignment-unlocked]").forEach((toggle) => {
            toggle.checked = canUnlock;
        });

        dashboard.querySelectorAll("[data-grid-alignment-field], [data-grid-alignment-save], [data-action='reset-grid-alignment']").forEach((control) => {
            control.disabled = !canUnlock;
        });

        dashboard.querySelectorAll("[data-grid-alignment-lock-label]").forEach((label) => {
            label.textContent = canUnlock ? "Alignment unlocked" : "Alignment locked";
        });

        const status = dashboard.querySelector("[data-grid-alignment-status]");
        if (status && !status.dataset.state) {
            status.textContent = canUnlock ? "Grid alignment editing enabled." : "Grid alignment locked.";
        }

        positionGridEditLayer(dashboard, collectGridAlignmentFromDashboard(dashboard));
    }

    function canEditGridAlignment(dashboard) {
        return Boolean(game.user?.isGM && dashboard?.classList?.contains("isl-grid-alignment-unlocked"));
    }

    function positionGridEditLayer(dashboard, calibration) {
        const editLayer = dashboard.querySelector("#isl-grid-edit-layer");
        if (!editLayer) return;

        const nextCalibration = sanitizeGridCalibration(calibration);
        editLayer.style.left = `${formatCalibrationPercent(nextCalibration.left)}%`;
        editLayer.style.top = `${formatCalibrationPercent(nextCalibration.top)}%`;
        editLayer.style.width = `${formatCalibrationPercent(nextCalibration.width)}%`;
        editLayer.style.height = `${formatCalibrationPercent(nextCalibration.height)}%`;
        editLayer.setAttribute("aria-hidden", String(!canEditGridAlignment(dashboard)));
    }

    function beginGridAlignmentEdit(dashboard, event) {
        const actionTarget = event.target?.closest?.("[data-grid-edit-action]");
        const action = actionTarget?.dataset.gridEditAction;
        if (!action || !canEditGridAlignment(dashboard)) return;
        if (event.button !== undefined && event.button !== 0) return;

        const pointer = getMapStagePointerPoint(dashboard, event);
        if (!pointer) return;

        const editLayer = dashboard.querySelector("#isl-grid-edit-layer");
        activeGridAlignmentEdit = {
            dashboard,
            editLayer,
            pointerId: event.pointerId,
            action,
            startPointer: pointer,
            startCalibration: collectGridAlignmentFromDashboard(dashboard)
        };

        editLayer?.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
    }

    function updateGridAlignmentEdit(event) {
        const edit = activeGridAlignmentEdit;
        if (!edit || event.pointerId !== edit.pointerId) return;
        if (!edit.dashboard?.isConnected) {
            activeGridAlignmentEdit = null;
            return;
        }

        const pointer = getMapStagePointerPoint(edit.dashboard, event);
        if (!pointer) return;

        const nextCalibration = deriveGridAlignmentFromEdit(
            edit.action,
            edit.startCalibration,
            pointer.x - edit.startPointer.x,
            pointer.y - edit.startPointer.y
        );

        applyGridCalibrationToDashboard(edit.dashboard, nextCalibration);
        setGridAlignmentStatus(edit.dashboard, "Unsaved grid alignment.", "dirty");
        event.preventDefault();
        event.stopPropagation();
    }

    function endGridAlignmentEdit(event) {
        const edit = activeGridAlignmentEdit;
        if (!edit || event.pointerId !== edit.pointerId) return;

        if (edit.editLayer?.hasPointerCapture?.(event.pointerId)) {
            edit.editLayer.releasePointerCapture(event.pointerId);
        }

        activeGridAlignmentEdit = null;
        event.preventDefault();
        event.stopPropagation();
    }

    function getMapStagePointerPoint(dashboard, event) {
        const stage = dashboard.querySelector("#isl-map-stage");
        const rect = stage?.getBoundingClientRect?.();
        if (!rect?.width || !rect.height) return null;

        return {
            x: clampNumber((event.clientX - rect.left) / rect.width, 0, 1, 0),
            y: clampNumber((event.clientY - rect.top) / rect.height, 0, 1, 0)
        };
    }

    function deriveGridAlignmentFromEdit(action, startCalibration, deltaX, deltaY) {
        const start = sanitizeGridCalibration(startCalibration);
        if (action === "move") {
            return sanitizeGridCalibration({
                ...start,
                left: clampNumber(start.left + deltaX, 0, 1 - start.width, start.left),
                top: clampNumber(start.top + deltaY, 0, 1 - start.height, start.top)
            });
        }

        const direction = action.replace("resize-", "");
        let left = start.left;
        let top = start.top;
        let right = start.left + start.width;
        let bottom = start.top + start.height;

        if (direction.includes("w")) {
            left = clampNumber(start.left + deltaX, 0, right - GRID_EDIT_MIN_SIZE, left);
        }

        if (direction.includes("e")) {
            right = clampNumber(start.left + start.width + deltaX, left + GRID_EDIT_MIN_SIZE, 1, right);
        }

        if (direction.includes("n")) {
            top = clampNumber(start.top + deltaY, 0, bottom - GRID_EDIT_MIN_SIZE, top);
        }

        if (direction.includes("s")) {
            bottom = clampNumber(start.top + start.height + deltaY, top + GRID_EDIT_MIN_SIZE, 1, bottom);
        }

        return sanitizeGridCalibration({
            ...start,
            left,
            top,
            width: right - left,
            height: bottom - top
        });
    }

    async function saveGridAlignmentFromDashboard(dashboard) {
        if (!game.user?.isGM) {
            setGridAlignmentStatus(dashboard, "GM clearance required to save grid alignment.", "error");
            return;
        }

        if (!canEditGridAlignment(dashboard)) {
            setGridAlignmentStatus(dashboard, "Unlock grid alignment before saving.", "error");
            return;
        }

        const alignment = collectGridAlignmentFromDashboard(dashboard);

        try {
            await persistGridAlignment(alignment);
            setGridAlignmentStatus(dashboard, "Grid alignment saved.", "");
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to save grid alignment`, error);
            setGridAlignmentStatus(dashboard, "Grid alignment save failed.", "error");
        }
    }

    async function persistGridAlignment(alignment) {
        if (!game.user?.isGM) return;

        const nextAlignment = sanitizeGridCalibration(alignment);
        await game.settings.set(MODULE_ID, GRID_ALIGNMENT_SETTING_KEY, nextAlignment);
        applyGridAlignmentToOpenDashboards(nextAlignment);

        game.socket?.emit(SOCKET_NAME, {
            type: "gridAlignmentSaved",
            alignment: nextAlignment
        });
    }

    async function setGridAlignmentUnlockedFromDashboard(dashboard, unlocked, { persist = false } = {}) {
        if (!game.user?.isGM) {
            applyGridAlignmentUnlockedToDashboard(dashboard, false);
            setGridAlignmentStatus(dashboard, "GM clearance required to unlock grid alignment.", "error");
            return;
        }

        const nextUnlocked = Boolean(unlocked);
        applyGridAlignmentUnlockedToOpenDashboards(nextUnlocked);

        if (!persist) return;

        try {
            await game.settings.set(MODULE_ID, GRID_ALIGNMENT_UNLOCKED_SETTING_KEY, nextUnlocked);
            game.socket?.emit(SOCKET_NAME, {
                type: "gridAlignmentLockChanged",
                unlocked: nextUnlocked
            });
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to save grid alignment lock state`, error);
            setGridAlignmentStatus(dashboard, "Grid alignment lock update failed.", "error");
        }
    }

    function applyGridAlignmentToOpenDashboards(alignment) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            applyGridCalibrationToDashboard(dashboard, alignment);
            setGridAlignmentStatus(dashboard, "Grid alignment synchronized.", "");
        });
    }

    function applyGridAlignmentUnlockedToOpenDashboards(unlocked) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            applyGridAlignmentUnlockedToDashboard(dashboard, unlocked);
            setGridAlignmentStatus(dashboard, unlocked ? "Grid alignment editing enabled." : "Grid alignment locked.", "");
        });
    }

    function setGridAlignmentStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-grid-alignment-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function getDefaultRestrictionTierAccess() {
        return RESTRICTION_TIERS.reduce((access, tier) => {
            access[getRestrictionTierKey(tier.id)] = Boolean(tier.defaultAccess);
            return access;
        }, {});
    }

    function getRestrictionTierKey(tierId) {
        return `tier${tierId}`;
    }

    function getRestrictionTierAccess() {
        let savedAccess = {};

        try {
            savedAccess = game.settings.get(MODULE_ID, RESTRICTION_TIER_ACCESS_SETTING_KEY) || {};
        } catch (error) {
            savedAccess = {};
        }

        return sanitizeRestrictionTierAccess(savedAccess);
    }

    function sanitizeRestrictionTierAccess(access) {
        const nextAccess = getDefaultRestrictionTierAccess();

        Object.entries(access || {}).forEach(([key, value]) => {
            if (key in nextAccess) nextAccess[key] = Boolean(value);
        });

        return nextAccess;
    }

    function getRestrictionTierAccessTemplateData() {
        return getRestrictionTierAccess();
    }

    function hasRestrictionTierAccess(tier, access = getRestrictionTierAccess()) {
        if (!tier) return true;
        return Boolean(access[getRestrictionTierKey(tier.id)]);
    }

    function getDashboardRestrictionTierAccess(dashboard) {
        try {
            return sanitizeRestrictionTierAccess(JSON.parse(dashboard.dataset.restrictionTierAccess || "{}"));
        } catch (error) {
            return getRestrictionTierAccess();
        }
    }

    function getDefaultNavData() {
        return { regions: [], sectors: [], grids: [], planets: [] };
    }

    function normalizeNavDataValue(scope, value) {
        if (scope === "grids") return normalizeGrid(value);
        if (scope === "planets") {
            const normalized = normalizePlanetName(value);
            return GRID_COORDINATE_ALIASES[normalized] || planetAliases[normalized] || normalized;
        }
        if (scope === "regions") return normalizeHyperspaceRegion(value).toUpperCase();
        return String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();
    }

    function sanitizeNavData(navData) {
        const next = getDefaultNavData();

        Object.keys(next).forEach((scope) => {
            const values = Array.isArray(navData?.[scope]) ? navData[scope] : [];
            next[scope] = [...new Set(values.map((value) => normalizeNavDataValue(scope, value)).filter(Boolean))].sort();
        });

        return next;
    }

    function getNavData() {
        try {
            return sanitizeNavData(game.settings.get(MODULE_ID, NAV_DATA_SETTING_KEY) || {});
        } catch (error) {
            return getDefaultNavData();
        }
    }

    function getDashboardNavData(dashboard) {
        try {
            return sanitizeNavData(JSON.parse(dashboard.dataset.navData || "{}"));
        } catch (error) {
            return getNavData();
        }
    }

    function hasNavDataValue(scope, value, navData = getNavData()) {
        if (game.user?.isGM) return true;
        const normalized = normalizeNavDataValue(scope, value);
        return Boolean(normalized && navData[scope]?.includes(normalized));
    }

    function isCurrentNavDataTarget(record) {
        const fields = record?.fields ?? record ?? {};
        const liveState = getLiveState();
        return normalizePlanetName(fields.Planet) === normalizePlanetName(liveState.location)
            || normalizeGrid(fields.Grid) === normalizeGrid(liveState.shipGrid);
    }

    function hasPlanetNavData(record, navData = getNavData()) {
        const fields = record?.fields ?? record ?? {};
        return isCurrentNavDataTarget(record)
            || hasNavDataValue("planets", fields.Planet ?? fields.planet ?? fields.name, navData);
    }

    function hasSystemNavData(record, navData = getNavData()) {
        const fields = record?.fields ?? record ?? {};
        return isCurrentNavDataTarget(record)
            || hasPlanetNavData(record, navData)
            || hasNavDataValue("grids", fields.Grid ?? fields.grid, navData)
            || hasNavDataValue("sectors", fields.Sector ?? fields.sector, navData);
    }

    function hasGridNavData(grid, navData = getNavData()) {
        const normalizedGrid = normalizeGrid(grid);
        return normalizedGrid === normalizeGrid(getLiveState().shipGrid)
            || hasNavDataValue("grids", normalizedGrid, navData)
            || hasNavDataValue("planets", gridCoordinateByGrid[normalizedGrid]?.fields?.Planet, navData);
    }

    function hasAstroNavTargetData(target, navData = getNavData()) {
        if (game.user?.isGM || !target) return true;
        if (target.type === "region") return hasNavDataValue("regions", target.region, navData);
        if (target.type === "grid") return hasGridNavData(target.grid, navData);
        return hasSystemNavData({ fields: { Planet: target.name, Grid: target.grid, Sector: target.sector } }, navData);
    }

    function getNavDataLabel(scope, value) {
        const normalized = normalizeNavDataValue(scope, value);
        if (scope === "planets") return gridCoordinateByName[normalized]?.fields?.Planet || normalized;
        if (scope === "sectors") {
            return gridCoordinateRecords.find((record) => normalizeNavDataValue("sectors", record.fields.Sector) === normalized)?.fields?.Sector || normalized;
        }
        if (scope === "regions") return normalizeHyperspaceRegion(normalized) || normalized;
        return normalized;
    }

    function isValidNavDataPackage(scope, value) {
        if (scope === "regions") return Boolean(normalizeHyperspaceRegion(value));
        if (scope === "grids") return Boolean(parseAstroNavGrid(value));
        if (scope === "planets") return Boolean(gridCoordinateByName[normalizeNavDataValue(scope, value)]);
        if (scope === "sectors") {
            const normalized = normalizeNavDataValue(scope, value);
            return gridCoordinateRecords.some((record) => normalizeNavDataValue(scope, record.fields.Sector) === normalized);
        }
        return false;
    }

    function renderNavDataLibrary(dashboard, navData = getDashboardNavData(dashboard)) {
        const library = dashboard.querySelector("[data-navdata-library]");
        if (!library) return;

        const labels = {
            regions: "Region Charts",
            sectors: "Sector Surveys",
            grids: "Grid Fixes",
            planets: "Planetary Packets"
        };
        const sections = Object.entries(labels).map(([scope, label]) => {
            const entries = navData[scope].map((value) => escapeHtml(getNavDataLabel(scope, value)));
            return `<div><b>${label}</b>: ${entries.length ? entries.join(", ") : "None acquired"}</div>`;
        });

        library.innerHTML = sections.join("");
    }

    function applyNavDataToDashboard(dashboard, navData = getNavData()) {
        const next = sanitizeNavData(navData);
        dashboard.dataset.navData = JSON.stringify(next);
        renderNavDataLibrary(dashboard, next);
        if (gridCoordinateRecords.length) populateLocationOptions(dashboard, gridCoordinateRecords);
    }

    function applyNavDataToOpenDashboards(navData) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            applyNavDataToDashboard(dashboard, navData);
        });
    }

    async function updateNavDataFromDashboard(dashboard) {
        if (!game.user?.isGM) return;

        const form = dashboard.querySelector("#isl-navdata-form");
        const action = form?.elements?.namedItem("navDataAction")?.value === "revoke" ? "revoke" : "grant";
        const scope = form?.elements?.namedItem("navDataScope")?.value;
        const rawValue = form?.elements?.namedItem("navDataValue")?.value;
        const status = dashboard.querySelector("[data-navdata-status]");
        const value = normalizeNavDataValue(scope, rawValue);

        if (!Object.prototype.hasOwnProperty.call(getDefaultNavData(), scope) || !value || !isValidNavDataPackage(scope, value)) {
            if (status) {
                status.textContent = "Valid package scope and NavData designation required.";
                status.dataset.state = "error";
            }
            return;
        }

        const navData = getNavData();
        navData[scope] = action === "grant"
            ? [...new Set([...navData[scope], value])]
            : navData[scope].filter((entry) => entry !== value);

        await persistNavData(navData);
        if (status) {
            status.textContent = `${getNavDataLabel(scope, value)} ${action === "grant" ? "package distributed" : "package revoked"}.`;
            delete status.dataset.state;
        }
    }

    async function persistNavData(navData) {
        if (!game.user?.isGM) return;
        const next = sanitizeNavData(navData);
        await game.settings.set(MODULE_ID, NAV_DATA_SETTING_KEY, next);
        applyNavDataToOpenDashboards(next);
        game.socket?.emit(SOCKET_NAME, { type: "navDataChanged", navData: next });
    }

    function getNavigationRestriction(target) {
        const fields = target?.fields ?? target ?? {};
        return getRestrictionForRecord({
            fields: {
                Planet: fields.Planet ?? fields.planet ?? fields.name ?? "",
                Grid: fields.Grid ?? fields.grid ?? ""
            }
        });
    }

    function requiresNavigationClearance(target) {
        const restriction = getNavigationRestriction(target);
        return !game.user?.isGM && Number(restriction?.tier?.id) >= 3;
    }

    function getNavigationClearanceKey(target) {
        const fields = target?.fields ?? target ?? {};
        const grid = normalizeGrid(fields.Grid ?? fields.grid ?? "");
        if (grid) return `grid:${grid}`;

        const name = normalizePlanetName(fields.Planet ?? fields.planet ?? fields.name ?? "");
        return name ? `world:${name}` : "";
    }

    function hasNavigationClearance(target) {
        const key = getNavigationClearanceKey(target);
        return Boolean(key && navigationClearanceKeys.has(key));
    }

    function getNavigationClearanceGrids() {
        return [...navigationClearanceKeys]
            .filter((key) => key.startsWith("grid:"))
            .map((key) => key.slice("grid:".length));
    }

    function requestNavigationClearance(dashboard, target, onAuthorized) {
        if (!requiresNavigationClearance(target) || hasNavigationClearance(target)) {
            return true;
        }

        const popup = dashboard.querySelector("#isl-clearance-popup");
        const targetReadout = dashboard.querySelector("#isl-clearance-target");
        const tierReadout = dashboard.querySelector("#isl-clearance-tier");
        const input = dashboard.querySelector("[data-clearance-code]");
        const status = dashboard.querySelector("[data-clearance-status]");
        const restriction = getNavigationRestriction(target);
        const fields = target?.fields ?? target ?? {};
        const system = String(fields.Planet ?? fields.planet ?? fields.name ?? fields.Grid ?? fields.grid ?? "restricted system").trim();

        if (!popup || !restriction) return false;

        dashboard._islNavigationClearanceRequest = { target, onAuthorized };
        if (targetReadout) targetReadout.textContent = system;
        if (tierReadout) tierReadout.textContent = `Tier ${restriction.tier.id} // ${restriction.tier.clearance}`;
        if (input) input.value = "";
        if (status) {
            status.textContent = "Imperial clearance code required before navigation can continue.";
            delete status.dataset.state;
        }
        popup.classList.remove("hidden");
        window.setTimeout(() => input?.focus(), 0);
        return false;
    }

    async function submitNavigationClearanceCode(dashboard) {
        const request = dashboard._islNavigationClearanceRequest;
        const input = dashboard.querySelector("[data-clearance-code]");
        const status = dashboard.querySelector("[data-clearance-status]");
        if (!request || !input) return;

        const submittedCode = normalizeClearanceCode(input.value);
        const restriction = getNavigationRestriction(request.target);
        const validCodes = await loadClearanceCodes();
        const tierCodes = validCodes[getRestrictionTierKey(restriction?.tier?.id)] || [];
        if (!submittedCode || !tierCodes.includes(submittedCode)) {
            if (status) {
                status.textContent = "Clearance code rejected. Verify credentials and retransmit.";
                status.dataset.state = "error";
            }
            input.select();
            return;
        }

        const key = getNavigationClearanceKey(request.target);
        if (!key) return;

        navigationClearanceKeys.add(key);
        closeNavigationClearancePopup(dashboard);
        setLocationStatus(dashboard, "Imperial clearance accepted. Navigation authorization granted.", "");
        await request.onAuthorized();
    }

    function closeNavigationClearancePopup(dashboard) {
        dashboard.querySelector("#isl-clearance-popup")?.classList.add("hidden");
        delete dashboard._islNavigationClearanceRequest;
    }

    function normalizeClearanceCode(value) {
        return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    async function loadClearanceCodes() {
        if (!clearanceCodesPromise) {
            clearanceCodesPromise = fetch(clearanceCodesPath, { cache: "no-cache" })
                .then((response) => {
                    if (!response.ok) throw new Error(`Unable to load clearance codes (${response.status}).`);
                    return response.text();
                })
                .then(parseClearanceCodes)
                .catch((error) => {
                    console.error(`${MODULE_ID} | Failed to load clearance codes`, error);
                    clearanceCodesPromise = null;
                    return {};
                });
        }

        return clearanceCodesPromise;
    }

    function parseClearanceCodes(text) {
        const codesByTier = {};
        let tierKey = "";

        String(text ?? "").split(/\r?\n/).forEach((line) => {
            const tierMatch = line.match(/^\s*Tier\s+([3-5])\s*$/i);
            if (tierMatch) {
                tierKey = getRestrictionTierKey(tierMatch[1]);
                codesByTier[tierKey] ??= [];
                return;
            }

            const codeMatch = line.match(/\b[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}-[A-Z0-9]{2}\b/i);
            if (tierKey && codeMatch) codesByTier[tierKey].push(normalizeClearanceCode(codeMatch[0]));
        });

        return codesByTier;
    }

    function getMapIndicatorsHidden() {
        try {
            return Boolean(game.settings.get(MODULE_ID, MAP_INDICATORS_HIDDEN_SETTING_KEY));
        } catch (error) {
            return false;
        }
    }

    function getDashboardMapIndicatorsHidden(dashboard) {
        return dashboard.dataset.mapIndicatorsHidden === "true";
    }

    async function setMapIndicatorsHiddenFromDashboard(dashboard, hidden) {
        applyMapIndicatorsHiddenToDashboard(dashboard, hidden);

        try {
            await game.settings.set(MODULE_ID, MAP_INDICATORS_HIDDEN_SETTING_KEY, Boolean(hidden));
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to save sector indicator visibility`, error);
        }
    }

    function applyMapIndicatorsHiddenToDashboard(dashboard, hidden = getMapIndicatorsHidden()) {
        const nextHidden = Boolean(hidden);
        dashboard.dataset.mapIndicatorsHidden = String(nextHidden);
        dashboard.querySelectorAll("[data-map-indicators-hidden]").forEach((toggle) => {
            toggle.checked = nextHidden;
        });
        renderGridOverlay(dashboard, getGridCalibration());
    }

    async function updateRestrictionTierAccessFromDashboard(dashboard, toggle) {
        if (!game.user?.isGM) {
            applyRestrictionTierAccessToDashboard(dashboard, getRestrictionTierAccess());
            setRestrictionTierAccessStatus(dashboard, "GM clearance required to alter tier access.", "error");
            return;
        }

        const tierKey = toggle.dataset.restrictionTierToggle;
        const access = getRestrictionTierAccess();
        if (!(tierKey in access)) return;

        access[tierKey] = Boolean(toggle.checked);

        try {
            await persistRestrictionTierAccess(access);
            const tierLabel = getRestrictionTierLabelFromKey(tierKey);
            setRestrictionTierAccessStatus(dashboard, `${tierLabel} access ${toggle.checked ? "authorized" : "revoked"}.`, "");
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to save restriction tier access`, error);
            setRestrictionTierAccessStatus(dashboard, "Restriction tier access save failed.", "error");
        }
    }

    async function persistRestrictionTierAccess(access) {
        if (!game.user?.isGM) return;

        const nextAccess = sanitizeRestrictionTierAccess(access);
        await game.settings.set(MODULE_ID, RESTRICTION_TIER_ACCESS_SETTING_KEY, nextAccess);
        applyRestrictionTierAccessToOpenDashboards(nextAccess);

        game.socket?.emit(SOCKET_NAME, {
            type: "restrictionTierAccessChanged",
            access: nextAccess
        });
    }

    function applyRestrictionTierAccessToOpenDashboards(access) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            applyRestrictionTierAccessToDashboard(dashboard, access);
        });
    }

    function applyRestrictionTierAccessToDashboard(dashboard, access = getRestrictionTierAccess()) {
        const nextAccess = sanitizeRestrictionTierAccess(access);
        dashboard.dataset.restrictionTierAccess = JSON.stringify(nextAccess);

        dashboard.querySelectorAll("[data-restriction-tier-toggle]").forEach((toggle) => {
            const tierKey = toggle.dataset.restrictionTierToggle;
            toggle.checked = Boolean(nextAccess[tierKey]);
        });

        dashboard.querySelectorAll("[data-restriction-tier]").forEach((tierPanel) => {
            const tierKey = tierPanel.dataset.restrictionTier;
            const enabled = Boolean(nextAccess[tierKey]);
            tierPanel.classList.toggle("isl-tier-access-enabled", enabled);
            tierPanel.classList.toggle("isl-tier-access-denied", !enabled);
        });

        renderGridOverlay(dashboard, getGridCalibration());
        refreshCurrentLocationRestrictionDisplay(dashboard);
    }

    function getRestrictionTierLabelFromKey(tierKey) {
        const tierId = Number(String(tierKey).replace(/^tier/, ""));
        const tier = RESTRICTION_TIERS.find((record) => record.id === tierId);
        return tier ? `Tier ${tier.id}` : "Tier";
    }

    function setRestrictionTierAccessStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-restriction-tier-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function getMapUiModule() {
        const mapUiModule = globalThis.GalacticOperationsConsoleModules?.mapUi;
        if (!mapUiModule) throw new Error(`${MODULE_ID} | Map UI module was not loaded.`);
        return mapUiModule;
    }

    function getMapUiModuleConfig() {
        return {
            gridColumns: MAP_GRID_COLUMNS,
            restrictedGridEntries,
            normalizeGrid,
            normalizePlanetName,
            getDashboardMapIndicatorsHidden,
            getDashboardRestrictionTierAccess,
            hasRestrictionTierAccess
        };
    }

    function renderGridOverlay(dashboard, calibration = getGridCalibration()) {
        return getMapUiModule().renderGridOverlay(dashboard, calibration, getMapUiModuleConfig());
    }

    function getMapPointForSpecialPosition(mapPosition, calibration = getGridCalibration()) {
        return getMapUiModule().getSpecialPositionPoint(mapPosition, calibration, getMapUiModuleConfig());
    }

    function gridToMapCell(grid, calibration = getGridCalibration()) {
        return getMapUiModule().gridToCell(grid, calibration, getMapUiModuleConfig());
    }

    function mapGridCellWidth(calibration = getGridCalibration()) {
        return getMapUiModule().cellWidth(calibration, getMapUiModuleConfig());
    }

    function mapGridCellHeight(calibration = getGridCalibration()) {
        return getMapUiModule().cellHeight(calibration);
    }

    function mapGridX(col, calibration = getGridCalibration()) {
        return getMapUiModule().gridX(col, calibration, getMapUiModuleConfig());
    }

    function mapGridY(row, calibration = getGridCalibration()) {
        return getMapUiModule().gridY(row, calibration);
    }

    function gridToMapPoint(grid, calibration = getGridCalibration()) {
        return getMapUiModule().gridToPoint(grid, calibration, getMapUiModuleConfig());
    }

    function gridFromMapPointer(event, calibration = getGridCalibration(), stage = event.currentTarget) {
        return getMapUiModule().gridFromPointer(event, calibration, stage, getMapUiModuleConfig());
    }

    function getStateSyncModule() {
        const stateSyncModule = globalThis.GalacticOperationsConsoleModules?.stateSync;
        if (!stateSyncModule) throw new Error(`${MODULE_ID} | State-sync module was not loaded.`);
        return stateSyncModule;
    }

    function getStateSyncConfig() {
        return {
            moduleId: MODULE_ID,
            liveStateSettingKey: LIVE_STATE_SETTING_KEY,
            socketName: SOCKET_NAME,
            defaultLiveState: DEFAULT_LIVE_STATE,
            normalizeGrid,
            isPrimaryActiveGM,
            hasActiveGM,
            applyLiveStateToOpenDashboards,
            triggerFirstTimeSystemWarning,
            setLiveUpdateStatus
        };
    }

    function getLiveState() {
        return getStateSyncModule().getLiveState(getStateSyncConfig());
    }

    function normalizeLiveState(state = {}) {
        return getStateSyncModule().normalizeLiveState(state, getStateSyncConfig());
    }

    function normalizeLiveStatePartial(partial = {}) {
        return getStateSyncModule().normalizeLiveStatePartial(partial, getStateSyncConfig());
    }

    async function setCurrentLocationFromDashboard(dashboard, rawName) {
        const record = await resolveLocationRecord(rawName);
        if (!record) return showCurrentLocation(dashboard, rawName);

        if (!hasSystemNavData(record, getDashboardNavData(dashboard))) {
            renderLocationUnavailable(dashboard, rawName, "NavData package required for this mission theater.");
            setLocationStatus(dashboard, "NavData package required for this mission theater.", "error");
            return null;
        }

        if (!requestNavigationClearance(dashboard, record, () => commitCurrentLocationFromDashboard(dashboard, rawName))) {
            return null;
        }

        return commitCurrentLocationFromDashboard(dashboard, rawName);
    }

    async function commitCurrentLocationFromDashboard(dashboard, rawName) {
        const previousShipGrid = dashboard.dataset.shipGrid || getLiveState().shipGrid || DEFAULT_SHIP_GRID;
        const record = await showCurrentLocation(dashboard, rawName);
        if (!record) return null;

        const location = String(record.fields.Planet || rawName || DEFAULT_LOCATION_NAME).trim();
        const shipGrid = normalizeGrid(record.fields.Grid) || previousShipGrid;
        const input = dashboard.querySelector("#isl-location-input");
        if (input) input.value = location;
        setShipLocationOnDashboard(dashboard, location);

        await requestLiveStateUpdate(dashboard, { location, shipGrid }, {
            successStatus: "Mission theater broadcast to operational telemetry.",
            requestedStatus: "Mission theater synchronization requested.",
            errorStatus: "Active GM required to update mission theater.",
            statusTarget: "location"
        });

        return record;
    }

    async function resolveLocationRecord(rawName) {
        const normalizedInput = normalizePlanetName(rawName || DEFAULT_LOCATION_NAME);
        if (!normalizedInput) return null;

        try {
            await loadGridCoordinateRecords();
        } catch (error) {
            return null;
        }

        const lookupName = GRID_COORDINATE_ALIASES[normalizedInput] || planetAliases[normalizedInput] || normalizedInput;
        return gridCoordinateByName[lookupName] || null;
    }

    async function requestLiveStateUpdate(dashboard, partial, options = {}) {
        return getStateSyncModule().requestLiveStateUpdate(dashboard, partial, options, getStateSyncConfig());
    }

    async function persistLiveState(partial, requesterId = null) {
        return getStateSyncModule().persistLiveState(partial, requesterId, getStateSyncConfig());
    }

    function applyLiveStateToOpenDashboards(state, options = {}) {
        return Promise.all(Array.from(document.querySelectorAll(".imperial-star-log-app .isl-dashboard")).map((dashboard) => {
            return applyLiveStateToDashboard(dashboard, state, options);
        }));
    }

    async function applyLiveStateToDashboard(dashboard, state, { changedKeys = null } = {}) {
        const liveState = normalizeLiveState(state);
        const changed = Array.isArray(changedKeys) ? changedKeys : null;
        const updateLocation = !changed || changed.includes("location");
        const updateShip = !changed || changed.includes("location") || changed.includes("shipGrid");
        const input = dashboard.querySelector("#isl-location-input");

        dashboard.dataset.liveLocation = liveState.location;
        if (input && updateLocation) input.value = liveState.location;
        setShipLocationOnDashboard(dashboard, liveState.location);

        if (updateLocation) {
            await showCurrentLocation(dashboard, liveState.location);
        }

        if (updateShip) {
            setShipGridOnDashboard(dashboard, liveState.shipGrid);
        }

        setLiveStateStatus(dashboard, "Operational telemetry synchronized.", "");
    }

    function setLiveUpdateStatus(dashboard, text, state, statusTarget) {
        setLiveStateStatus(dashboard, text, state);
        if (statusTarget === "location") {
            setLocationStatus(dashboard, text, state);
        }
    }

    function setLiveStateStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-live-state-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function queueMapStageClick(dashboard, event) {
        if (event.button !== 0) return;
        if (event.detail !== 1) return;
        if (pendingMapClick?.timer) clearTimeout(pendingMapClick.timer);

        const mapEvent = {
            target: event.target,
            currentTarget: event.currentTarget,
            clientX: event.clientX,
            clientY: event.clientY
        };
        const timer = setTimeout(() => {
            if (pendingMapClick?.timer !== timer || !dashboard.isConnected) return;
            pendingMapClick = null;
            void moveShipTokenFromMapClick(dashboard, mapEvent);
        }, 240);
        pendingMapClick = { dashboard, timer };
    }

    function beginMapPan(dashboard, event) {
        if (event.button !== 2) return;

        const viewport = dashboard.querySelector("#isl-map-viewport");
        const stage = event.currentTarget;
        if (!viewport || !stage) return;

        activeMapPan = {
            dashboard,
            viewport,
            stage,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            scrollLeft: viewport.scrollLeft,
            scrollTop: viewport.scrollTop
        };
        stage.classList.add("isl-map-panning");
        stage.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
    }

    function updateMapPan(event) {
        const pan = activeMapPan;
        if (!pan || event.pointerId !== pan.pointerId || !pan.dashboard?.isConnected) return;

        pan.viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
        pan.viewport.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
        event.preventDefault();
        event.stopPropagation();
    }

    function endMapPan(event) {
        const pan = activeMapPan;
        if (!pan || event.pointerId !== pan.pointerId) return;

        if (pan.stage?.hasPointerCapture?.(event.pointerId)) pan.stage.releasePointerCapture(event.pointerId);
        pan.stage?.classList.remove("isl-map-panning");
        activeMapPan = null;
        event.preventDefault();
        event.stopPropagation();
    }

    function zoomMapAtCursorGrid(dashboard, event) {
        if (pendingMapClick?.dashboard === dashboard && pendingMapClick.timer) {
            clearTimeout(pendingMapClick.timer);
            pendingMapClick = null;
        }
        if (event.target.closest("#isl-ship-token, #isl-route-token, #isl-grid-edit-layer")) return;
        if (dashboard.dataset.routePlacement === "true") return;

        const grid = gridFromMapPointer(event);
        const point = gridToMapPoint(grid);
        const viewport = dashboard.querySelector("#isl-map-viewport");
        const stage = dashboard.querySelector("#isl-map-stage");
        if (!grid || !point || !viewport || !stage) return;

        const currentZoom = Number.parseFloat(stage.style.getPropertyValue("--isl-map-focus-zoom")) || 100;
        if (currentZoom > 100) {
            clearPlanetMapFocus(dashboard);
            event.preventDefault();
            return;
        }

        stage.style.setProperty("--isl-map-focus-zoom", `${CURSOR_GRID_ZOOM}%`);
        centerMapViewport(viewport, stage, point);
        event.preventDefault();
    }

    async function moveShipTokenFromMapClick(dashboard, event) {
        if (event.target.closest("#isl-ship-token")) return;
        if (event.target.closest("#isl-route-token")) return;
        if (event.target.closest("#isl-grid-edit-layer")) return;

        const grid = gridFromMapPointer(event);
        if (!grid) return;

        if (dashboard.dataset.routePlacement === "true") {
            await setMapRouteDestination(dashboard, grid);
            return;
        }

        if (!game.user?.isGM) {
            setLiveStateStatus(dashboard, "Vessel position is controlled by the NaviComputer. Plot and engage a transit to move the vessel.", "error");
            return;
        }

        const target = { name: grid, grid };
        if (!hasGridNavData(grid, getDashboardNavData(dashboard))) {
            setLiveStateStatus(dashboard, `NavData grid fix required for ${grid}.`, "error");
            return;
        }
        if (!requestNavigationClearance(dashboard, target, () => moveShipTokenToGrid(dashboard, grid))) return;
        await moveShipTokenToGrid(dashboard, grid);
    }

    async function moveShipTokenToGrid(dashboard, grid) {
        setShipGridOnDashboard(dashboard, grid);
        await requestLiveStateUpdate(dashboard, { shipGrid: grid }, {
            successStatus: `Vessel grid ${grid} broadcast to telemetry.`,
            requestedStatus: `Vessel grid ${grid} synchronization requested.`,
            errorStatus: "Active GM required to update vessel grid.",
            statusTarget: "live"
        });
    }

    function setShipGridOnDashboard(dashboard, grid, calibration = getGridCalibration()) {
        const normalizedGrid = normalizeGrid(grid);
        const point = gridToMapPoint(normalizedGrid, calibration);
        const token = dashboard.querySelector("#isl-ship-token");
        const readout = dashboard.querySelector("#isl-map-readout");
        dashboard.dataset.shipGrid = normalizedGrid;

        if (!point || !token) {
            if (readout) readout.textContent = "Vessel Grid: Unknown";
            dashboard.querySelectorAll("[data-ship-grid-readout]").forEach((shipReadout) => {
                shipReadout.textContent = "Unknown";
            });
            setAstroNavOriginGrid(dashboard, "");
            return;
        }

        token.style.left = `${point.x}%`;
        token.style.top = `${point.y}%`;
        token.title = `Vessel Grid: ${normalizedGrid}`;
        token.setAttribute("aria-label", `Vessel position ${normalizedGrid}`);
        if (readout) readout.textContent = `Vessel Grid: ${normalizedGrid}`;
        dashboard.querySelectorAll("[data-ship-grid-readout]").forEach((shipReadout) => {
            shipReadout.textContent = normalizedGrid;
        });
        setAstroNavOriginGrid(dashboard, normalizedGrid);
    }

    function setShipLocationOnDashboard(dashboard, location) {
        const value = String(location ?? DEFAULT_LOCATION_NAME).trim() || DEFAULT_LOCATION_NAME;
        dashboard.querySelectorAll("[data-ship-location-readout]").forEach((readout) => {
            readout.textContent = value;
        });
    }

    function setAstroNavOriginGrid(dashboard, grid) {
        const field = dashboard.querySelector("[data-astronav-origin-grid]");
        if (field) field.value = normalizeGrid(grid);
    }

    function setAstroNavDestinationGrid(dashboard, grid) {
        const field = dashboard.querySelector("[data-astronav-destination]");
        if (field) field.value = normalizeGrid(grid);
    }

    function beginMapRoutePlacement(dashboard) {
        dashboard.dataset.routePlacement = "true";
        dashboard.classList.add("isl-map-route-placement");
        setAstroNavStatus(dashboard, "Select an objective grid on the map.", "dirty");
        void loadGridCoordinateRecords().catch((error) => {
            console.error(`${MODULE_ID} | Failed to preload NaviComputer coordinates`, error);
        });
    }

    async function setMapRouteDestination(dashboard, grid) {
        const normalizedGrid = normalizeGrid(grid);
        if (!normalizedGrid) return;

        dashboard.dataset.routePlacement = "false";
        dashboard.classList.remove("isl-map-route-placement");
        setAstroNavDestinationGrid(dashboard, normalizedGrid);
        const originGrid = dashboard.dataset.shipGrid || getLiveState().shipGrid;
        if (originGrid) renderMapRoute(dashboard, [originGrid, normalizedGrid]);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await calculateAstroNavRoute(dashboard);
    }

    function clearMapRoute(dashboard) {
        delete dashboard.dataset.routeGridPath;
        delete dashboard.dataset.routeDestinationGrid;
        delete dashboard.dataset.routeOriginGrid;
        delete dashboard.dataset.plannedTransit;
        dashboard.dataset.routePlacement = "false";
        dashboard.classList.remove("isl-map-route-placement");
        const destinationField = dashboard.querySelector("[data-astronav-destination]");
        if (destinationField) destinationField.value = "";
        renderMapRoute(dashboard, []);
        setAstroNavTransitEngageEnabled(dashboard, false);
        setAstroNavStatus(dashboard, "Transit plot cleared.", "");
    }

    function setAstroNavTransitEngageEnabled(dashboard, enabled) {
        dashboard.querySelectorAll("[data-action='astronav-engage-transit']").forEach((button) => {
            button.disabled = !enabled;
        });
    }

    async function engageAstroNavTransit(dashboard) {
        let transit;

        try {
            transit = JSON.parse(dashboard.dataset.plannedTransit || "{}");
        } catch (error) {
            transit = {};
        }

        const shipGrid = normalizeGrid(transit.shipGrid);
        const location = String(transit.location ?? "").trim();
        if (!shipGrid || !location) {
            setAstroNavStatus(dashboard, "Plot a destination grid before engaging transit.", "error");
            setAstroNavTransitEngageEnabled(dashboard, false);
            return;
        }

        if (!game.user?.isGM && !hasActiveGM()) {
            setAstroNavStatus(dashboard, "Active GM required to engage transit.", "error");
            return;
        }

        await requestLiveStateUpdate(dashboard, { location, shipGrid }, {
            successStatus: "Transit engaged. Vessel telemetry updating.",
            requestedStatus: "Transit engagement transmitted to operational telemetry.",
            errorStatus: "Active GM required to engage transit.",
            statusTarget: "live"
        });
        clearMapRoute(dashboard);
        setAstroNavStatus(dashboard, `Transit engaged: ${location} // ${shipGrid}.`, "");
    }

    function beginRouteMarkerDrag(dashboard, event) {
        if (event.button !== undefined && event.button !== 0) return;
        const marker = event.currentTarget;
        if (!marker || marker.classList.contains("hidden")) return;

        activeRouteMarkerDrag = {
            dashboard,
            marker,
            pointerId: event.pointerId
        };
        marker.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
    }

    function updateRouteMarkerDrag(event) {
        const drag = activeRouteMarkerDrag;
        if (!drag || event.pointerId !== drag.pointerId || !drag.dashboard?.isConnected) return;
        const stage = drag.dashboard.querySelector("#isl-map-stage");
        const grid = gridFromMapPointer(event, getGridCalibration(), stage);
        const point = gridToMapPoint(grid);
        if (!grid || !point) return;
        if (drag.previewGrid === grid) return;

        drag.previewGrid = grid;

        drag.marker.style.left = `${point.x}%`;
        drag.marker.style.top = `${point.y}%`;
        drag.marker.title = `Planned objective: ${grid}`;
        drag.marker.setAttribute("aria-label", `Planned objective ${grid}`);
        renderMapRoute(drag.dashboard, [drag.dashboard.dataset.routeOriginGrid || drag.dashboard.dataset.shipGrid, grid]);
        event.preventDefault();
        event.stopPropagation();
    }

    async function endRouteMarkerDrag(event) {
        const drag = activeRouteMarkerDrag;
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (drag.marker?.hasPointerCapture?.(event.pointerId)) drag.marker.releasePointerCapture(event.pointerId);

        const stage = drag.dashboard.querySelector("#isl-map-stage");
        const grid = gridFromMapPointer(event, getGridCalibration(), stage);
        activeRouteMarkerDrag = null;
        if (grid) await setMapRouteDestination(drag.dashboard, grid);
        event.preventDefault();
        event.stopPropagation();
    }

    async function calculateAstroNavRoute(dashboard) {
        const originField = dashboard.querySelector("[data-astronav-origin-grid]");
        const destinationField = dashboard.querySelector("[data-astronav-destination]");
        const originValue = originField?.value || dashboard.dataset.shipGrid || getLiveState().shipGrid;
        const destinationValue = destinationField?.value || "";

        setAstroNavStatus(dashboard, "NaviComputer calculating approach.", "dirty");

        let origin;
        let destination;

        try {
            await loadGridCoordinateRecords();
            origin = resolveAstroNavTarget(originValue);
            destination = resolveAstroNavTarget(destinationValue);
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to calculate transit plot`, error);
            renderAstroNavError(dashboard, "Transit coordinate database offline.");
            return;
        }

        if (!origin) {
            renderAstroNavError(dashboard, "Departure world, grid, or region invalid.");
            return;
        }

        if (!origin.region) {
            renderAstroNavError(dashboard, "Departure region unavailable for selected coordinates.");
            return;
        }

        if (!hasAstroNavTargetData(origin, getDashboardNavData(dashboard))) {
            renderAstroNavError(dashboard, "NavData package required for the selected departure coordinates.");
            return;
        }

        if (!destination) {
            renderAstroNavError(dashboard, "Objective world, grid, or region invalid.");
            return;
        }

        if (!destination.region) {
            renderAstroNavError(dashboard, "Objective region unavailable for selected coordinates.");
            return;
        }

        if (!hasAstroNavTargetData(destination, getDashboardNavData(dashboard))) {
            renderAstroNavError(dashboard, "NavData package required for the selected objective coordinates.");
            return;
        }

        if (!requestNavigationClearance(dashboard, destination, () => calculateAstroNavRoute(dashboard))) {
            setAstroNavStatus(dashboard, "Imperial clearance code required for selected objective.", "error");
            return;
        }

        if (readAstroNavTransitMode(dashboard) === "direct-transit" && origin.coordinate && destination.coordinate) {
            const directRoute = buildAstroNavGridRoute(origin.coordinate, destination.coordinate);
            const transitTarget = getDirectTransitClearanceTarget(directRoute);
            if (transitTarget && !requestNavigationClearance(dashboard, transitTarget, () => calculateAstroNavRoute(dashboard))) {
                setAstroNavStatus(dashboard, "Imperial clearance code required for direct transit.", "error");
                return;
            }
        }

        const route = calculateHyperspaceRoute(dashboard, origin, destination);
        if (route.error) {
            renderAstroNavError(dashboard, route.error);
            return;
        }

        renderAstroNavResult(dashboard, route);
        setAstroNavStatus(
            dashboard,
            route.transitMode === "direct-transit"
                ? "Direct transit clearance verified."
                : "Transit plot routed around restricted grids.",
            ""
        );
    }

    function resolveAstroNavTarget(rawValue) {
        const value = String(rawValue ?? "").trim();
        if (!value) return null;

        const directRegion = normalizeHyperspaceRegion(value);
        if (directRegion) {
            return {
                name: directRegion,
                grid: "",
                region: directRegion,
                coordinate: null,
                type: "region",
                sector: ""
            };
        }

        const directGrid = parseAstroNavGrid(value);
        if (directGrid) {
            const gridRecord = gridCoordinateByGrid[directGrid.grid];
            const region = getAstroNavGridRegion(directGrid.grid, normalizeHyperspaceRegion(gridRecord?.fields?.Region));
            return {
                name: gridRecord?.fields?.Planet || directGrid.grid,
                grid: directGrid.grid,
                region,
                coordinate: directGrid,
                mapPosition: gridRecord?.fields?.MapPosition || "",
                type: "grid",
                sector: gridRecord?.fields?.Sector || ""
            };
        }

        const normalizedInput = normalizePlanetName(value);
        const lookupName = GRID_COORDINATE_ALIASES[normalizedInput] || planetAliases[normalizedInput] || normalizedInput;
        const record = gridCoordinateByName[lookupName];
        const recordGrid = parseAstroNavGrid(record?.fields?.Grid);
        const region = normalizeHyperspaceRegion(record?.fields?.Region);
        if (!record || !region) return null;

        return {
            name: record.fields.Planet || value,
            grid: recordGrid?.grid || "",
            region,
            coordinate: recordGrid,
            mapPosition: record.fields.MapPosition || "",
            type: "planet",
            sector: record.fields.Sector || ""
        };
    }

    function normalizeHyperspaceRegion(rawRegion) {
        const normalizedRegion = String(rawRegion ?? "").trim().replace(/\s+/g, " ").toUpperCase();
        if (!normalizedRegion) return "";
        return HYPERSPACE_REGION_ALIASES[normalizedRegion] || "";
    }

    function parseAstroNavGrid(rawGrid) {
        const normalizedGrid = normalizeGrid(rawGrid);
        const match = normalizedGrid.match(/^([A-W])(\d{1,2})$/);
        if (!match) return null;

        const column = MAP_GRID_COLUMNS.indexOf(match[1]) + 1;
        const row = Number.parseInt(match[2], 10);
        const rows = getGridCalibration().rows || DEFAULT_MAP_GRID_CALIBRATION.rows;
        if (column < 1 || row < 1 || row > rows) return null;

        return {
            grid: `${match[1]}${row}`,
            column,
            row
        };
    }

    function calculateHyperspaceRoute(dashboard, origin, destination) {
        return getNavRoutingModule().calculateRoute({
            origin,
            destination,
            transitMode: readAstroNavTransitMode(dashboard),
            restrictionAccess: getDashboardRestrictionTierAccess(dashboard),
            authorizedGrids: getNavigationClearanceGrids(),
            hyperdriveClass: readAstroNavNumber(dashboard, "hyperdriveClass", 1, { min: 0.1 }),
            realspaceLeg: readAstroNavRealspaceLeg(dashboard),
            regionTravelHours: HYPERSPACE_REGION_TRAVEL_HOURS
        }, getNavRoutingModuleConfig());
    }

    function getNavRoutingModule() {
        const navRoutingModule = globalThis.GalacticOperationsConsoleModules?.navRouting;
        if (!navRoutingModule) throw new Error(`${MODULE_ID} | Nav-routing module was not loaded.`);
        return navRoutingModule;
    }

    function getNavRoutingModuleConfig() {
        return {
            hyperlanes: MAJOR_GALACTIC_HYPERLANES,
            aliases: HYPERLANE_NODE_ALIASES,
            adjacentGridDistance: HYPERLANE_ADJACENT_GRID_DISTANCE,
            normalizePlanetName,
            normalizeGrid,
            parseGrid: parseAstroNavGrid,
            formatGrid: formatAstroNavGrid,
            calculateGridTransit: calculateAstroNavGridTransit,
            buildGridSegments: buildAstroNavGridSegments,
            getGridRegion: getAstroNavGridRegion,
            restrictedEntries: restrictedGridEntries,
            restrictedEntryByGrid,
            hasRestrictionTierAccess,
            hasNavigationClearance
        };
    }

    function findMajorHyperlaneRoute(origin, destination) {
        return getNavRoutingModule().findDirect(origin, destination, getNavRoutingModuleConfig());
    }

    function findAdjacentMajorHyperlaneRoute(gridRoute, origin, destination, options = {}) {
        return getNavRoutingModule().findAdjacent(gridRoute, origin, destination, options, getNavRoutingModuleConfig());
    }

    function calculateAstroNavGridTransit(origin, destination, options = {}) {
        return getNavRoutingModule().calculateGridTransit(origin, destination, options, getNavRoutingModuleConfig());
    }

    function mergeAstroNavGridPaths(...paths) {
        return getNavRoutingModule().mergeGridPaths(paths, getNavRoutingModuleConfig());
    }

    function buildAstroNavGridRoute(originCoordinate, destinationCoordinate, options = {}) {
        return getNavRoutingModule().buildGridRoute(originCoordinate, destinationCoordinate, options, getNavRoutingModuleConfig());
    }

    function getAstroNavRestrictedGridEntries(gridRoute, options = {}) {
        return getNavRoutingModule().getRestrictedEntries(gridRoute, options, getNavRoutingModuleConfig());
    }

    function getUnauthorizedAstroNavRestrictedTransits(gridRoute, access, options = {}) {
        return getNavRoutingModule().getUnauthorizedRestrictedTransits(gridRoute, access, options, getNavRoutingModuleConfig());
    }

    function getDirectTransitClearanceTarget(gridRoute) {
        return getNavRoutingModule().getDirectTransitClearanceTarget(gridRoute, getNavRoutingModuleConfig());
    }

    function formatAstroNavDirectTransitDenial(denial) {
        return getNavRoutingModule().formatDirectTransitDenial(denial);
    }

    function isAstroNavMajorHyperlaneRouteAvailable(route, transitMode, origin, destination, access, authorizedGrids = []) {
        return getNavRoutingModule().isMajorRouteAvailable(
            route,
            transitMode,
            origin,
            destination,
            access,
            authorizedGrids,
            getNavRoutingModuleConfig()
        );
    }

    function buildAstroNavGridSegments(gridRoute, origin, destination) {
        return gridRoute.slice(1).map((toGrid, index) => {
            const fromGrid = gridRoute[index];
            const isOriginGrid = index === 0;
            const isDestinationGrid = index === gridRoute.length - 2;
            const fromRegion = isOriginGrid
                ? origin.region
                : getAstroNavGridRegion(fromGrid, origin.region);
            const toRegion = isDestinationGrid
                ? destination.region
                : getAstroNavGridRegion(toGrid, destination.region);
            const hours = HYPERSPACE_REGION_TRAVEL_HOURS[fromRegion]?.[toRegion] ?? 0;

            return {
                fromGrid,
                toGrid,
                fromRegion,
                toRegion,
                hours
            };
        });
    }

    function getAstroNavGridRegion(grid, fallbackRegion = "") {
        const normalizedGrid = normalizeGrid(grid);
        if (!normalizedGrid) return fallbackRegion;

        if (gridRegionByGrid[normalizedGrid]) return gridRegionByGrid[normalizedGrid];

        const coordinate = parseAstroNavGrid(normalizedGrid);
        if (!coordinate || !gridRegionCoordinates.length) return fallbackRegion;

        const nearest = gridRegionCoordinates.reduce((closest, entry) => {
            const distance = Math.hypot(entry.column - coordinate.column, entry.row - coordinate.row);
            if (!closest || distance < closest.distance) {
                return { ...entry, distance };
            }

            return closest;
        }, null);

        return nearest?.region || fallbackRegion;
    }

    function formatAstroNavGrid(column, row) {
        const colIndex = Number(column) - 1;
        const gridColumn = MAP_GRID_COLUMNS[colIndex];
        if (!gridColumn || row < 1 || row > (getGridCalibration().rows || DEFAULT_MAP_GRID_CALIBRATION.rows)) return "";
        return `${gridColumn}${row}`;
    }

    function buildGridRegionByGrid(records) {
        const regionCountsByGrid = records.reduce((counts, record) => {
            const grid = normalizeGrid(record.fields.Grid);
            const region = normalizeHyperspaceRegion(record.fields.Region);
            if (!grid || !region) return counts;

            counts[grid] ??= {};
            counts[grid][region] = (counts[grid][region] || 0) + 1;
            return counts;
        }, {});

        return Object.entries(regionCountsByGrid).reduce((regions, [grid, counts]) => {
            const dominantRegion = Object.entries(counts).sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1];
                return a[0].localeCompare(b[0]);
            })[0]?.[0];

            if (dominantRegion) regions[grid] = dominantRegion;
            return regions;
        }, {});
    }

    function buildGridRegionCoordinates(regionByGrid) {
        return Object.entries(regionByGrid).map(([grid, region]) => {
            const coordinate = parseAstroNavGrid(grid);
            return coordinate ? { ...coordinate, region } : null;
        }).filter(Boolean);
    }

    function readAstroNavNumber(dashboard, fieldName, fallback, { min = -Infinity, max = Infinity } = {}) {
        const field = dashboard.querySelector(`[data-astronav-field='${fieldName}']`);
        const value = Number.parseFloat(field?.value);
        const numeric = Number.isFinite(value) ? value : fallback;
        return Math.min(max, Math.max(min, numeric));
    }

    function readAstroNavRealspaceLeg(dashboard) {
        const field = dashboard.querySelector("[data-astronav-field='realspaceLeg']");
        return ASTRONAV_REALSPACE_OPTIONS[field?.value] || ASTRONAV_REALSPACE_OPTIONS["safe-jump"];
    }

    function readAstroNavTransitMode(dashboard) {
        const field = dashboard.querySelector("[data-astronav-field='transitMode']");
        return field?.value === "direct-transit" ? "direct-transit" : "avoid-restricted";
    }

    function renderAstroNavResult(dashboard, route) {
        const result = dashboard.querySelector("#isl-astronav-result");
        if (!result) return;
        const fuelRequired = formatAstroNavRange(route.fuelRequiredMin, route.fuelRequiredMax, 0);
        const fuelReadout = dashboard.querySelector("[data-astronav-fuel-required]");
        if (fuelReadout) fuelReadout.value = `${fuelRequired} units`;
        const plottedGridRoute = route.majorHyperlaneRoute?.grids.length
            ? route.majorHyperlaneRoute.grids
            : route.gridRoute;

        result.innerHTML = [
            `Departure: ${escapeHtml(route.origin.name)}, ${escapeHtml(route.origin.region)}`,
            `Objective: ${escapeHtml(route.destination.name)}, ${escapeHtml(route.destination.region)}`,
            `Transit Plot: ${plottedGridRoute.length ? escapeHtml(formatAstroNavGridRoute(plottedGridRoute)) : "Unavailable"}`,
            `Projected Hyperspace Time: ${formatAstroNavNumber(route.hours, 2)} hours`,
            formatMajorHyperlaneDifference(route),
            `Local Transit Leg: ${escapeHtml(route.realspaceLeg.label)} (${escapeHtml(route.realspaceLeg.display)})`,
            `Mission Transit Time: ${formatAstroNavDurationRange(route.totalMinHours, route.totalMaxHours)}`,
            `Fuel Allocation: ${fuelRequired} units`
        ].filter(Boolean).join("<br>");
        const destinationGrid = normalizeGrid(route.destination.grid);
        if (destinationGrid) {
            dashboard.dataset.plannedTransit = JSON.stringify({
                location: route.destination.name,
                shipGrid: destinationGrid
            });
        } else {
            delete dashboard.dataset.plannedTransit;
        }
        setAstroNavTransitEngageEnabled(dashboard, Boolean(destinationGrid));
        renderMapRoute(dashboard, route.majorHyperlaneRoute?.grids.length
            ? route.majorHyperlaneRoute.grids
            : route.gridRoute.length
            ? route.gridRoute
            : [route.origin.grid, route.destination.grid]);
    }

    function refreshMapRouteOverlay(dashboard, calibration = getGridCalibration()) {
        const storedGridPath = String(dashboard.dataset.routeGridPath || "")
            .split(",")
            .map(normalizeGrid)
            .filter(Boolean);
        renderMapRoute(dashboard, storedGridPath, calibration);
    }

    function renderMapRoute(dashboard, grids, calibration = getGridCalibration()) {
        const routeOverlay = dashboard.querySelector("#isl-route-overlay");
        const marker = dashboard.querySelector("#isl-route-token");
        const routeGrids = (Array.isArray(grids) ? grids : [])
            .map(normalizeGrid)
            .filter(Boolean);
        const points = routeGrids.map((grid) => ({ grid, point: gridToMapPoint(grid, calibration) })).filter((entry) => entry.point);

        if (!routeOverlay || !marker || !points.length) {
            routeOverlay?.replaceChildren();
            marker?.classList.add("hidden");
            return;
        }

        const destination = points[points.length - 1];
        dashboard.dataset.routeGridPath = points.map((entry) => entry.grid).join(",");
        dashboard.dataset.routeOriginGrid = points[0].grid;
        dashboard.dataset.routeDestinationGrid = destination.grid;

        routeOverlay.setAttribute("viewBox", "0 0 100 100");
        routeOverlay.setAttribute("preserveAspectRatio", "none");
        routeOverlay.replaceChildren();
        if (points.length > 1) {
            const trace = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            trace.setAttribute("class", "isl-route-trace");
            trace.setAttribute("points", points.map((entry) => `${entry.point.x},${entry.point.y}`).join(" "));
            routeOverlay.append(trace);
        }

        marker.style.left = `${destination.point.x}%`;
        marker.style.top = `${destination.point.y}%`;
        marker.title = `Planned objective: ${destination.grid}`;
        marker.setAttribute("aria-label", `Planned objective ${destination.grid}`);
        marker.classList.remove("hidden");
    }

    function formatAstroNavTarget(target) {
        return target.grid ? `${target.name} [${target.grid}]` : target.name;
    }

    function formatAstroNavGridRoute(gridRoute) {
        if (gridRoute.length <= 14) return gridRoute.join(" -> ");
        return `${gridRoute.slice(0, 7).join(" -> ")} -> ... -> ${gridRoute.slice(-6).join(" -> ")}`;
    }

    function renderAstroNavError(dashboard, message) {
        const result = dashboard.querySelector("#isl-astronav-result");
        const fuelReadout = dashboard.querySelector("[data-astronav-fuel-required]");
        if (fuelReadout) fuelReadout.value = "Unavailable";
        clearMapRoute(dashboard);
        if (result) {
            result.innerHTML = `<span class="isl-warning-text">${escapeHtml(message)}</span>`;
        }

        setAstroNavStatus(dashboard, message, "error");
    }

    function setAstroNavStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-astronav-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function formatAstroNavNumber(value, digits = 2) {
        return Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    function formatAstroNavClass(value) {
        return `Class ${formatAstroNavNumber(value, Number.isInteger(Number(value)) ? 0 : 2)}`;
    }

    function formatMajorHyperlaneDifference(route) {
        const hyperlaneRoute = route.availableMajorHyperlaneRoute;
        if (!hyperlaneRoute || route.baseHours <= 0) return "Hyperlane Advantage: 0.00 hours";

        const difference = (route.baseHours - hyperlaneRoute.hours) * route.hyperdriveClass;
        const formattedDifference = formatAstroNavNumber(Math.abs(difference), 2);
        if (Math.abs(difference) < 0.005) return "Hyperlane Advantage: 0.00 hours";
        return difference > 0
            ? `Hyperlane Advantage: ${formattedDifference} hours saved.`
            : `Hyperlane Cost: ${formattedDifference} additional hours.`;
    }

    function formatAstroNavRange(minValue, maxValue, digits = 2) {
        const min = Number(minValue || 0);
        const max = Number(maxValue || 0);
        if (Math.abs(min - max) < 0.000001) return formatAstroNavNumber(min, digits);
        return `${formatAstroNavNumber(min, digits)}-${formatAstroNavNumber(max, digits)}`;
    }

    function formatAstroNavHourRange(minHours, maxHours) {
        return `${formatAstroNavRange(minHours, maxHours, 2)} hours`;
    }

    function formatAstroNavDayRange(minHours, maxHours) {
        return `${formatAstroNavRange(minHours / 24, maxHours / 24, 2)} days`;
    }

    function formatAstroNavDurationRange(minHours, maxHours) {
        const min = Number(minHours || 0);
        const max = Number(maxHours || 0);
        if (Math.abs(min - max) < 0.000001) return formatAstroNavDuration(min);
        return `${formatAstroNavDuration(min)} - ${formatAstroNavDuration(max)}`;
    }

    function formatAstroNavDuration(hours) {
        const value = Math.max(0, Number(hours) || 0);
        if (value >= 720) return formatAstroNavDurationUnit(value / 720, "month");
        if (value >= 168) return formatAstroNavDurationUnit(value / 168, "week");
        if (value >= 24) return formatAstroNavDurationUnit(value / 24, "day");
        return `${formatAstroNavNumber(value, 2)} hours`;
    }

    function formatAstroNavDurationUnit(value, unit) {
        const suffix = Math.abs(value - 1) < 0.000001 ? "" : "s";
        return `${formatAstroNavNumber(value, 2)} ${unit}${suffix}`;
    }

    async function initializeLocationPanel(dashboard) {
        setLocationStatus(dashboard, "Mission theater database initializing.", "");

        try {
            const records = await loadGridCoordinateRecords();
            if (!dashboard.isConnected) return;

            populateLocationOptions(dashboard, records);
            applyNavDataToDashboard(dashboard, getNavData());
            await applyLiveStateToDashboard(dashboard, getLiveState());
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to load grid coordinates`, error);
            renderLocationUnavailable(dashboard, DEFAULT_LOCATION_NAME, "Mission theater database offline.");
            setLocationStatus(dashboard, "Mission theater database offline.", "error");
        }
    }

    async function scanSector(dashboard) {
        const input = dashboard.querySelector("#isl-location-input");
        const previousShipGrid = dashboard.dataset.shipGrid || getLiveState().shipGrid || DEFAULT_SHIP_GRID;
        const requestedLocation = input?.value || getLiveState().location || SCAN_LOCATION_NAME;
        const requestedRecord = await resolveLocationRecord(requestedLocation);
        if (requestedRecord && !hasSystemNavData(requestedRecord, getDashboardNavData(dashboard))) {
            setLocationStatus(dashboard, "NavData package required for tactical reconnaissance.", "error");
            return;
        }
        const record = await showCurrentLocation(dashboard, requestedLocation);
        if (!record) return;

        const grid = normalizeGrid(record.fields.Grid);
        await requestLiveStateUpdate(dashboard, {
            location: record.fields.Planet || input?.value || DEFAULT_LOCATION_NAME,
            shipGrid: grid || previousShipGrid
        });

        setLocationStatus(dashboard, grid ? `Tactical scan complete: Grid ${grid}.` : "Tactical scan complete.", "");
    }

    function getRestrictionForRecord(record) {
        const fields = record?.fields ?? record ?? {};
        const planetKey = normalizePlanetName(fields.Planet ?? fields.planet ?? "");
        const grid = normalizeGrid(fields.Grid ?? fields.grid ?? "");

        return restrictionTierByPlanetName[planetKey] || restrictionTierByGrid[grid] || null;
    }

    async function showCurrentLocation(dashboard, rawName, options = {}) {
        const normalizedInput = normalizePlanetName(rawName || DEFAULT_LOCATION_NAME);
        if (!normalizedInput) {
            renderLocationUnavailable(dashboard, "", "Mission theater designation required.");
            setLocationStatus(dashboard, "Mission theater designation required.", "error");
            return null;
        }

        try {
            await loadGridCoordinateRecords();
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to load grid coordinates`, error);
            renderLocationUnavailable(dashboard, rawName, "Mission theater database offline.");
            setLocationStatus(dashboard, "Mission theater database offline.", "error");
            return null;
        }

        const lookupName = GRID_COORDINATE_ALIASES[normalizedInput] || planetAliases[normalizedInput] || normalizedInput;
        const record = gridCoordinateByName[lookupName];

        if (!record) {
            renderLocationUnavailable(dashboard, rawName, "Mission theater coordinates unavailable.");
            setLocationStatus(dashboard, "Mission theater coordinates unavailable.", "error");
            return null;
        }

        renderLocationRecord(dashboard, record, options.warning);
        setShipLocationOnDashboard(dashboard, record.fields.Planet || rawName || DEFAULT_LOCATION_NAME);
        setShipGridOnDashboard(dashboard, record.fields.Grid);
        setLocationStatus(dashboard, options.warning ? "Tactical anomaly logged." : "Mission theater synchronized.", options.warning ? "dirty" : "");
        return record;
    }

    function renderLocationRecord(dashboard, record, warning = "") {
        const locationData = dashboard.querySelector("#isl-location-data");
        if (!locationData) return;

        const restriction = getRestrictionForRecord(record);
        const restrictionAccessGranted = restriction
            ? hasRestrictionTierAccess(restriction.tier, getDashboardRestrictionTierAccess(dashboard))
            : false;
        const rows = [
            ["Objective World", record.fields.Planet],
            ["Tactical Grid", record.fields.Grid],
            ["Precise Coordinates", record.fields.PGC],
            ["Sector", record.fields.Sector],
            ["Operating Region", record.fields.Region],
            ["Restriction", restrictionAccessGranted ? `Tier ${restriction.tier.id}: ${restriction.tier.label}` : ""],
            ["Clearance", restrictionAccessGranted ? restriction.tier.clearance : ""]
        ].filter(([, value]) => String(value ?? "").trim());

        const details = rows.map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`);
        if (warning) details.push(`<span class="isl-warning-text">${escapeHtml(warning)}</span>`);

        dashboard.dataset.currentLocationFields = JSON.stringify(record.fields);
        dashboard.dataset.currentLocationWarning = warning || "";
        locationData.innerHTML = details.join("<br>");
    }

    function renderLocationUnavailable(dashboard, rawName, message) {
        const locationData = dashboard.querySelector("#isl-location-data");
        if (!locationData) return;

        delete dashboard.dataset.currentLocationFields;
        delete dashboard.dataset.currentLocationWarning;
        const locationName = String(rawName ?? "").trim() || "Unknown";
        locationData.innerHTML = [
            `Objective World: ${escapeHtml(locationName)}`,
            `<span class="isl-warning-text">${escapeHtml(message)}</span>`
        ].join("<br>");
    }

    function refreshCurrentLocationRestrictionDisplay(dashboard) {
        if (!dashboard.dataset.currentLocationFields) return;

        try {
            const fields = JSON.parse(dashboard.dataset.currentLocationFields);
            renderLocationRecord(dashboard, { fields }, dashboard.dataset.currentLocationWarning || "");
        } catch (error) {
            delete dashboard.dataset.currentLocationFields;
            delete dashboard.dataset.currentLocationWarning;
        }
    }

    function populateLocationOptions(dashboard, records) {
        populateNavDataOptions(dashboard, records);
        const navData = getDashboardNavData(dashboard);
        const visibleRecords = game.user?.isGM
            ? records
            : records.filter((record) => hasSystemNavData(record, navData));
        const options = dashboard.querySelector("#isl-location-options");
        if (options) {
            options.replaceChildren(...visibleRecords.map((record) => {
                const option = document.createElement("option");
                option.value = record.fields.Planet;
                return option;
            }));
        }

        populateAstroNavOptions(dashboard, records);
    }

    function populateNavDataOptions(dashboard, records) {
        const options = dashboard.querySelector("#isl-navdata-options");
        if (!options) return;

        const values = [
            ...Object.keys(HYPERSPACE_REGION_TRAVEL_HOURS),
            ...records.map((record) => record.fields.Sector),
            ...records.map((record) => record.fields.Grid),
            ...records.map((record) => record.fields.Planet)
        ].map((value) => String(value ?? "").trim()).filter(Boolean);

        options.replaceChildren(...[...new Set(values)].sort((left, right) => left.localeCompare(right)).map((value) => {
            const option = document.createElement("option");
            option.value = value;
            return option;
        }));
    }

    function populateAstroNavOptions(dashboard, records) {
        const options = dashboard.querySelector("#isl-astronav-options");
        if (!options) return;

        const navData = getDashboardNavData(dashboard);
        const planetOptions = records.filter((record) => game.user?.isGM || hasSystemNavData(record, navData)).map((record) => {
            const option = document.createElement("option");
            option.value = record.fields.Planet;
            option.label = normalizeHyperspaceRegion(record.fields.Region) || normalizeGrid(record.fields.Grid) || "Region unavailable";
            return option;
        });
        const regionOptions = Object.keys(HYPERSPACE_REGION_TRAVEL_HOURS)
            .filter((region) => game.user?.isGM || hasNavDataValue("regions", region, navData))
            .map((region) => {
            const option = document.createElement("option");
            option.value = region;
            option.label = "Region";
            return option;
        });

        options.replaceChildren(...planetOptions, ...regionOptions);
    }

    function setLocationStatus(dashboard, text, state) {
        const status = dashboard.querySelector("#isl-location-status");
        if (!status) return;

        status.textContent = text;
        if (state) status.dataset.state = state;
        else delete status.dataset.state;
    }

    function getWarningsModule() {
        const warningsModule = globalThis.GalacticOperationsConsoleModules?.warnings;
        if (!warningsModule) throw new Error(`${MODULE_ID} | Warnings module was not loaded.`);
        return warningsModule;
    }

    function getWarningsModuleConfig() {
        return {
            moduleId: MODULE_ID,
            warningDefinitionsPath,
            isdNamesPath,
            warningVisitsSettingKey: WARNING_SYSTEM_VISITS_SETTING_KEY,
            restrictionTierByPlanetName,
            defaultShipTransponder: DEFAULT_SHIP_TRANSPONDER,
            normalizePlanetName,
            normalizeGrid,
            normalizeLiveState,
            getLiveState,
            transmit: transmitSystemWarning,
            setStatus: setWarningStatus
        };
    }

    async function triggerFirstTimeSystemWarning(state) {
        return getWarningsModule().triggerFirstVisit(state, getWarningsModuleConfig());
    }

    async function triggerManualWarningGrade(dashboard, rawGrade) {
        return getWarningsModule().triggerManualGrade(dashboard, rawGrade, getWarningsModuleConfig());
    }

    async function transmitSystemWarning(payload) {
        if (!payload) return;

        rememberTransmission(payload);
        if (payload.isLive) await persistLiveHail(payload);
        applySystemWarningToOpenDashboards(payload);

        game.socket?.emit(SOCKET_NAME, {
            type: "systemWarning",
            senderId: game.user?.id,
            payload
        });
    }

    function applySystemWarningToOpenDashboards(payload) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            displaySystemWarning(dashboard, payload);
        });
    }

    function displaySystemWarning(dashboard, payload) {
        rememberTransmission(payload);
        const source = payload.isLive ? "Live hail" : "Automated warning";
        setLocationStatus(dashboard, `${source} received: Grade ${payload.grade} ${payload.system}.`, "error");
        openTransmissionPopup(dashboard, {
            kicker: payload.isLive ? "Live Imperial Hail" : "Automated Imperial Warning",
            title: `Grade ${payload.grade} // ${payload.system}`,
            message: payload.message
        });
    }

    function rememberTransmission(payload) {
        if (!payload?.message) return;
        lastTransmissionPayload = { ...payload };
    }

    function getLatestTransmission() {
        if (lastTransmissionPayload?.message) return lastTransmissionPayload;

        const latestHail = getLiveHailLog().at?.(-1);
        if (!latestHail?.message) return null;

        return {
            ...latestHail,
            isLive: true
        };
    }

    function openLatestTransmission(dashboard) {
        const transmission = getLatestTransmission();
        if (!transmission) {
            ui.notifications?.info("No priority transmissions received.");
            return;
        }

        openTransmissionPopup(dashboard, {
            kicker: transmission.isLive ? "Live Imperial Hail" : "Automated Imperial Warning",
            title: `Grade ${transmission.grade} // ${transmission.system}`,
            message: transmission.message
        });
    }

    function getLiveHailLog() {
        try {
            const hails = game.settings.get(MODULE_ID, LIVE_HAIL_LOG_SETTING_KEY);
            return Array.isArray(hails) ? hails : [];
        } catch (error) {
            return [];
        }
    }

    async function persistLiveHail(payload) {
        if (!game.user?.isGM) return;

        const entry = {
            id: payload.id,
            grade: payload.grade,
            system: payload.system,
            grid: payload.grid,
            transmissionTitle: payload.transmissionTitle,
            message: payload.message,
            isdName: payload.isdName,
            timestamp: payload.timestamp
        };
        const hails = [...getLiveHailLog(), entry].slice(-30);
        await game.settings.set(MODULE_ID, LIVE_HAIL_LOG_SETTING_KEY, hails);
        applyLiveHailLogToOpenDashboards(hails);
    }

    function applyLiveHailLogToOpenDashboards(hails = getLiveHailLog()) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            renderLiveHailLog(dashboard, hails);
        });
    }

    function renderLiveHailLog(dashboard, hails = getLiveHailLog()) {
        const log = dashboard.querySelector("[data-live-hail-log]");
        if (!log) return;

        const entries = Array.isArray(hails) ? hails : [];
        if (!entries.length) {
            log.textContent = "No live hails recorded.";
            return;
        }

        const fragment = document.createDocumentFragment();
        entries.slice().reverse().forEach((entry) => {
            const item = document.createElement("article");
            item.className = "isl-live-hail-entry";

            const meta = document.createElement("div");
            const timestamp = Number(entry.timestamp) ? new Date(entry.timestamp).toLocaleTimeString() : "Unknown time";
            meta.className = "isl-live-hail-meta";
            meta.textContent = `${timestamp} // Grade ${entry.grade} // ${entry.system}${entry.grid ? ` [${entry.grid}]` : ""}`;

            const message = document.createElement("div");
            message.className = "isl-live-hail-message";
            message.textContent = entry.message;

            item.append(meta, message);
            fragment.append(item);
        });

        log.replaceChildren(fragment);
    }

    function setWarningStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-warning-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function openTransmissionPopup(dashboard, { kicker = "Priority Transmission", title = "Imperial Transmission", message = "" } = {}) {
        const popup = dashboard.querySelector("#isl-transmission-popup");
        const popupKicker = dashboard.querySelector("#isl-transmission-popup-kicker");
        const popupTitle = dashboard.querySelector("#isl-transmission-popup-title");
        const body = dashboard.querySelector("#isl-transmission-popup-body");
        if (!popup || !body) return;

        if (popupKicker) popupKicker.textContent = kicker;
        if (popupTitle) popupTitle.textContent = title;
        body.textContent = message;
        popup.classList.remove("hidden");
    }

    function closeTransmissionPopup(dashboard) {
        dashboard.querySelector("#isl-transmission-popup")?.classList.add("hidden");
    }

    function normalizeGrid(value) {
        return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
    }

    function getStealthSystemsEngaged() {
        try {
            return Boolean(game.settings.get(MODULE_ID, STEALTH_SYSTEMS_SETTING_KEY));
        } catch (error) {
            return false;
        }
    }

    function getDashboardStealthSystemsEngaged(dashboard) {
        const button = dashboard.querySelector("[data-action='toggle-stealth']");
        if (!button) return getStealthSystemsEngaged();
        return button.getAttribute("aria-pressed") === "true";
    }

    async function toggleStealthSystems(dashboard) {
        const nextEngaged = !getDashboardStealthSystemsEngaged(dashboard);

        if (game.user?.isGM) {
            await persistStealthSystemsEngaged(nextEngaged, game.user.id);
            return;
        }

        if (!hasActiveGM()) {
            setStealthStatus(dashboard, "Active GM required to route deception systems.", "error");
            ui.notifications?.warn("Galactic Operations Console requires an active GM to update deception systems.");
            return;
        }

        game.socket?.emit(SOCKET_NAME, {
            type: "requestStealthSystems",
            requesterId: game.user?.id,
            engaged: nextEngaged
        });
        setStealthStatus(dashboard, nextEngaged ? "Deception systems engagement requested." : "Deception systems standby requested.", "dirty");
    }

    async function persistStealthSystemsEngaged(engaged, requesterId = null) {
        if (!game.user?.isGM) return;

        const value = Boolean(engaged);
        await game.settings.set(MODULE_ID, STEALTH_SYSTEMS_SETTING_KEY, value);
        applyStealthSystemsToOpenDashboards(value);

        game.socket?.emit(SOCKET_NAME, {
            type: "stealthSystemsUpdated",
            requesterId,
            engaged: value
        });
    }

    function applyStealthSystemsToOpenDashboards(engaged) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            updateStealthControls(dashboard, engaged);
        });
    }

    function updateStealthControls(dashboard, engaged) {
        dashboard.querySelectorAll("[data-action='toggle-stealth']").forEach((button) => {
            button.classList.toggle("active", engaged);
            button.setAttribute("aria-pressed", String(engaged));
        });

        dashboard.querySelectorAll("[data-stealth-readout]").forEach((readout) => {
            readout.textContent = engaged ? "Engaged" : "Standby";
        });

        setStealthStatus(dashboard, engaged ? "Deception systems engaged." : "Deception systems standby.", engaged ? "dirty" : "");
    }

    function setStealthStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-stealth-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    async function loadGridCoordinateRecords() {
        if (!gridCoordinateRecordsPromise) {
            gridCoordinateRecordsPromise = fetchGridCoordinateRecords().catch((error) => {
                gridCoordinateRecordsPromise = null;
                throw error;
            });
        }

        return gridCoordinateRecordsPromise;
    }

    async function fetchGridCoordinateRecords() {
        let lastError;

        for (const csvPath of gridCoordinateCsvPaths) {
            try {
                const response = await fetch(csvPath, { cache: "no-cache" });
                if (!response.ok) {
                    lastError = new Error(`${csvPath} returned ${response.status}`);
                    continue;
                }

                const csvText = await response.text();
                gridCoordinateRecords = parseGridCoordinateCsv(csvText);
                gridCoordinateByName = gridCoordinateRecords.reduce((records, record) => {
                    records[normalizePlanetName(record.fields.Planet)] = record;
                    return records;
                }, {});
                gridCoordinateByGrid = gridCoordinateRecords.reduce((records, record) => {
                    const grid = normalizeGrid(record.fields.Grid);
                    if (grid && !records[grid]) records[grid] = record;
                    return records;
                }, {});
                gridRegionByGrid = buildGridRegionByGrid(gridCoordinateRecords);

                Object.entries(GRID_COORDINATE_OVERRIDES).forEach(([name, fields]) => {
                    gridCoordinateByName[name] = { fields };
                    const grid = normalizeGrid(fields.Grid);
                    if (grid) gridCoordinateByGrid[grid] = { fields };
                    const region = normalizeHyperspaceRegion(fields.Region);
                    if (grid && region) gridRegionByGrid[grid] = region;
                });
                gridRegionCoordinates = buildGridRegionCoordinates(gridRegionByGrid);

                return gridCoordinateRecords;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError ?? new Error("No grid coordinate CSV path available.");
    }

    function parseGridCoordinateCsv(csvText) {
        const rows = parseCsvRows(csvText);
        const headers = rows.shift()?.map((header) => header.trim().replace(/^\uFEFF/, "")) ?? [];

        return rows
            .map((row) => {
                const fields = headers.reduce((record, header, index) => {
                    record[header] = String(row[index] ?? "").trim();
                    return record;
                }, {});

                return { fields };
            })
            .filter((record) => record.fields.Planet);
    }

    function parseCsvRows(csvText) {
        const rows = [];
        let row = [];
        let cell = "";
        let inQuotes = false;

        for (let index = 0; index < csvText.length; index += 1) {
            const char = csvText[index];
            const nextChar = csvText[index + 1];

            if (char === "\"") {
                if (inQuotes && nextChar === "\"") {
                    cell += "\"";
                    index += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (char === "," && !inQuotes) {
                row.push(cell);
                cell = "";
                continue;
            }

            if ((char === "\n" || char === "\r") && !inQuotes) {
                if (char === "\r" && nextChar === "\n") index += 1;
                row.push(cell);
                if (row.some((value) => value.trim())) rows.push(row);
                row = [];
                cell = "";
                continue;
            }

            cell += char;
        }

        row.push(cell);
        if (row.some((value) => value.trim())) rows.push(row);

        return rows;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[char]));
    }

    function getJournalModule() {
        const journalModule = globalThis.GalacticOperationsConsoleModules?.journals;
        if (!journalModule) throw new Error(`${MODULE_ID} | Journal module was not loaded.`);
        return journalModule;
    }

    function getStationJournalModuleConfig() {
        return {
            moduleId: MODULE_ID,
            folderName: STATION_JOURNAL_FOLDER_NAME,
            journalFlag: STATION_JOURNAL_FLAG,
            manifestSettingKey: STATION_JOURNAL_MANIFEST_SETTING_KEY,
            manifestVersion: STATION_JOURNAL_MANIFEST_VERSION,
            descriptors: STATION_JOURNAL_DESCRIPTORS,
            isPrimaryActiveGM
        };
    }

    async function syncStationJournals(options = {}) {
        return getJournalModule().sync(getStationJournalModuleConfig(), options);
    }

    async function ensureStationJournalArchive() {
        return getJournalModule().ensureArchive(getStationJournalModuleConfig());
    }

    async function generateStationJournalsFromDashboard(dashboard) {
        return getJournalModule().generateFromDashboard(dashboard, getStationJournalModuleConfig());
    }

    function showPlanetRecord(dashboard, rawName) {
        const resultText = dashboard.querySelector("#isl-planet-result-text");
        const popup = dashboard.querySelector("#isl-planet-popup");
        const popupTitle = dashboard.querySelector("#isl-planet-popup-title");
        const zoomReadout = dashboard.querySelector("#isl-planet-zoom-value");
        const image = dashboard.querySelector("#isl-planet-image");
        const fallback = dashboard.querySelector("#isl-planet-fallback");
        const normalizedInput = normalizePlanetName(rawName);

        if (!normalizedInput) {
            if (resultText) resultText.textContent = "Enter target designation.";
            image?.classList.add("hidden");
            fallback?.classList.add("hidden");
            popup?.classList.add("hidden");
            return;
        }

        const lookupName = planetAliases[normalizedInput] || normalizedInput;
        if (!hasPlanetNavData({ fields: { Planet: lookupName } }, getDashboardNavData(dashboard))) {
            if (resultText) resultText.textContent = "Planetary NavData package required for target analysis.";
            image?.classList.add("hidden");
            fallback?.classList.add("hidden");
            popup?.classList.add("hidden");
            return;
        }
        const fileName = planetImageByName[lookupName];
        setLastPlanetRecord(dashboard, rawName);
        void focusMapOnPlanet(dashboard, rawName);

        if (!fileName) {
            showIncompleteRecord(dashboard, normalizedInput);
            return;
        }

        const displayName = fileName.replace(/\.png$/i, "");
        openPlanetPopup(dashboard);
        if (popupTitle) popupTitle.textContent = displayName;
        zoomReadout?.classList.remove("hidden");
        setPlanetZoom(dashboard, ZOOM_MIN);
        fallback?.classList.add("hidden");
        image?.classList.remove("hidden");
        if (image) {
            const requestId = String(Number(image.dataset.requestId || 0) + 1);
            image.dataset.requestId = requestId;
            image.dataset.planetName = displayName;
            image.alt = `${displayName} intelligence dossier image`;
            image.onload = () => {
                if (image.dataset.requestId !== requestId) return;
                image.onload = null;
                image.onerror = null;
            };
            image.onerror = () => {
                if (image.dataset.requestId !== requestId) return;
                showIncompleteRecord(dashboard, displayName);
            };
            image.src = encodedImagePath(fileName);
        }
        if (resultText) resultText.textContent = `Dossier projected: ${displayName}`;
    }

    function setLastPlanetRecord(dashboard, rawName) {
        const recordName = String(rawName ?? "").trim();
        if (!recordName) return;
        dashboard.dataset.lastPlanetRecord = recordName;
        const recallButton = dashboard.querySelector("[data-action='recall-planet-record']");
        if (recallButton) recallButton.disabled = false;
    }

    async function focusMapOnPlanet(dashboard, rawName) {
        try {
            await loadGridCoordinateRecords();
            if (!dashboard.isConnected || !dashboard.querySelector("#isl-planet-tab")?.classList.contains("active")) return;
            const target = resolveAstroNavTarget(rawName);
            if (!target?.grid) return;
            focusMapOnGrid(dashboard, target.grid, target.mapPosition);
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to focus planet location`, error);
        }
    }

    function focusMapOnGrid(dashboard, grid, mapPosition = "") {
        const viewport = dashboard.querySelector("#isl-map-viewport");
        const stage = dashboard.querySelector("#isl-map-stage");
        const point = getMapPointForSpecialPosition(mapPosition) || gridToMapPoint(grid);
        if (!viewport || !stage || !point) return;

        stage.style.setProperty("--isl-map-focus-zoom", `${PLANET_FOCUS_ZOOM}%`);
        setPlanetFocusIndicator(dashboard, grid);
        centerMapViewport(viewport, stage, point);
    }

    function centerMapViewport(viewport, stage, point) {
        const centerGrid = () => {
            const left = Math.max(0, ((stage.clientWidth * point.x) / 100) - (viewport.clientWidth / 2));
            const top = Math.max(0, ((stage.clientHeight * point.y) / 100) - (viewport.clientHeight / 2));
            if (typeof viewport.scrollTo === "function") {
                viewport.scrollTo({ left, top, behavior: "smooth" });
            } else {
                viewport.scrollLeft = left;
                viewport.scrollTop = top;
            }
        };

        if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(centerGrid);
        else centerGrid();
    }

    function clearPlanetMapFocus(dashboard) {
        const viewport = dashboard.querySelector("#isl-map-viewport");
        const stage = dashboard.querySelector("#isl-map-stage");
        const marker = dashboard.querySelector("#isl-planet-focus-marker");

        stage?.style.removeProperty("--isl-map-focus-zoom");
        marker?.classList.add("hidden");
        delete dashboard.dataset.focusedPlanetGrid;
        if (viewport) {
            viewport.scrollLeft = 0;
            viewport.scrollTop = 0;
        }
    }

    function setPlanetFocusIndicator(dashboard, grid, calibration = getGridCalibration()) {
        const marker = dashboard.querySelector("#isl-planet-focus-marker");
        const normalizedGrid = normalizeGrid(grid);
        const cell = gridToMapCell(normalizedGrid, calibration);
        if (!marker || !cell) return;

        dashboard.dataset.focusedPlanetGrid = normalizedGrid;
        marker.style.left = `${mapGridX(cell.col, calibration)}%`;
        marker.style.top = `${mapGridY(cell.row, calibration)}%`;
        marker.style.width = `${mapGridCellWidth(calibration)}%`;
        marker.style.height = `${mapGridCellHeight(calibration)}%`;
        marker.classList.remove("hidden");
    }

    function showIncompleteRecord(dashboard, label = "Intelligence Dossier") {
        const resultText = dashboard.querySelector("#isl-planet-result-text");
        const popup = dashboard.querySelector("#isl-planet-popup");
        const popupTitle = dashboard.querySelector("#isl-planet-popup-title");
        const zoomReadout = dashboard.querySelector("#isl-planet-zoom-value");
        const image = dashboard.querySelector("#isl-planet-image");
        const fallback = dashboard.querySelector("#isl-planet-fallback");

        openPlanetPopup(dashboard);
        if (popupTitle) popupTitle.textContent = label;
        zoomReadout?.classList.add("hidden");
        setPlanetZoom(dashboard, ZOOM_MIN);
        image?.classList.add("hidden");
        if (image) {
            image.dataset.requestId = String(Number(image.dataset.requestId || 0) + 1);
            image.onload = null;
            image.onerror = null;
        }
        image?.removeAttribute("src");
        if (image) image.alt = "";
        fallback?.classList.remove("hidden");
        if (resultText) resultText.textContent = "Intelligence Database Incomplete";
    }

    function closePlanetPopup(dashboard) {
        dashboard.querySelector("#isl-planet-popup")?.classList.add("hidden");
    }

    function openPlanetPopup(dashboard) {
        const popup = dashboard.querySelector("#isl-planet-popup");
        popup?.classList.remove("hidden");
        requestAnimationFrame(() => layoutPlanetPopup(dashboard));
    }

    function beginPlanetPopupDrag(dashboard, event) {
        if (event.button !== 0) return;
        if (event.target.closest("button, input, output")) return;

        const popup = dashboard.querySelector("#isl-planet-popup");
        if (!popup || popup.classList.contains("hidden")) return;

        event.preventDefault();
        popup.dataset.moved = "true";

        const dashboardRect = dashboard.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const pointerOffsetX = event.clientX - popupRect.left;
        const pointerOffsetY = event.clientY - popupRect.top;

        setPlanetPopupPosition(dashboard, popupRect.left - dashboardRect.left, popupRect.top - dashboardRect.top);

        const movePopup = (moveEvent) => {
            const nextLeft = moveEvent.clientX - dashboardRect.left - pointerOffsetX;
            const nextTop = moveEvent.clientY - dashboardRect.top - pointerOffsetY;
            setPlanetPopupPosition(dashboard, nextLeft, nextTop);
        };

        const stopDragging = () => {
            window.removeEventListener("pointermove", movePopup);
            window.removeEventListener("pointerup", stopDragging);
            window.removeEventListener("pointercancel", stopDragging);
        };

        window.addEventListener("pointermove", movePopup);
        window.addEventListener("pointerup", stopDragging);
        window.addEventListener("pointercancel", stopDragging);
    }

    function layoutPlanetPopup(dashboard) {
        const popup = dashboard.querySelector("#isl-planet-popup");
        if (!popup || popup.classList.contains("hidden")) return;

        if (popup.dataset.moved === "true") {
            const left = Number.parseFloat(popup.style.left) || 0;
            const top = Number.parseFloat(popup.style.top) || 0;
            setPlanetPopupPosition(dashboard, left, top);
            return;
        }

        positionPlanetPopupDefault(dashboard);
    }

    function positionPlanetPopupDefault(dashboard) {
        const popup = dashboard.querySelector("#isl-planet-popup");
        const panel = dashboard.querySelector(".isl-panel");
        if (!popup) return;

        const dashboardRect = dashboard.getBoundingClientRect();
        const panelRect = panel?.getBoundingClientRect();
        const panelWidth = panelRect ? Math.max(0, panelRect.right - dashboardRect.left) : 0;
        const mapWidth = Math.max(0, dashboardRect.width - panelWidth);
        const left = panelWidth + ((mapWidth - popup.offsetWidth) / 2);
        const top = (dashboardRect.height - popup.offsetHeight) / 2;

        setPlanetPopupPosition(dashboard, left, top);
    }

    function setPlanetPopupPosition(dashboard, left, top) {
        const popup = dashboard.querySelector("#isl-planet-popup");
        if (!popup) return;

        const dashboardRect = dashboard.getBoundingClientRect();
        const maxLeft = Math.max(0, dashboardRect.width - popup.offsetWidth);
        const maxTop = Math.max(0, dashboardRect.height - popup.offsetHeight);
        const nextLeft = Math.min(maxLeft, Math.max(0, left));
        const nextTop = Math.min(maxTop, Math.max(0, top));

        popup.style.left = `${nextLeft}px`;
        popup.style.top = `${nextTop}px`;
    }

    function zoomPlanetAtCursor(dashboard, event) {
        const image = dashboard.querySelector("#isl-planet-image");
        if (!image || image.classList.contains("hidden")) return;

        event.preventDefault();

        const currentZoom = Number(image.dataset.zoom || ZOOM_MIN);
        const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setPlanetZoom(dashboard, currentZoom + delta, event);
    }

    function setPlanetZoom(dashboard, value, anchorEvent = null) {
        const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(value) || ZOOM_MIN));
        const image = dashboard.querySelector("#isl-planet-image");
        const popupBody = dashboard.querySelector(".isl-planet-popup-body");
        const readout = dashboard.querySelector("#isl-planet-zoom-value");
        const viewportRect = popupBody?.getBoundingClientRect();
        const pointerX = anchorEvent && viewportRect ? anchorEvent.clientX - viewportRect.left : 0;
        const pointerY = anchorEvent && viewportRect ? anchorEvent.clientY - viewportRect.top : 0;
        const relativeX = anchorEvent && image ? (popupBody.scrollLeft + pointerX) / Math.max(image.offsetWidth, 1) : 0;
        const relativeY = anchorEvent && image ? (popupBody.scrollTop + pointerY) / Math.max(image.offsetHeight, 1) : 0;

        if (image) {
            image.dataset.zoom = String(zoom);
            image.style.width = `${zoom}%`;
            image.style.height = `${zoom}%`;
        }
        if (readout) readout.textContent = `${zoom}%`;

        if (anchorEvent && popupBody && image) {
            popupBody.scrollLeft = (relativeX * image.offsetWidth) - pointerX;
            popupBody.scrollTop = (relativeY * image.offsetHeight) - pointerY;
        } else if (popupBody) {
            popupBody.scrollLeft = 0;
            popupBody.scrollTop = 0;
        }
    }

    async function playCodexStartup(dashboard) {
        const startupSequence = globalThis.GalacticOperationsConsoleModules?.startupSequence;
        if (!startupSequence) {
            console.error(`${MODULE_ID} | Startup sequence module was not loaded.`);
            return;
        }

        if (codexStartupPlayed) {
            dashboard.querySelector("#isl-codex-startup")?.classList.add("hidden");
            return;
        }

        codexStartupPlayed = true;
        await startupSequence.play(dashboard, {
            lines: CODEX_STARTUP_LINES,
            accessGrantedLine: CODEX_ACCESS_GRANTED_LINE,
            inlineReplacements: CODEX_STARTUP_INLINE_REPLACEMENTS,
            timing: {
                displayDuration: CODEX_STARTUP_DISPLAY_DURATION_MS,
                initialDelay: CODEX_STARTUP_INITIAL_DELAY_MS,
                typeDelay: CODEX_STARTUP_TYPE_DELAY_MS,
                ellipsisTypeDelay: CODEX_STARTUP_ELLIPSIS_TYPE_DELAY_MS,
                ellipsisRepeatDelay: CODEX_STARTUP_ELLIPSIS_REPEAT_DELAY_MS,
                replacementFade: CODEX_STARTUP_REPLACEMENT_FADE_MS,
                inlineResultDwell: CODEX_STARTUP_INLINE_RESULT_DWELL_MS
            }
        });
    }

    function getMissionBrief() {
        let missionBrief = DEFAULT_MISSION_BRIEF;

        try {
            const savedBrief = game.settings.get(MODULE_ID, MISSION_BRIEF_SETTING_KEY);
            if (typeof savedBrief === "string") missionBrief = savedBrief;
        } catch (error) {
            missionBrief = DEFAULT_MISSION_BRIEF;
        }

        if (missionBrief === DEFAULT_MISSION_BRIEF) {
            try {
                const legacyData = game.settings.get(MODULE_ID, LEGACY_OPS_SETTING_KEY);
                if (typeof legacyData?.mission === "string" && legacyData.mission.trim()) {
                    missionBrief = legacyData.mission;
                }
            } catch (error) {
                // Legacy OPS data may not exist in worlds that never used the editable OPS build.
            }
        }

        return missionBrief;
    }

    function applyMissionBriefToDashboard(dashboard, missionBrief) {
        const value = String(missionBrief ?? DEFAULT_MISSION_BRIEF);

        updateMissionStaticText(dashboard, value);
        dashboard.querySelectorAll("[data-mission-field]").forEach((field) => {
            field.value = value;
        });
    }

    function applyMissionBriefToOpenDashboards(missionBrief) {
        document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
            applyMissionBriefToDashboard(dashboard, missionBrief);
            setMissionStatus(dashboard, "Confidential mission data synchronized.", "");
        });
    }

    async function saveMissionBriefFromDashboard(dashboard) {
        if (!game.user?.isGM) {
            setMissionStatus(dashboard, "GM clearance required to save mission orders.", "error");
            return;
        }

        const field = dashboard.querySelector("[data-mission-field]");
        const missionBrief = field?.value ?? DEFAULT_MISSION_BRIEF;

        try {
            await persistMissionBrief(missionBrief);
            setMissionStatus(dashboard, "Mission orders saved.", "");
        } catch (error) {
            console.error(`${MODULE_ID} | Failed to save mission brief`, error);
            setMissionStatus(dashboard, "Mission orders save failed.", "error");
        }
    }

    async function persistMissionBrief(missionBrief) {
        if (!game.user?.isGM) return;

        const value = String(missionBrief ?? DEFAULT_MISSION_BRIEF);
        await game.settings.set(MODULE_ID, MISSION_BRIEF_SETTING_KEY, value);
        applyMissionBriefToOpenDashboards(value);

        game.socket?.emit(SOCKET_NAME, {
            type: "missionBriefSaved",
            missionBrief: value
        });
    }

    function handleSocketMessage(message) {
        if (!message || typeof message !== "object") return;

        if (message.type === "missionBriefSaved") {
            applyMissionBriefToOpenDashboards(message.missionBrief);
            return;
        }

        if (message.type === "gridAlignmentSaved") {
            applyGridAlignmentToOpenDashboards(message.alignment);
            return;
        }

        if (message.type === "gridAlignmentLockChanged") {
            applyGridAlignmentUnlockedToOpenDashboards(Boolean(message.unlocked));
            return;
        }

        if (message.type === "restrictionTierAccessChanged") {
            applyRestrictionTierAccessToOpenDashboards(message.access);
            return;
        }

        if (message.type === "navDataChanged") {
            applyNavDataToOpenDashboards(message.navData);
            return;
        }

        if (message.type === "requestLiveStateUpdate") {
            if (game.user?.isGM && isPrimaryActiveGM()) {
                persistLiveState(message.partial, message.requesterId).catch((error) => {
                    console.error(`${MODULE_ID} | Failed to process live telemetry request`, error);
                });
            }
            return;
        }

        if (message.type === "liveStateUpdated") {
            applyLiveStateToOpenDashboards(message.state, { changedKeys: message.changedKeys });

            if (message.requesterId === game.user?.id) {
                ui.notifications?.info("Operational telemetry synchronized.");
            }
            return;
        }

        if (message.type === "requestStealthSystems") {
            if (game.user?.isGM && isPrimaryActiveGM()) {
                persistStealthSystemsEngaged(message.engaged, message.requesterId);
            }
            return;
        }

        if (message.type === "stealthSystemsUpdated") {
            applyStealthSystemsToOpenDashboards(Boolean(message.engaged));

            if (message.requesterId === game.user?.id) {
                ui.notifications?.info(message.engaged ? "Deception systems engaged." : "Deception systems on standby.");
            }
            return;
        }

        if (message.type === "systemWarning") {
            if (message.senderId === game.user?.id) return;
            rememberTransmission(message.payload);
            applySystemWarningToOpenDashboards(message.payload);
            return;
        }

        if (message.type === "commlinkAlertChanged") {
            applyCommlinkAlertToUi(Boolean(message.active));
        }
    }

    function updateMissionStaticText(dashboard, missionBrief) {
        const value = String(missionBrief ?? DEFAULT_MISSION_BRIEF);
        dashboard.querySelectorAll("[data-mission-static]").forEach((staticField) => {
            staticField.textContent = value;
        });
    }

    function setMissionStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-mission-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function getActiveGMs() {
        const users = typeof game.users?.filter === "function"
            ? game.users.filter((user) => user.active && user.isGM)
            : Array.from(game.users ?? []).filter((user) => user.active && user.isGM);

        return users.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }

    function hasActiveGM() {
        return getActiveGMs().length > 0;
    }

    function isPrimaryActiveGM() {
        return getActiveGMs()[0]?.id === game.user?.id;
    }

    function createApplicationClass() {
        const LegacyApplication = globalThis.Application ?? globalThis.foundry?.appv1?.api?.Application;
        const ApplicationV2 = globalThis.foundry?.applications?.api?.ApplicationV2;

        if (LegacyApplication) {
            return class ImperialStarLogLegacyApp extends LegacyApplication {
                static get defaultOptions() {
                    const options = {
                        id: "imperial-star-log",
                        title: "Galactic Operations Console",
                        template: templatePath,
                        width: 1400,
                        height: 990,
                        resizable: true,
                        classes: ["imperial-star-log-app"]
                    };

                    return globalThis.foundry?.utils?.mergeObject
                        ? foundry.utils.mergeObject(super.defaultOptions, options, { inplace: false })
                        : { ...super.defaultOptions, ...options };
                }

                getData(options) {
                    const data = super.getData?.(options) ?? {};
                    return { ...data, ...getTemplateData() };
                }

                activateListeners(html) {
                    super.activateListeners?.(html);
                    activateDashboardListeners(html?.[0] ?? html);
                }

                async close(options) {
                    cleanupDashboardResources(this.element?.[0] ?? this.element);
                    return super.close(options);
                }
            };
        }

        if (ApplicationV2) {
            return class ImperialStarLogApplicationV2 extends ApplicationV2 {
                static DEFAULT_OPTIONS = {
                    id: "imperial-star-log",
                    tag: "section",
                    classes: ["imperial-star-log-app"],
                    window: {
                        title: "Galactic Operations Console",
                        icon: "fas fa-satellite-dish",
                        resizable: true
                    },
                    position: {
                        width: 1400,
                        height: 990
                    }
                };

                async _renderHTML() {
                    return renderTemplate(templatePath, getTemplateData());
                }

                _replaceHTML(result, content) {
                    cleanupDashboardResources(content);
                    content.innerHTML = result;
                    activateDashboardListeners(content);
                }
            };
        }

        return null;
    }

    function openStarLog() {
        if (!ImperialStarLogApp) {
            ui.notifications?.error("Galactic Operations Console could not find a compatible Foundry application API.");
            return null;
        }

        if (starLogApp?.rendered) {
            starLogApp.bringToFront?.();
            return starLogApp;
        }

        starLogApp = new ImperialStarLogApp();
        starLogApp.render(true);
        return starLogApp;
    }

    function getCommlinkAlertActive() {
        try {
            return Boolean(game.settings.get(MODULE_ID, COMMLINK_ALERT_SETTING_KEY));
        } catch (error) {
            return false;
        }
    }

    async function toggleCommlinkAlert() {
        if (!game.user?.isGM) return;

        const active = !getCommlinkAlertActive();
        await game.settings.set(MODULE_ID, COMMLINK_ALERT_SETTING_KEY, active);
        applyCommlinkAlertToUi(active);
        game.socket?.emit(SOCKET_NAME, {
            type: "commlinkAlertChanged",
            active
        });
        ui.notifications?.info(active ? "Player commlink alert activated." : "Player commlink alert cleared.");
    }

    function mountCommlinkControl() {
        const existing = document.getElementById("isl-commlink-control");
        if (existing) {
            applyCommlinkAlertToUi(getCommlinkAlertActive());
            return;
        }

        if (!document.body) return;

        const control = document.createElement("div");
        control.id = "isl-commlink-control";
        control.className = "isl-commlink-control";
        control.setAttribute("role", "toolbar");
        control.setAttribute("aria-label", "Galactic Operations quick access");

        if (game.user?.isGM) {
            const isbButton = document.createElement("button");
            isbButton.type = "button";
            isbButton.className = "isl-quick-access-button isl-isb-conf-trigger";
            isbButton.dataset.quickAction = "gm-isb-conf";
            isbButton.title = "Open ISB Confidential Terminal";
            isbButton.setAttribute("aria-label", "Open ISB Confidential Terminal");
            isbButton.innerHTML = '<i class="fas fa-user-secret" aria-hidden="true"></i>';
            isbButton.addEventListener("click", () => focusDashboardView("isl-confidential-tab"));
            control.append(isbButton);

            const alertButton = document.createElement("button");
            alertButton.type = "button";
            alertButton.className = "isl-quick-access-button isl-commlink-alert-trigger";
            alertButton.dataset.quickAction = "gm-commlink-alert";
            alertButton.title = "Toggle player commlink alert";
            alertButton.setAttribute("aria-label", "Toggle player commlink alert");
            alertButton.innerHTML = '<i class="fas fa-broadcast-tower" aria-hidden="true"></i>';
            alertButton.addEventListener("click", () => {
                toggleCommlinkAlert().catch((error) => {
                    console.error(`${MODULE_ID} | Failed to toggle commlink alert`, error);
                });
            });
            control.append(alertButton);
        }

        QUICK_ACCESS_BUTTONS.forEach((definition) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "isl-quick-access-button";
            button.dataset.quickAction = definition.action;
            button.title = definition.action === "commlink" && game.user?.isGM
                ? "Commlink. Right-click to toggle player commlink alert."
                : definition.label;
            button.setAttribute("aria-label", definition.label);

            const icon = document.createElement("img");
            icon.src = `${assetRoot}assets/quick-access/${definition.icon}`;
            icon.alt = "";
            icon.draggable = false;
            button.append(icon);

            button.addEventListener("click", () => openQuickAccessView(definition.action));

            if (definition.action === "commlink" && game.user?.isGM) {
                button.classList.add("isl-commlink-open");
                button.addEventListener("contextmenu", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleCommlinkAlert().catch((error) => {
                        console.error(`${MODULE_ID} | Failed to toggle commlink alert`, error);
                    });
                });
            }

            control.append(button);
        });
        document.body.append(control);
        applyCommlinkAlertToUi(getCommlinkAlertActive());
    }

    function applyCommlinkAlertToUi(active = getCommlinkAlertActive()) {
        const isActive = Boolean(active);
        document.querySelectorAll("#isl-commlink-control").forEach((control) => {
            control.classList.toggle("is-alerting", isActive);
            const button = control.querySelector("[data-quick-action='commlink']");
            if (button && game.user?.isGM) button.setAttribute("aria-pressed", String(isActive));
            const alertButton = control.querySelector("[data-quick-action='gm-commlink-alert']");
            if (alertButton) alertButton.setAttribute("aria-pressed", String(isActive));
        });
    }

    function addSceneControlButton(controls) {
        const tool = {
            name: "imperial-star-log",
            title: "Galactic Operations Console",
            icon: "fas fa-satellite-dish",
            button: true,
            onClick: openStarLog
        };

        if (Array.isArray(controls)) {
            const notesControl = controls.find((control) => ["notes", "journal"].includes(control.name));
            const targetControl = notesControl ?? controls[0];

            if (targetControl?.tools && Array.isArray(targetControl.tools)) {
                if (!targetControl.tools.some((existingTool) => existingTool.name === tool.name)) {
                    targetControl.tools.push(tool);
                }
                return;
            }

            controls.push({
                name: "imperial-star-log",
                title: "Galactic Operations Console",
                icon: "fas fa-satellite-dish",
                layer: "controls",
                tools: [tool],
                activeTool: "imperial-star-log"
            });
            return;
        }

        if (!controls || typeof controls !== "object") return;

        const targetControl = controls.notes ?? controls.journal ?? Object.values(controls)[0];
        if (!targetControl?.tools) return;

        if (Array.isArray(targetControl.tools)) {
            if (!targetControl.tools.some((existingTool) => existingTool.name === tool.name)) {
                targetControl.tools.push(tool);
            }
            return;
        }

        targetControl.tools["imperial-star-log"] = tool;
    }

    Hooks.once("init", () => {
        ImperialStarLogApp = createApplicationClass();

        game.settings.register(MODULE_ID, MISSION_BRIEF_SETTING_KEY, {
            name: "Galactic Operations Console Mission Brief",
            scope: "world",
            config: false,
            type: String,
            default: DEFAULT_MISSION_BRIEF
        });

        game.settings.register(MODULE_ID, LEGACY_OPS_SETTING_KEY, {
            name: "Galactic Operations Console Legacy OPS Data",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        });

        game.settings.register(MODULE_ID, LIVE_STATE_SETTING_KEY, {
            name: "Galactic Operations Console Live Telemetry",
            scope: "world",
            config: false,
            type: Object,
            default: DEFAULT_LIVE_STATE,
            onChange: (state) => {
                applyLiveStateToOpenDashboards(state);
            }
        });

        game.settings.register(MODULE_ID, STEALTH_SYSTEMS_SETTING_KEY, {
            name: "Galactic Operations Console Stealth Systems",
            scope: "world",
            config: false,
            type: Boolean,
            default: false
        });

        game.settings.register(MODULE_ID, GRID_ALIGNMENT_SETTING_KEY, {
            name: "Galactic Operations Console Grid Alignment",
            scope: "world",
            config: false,
            type: Object,
            default: DEFAULT_MAP_GRID_CALIBRATION
        });

        game.settings.register(MODULE_ID, GRID_ALIGNMENT_UNLOCKED_SETTING_KEY, {
            name: "Galactic Operations Console Grid Alignment Lock",
            scope: "world",
            config: false,
            type: Boolean,
            default: false
        });

        game.settings.register(MODULE_ID, RESTRICTION_TIER_ACCESS_SETTING_KEY, {
            name: "Galactic Operations Console Restriction Tier Access",
            scope: "world",
            config: false,
            type: Object,
            default: getDefaultRestrictionTierAccess()
        });

        game.settings.register(MODULE_ID, NAV_DATA_SETTING_KEY, {
            name: "Galactic Operations Console NavData Library",
            scope: "world",
            config: false,
            type: Object,
            default: getDefaultNavData(),
            onChange: (navData) => {
                applyNavDataToOpenDashboards(navData);
            }
        });

        game.settings.register(MODULE_ID, MAP_INDICATORS_HIDDEN_SETTING_KEY, {
            name: "Galactic Operations Console Sector Indicator Visibility",
            scope: "client",
            config: false,
            type: Boolean,
            default: false,
            onChange: (hidden) => {
                document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
                    applyMapIndicatorsHiddenToDashboard(dashboard, hidden);
                });
            }
        });

        game.settings.register(MODULE_ID, WARNING_SYSTEM_VISITS_SETTING_KEY, {
            name: "Galactic Operations Console Warning System Visits",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        });

        game.settings.register(MODULE_ID, LIVE_HAIL_LOG_SETTING_KEY, {
            name: "Galactic Operations Console Live Hail Log",
            scope: "world",
            config: false,
            type: Array,
            default: [],
            onChange: (hails) => {
                applyLiveHailLogToOpenDashboards(hails);
            }
        });

        game.settings.register(MODULE_ID, COMMLINK_ALERT_SETTING_KEY, {
            name: "Galactic Operations Console Commlink Alert",
            scope: "world",
            config: false,
            type: Boolean,
            default: false,
            onChange: (active) => {
                applyCommlinkAlertToUi(Boolean(active));
            }
        });

        game.settings.register(MODULE_ID, STATION_JOURNAL_MANIFEST_SETTING_KEY, {
            name: "Galactic Operations Console Station Journal Manifest Version",
            scope: "world",
            config: false,
            type: Number,
            default: 0
        });

        game.keybindings?.register(MODULE_ID, "open", {
            name: "Open Galactic Operations Console",
            hint: "Open the Galactic Operations Console dashboard.",
            editable: [
                {
                    key: "KeyL",
                    modifiers: ["Control"]
                }
            ],
            onDown: () => {
                openStarLog();
                return true;
            },
            restricted: false
        });
    });

    Hooks.once("ready", () => {
        game.socket?.on(SOCKET_NAME, handleSocketMessage);
        mountCommlinkControl();

        const api = {
            open: openStarLog,
            getMissionBrief,
            saveMissionBrief: persistMissionBrief,
            getStealthSystemsEngaged,
            setStealthSystemsEngaged: persistStealthSystemsEngaged,
            getGridCalibration,
            saveGridAlignment: persistGridAlignment,
            getGridAlignmentUnlocked,
            getRestrictionTierAccess,
            saveRestrictionTierAccess: persistRestrictionTierAccess,
            getNavData,
            saveNavData: persistNavData,
            getCommlinkAlertActive,
            toggleCommlinkAlert,
            syncStationJournals,
            planets: planetRecords.map((record) => ({ ...record }))
        };

        globalThis.ImperialStarLog = api;
        globalThis.GalacticOperationsConsole = api;

        const module = game.modules.get(MODULE_ID);
        if (module) module.api = api;

        if (game.user?.isGM && isPrimaryActiveGM()) {
            ensureStationJournalArchive().catch((error) => {
                console.error(`${MODULE_ID} | Failed to create station briefing journals`, error);
            });
        }
    });

    Hooks.on("getSceneControlButtons", addSceneControlButton);
    Hooks.on("renderSceneControls", mountCommlinkControl);
    Hooks.on("canvasReady", mountCommlinkControl);
})();

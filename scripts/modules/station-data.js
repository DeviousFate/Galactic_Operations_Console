(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    const stationDescriptors = [
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

    modules.stationData = {
        getDescriptors() {
            return stationDescriptors.map((descriptor) => ({ ...descriptor }));
        }
    };
})();

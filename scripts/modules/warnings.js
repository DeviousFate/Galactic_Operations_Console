(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    let definitionsPromise;
    let isdNamesPromise;
    let definitionsLoadStatus = "unloaded";
    let isdNamesLoadStatus = "unloaded";

    modules.warnings = {
        async triggerFirstVisit(state, config) {
            if (!game.user?.isGM) return;

            const liveState = config.normalizeLiveState(state);
            const definition = await getDefinitionForSystem(liveState.location, config);
            if (!definition || !(await claimFirstVisit(liveState.location, config))) return;

            const payload = await createPayload(
                definition,
                liveState.location,
                liveState.shipGrid,
                selectFirstVisitTransmission(definition),
                "first-visit",
                config
            );
            if (payload) await config.transmit(payload);
        },

        async triggerManualGrade(dashboard, rawGrade, config) {
            if (!game.user?.isGM) {
                config.setStatus(dashboard, "GM clearance required to transmit warning protocols.", "error");
                return;
            }

            const grade = Number.parseInt(rawGrade, 10);
            const definition = (await loadDefinitions(config)).find((entry) => entry.grade === grade);
            if (!definition) {
                config.setStatus(dashboard, `Grade ${rawGrade} warning protocol unavailable.`, "error");
                return;
            }

            const liveState = config.getLiveState();
            const payload = await createPayload(
                definition,
                liveState.location,
                liveState.shipGrid,
                selectManualTransmission(definition),
                "manual",
                config
            );
            if (!payload) {
                config.setStatus(dashboard, `Grade ${grade} warning protocol unavailable.`, "error");
                return;
            }

            await config.transmit(payload);
            config.setStatus(dashboard, `Grade ${grade} warning transmitted.`, "");
        },

        getLoadStatus() {
            return { definitions: definitionsLoadStatus, isdNames: isdNamesLoadStatus };
        },

        async preload(config) {
            await loadDefinitions(config);
        }
    };

    async function loadDefinitions(config) {
        if (!definitionsPromise) {
            definitionsLoadStatus = "loading";
            definitionsPromise = fetch(config.warningDefinitionsPath)
                .then((response) => {
                    if (!response.ok) throw new Error(`Unable to load warning protocols (${response.status}).`);
                    return response.text();
                })
                .then((text) => {
                    definitionsLoadStatus = "ready";
                    return parseDefinitions(text);
                })
                .catch((error) => {
                    console.error(`${config.moduleId} | Failed to load warning protocols`, error);
                    definitionsPromise = null;
                    definitionsLoadStatus = "failed";
                    return [];
                });
        }

        return definitionsPromise;
    }

    async function loadIsdNames(config) {
        if (!isdNamesPromise) {
            isdNamesLoadStatus = "loading";
            isdNamesPromise = fetch(config.isdNamesPath)
                .then((response) => {
                    if (!response.ok) throw new Error(`Unable to load ISD names (${response.status}).`);
                    return response.text();
                })
                .then((text) => {
                    isdNamesLoadStatus = "ready";
                    return text.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
                })
                .catch((error) => {
                    console.error(`${config.moduleId} | Failed to load ISD names`, error);
                    isdNamesPromise = null;
                    isdNamesLoadStatus = "failed";
                    return [];
                });
        }

        return isdNamesPromise;
    }

    function parseDefinitions(text) {
        return String(text ?? "")
            .split(/(?=^Grade\s+[1-5]:)/m)
            .map((section) => section.trim())
            .filter(Boolean)
            .map((section) => {
                const header = section.match(/^Grade\s+([1-5]):\s*(.+)$/m);
                const systems = section.match(/(?:\r?\n){2}([^\r\n]+)(?:\r?\n){2}Protocol:/)?.[1]
                    ?.split(",").map((system) => system.trim()).filter(Boolean) || [];
                const transmissions = [];
                const pattern = /(?:^|(?:\r?\n){2})([A-Z][^\r\n]*?):[ \t]*(?:\r?\n){2}([\s\S]*?)(?=(?:\r?\n){2}[A-Z][^\r\n]*?:[ \t]*(?:\r?\n){2}|$)/g;
                let match;
                while ((match = pattern.exec(section))) {
                    transmissions.push({
                        title: match[1].trim(),
                        message: match[2].trim().replace(/^["\u201c]+/, "").replace(/["\u201d]+$/, "").trim()
                    });
                }

                return header && systems.length && transmissions.length
                    ? { grade: Number(header[1]), label: header[2].trim(), systems, transmissions }
                    : null;
            })
            .filter(Boolean);
    }

    async function getDefinitionForSystem(system, config) {
        const definitions = await loadDefinitions(config);
        const normalizedSystem = config.normalizePlanetName(system);
        const exactMatch = definitions.find((definition) => definition.systems.some((entry) => (
            config.normalizePlanetName(entry) === normalizedSystem
        )));
        if (exactMatch) return exactMatch;

        const restriction = config.restrictionTierByPlanetName[normalizedSystem];
        return restriction ? definitions.find((definition) => definition.grade === restriction.tier.id) || null : null;
    }

    function selectFirstVisitTransmission(definition) {
        return definition.transmissions.find((transmission) => /automated/i.test(transmission.title))
            || definition.transmissions[0]
            || null;
    }

    function selectManualTransmission(definition) {
        return definition.transmissions.find((transmission) => /live/i.test(transmission.title))
            || definition.transmissions[0]
            || null;
    }

    async function createPayload(definition, system, grid, transmission, trigger, config) {
        if (!definition || !transmission) return null;

        const isLive = /\blive\b/i.test(transmission.title);
        const isdNames = definition.grade === 3 ? await loadIsdNames(config) : [];
        const isdName = isdNames.length ? isdNames[Math.floor(Math.random() * isdNames.length)] : "Unidentified Star Destroyer";
        const message = formatMessage(transmission.message, system, isdName, config);

        return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            grade: definition.grade,
            label: definition.label,
            system: String(system ?? "").trim() || "Unknown System",
            grid: config.normalizeGrid(grid),
            transmissionTitle: transmission.title,
            message,
            isLive,
            isdName: definition.grade === 3 ? isdName : "",
            trigger,
            timestamp: Date.now()
        };
    }

    function formatMessage(message, system, isdName, config) {
        const orbitalYards = config.normalizePlanetName(system) === "KUAT" ? "Kuat Drive Yards" : "Fondor Ship Yards";
        return String(message ?? "")
            .replace(/\(Read Ship Transponder or if N\/A use default 'Unidentified Vessel'\)/gi, config.defaultShipTransponder)
            .replace(/\(Insert ISD Name\)/gi, isdName)
            .replace(/\(Kuat Drive or Fondor Ship\) Yards/gi, orbitalYards);
    }

    async function claimFirstVisit(system, config) {
        if (!game.user?.isGM) return false;
        const key = config.normalizePlanetName(system);
        if (!key) return false;

        const visits = getVisits(config);
        if (visits[key]) return false;

        await game.settings.set(config.moduleId, config.warningVisitsSettingKey, {
            ...visits,
            [key]: Date.now()
        });
        return true;
    }

    function getVisits(config) {
        try {
            const visits = game.settings.get(config.moduleId, config.warningVisitsSettingKey);
            return visits && typeof visits === "object" ? visits : {};
        } catch (error) {
            return {};
        }
    }
})();

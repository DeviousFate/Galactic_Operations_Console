(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    const TIER_FLEET_POSTURES = {
        5: {
            designation: "BLACK-SITE EXCLUSION CORDON",
            purpose: "Erase unsanctioned traffic before it can observe, record, or depart with protected Imperial intelligence.",
            composition: [
                "1 Imperial-class Star Destroyer command ship",
                "1 Interdictor cruiser",
                "2 Arquitens-class command cruisers",
                "2 Gozanti-class assault carriers",
                "4 TIE line squadrons",
                "Planetary defense grid and long-range sensor interdiction"
            ],
            protocol: "Challenge only verified Imperial transponders. Unverified arrivals are treated as hostile incursions."
        },
        4: {
            designation: "QUARANTINE ENFORCEMENT GROUP",
            purpose: "Contain sensitive sites, suppress recovery efforts, and deny access to anomalous or compromised locations.",
            composition: [
                "1 Victory-class Star Destroyer",
                "2 Arquitens-class light cruisers",
                "2 Gozanti-class patrol carriers",
                "2 TIE line squadrons",
                "System sensor picket and customs boarding team"
            ],
            protocol: "Hold targets at the outer patrol line while clearance is confirmed through ISB channels."
        },
        3: {
            designation: "MARTIAL LAW BLOCKADE GROUP",
            purpose: "Maintain orbital control over occupied worlds, protect extraction assets, and deter organized resistance.",
            composition: [
                "1 Imperial-class Star Destroyer",
                "2 Arquitens-class light cruisers",
                "2 Gozanti-class assault carriers",
                "3 TIE line squadrons",
                "Ground garrison transports and orbital inspection teams"
            ],
            protocol: "Enforce a declared exclusion zone, inspect all traffic, and retain relief forces for rapid surface intervention."
        },
        2: {
            designation: "STRATEGIC NAVAL ASSET SCREEN",
            purpose: "Protect naval industry, control military logistics, and prevent sabotage or industrial espionage.",
            composition: [
                "2 Imperial-class Star Destroyers",
                "1 Interdictor cruiser",
                "4 Arquitens-class light cruisers",
                "4 Gozanti-class patrol carriers",
                "6 TIE line squadrons",
                "Dense customs, sensor, and dockyard security net"
            ],
            protocol: "Authenticate traffic before it reaches protected orbital infrastructure; intercept deviations immediately."
        },
        1: {
            designation: "PENAL SECURITY DETACHMENT",
            purpose: "Secure forced-labor operations and restrict transit to scheduled prison, supply, and guard traffic.",
            composition: [
                "1 Arquitens-class command cruiser",
                "2 Gozanti-class patrol carriers",
                "1 TIE line squadron",
                "Prison transport escort section",
                "Surface security and customs inspection detail"
            ],
            protocol: "Board unknown traffic, protect labor transports, and maintain continuous surface-to-orbit surveillance."
        },
        0: {
            designation: "IMPERIAL CAPITAL DEFENSE FLEET",
            purpose: "Defend the seat of Imperial power, preserve government continuity, and maintain absolute control of capital airspace.",
            composition: [
                "3 Imperial-class Star Destroyers",
                "1 fleet command carrier",
                "4 Arquitens-class light cruisers",
                "6 Gozanti-class patrol carriers",
                "8 TIE line squadrons",
                "Planetary security, customs, and palace-defense coordination"
            ],
            protocol: "Maintain layered capital defense zones and route all unidentified craft to immediate customs control."
        }
    };

    const SYSTEM_OVERRIDES = {
        BYSS: {
            purpose: "Protect the Emperor's sanctuary and isolate unstable Deep Core approaches from all unauthorized traffic.",
            composition: ["2 Imperial-class Star Destroyers", "1 Interdictor cruiser", "Imperial Royal Guard security detachment", "4 TIE line squadrons", "Deep Core navigational denial network"]
        },
        PRAKITH: {
            purpose: "Secure the Inquisitorius fortress, prisoner holdings, and Purge Trooper deployment lanes.",
            composition: ["1 Imperial-class Star Destroyer", "2 Arquitens-class light cruisers", "Purge Trooper transport wing", "3 TIE line squadrons", "Fortress-defense turbolaser network"]
        },
        DESPAYRE: {
            purpose: "Conceal Project Celestial construction activity and prevent discovery of penal-colony operations.",
            composition: ["1 Imperial-class Star Destroyer", "1 Interdictor cruiser", "2 construction-security cruisers", "3 TIE line squadrons", "Orbital yard exclusion screen"]
        },
        ILUM: {
            purpose: "Protect kyber extraction, militarized mining infrastructure, and restricted surface approaches.",
            composition: ["1 Victory-class Star Destroyer", "2 Arquitens-class patrol cruisers", "2 Gozanti-class carriers", "2 TIE line squadrons", "Mining-zone sensor cordon"]
        },
        SCARIF: {
            purpose: "Defend shield-construction work, archive development, and the system-wide airspace interdiction program.",
            composition: ["1 Imperial-class Star Destroyer", "2 Arquitens-class light cruisers", "2 Gozanti-class patrol carriers", "3 TIE line squadrons", "Shield-project customs cordon"]
        },
        EADU: {
            purpose: "Secure kyber energy-conversion laboratories in hazardous storm corridors.",
            composition: ["1 Victory-class Star Destroyer", "2 Gozanti-class patrol carriers", "2 TIE line squadrons", "Storm-navigation beacon net", "Canyon refinery security teams"]
        },
        MUSTAFAR: { purpose: "Enforce Lord Vader's private exclusion zone and protect the fortified Nur complex.", composition: ["1 Imperial-class Star Destroyer", "1 Victory-class Star Destroyer", "2 Gozanti-class carriers", "3 TIE line squadrons", "Fortress and volcanic-approach defense batteries"] },
        KAMINO: { purpose: "Deny salvage access to the destroyed cloning infrastructure and monitor the graveyard perimeter.", composition: ["1 Victory-class Star Destroyer", "2 Arquitens-class patrol cruisers", "2 TIE line squadrons", "Salvage interdiction boarding teams"] },
        "KORRIBAN MORABAND": { purpose: "Quarantine sealed tomb complexes and prevent artifact recovery or cult activity.", composition: ["2 Arquitens-class patrol cruisers", "2 Gozanti-class patrol carriers", "1 TIE line squadron", "Archaeological containment and surface execution detachment"] },
        OSSUS: { purpose: "Monitor the former Jedi library ruins and ambush returning survivors or scavengers.", composition: ["1 Arquitens-class light cruiser", "2 Gozanti-class patrol carriers", "1 TIE line squadron", "ISB surveillance and rapid-response landing teams"] },
        DANTOOINE: { purpose: "Maintain the former Jedi Enclave as a controlled trap for sympathetic traffic.", composition: ["1 Arquitens-class light cruiser", "2 Gozanti-class patrol carriers", "1 TIE line squadron", "Concealed garrison and capture teams"] },
        GEONOSIS: { purpose: "Conceal sterilization operations and protect restricted orbital construction infrastructure.", composition: ["1 Imperial-class Star Destroyer", "1 Interdictor cruiser", "2 Arquitens-class light cruisers", "3 TIE line squadrons", "Radiological exclusion patrols"] },
        KASHYYYK: { purpose: "Maintain the planetary blockade and secure forced-labor extraction routes.", composition: ["1 Imperial-class Star Destroyer", "2 Gozanti-class assault carriers", "3 TIE line squadrons", "Labor transport escorts and surface occupation craft"] },
        "MON CALA": { purpose: "Hold nationalized shipyards and contest persistent local insurgency in orbital and aquatic zones.", composition: ["1 Imperial-class Star Destroyer", "2 Arquitens-class light cruisers", "3 Gozanti-class assault carriers", "4 TIE line squadrons", "Aquatic-city garrison landing craft"] },
        RYLOTH: { purpose: "Protect doonium strip-mining operations and suppress insurgent movement through the blockade.", composition: ["1 Imperial-class Star Destroyer", "2 Arquitens-class light cruisers", "2 Gozanti-class patrol carriers", "3 TIE line squadrons", "Mining convoy escort section"] },
        UTAPAU: { purpose: "Control sinkhole approaches, landing pads, and all vertical transit through occupied settlements.", composition: ["1 Victory-class Star Destroyer", "2 Arquitens-class patrol cruisers", "2 Gozanti-class carriers", "2 TIE line squadrons", "Checkpoint and landing-pad enforcement teams"] },
        KUAT: { purpose: "Defend the drive-yard ring and preserve the fleet's principal capital-ship production capacity.", composition: ["2 Imperial-class Star Destroyers", "1 Interdictor cruiser", "4 Arquitens-class light cruisers", "6 TIE line squadrons", "Orbital-ring customs and yard-security screen"] },
        FONDOR: { purpose: "Secure the refit yards, sensor net, and fleet staging infrastructure.", composition: ["2 Imperial-class Star Destroyers", "3 Arquitens-class light cruisers", "4 Gozanti-class patrol carriers", "5 TIE line squadrons", "Dockyard boarding and sensor-control command"] },
        MIMBAN: { purpose: "Protect hyperbaride claims and maintain military control of an active ground warzone.", composition: ["1 Arquitens-class command cruiser", "2 Gozanti-class patrol carriers", "1 TIE line squadron", "Walker transport and trench-security escort group"] },
        WOBANI: { purpose: "Secure prison complexes, labor convoys, and controlled agricultural production.", composition: ["1 Arquitens-class command cruiser", "2 Gozanti-class patrol carriers", "1 TIE line squadron", "Prison transport escort and surface guard detail"] },
        CORUSCANT: { purpose: "Defend the Imperial capital, palace airspace, and the continuity of central government.", composition: ["3 Imperial-class Star Destroyers", "1 fleet command carrier", "4 Arquitens-class light cruisers", "6 Gozanti-class patrol carriers", "8 TIE line squadrons", "Palace-defense and capital customs coordination"] }
    };

    modules.fleetJournals = {
        buildEntries(tiers) {
            return tiers.flatMap((tier) => tier.planets.map((planet) => buildEntry(tier, planet)));
        },

        async sync(config, { refreshExisting = false } = {}) {
            assertPrimaryGM(config);
            const folder = await getOrCreateFolder(config);
            const entries = this.buildEntries(config.tiers);
            const journal = await getOrCreateJournal(entries, folder, refreshExisting, config);
            return journal;
        },

        async ensureArchive(config) {
            if (!game.user?.isGM || !config.isPrimaryActiveGM()) return null;
            const currentVersion = Number(game.settings.get(config.moduleId, config.manifestSettingKey)) || 0;
            if (currentVersion === config.manifestVersion) return null;

            const summary = await this.sync(config);
            await game.settings.set(config.moduleId, config.manifestSettingKey, config.manifestVersion);
            return summary;
        },

        async generateFromDashboard(dashboard, config) {
            if (!game.user?.isGM || !config.isPrimaryActiveGM()) {
                setStatus(dashboard, "GM clearance required to synchronize the fleet disposition journal.", "error");
                return;
            }

            const button = dashboard.querySelector("[data-action='generate-fleet-journal']");
            if (button) button.disabled = true;
            setStatus(dashboard, "Synchronizing Imperial fleet disposition pages...", "");
            try {
                const summary = await this.sync(config, { refreshExisting: true });
                await game.settings.set(config.moduleId, config.manifestSettingKey, config.manifestVersion);
                const message = `Fleet disposition synchronized: ${summary.createdPages} created, ${summary.refreshedPages} refreshed.`;
                setStatus(dashboard, message, "");
                ui.notifications?.info(message);
            } catch (error) {
                console.error(`${config.moduleId} | Failed to synchronize fleet disposition journal`, error);
                setStatus(dashboard, "Fleet disposition synchronization failed. Check the console.", "error");
            } finally {
                if (button) button.disabled = false;
            }
        }
    };

    function buildEntry(tier, planet) {
        const override = SYSTEM_OVERRIDES[normalizeName(planet.name)] ?? {};
        const posture = TIER_FLEET_POSTURES[tier.id];
        return {
            id: `tier-${tier.id}-${normalizeName(planet.name).replace(/\s+/g, "-").toLowerCase()}`,
            name: planet.name,
            grid: planet.grid,
            tier,
            designation: override.designation ?? posture.designation,
            purpose: override.purpose ?? posture.purpose,
            composition: override.composition ?? posture.composition,
            protocol: override.protocol ?? posture.protocol,
            status: planet.status
        };
    }

    function assertPrimaryGM(config) {
        if (!game.user?.isGM || !config.isPrimaryActiveGM()) {
            throw new Error("GM clearance is required to create fleet disposition journals.");
        }
    }

    function getDocuments(collection) {
        if (!collection) return [];
        if (Array.isArray(collection.contents)) return collection.contents;
        if (typeof collection.values === "function") return Array.from(collection.values());
        return Array.from(collection);
    }

    async function getOrCreateFolder(config) {
        const existing = getDocuments(game.folders).find((folder) => folder.type === "JournalEntry" && folder.name === config.folderName);
        if (existing) return existing;
        const FolderDocument = globalThis.Folder ?? globalThis.foundry?.documents?.Folder;
        if (!FolderDocument?.create) throw new Error("Foundry journal folders are unavailable.");
        return FolderDocument.create({ name: config.folderName, type: "JournalEntry", sorting: "a", color: "#bc1e22" });
    }

    async function getOrCreateJournal(entries, folder, refreshExisting, config) {
        const journals = getDocuments(game.journal);
        let journal = journals.find((entry) => getFlag(entry, config.journalFlag, config) === true);
        if (!journal) {
            const JournalEntryDocument = globalThis.JournalEntry ?? globalThis.foundry?.documents?.JournalEntry;
            if (!JournalEntryDocument?.create) throw new Error("Foundry journal entries are unavailable.");
            await JournalEntryDocument.create({
                name: config.journalName,
                folder: folder.id,
                flags: getFlags(config.journalFlag, true, config),
                pages: entries.map((entry) => getPageData(entry, config))
            });
            return { createdPages: entries.length, refreshedPages: 0 };
        }

        if (!refreshExisting) return { createdPages: 0, refreshedPages: 0 };
        await journal.update({ name: config.journalName, folder: folder.id, flags: getFlags(config.journalFlag, true, config) });
        const existingPages = new Map(getDocuments(journal.pages).map((page) => [getFlag(page, config.pageFlag, config), page]));
        let createdPages = 0;
        let refreshedPages = 0;
        for (const entry of entries) {
            const pageData = getPageData(entry, config);
            const page = existingPages.get(entry.id);
            if (page) {
                await page.update(pageData);
                refreshedPages += 1;
            } else {
                await journal.createEmbeddedDocuments("JournalEntryPage", [pageData]);
                createdPages += 1;
            }
        }
        return { createdPages, refreshedPages };
    }

    function getPageData(entry, config) {
        return {
            name: `Tier ${entry.tier.id} // ${entry.name}`,
            type: "text",
            text: {
                content: getJournalHtml(entry),
                format: globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1
            },
            flags: getFlags(config.pageFlag, entry.id, config)
        };
    }

    function getJournalHtml(entry) {
        const composition = entry.composition.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
        return `<section><h1>${escapeHtml(entry.name)}</h1><p><strong>Restriction Tier:</strong> ${entry.tier.id} // ${escapeHtml(entry.tier.label)}<br><strong>Grid:</strong> ${escapeHtml(entry.grid)}<br><strong>Clearance:</strong> ${escapeHtml(entry.tier.clearance)}</p><hr><h2>Operational Status</h2><p>${escapeHtml(entry.status)}</p><h2>Fleet Posture</h2><p><strong>${escapeHtml(entry.designation)}</strong></p><p>${escapeHtml(entry.purpose)}</p><h2>Assigned Composition</h2><ul>${composition}</ul><h2>Engagement Protocol</h2><p>${escapeHtml(entry.protocol)}</p><hr><p><em>GM reference: campaign Imperial fleet disposition.</em></p></section>`;
    }

    function getFlags(key, value, config) {
        return { [config.moduleId]: { [key]: value } };
    }

    function getFlag(document, key, config) {
        return document?.getFlag?.(config.moduleId, key) ?? document?.flags?.[config.moduleId]?.[key];
    }

    function setStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-fleet-journal-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
    }

    function normalizeName(value) {
        return String(value ?? "").toUpperCase().replace(/[()]/g, " ").replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
    }
})();

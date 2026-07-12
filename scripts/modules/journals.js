(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    modules.journals = {
        async sync(config, { refreshExisting = false } = {}) {
            assertPrimaryGM(config);

            const folder = await getOrCreateFolder(config);
            const results = [];
            for (const station of config.descriptors) {
                results.push(await createOrRefreshJournal(station, folder, refreshExisting, config));
            }

            return results.reduce((summary, result) => ({
                created: summary.created + Number(result.created),
                refreshed: summary.refreshed + Number(result.refreshed)
            }), { created: 0, refreshed: 0 });
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
            if (!game.user?.isGM) {
                setStatus(dashboard, "GM clearance required for journal creation.", "error");
                return;
            }
            if (!config.isPrimaryActiveGM()) {
                setStatus(dashboard, "Station journal synchronization is assigned to the primary active GM.", "error");
                return;
            }

            const button = dashboard.querySelector("[data-action='generate-station-journals']");
            if (button) button.disabled = true;
            setStatus(dashboard, "Refreshing station briefing journals...", "");

            try {
                const summary = await this.sync(config, { refreshExisting: true });
                await game.settings.set(config.moduleId, config.manifestSettingKey, config.manifestVersion);
                const message = `Station archive synchronized: ${summary.created} created, ${summary.refreshed} refreshed.`;
                setStatus(dashboard, message, "");
                ui.notifications?.info(message);
            } catch (error) {
                console.error(`${config.moduleId} | Failed to synchronize station journals`, error);
                setStatus(dashboard, "Station journal synchronization failed. Check the console.", "error");
            } finally {
                if (button) button.disabled = false;
            }
        }
    };

    function assertPrimaryGM(config) {
        if (!game.user?.isGM) throw new Error("GM clearance is required to create station journals.");
        if (!config.isPrimaryActiveGM()) {
            throw new Error("Station journal synchronization is assigned to the primary active GM.");
        }
    }

    function getDocuments(collection) {
        if (!collection) return [];
        if (Array.isArray(collection.contents)) return collection.contents;
        if (typeof collection.values === "function") return Array.from(collection.values());
        return Array.from(collection);
    }

    async function getOrCreateFolder(config) {
        const existing = getDocuments(game.folders)
            .find((folder) => folder.type === "JournalEntry" && folder.name === config.folderName);
        if (existing) return existing;

        const FolderDocument = globalThis.Folder ?? globalThis.foundry?.documents?.Folder;
        if (!FolderDocument?.create) throw new Error("Foundry journal folders are unavailable.");

        return FolderDocument.create({
            name: config.folderName,
            type: "JournalEntry",
            sorting: "a",
            color: "#bc1e22"
        });
    }

    async function createOrRefreshJournal(station, folder, refreshExisting, config) {
        const journals = getDocuments(game.journal);
        let journal = journals.find((entry) => getJournalFlag(entry, config) === station.name);
        let created = false;

        if (!journal) {
            const JournalEntryDocument = globalThis.JournalEntry ?? globalThis.foundry?.documents?.JournalEntry;
            if (!JournalEntryDocument?.create) throw new Error("Foundry journal entries are unavailable.");

            journal = await JournalEntryDocument.create({
                name: getJournalName(station),
                folder: folder.id,
                flags: getJournalFlags(station, config),
                pages: [getJournalPageData(station, config)]
            });
            created = true;
        } else if (refreshExisting) {
            await journal.update({
                name: getJournalName(station),
                folder: folder.id,
                flags: getJournalFlags(station, config)
            });

            const page = getDocuments(journal.pages).find((entry) => getJournalFlag(entry, config) === station.name);
            const pageData = getJournalPageData(station, config);
            if (page) await page.update(pageData);
            else await journal.createEmbeddedDocuments("JournalEntryPage", [pageData]);
        }

        return { created, refreshed: !created && refreshExisting };
    }

    function getJournalPageData(station, config) {
        return {
            name: "Approach Briefing",
            type: "text",
            text: {
                content: getJournalHtml(station),
                format: globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1
            },
            flags: getJournalFlags(station, config)
        };
    }

    function getJournalFlags(station, config) {
        return { [config.moduleId]: { [config.journalFlag]: station.name } };
    }

    function getJournalFlag(document, config) {
        return document?.getFlag?.(config.moduleId, config.journalFlag)
            ?? document?.flags?.[config.moduleId]?.[config.journalFlag];
    }

    function getJournalName(station) {
        return `Station Briefing - ${station.name}`;
    }

    function getJournalHtml(station) {
        return `<section><h1>${escapeHtml(station.name)}</h1><p><strong>Grid:</strong> ${escapeHtml(station.grid)}<br><strong>Sector:</strong> ${escapeHtml(station.sector)}<br><strong>Region:</strong> ${escapeHtml(station.region)}</p><hr><h2>Read Aloud</h2><blockquote><p>${escapeHtml(station.descriptor)}</p></blockquote><hr><p><em>GM reference: ${escapeHtml(station.source)}</em></p></section>`;
    }

    function setStatus(dashboard, text, state) {
        dashboard.querySelectorAll("[data-station-journal-status]").forEach((status) => {
            status.textContent = text;
            if (state) status.dataset.state = state;
            else delete status.dataset.state;
        });
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
})();

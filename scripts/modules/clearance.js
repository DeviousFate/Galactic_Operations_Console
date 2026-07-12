(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    let codesPromise;
    let loadStatus = "unloaded";

    modules.clearance = {
        normalizeCode(value) {
            return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        },

        parseCodes(text) {
            const codesByTier = {};
            let tierKey = "";
            String(text ?? "").split(/\r?\n/).forEach((line) => {
                const tierMatch = line.match(/^\s*Tier\s+([3-5])\s*$/i);
                if (tierMatch) {
                    tierKey = `tier${tierMatch[1]}`;
                    codesByTier[tierKey] ??= [];
                    return;
                }
                const codeMatch = line.match(/\b[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}-[A-Z0-9]{2}\b/i);
                if (tierKey && codeMatch) codesByTier[tierKey].push(this.normalizeCode(codeMatch[0]));
            });
            return codesByTier;
        },

        async loadCodes(path, moduleId) {
            if (!codesPromise) {
                loadStatus = "loading";
                codesPromise = fetch(path, { cache: "no-cache" })
                    .then((response) => {
                        if (!response.ok) throw new Error(`Unable to load clearance codes (${response.status}).`);
                        return response.text();
                    })
                    .then((text) => {
                        loadStatus = "ready";
                        return this.parseCodes(text);
                    })
                    .catch((error) => {
                        console.error(`${moduleId} | Failed to load clearance codes`, error);
                        codesPromise = null;
                        loadStatus = "failed";
                        return {};
                    });
            }
            return codesPromise;
        },

        getLoadStatus() {
            return loadStatus;
        }
    };
})();

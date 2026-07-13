(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    let coordinateLoadStatus = "unloaded";

    modules.navData = {
        async loadCoordinateRecords(paths) {
            coordinateLoadStatus = "loading";
            let lastError;
            for (const path of paths) {
                try {
                    const response = await fetch(path, { cache: "no-cache" });
                    if (!response.ok) {
                        lastError = new Error(`${path} returned ${response.status}`);
                        continue;
                    }
                    const records = parseCoordinateCsv(await response.text());
                    coordinateLoadStatus = "ready";
                    return records;
                } catch (error) {
                    lastError = error;
                }
            }
            coordinateLoadStatus = "failed";
            throw lastError ?? new Error("No grid coordinate CSV path available.");
        },

        getLoadStatus() {
            return coordinateLoadStatus;
        }
    };

    function parseCoordinateCsv(csvText) {
        const rows = parseCsvRows(csvText);
        const headers = rows.shift()?.map((header) => header.trim().replace(/^\uFEFF/, "")) ?? [];
        const records = rows
            .map((row) => ({
                fields: headers.reduce((record, header, index) => {
                    record[header] = String(row[index] ?? "").trim();
                    return record;
                }, {})
            }))
            .filter((record) => record.fields.Planet);
        return applySectorFallback(records);
    }

    function applySectorFallback(records) {
        const firstPlanetByGrid = new Map();
        records.forEach((record) => {
            const grid = String(record.fields.Grid ?? "").trim();
            const planet = String(record.fields.Planet ?? "").trim();
            if (grid && planet && !firstPlanetByGrid.has(grid)) firstPlanetByGrid.set(grid, planet);
        });

        records.forEach((record) => {
            const grid = String(record.fields.Grid ?? "").trim();
            const sector = String(record.fields.Sector ?? "").trim();
            if (grid && (!sector || sector === "|") && firstPlanetByGrid.has(grid)) {
                record.fields.Sector = `${firstPlanetByGrid.get(grid)} Sector`;
            }
        });

        return records;
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
})();

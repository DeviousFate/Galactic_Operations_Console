/*
 * Surveys Wookieepedia's "Locations in grid square" categories against the
 * module NavData. It intentionally creates review files and never changes
 * SW Grid Coords.csv.
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "SW Grid Coords.csv");
const MATCHES_PATH = path.join(ROOT, "Wookieepedia Sector Matches.csv");
const UNRESOLVED_PATH = path.join(ROOT, "Wookieepedia Sector Unresolved.csv");
const API_URL = "https://starwars.fandom.com/api.php";
const REQUEST_DELAY_MS = 80;

async function main() {
    const records = parseCoordinateCsv(await fs.readFile(INPUT_PATH, "utf8"));
    const recordsByGrid = new Map();
    records.forEach((record, index) => {
        const grid = normalizeGrid(record.Grid);
        if (!grid) return;
        const entries = recordsByGrid.get(grid) ?? [];
        entries.push({ index, record });
        recordsByGrid.set(grid, entries);
    });

    const candidatesByRecord = new Map();
    const categoryErrorsByGrid = new Map();
    const grids = [...recordsByGrid.keys()].sort();
    console.log(`Surveying ${grids.length} Wookieepedia grid categories for ${records.length} NavData records.`);

    for (let index = 0; index < grids.length; index += 1) {
        const grid = grids[index];
        try {
            const titles = await getCategoryTitles(grid);
            for (const entry of recordsByGrid.get(grid)) {
                const candidates = titles
                    .map((title) => ({ title, rank: getTitleMatchRank(title, entry.record.Planet) }))
                    .filter((candidate) => candidate.rank > 0)
                    .sort((left, right) => right.rank - left.rank || left.title.localeCompare(right.title));
                if (candidates.length) candidatesByRecord.set(entry.index, candidates);
            }
        } catch (error) {
            categoryErrorsByGrid.set(grid, error.message);
        }

        if ((index + 1) % 25 === 0 || index === grids.length - 1) {
            console.log(`Processed ${index + 1}/${grids.length} grid categories.`);
        }
    }

    const categoryTitles = [...new Set([...candidatesByRecord.values()].flatMap((candidates) => candidates.map((candidate) => candidate.title)))];
    console.log(`Retrieving sector fields from ${categoryTitles.length} matching Wookieepedia pages.`);
    const categoryPagesByTitle = await getSectorsByTitle(categoryTitles);

    const searchCandidatesByRecord = new Map();
    const recordsWithoutCategoryMatch = records
        .map((record, index) => ({ record, index }))
        .filter(({ record, index }) => normalizeGrid(record.Grid) && !categoryErrorsByGrid.has(normalizeGrid(record.Grid)) && !candidatesByRecord.has(index));
    for (let index = 0; index < recordsWithoutCategoryMatch.length; index += 1) {
        const entry = recordsWithoutCategoryMatch[index];
        const candidates = (await getSearchTitles(entry.record.Planet))
            .map((title) => ({ title, rank: getTitleMatchRank(title, entry.record.Planet), source: "search" }))
            .filter((candidate) => candidate.rank > 0)
            .sort((left, right) => right.rank - left.rank || left.title.localeCompare(right.title));
        if (candidates.length) searchCandidatesByRecord.set(entry.index, candidates);
        if ((index + 1) % 25 === 0 || index === recordsWithoutCategoryMatch.length - 1) {
            console.log(`Searched ${index + 1}/${recordsWithoutCategoryMatch.length} unmatched planet titles.`);
        }
    }

    const searchTitles = [...new Set([...searchCandidatesByRecord.values()].flatMap((candidates) => candidates.map((candidate) => candidate.title)))];
    const searchPagesByTitle = await getSectorsByTitle(searchTitles);
    const pagesByTitle = new Map([...categoryPagesByTitle, ...searchPagesByTitle]);
    const linkedSystemTitles = [...new Set([...pagesByTitle.values()]
        .filter((page) => !page.sector && page.systemTitle)
        .map((page) => page.systemTitle))];
    console.log(`Following ${linkedSystemTitles.length} linked star-system records for unresolved sectors.`);
    const systemPagesByTitle = await getSectorsByTitle(linkedSystemTitles);
    systemPagesByTitle.forEach((page, title) => pagesByTitle.set(title, page));

    const matches = [];
    const unresolved = [];
    records.forEach((record, index) => {
        const grid = normalizeGrid(record.Grid);
        if (!grid) {
            unresolved.push(createUnresolvedRecord(record, "No NavData grid is assigned."));
            return;
        }
        if (categoryErrorsByGrid.has(grid)) {
            unresolved.push(createUnresolvedRecord(record, `Grid category request failed: ${categoryErrorsByGrid.get(grid)}`));
            return;
        }

        const candidates = candidatesByRecord.get(index) ?? searchCandidatesByRecord.get(index) ?? [];
        if (!candidates.length) {
            unresolved.push(createUnresolvedRecord(record, "No matching page title in the Wookieepedia grid category."));
            return;
        }

        const resolved = findResolvedCandidate(candidates, pagesByTitle);
        if (!resolved) {
            unresolved.push(createUnresolvedRecord(record, "Matching Wookieepedia page and linked system have no usable sector field.", candidates[0].title));
            return;
        }

        matches.push({
            Planet: record.Planet,
            Grid: record.Grid,
            CurrentSector: record.Sector,
            WookieepediaTitle: resolved.page.title,
            WookieepediaSector: resolved.page.sector,
            MatchType: getMatchType(resolved),
            SourceUrl: getPageUrl(resolved.page.title)
        });
    });

    matches.sort((left, right) => left.Planet.localeCompare(right.Planet));
    unresolved.sort((left, right) => left.Planet.localeCompare(right.Planet));
    await fs.writeFile(MATCHES_PATH, serializeCsv(matches, ["Planet", "Grid", "CurrentSector", "WookieepediaTitle", "WookieepediaSector", "MatchType", "SourceUrl"]), "utf8");
    await fs.writeFile(UNRESOLVED_PATH, serializeCsv(unresolved, ["Planet", "Grid", "CurrentSector", "Reason", "SuggestedWookieepediaTitle", "GridCategoryUrl"]), "utf8");
    console.log(`Wrote ${matches.length} matched sectors to ${path.basename(MATCHES_PATH)}.`);
    console.log(`Wrote ${unresolved.length} manual-search records to ${path.basename(UNRESOLVED_PATH)}.`);
}

async function getCategoryTitles(grid) {
    const category = `Category:Locations in grid square ${formatWookieepediaGrid(grid)}`;
    const titles = [];
    let continuation = "";
    do {
        const data = await requestApi({
            action: "query",
            list: "categorymembers",
            cmtitle: category,
            cmnamespace: "0",
            cmtype: "page",
            cmlimit: "500",
            cmcontinue: continuation
        });
        titles.push(...(data.query?.categorymembers ?? []).map((member) => member.title));
        continuation = data.continue?.cmcontinue ?? "";
    } while (continuation);
    return [...new Set(titles)];
}

async function getSectorsByTitle(titles) {
    const sectorsByTitle = new Map();
    const batches = chunk(titles, 25);
    for (let index = 0; index < batches.length; index += 1) {
        const data = await requestApi({
            action: "query",
            prop: "revisions",
            rvslots: "main",
            rvprop: "content",
            redirects: "1",
            titles: batches[index].join("|")
        });
        Object.values(data.query?.pages ?? {}).forEach((page) => {
            if (page.missing) return;
            const content = page.revisions?.[0]?.slots?.main?.["*"] ?? page.revisions?.[0]?.["*"] ?? "";
            sectorsByTitle.set(page.title, {
                title: page.title,
                sector: extractSector(content),
                systemTitle: extractSystemTitle(content)
            });
        });
        (data.query?.redirects ?? []).forEach((redirect) => {
            const page = sectorsByTitle.get(redirect.to);
            if (page) sectorsByTitle.set(redirect.from, page);
        });
        if ((index + 1) % 20 === 0 || index === batches.length - 1) {
            console.log(`Read ${Math.min((index + 1) * 25, titles.length)}/${titles.length} matching page records.`);
        }
    }
    return sectorsByTitle;
}

async function getSearchTitles(planet) {
    const data = await requestApi({
        action: "query",
        list: "search",
        srsearch: planet,
        srnamespace: "0",
        srlimit: "10"
    });
    return [...new Set((data.query?.search ?? []).map((result) => result.title))];
}

async function requestApi(parameters, attempt = 0) {
    const url = new URL(API_URL);
    url.search = new URLSearchParams({ format: "json", ...parameters }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "GalacticOperationsConsoleNavDataSurvey/1.0" } });
    if (!response.ok) {
        if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
            await delay(500 * (attempt + 1));
            return requestApi(parameters, attempt + 1);
        }
        throw new Error(`Wookieepedia returned HTTP ${response.status}.`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error.info ?? data.error.code ?? "Unknown Wookieepedia API error.");
    await delay(REQUEST_DELAY_MS);
    return data;
}

function extractSector(content) {
    return extractInfoboxValue(content, "sector");
}

function extractSystemTitle(content) {
    return extractInfoboxValue(content, "system");
}

function extractInfoboxValue(content, parameter) {
    const escapedParameter = parameter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(content ?? "").match(new RegExp(`^[ \\t]*\\|[ \\t]*${escapedParameter}[ \\t]*=[ \\t]*([^\\r\\n]*)`, "im"));
    if (!match) return "";
    const value = cleanWikitext(match[1]);
    return /^(?:none|unknown|n\/?a)$/i.test(value) ? "" : value;
}

function findResolvedCandidate(candidates, pagesByTitle) {
    for (const candidate of candidates) {
        const page = pagesByTitle.get(candidate.title);
        if (page?.sector) return { candidate, page, viaSystem: false };
        const systemPage = page?.systemTitle ? pagesByTitle.get(page.systemTitle) : null;
        if (systemPage?.sector) return { candidate, page: systemPage, viaSystem: true };
    }
    return null;
}

function getMatchType(resolved) {
    if (resolved.viaSystem) return "Linked system";
    if (resolved.candidate.source === "search") return "Search result";
    return resolved.candidate.rank >= 200 ? "Exact title" : "System or continuity variant";
}

function cleanWikitext(value) {
    return String(value ?? "")
        .replace(/<!--.*?-->/g, "")
        .replace(/<ref\b[^>]*\/>/gi, "")
        .replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, "")
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
        .replace(/\[\[([^\]]+)\]\]/g, "$1")
        .replace(/\{\{[^{}|]+\|([^{}|]+)\}\}/g, "$1")
        .replace(/\{\{[^{}]+\}\}/g, "")
        .replace(/''/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\/(?:Legends|Canon)$/i, "")
        .replace(/^\*+\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getTitleMatchRank(title, planet) {
    const titleWithoutContinuity = String(title).replace(/\/(?:Legends|Canon)$/i, "").trim();
    const planetKey = normalizeName(planet);
    if (normalizeName(titleWithoutContinuity) === planetKey) return 200;
    if (normalizeLocationName(titleWithoutContinuity) === normalizeLocationName(planet)) return 100;
    return 0;
}

function normalizeLocationName(value) {
    return normalizeName(value)
        .replace(/\s+system$/i, "")
        .replace(/\s+\([^)]*\)$/i, "")
        .trim();
}

function normalizeName(value) {
    return String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[’'`]/g, "")
        .replace(/[^a-z0-9]+/gi, " ")
        .trim()
        .toLowerCase();
}

function normalizeGrid(value) {
    const match = String(value ?? "").trim().toUpperCase().match(/^([A-Z])-?(\d{1,2})$/);
    return match ? `${match[1]}${Number(match[2])}` : "";
}

function formatWookieepediaGrid(grid) {
    const match = grid.match(/^([A-Z])(\d{1,2})$/);
    return match ? `${match[1]}-${match[2]}` : grid;
}

function getPageUrl(title) {
    return `https://starwars.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

function getGridCategoryUrl(grid) {
    return grid ? `https://starwars.fandom.com/wiki/Category:Locations_in_grid_square_${formatWookieepediaGrid(grid)}` : "";
}

function createUnresolvedRecord(record, reason, suggestedTitle = "") {
    return {
        Planet: record.Planet,
        Grid: record.Grid,
        CurrentSector: record.Sector,
        Reason: reason,
        SuggestedWookieepediaTitle: suggestedTitle || record.Planet,
        GridCategoryUrl: getGridCategoryUrl(normalizeGrid(record.Grid))
    };
}

function parseCoordinateCsv(csvText) {
    const rows = parseCsvRows(csvText);
    const headers = rows.shift()?.map((header) => header.trim().replace(/^\uFEFF/, "")) ?? [];
    return rows.map((row) => headers.reduce((record, header, index) => {
        record[header] = String(row[index] ?? "").trim();
        return record;
    }, {})).filter((record) => record.Planet);
}

function parseCsvRows(csvText) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    for (let index = 0; index < csvText.length; index += 1) {
        const char = csvText[index];
        const next = csvText[index + 1];
        if (char === "\"") {
            if (inQuotes && next === "\"") {
                cell += "\"";
                index += 1;
            } else inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            row.push(cell);
            cell = "";
        } else if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && next === "\n") index += 1;
            row.push(cell);
            if (row.some((value) => value.trim())) rows.push(row);
            row = [];
            cell = "";
        } else cell += char;
    }
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
    return rows;
}

function serializeCsv(rows, headers) {
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    return [headers, ...rows.map((row) => headers.map((header) => row[header]))]
        .map((row) => row.map(escape).join(","))
        .join("\r\n") + "\r\n";
}

function chunk(items, size) {
    return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

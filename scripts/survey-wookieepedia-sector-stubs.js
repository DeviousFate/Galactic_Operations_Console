/*
 * Cross-references current NavData sectors with Wookieepedia's Sector stubs
 * category. It creates review files and does not modify live NavData.
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "SW Grid Coords.csv");
const MATCHES_PATH = path.join(ROOT, "Wookieepedia Sector Stub Matches.csv");
const UNMATCHED_PATH = path.join(ROOT, "Wookieepedia Sector Stub Unmatched.csv");
const API_URL = "https://starwars.fandom.com/api.php";

async function main() {
    const records = parseCoordinateCsv(await fs.readFile(INPUT_PATH, "utf8"));
    const stubTitles = await getSectorStubTitles();
    const sectorMatches = new Map();

    [...new Set(records.map((record) => record.Sector).filter(Boolean))].forEach((sector) => {
        const candidates = stubTitles
            .map((title) => ({ title, rank: getSectorMatchRank(title, sector) }))
            .filter((candidate) => candidate.rank > 0)
            .sort((left, right) => right.rank - left.rank || preferPrimaryTitle(left.title, right.title));
        if (candidates.length) sectorMatches.set(sector, candidates[0]);
    });

    const matchedRecords = [];
    const unmatchedBySector = new Map();
    records.forEach((record) => {
        const match = sectorMatches.get(record.Sector);
        if (match) {
            matchedRecords.push({
                Planet: record.Planet,
                Grid: record.Grid,
                CurrentSector: record.Sector,
                WookieepediaStubTitle: match.title,
                MatchType: match.rank >= 200 ? "Exact title" : "Sector-normalized title",
                SourceUrl: getPageUrl(match.title)
            });
            return;
        }

        const entry = unmatchedBySector.get(record.Sector) ?? { sector: record.Sector, records: [] };
        entry.records.push(record);
        unmatchedBySector.set(record.Sector, entry);
    });

    const unmatchedSectors = [...unmatchedBySector.values()].map((entry) => ({
        CurrentSector: entry.sector,
        RecordCount: entry.records.length,
        ExamplePlanets: entry.records.slice(0, 8).map((record) => record.Planet).join("; "),
        Reason: "No matching Wookieepedia Sector stubs category title."
    }));

    matchedRecords.sort((left, right) => left.Planet.localeCompare(right.Planet));
    unmatchedSectors.sort((left, right) => left.CurrentSector.localeCompare(right.CurrentSector));
    await fs.writeFile(MATCHES_PATH, serializeCsv(matchedRecords, ["Planet", "Grid", "CurrentSector", "WookieepediaStubTitle", "MatchType", "SourceUrl"]), "utf8");
    await fs.writeFile(UNMATCHED_PATH, serializeCsv(unmatchedSectors, ["CurrentSector", "RecordCount", "ExamplePlanets", "Reason"]), "utf8");
    console.log(`Loaded ${stubTitles.length} Wookieepedia Sector stubs category titles.`);
    console.log(`Wrote ${matchedRecords.length} matching NavData records to ${path.basename(MATCHES_PATH)}.`);
    console.log(`Wrote ${unmatchedSectors.length} unmatched sector labels to ${path.basename(UNMATCHED_PATH)}.`);
}

async function getSectorStubTitles() {
    const titles = [];
    let continuation = "";
    do {
        const data = await requestApi({
            action: "query",
            list: "categorymembers",
            cmtitle: "Category:Sector stubs",
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

async function requestApi(parameters) {
    const url = new URL(API_URL);
    url.search = new URLSearchParams({ format: "json", ...parameters }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "GalacticOperationsConsoleNavDataSurvey/1.0" } });
    if (!response.ok) throw new Error(`Wookieepedia returned HTTP ${response.status}.`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.info ?? data.error.code ?? "Unknown Wookieepedia API error.");
    return data;
}

function getSectorMatchRank(title, sector) {
    const titleWithoutContinuity = String(title).replace(/\/(?:Legends|Canon)$/i, "").trim();
    if (normalizeName(titleWithoutContinuity) === normalizeName(sector)) return 200;
    return normalizeSectorName(titleWithoutContinuity) === normalizeSectorName(sector) ? 100 : 0;
}

function preferPrimaryTitle(left, right) {
    const leftLegacy = /\/(?:Legends|Canon)$/i.test(left);
    const rightLegacy = /\/(?:Legends|Canon)$/i.test(right);
    if (leftLegacy !== rightLegacy) return leftLegacy ? 1 : -1;
    return left.localeCompare(right);
}

function normalizeSectorName(value) {
    return normalizeName(value)
        .replace(/\bsub\s*sector\b/g, "")
        .replace(/\bsectors?\b/g, "")
        .replace(/\s+/g, " ")
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

function getPageUrl(title) {
    return `https://starwars.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

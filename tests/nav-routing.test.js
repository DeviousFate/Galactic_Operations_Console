const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
require("../scripts/modules/nav-routing.js");

const parseGrid = (grid) => {
    const match = String(grid).match(/^([A-C])(\d)$/);
    return match ? { grid, column: match[1].charCodeAt(0) - 64, row: Number(match[2]) } : null;
};

const restrictedEntry = {
    grid: "B1",
    tier: { id: 3, clearance: "TEST" },
    restrictions: [{ tier: { id: 3, clearance: "TEST" } }]
};

const config = {
    hyperlanes: [{ id: "H1", name: "Test Lane", legs: [["A", "A1", "B", "B1", 2], ["B", "B1", "C", "C1", 3]] }],
    aliases: {},
    adjacentGridDistance: 1,
    normalizePlanetName: (value) => String(value).toUpperCase(),
    normalizeGrid: (value) => String(value).toUpperCase(),
    parseGrid,
    formatGrid: (column, row) => column >= 1 && column <= 3 && row >= 1 && row <= 3 ? `${String.fromCharCode(64 + column)}${row}` : "",
    calculateGridTransit: () => ({ hours: 0, grids: [] }),
    buildGridSegments: (route) => route.slice(1).map(() => ({ hours: 6 })),
    getGridRegion: () => "Core",
    restrictedEntries: [restrictedEntry],
    restrictedEntryByGrid: new Map([["B1", restrictedEntry]]),
    hasRestrictionTierAccess: () => false,
    hasNavigationClearance: () => false
};

const routing = globalThis.GalacticOperationsConsoleModules.navRouting;

test("finds a weighted major hyperlane route", () => {
    const route = routing.findDirect({ name: "A" }, { name: "C" }, config);
    assert.equal(route.hours, 5);
    assert.deepEqual(route.grids, ["A1", "B1", "C1"]);
});

test("includes approach and departure grids in a major hyperlane transit", () => {
    const route = routing.findDirect({ name: "A" }, { name: "C" }, config);
    const transitConfig = {
        ...config,
        calculateGridTransit: (from, to) => ({
            hours: from.grid === to.grid ? 0 : 1,
            grids: from.grid === to.grid ? [from.grid] : [from.grid, to.grid]
        })
    };
    const transit = routing.buildMajorRouteTransit(route, {
        name: "A",
        grid: "A2",
        coordinate: parseGrid("A2"),
        region: "Core"
    }, {
        name: "C",
        grid: "C2",
        coordinate: parseGrid("C2"),
        region: "Core"
    }, {}, transitConfig);

    assert.equal(transit.hours, 7);
    assert.deepEqual(transit.grids, ["A2", "A1", "B1", "C1", "C2"]);
});

test("expands major hyperlane waypoints into the traversed grid path", () => {
    const transit = routing.buildMajorRouteTransit({
        hours: 5,
        legs: [{ from: "A", fromGrid: "A1", to: "C", toGrid: "C3" }],
        grids: ["A1", "C3"]
    }, {
        name: "A",
        grid: "A1",
        coordinate: parseGrid("A1"),
        region: "Core"
    }, {
        name: "C",
        grid: "C3",
        coordinate: parseGrid("C3"),
        region: "Core"
    }, {}, config);

    assert.deepEqual(transit.grids, ["A1", "B2", "C3"]);
});

test("avoids a restricted grid when plotting an avoid-restricted route", () => {
    const route = routing.buildGridRoute(parseGrid("A1"), parseGrid("C1"), { avoidRestricted: true }, config);
    assert.equal(route.includes("B1"), false);
    assert.equal(route[0], "A1");
    assert.equal(route.at(-1), "C1");
});

const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
require("../scripts/modules/clearance.js");

const clearance = globalThis.GalacticOperationsConsoleModules.clearance;

test("normalizes formatted clearance codes", () => {
    assert.equal(clearance.normalizeCode(" v8q2m-4lk-7r-1d6p9-x3 "), "V8Q2M4LK7R1D6P9X3");
});

test("parses tiered clearance codes", () => {
    const codes = clearance.parseCodes([
        "Tier 3",
        "V8Q2M-4LK-7R-1D6P9-X3",
        "",
        "Tier 5",
        "R9P4K-6VX-2T-7M3Q8-H1"
    ].join("\n"));

    assert.deepEqual(codes, {
        tier3: ["V8Q2M4LK7R1D6P9X3"],
        tier5: ["R9P4K6VX2T7M3Q8H1"]
    });
});

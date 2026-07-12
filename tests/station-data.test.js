const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
require("../scripts/modules/station-data.js");

test("exposes one complete, immutable-by-copy station descriptor set", () => {
    const stationData = globalThis.GalacticOperationsConsoleModules.stationData;
    const first = stationData.getDescriptors();
    const second = stationData.getDescriptors();

    assert.equal(first.length, 18);
    assert.equal(new Set(first.map((station) => station.name)).size, first.length);
    first[0].name = "Changed";
    assert.notEqual(second[0].name, "Changed");
});

const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
globalThis.fetch = async () => ({
    ok: true,
    text: async () => "Planet,Grid,Sector\n\"Test, Prime\",A1,Core\n"
});
require("../scripts/modules/navdata.js");

test("loads and parses quoted coordinate CSV fields", async () => {
    const records = await globalThis.GalacticOperationsConsoleModules.navData.loadCoordinateRecords(["test.csv"]);
    assert.equal(records.length, 1);
    assert.equal(records[0].fields.Planet, "Test, Prime");
    assert.equal(records[0].fields.Grid, "A1");
    assert.equal(globalThis.GalacticOperationsConsoleModules.navData.getLoadStatus(), "ready");
});

const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
const csvByPath = {
    "test.csv": "Planet,Grid,Sector\n\"Test, Prime\",A1,Core\n",
    "fallback.csv": "Planet,Grid,Sector\nFirst,A1,Known Sector\nSecond,A1,\nThird,A1,|\nOther,B2,\n"
};
globalThis.fetch = async (path) => ({ ok: true, text: async () => csvByPath[path] });
require("../scripts/modules/navdata.js");

test("loads and parses quoted coordinate CSV fields", async () => {
    const records = await globalThis.GalacticOperationsConsoleModules.navData.loadCoordinateRecords(["test.csv"]);
    assert.equal(records.length, 1);
    assert.equal(records[0].fields.Planet, "Test, Prime");
    assert.equal(records[0].fields.Grid, "A1");
    assert.equal(globalThis.GalacticOperationsConsoleModules.navData.getLoadStatus(), "ready");
});

test("uses the first listed grid planet when a sector is missing", async () => {
    const records = await globalThis.GalacticOperationsConsoleModules.navData.loadCoordinateRecords(["fallback.csv"]);
    assert.equal(records[1].fields.Sector, "First Sector");
    assert.equal(records[2].fields.Sector, "First Sector");
    assert.equal(records[3].fields.Sector, "Other Sector");
});

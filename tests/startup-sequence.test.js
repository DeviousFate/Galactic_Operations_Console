const assert = require("node:assert/strict");
const test = require("node:test");

globalThis.GalacticOperationsConsoleModules = {};
require("../scripts/modules/startup-sequence.js");

test("allocates the configured startup display window across all stages", () => {
    const config = {
        lines: ["> First line.", "> Waiting...", "> Override success."],
        accessGrantedLine: "SYSTEM ACCESS GRANTED",
        accessGrantedAfterIndex: 2,
        inlineReplacements: { 0: "> Complete." },
        timing: {
            displayDuration: 10_000,
            initialDelay: 500,
            typeDelay: 15,
            ellipsisTypeDelay: 100,
            ellipsisRepeatDelay: 75
        }
    };

    const durations = globalThis.GalacticOperationsConsoleModules.startupSequence.getStageDurations(config);
    assert.equal(durations.length, 4);
    assert.equal(durations.reduce((total, duration) => total + duration, 0), 9_500);
    assert.equal(durations.every((duration) => duration > 0), true);
});

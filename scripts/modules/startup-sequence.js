(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    modules.startupSequence = {
        getStageDurations(config) {
            return buildStageDurations(config);
        },

        async play(dashboard, config) {
            const popup = dashboard.querySelector("#isl-codex-startup");
            const output = dashboard.querySelector("#isl-codex-startup-lines");
            if (!popup || !output) return;

            popup.classList.remove("hidden");
            output.replaceChildren();
            resetEmblemState(dashboard);

            const startedAt = performance.now();
            const stageDurations = buildStageDurations(config);
            await delay(config.timing.initialDelay);

            let retryLine = null;
            let stageIndex = 0;
            let accessGrantedShown = false;
            for (const [index, text] of config.lines.entries()) {
                if (!dashboard.isConnected) return;

                const lineStartedAt = performance.now();
                const stageDuration = stageDurations[stageIndex++];
                let outputLine = null;
                let animation;

                if (index === 4 && retryLine) {
                    animation = replaceLine(retryLine, text, config.timing);
                } else {
                    outputLine = appendLine(output, text, config.timing);
                    animation = outputLine.typing;
                    if (index === 3) retryLine = outputLine.line;
                }

                const transitionAfterLine = index === 4;
                if (!transitionAfterLine) updateEmblemState(dashboard, text, config.lines);
                await animation;
                if (transitionAfterLine) updateEmblemState(dashboard, text, config.lines);

                const replacement = config.inlineReplacements[index];
                if (replacement) {
                    const leadTime = config.timing.replacementFade + config.timing.inlineResultDwell;
                    await delay(Math.max(0, stageDuration - (performance.now() - lineStartedAt) - leadTime));
                    await replaceLine(outputLine?.line, replacement, config.timing);
                }

                await delay(Math.max(0, stageDuration - (performance.now() - lineStartedAt)));

                if (index === config.accessGrantedAfterIndex) {
                    const grantedStartedAt = performance.now();
                    const granted = appendLine(output, config.accessGrantedLine, config.timing, true);
                    await granted.typing;
                    await delay(Math.max(0, stageDurations[stageIndex++] - (performance.now() - grantedStartedAt)));
                    accessGrantedShown = true;
                }
            }

            if (!dashboard.isConnected) return;
            if (!accessGrantedShown) {
                const grantedStartedAt = performance.now();
                const granted = appendLine(output, config.accessGrantedLine, config.timing, true);
                await granted.typing;
                await delay(Math.max(0, stageDurations[stageIndex++] - (performance.now() - grantedStartedAt)));
            }

            await delay(Math.max(0, config.timing.displayDuration - (performance.now() - startedAt)));
            if (dashboard.isConnected) popup.classList.add("hidden");
        }
    };

    function appendLine(output, text, timing, isAccessGranted = false) {
        const line = document.createElement("div");
        line.className = "isl-codex-startup-line";
        if (isAccessGranted) line.classList.add("isl-codex-startup-granted");
        if (/^> Failed\./i.test(text)) line.classList.add("isl-codex-startup-error");
        if (isSuccess(text)) line.classList.add("isl-codex-startup-success");

        const shouldType = !/^> (?:Failed\.|Override success\.)/i.test(text);
        const typing = shouldType ? typeLine(line, text, timing) : Promise.resolve(line.textContent = text);
        output.appendChild(line);
        return { line, typing };
    }

    async function typeLine(line, text, timing) {
        const hasEllipsis = text.endsWith("...");
        const baseText = hasEllipsis ? text.slice(0, -3) : text;
        line.classList.add("is-typing");
        line.textContent = "";

        await typeCharacters(line, baseText, timing.typeDelay);
        if (hasEllipsis) {
            await typeCharacters(line, "...", timing.ellipsisTypeDelay);
            await delay(timing.ellipsisRepeatDelay);
            line.textContent = baseText;
            await typeCharacters(line, "...", timing.ellipsisTypeDelay);
        }

        line.classList.remove("is-typing");
    }

    async function typeCharacters(line, text, delayMs) {
        for (const character of text) {
            line.textContent += character;
            await delay(delayMs);
        }
    }

    function buildStageDurations(config) {
        const stageLines = [...config.lines, config.accessGrantedLine];
        const availableDuration = config.timing.displayDuration - config.timing.initialDelay;
        const weights = stageLines.map((line, index) => getStageWeight(line, index, config));
        const totalWeight = weights.reduce((total, weight) => total + weight, 0);
        const durations = weights.map((weight) => Math.floor((weight / totalWeight) * availableDuration));
        durations[durations.length - 1] += availableDuration - durations.reduce((total, duration) => total + duration, 0);
        return durations;
    }

    function getStageWeight(text, index, config) {
        let weight = 1 + Math.min(0.45, estimateTypingDuration(text, config.timing) / 5_000);
        if (config.inlineReplacements[index]) weight += 0.18;
        if (/^> Failed\./i.test(text)) weight += 0.16;
        if (/^> Override success\./i.test(text)) weight += 0.08;
        return weight;
    }

    function estimateTypingDuration(text, timing) {
        if (/^> (?:Failed\.|Override success\.)/i.test(text)) return 0;

        const hasEllipsis = text.endsWith("...");
        const baseText = hasEllipsis ? text.slice(0, -3) : text;
        return (baseText.length * timing.typeDelay)
            + (hasEllipsis ? (6 * timing.ellipsisTypeDelay) + timing.ellipsisRepeatDelay : 0);
    }

    async function replaceLine(line, text, timing) {
        if (!line) return;

        line.classList.add("isl-codex-startup-clearing");
        await delay(timing.replacementFade);
        line.classList.remove("isl-codex-startup-clearing", "isl-codex-startup-error", "isl-codex-startup-success");
        if (isSuccess(text)) line.classList.add("isl-codex-startup-success");
        line.classList.add("isl-codex-startup-replacement");
        line.textContent = text;
    }

    function isSuccess(text) {
        return /^> (?:Override success\.|Encryption bypass: complete\.|Authentication spoof: complete\.)$/i.test(text);
    }

    function resetEmblemState(dashboard) {
        dashboard.querySelector(".isl-holo-emblem")?.classList.remove("is-distorting", "is-rebel-frequency");
    }

    function updateEmblemState(dashboard, text, lines) {
        const emblem = dashboard.querySelector(".isl-holo-emblem");
        if (!emblem) return;

        if (text === lines[2]) {
            emblem.classList.add("is-distorting");
        } else if (text === lines[4]) {
            emblem.classList.remove("is-distorting");
            emblem.classList.add("is-rebel-frequency");
        }
    }

    function delay(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }
})();

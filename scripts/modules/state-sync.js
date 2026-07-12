(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    modules.stateSync = {
        getLiveState(config) {
            let savedState = config.defaultLiveState;
            try {
                savedState = game.settings.get(config.moduleId, config.liveStateSettingKey);
            } catch (error) {
                savedState = config.defaultLiveState;
            }
            return normalizeLiveState(savedState, config);
        },

        normalizeLiveState(state = {}, config) {
            return normalizeLiveState(state, config);
        },

        normalizeLiveStatePartial(partial = {}, config) {
            return normalizeLiveStatePartial(partial, config);
        },

        async requestLiveStateUpdate(dashboard, partial, {
            successStatus = "",
            requestedStatus = "",
            errorStatus = "Active GM required to update operational telemetry.",
            statusTarget = "live"
        } = {}, config) {
            const normalizedPartial = normalizeLiveStatePartial(partial, config);
            if (!Object.keys(normalizedPartial).length) return null;

            if (game.user?.isGM && config.isPrimaryActiveGM()) {
                try {
                    const state = await this.persistLiveState(normalizedPartial, game.user.id, config);
                    if (successStatus) config.setLiveUpdateStatus(dashboard, successStatus, "", statusTarget);
                    return state;
                } catch (error) {
                    console.error(`${config.moduleId} | Failed to update operational telemetry`, error);
                    config.setLiveUpdateStatus(dashboard, "Operational telemetry update failed.", "error", statusTarget);
                    return null;
                }
            }

            if (!config.hasActiveGM()) {
                config.setLiveUpdateStatus(dashboard, errorStatus, "error", statusTarget);
                ui.notifications?.warn("Galactic Operations Console requires an active GM to update operational telemetry.");
                return null;
            }

            game.socket?.emit(config.socketName, {
                type: "requestLiveStateUpdate",
                requesterId: game.user?.id,
                partial: normalizedPartial
            });
            if (requestedStatus) config.setLiveUpdateStatus(dashboard, requestedStatus, "dirty", statusTarget);
            return null;
        },

        async persistLiveState(partial, requesterId = null, config) {
            if (!game.user?.isGM) return this.getLiveState(config);

            const normalizedPartial = normalizeLiveStatePartial(partial, config);
            const changedKeys = Object.keys(normalizedPartial);
            if (!changedKeys.length) return this.getLiveState(config);

            const state = normalizeLiveState({
                ...this.getLiveState(config),
                ...normalizedPartial
            }, config);
            await game.settings.set(config.moduleId, config.liveStateSettingKey, state);
            await config.applyLiveStateToOpenDashboards(state, { changedKeys });
            game.socket?.emit(config.socketName, {
                type: "liveStateUpdated",
                requesterId,
                state,
                changedKeys
            });
            if (changedKeys.includes("location")) await config.triggerFirstTimeSystemWarning(state);
            return state;
        }
    };

    function normalizeLiveState(state, config) {
        const location = String(state?.location ?? config.defaultLiveState.location).trim() || config.defaultLiveState.location;
        const shipGrid = config.normalizeGrid(state?.shipGrid ?? config.defaultLiveState.shipGrid) || config.defaultLiveState.shipGrid;
        return { location, shipGrid };
    }

    function normalizeLiveStatePartial(partial, config) {
        const normalized = {};
        if (Object.prototype.hasOwnProperty.call(partial, "location")) {
            const location = String(partial.location ?? "").trim();
            if (location) normalized.location = location;
        }
        if (Object.prototype.hasOwnProperty.call(partial, "shipGrid")) {
            const shipGrid = config.normalizeGrid(partial.shipGrid);
            if (shipGrid) normalized.shipGrid = shipGrid;
        }
        return normalized;
    }
})();

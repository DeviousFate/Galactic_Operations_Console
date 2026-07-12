(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    modules.missionControl = {
        getMissionBrief(config) {
            let missionBrief = config.defaultMissionBrief;
            try {
                const savedBrief = game.settings.get(config.moduleId, config.missionBriefSettingKey);
                if (typeof savedBrief === "string") missionBrief = savedBrief;
            } catch (error) {
                missionBrief = config.defaultMissionBrief;
            }
            if (missionBrief === config.defaultMissionBrief) {
                try {
                    const legacyData = game.settings.get(config.moduleId, config.legacyOpsSettingKey);
                    if (typeof legacyData?.mission === "string" && legacyData.mission.trim()) missionBrief = legacyData.mission;
                } catch (error) {
                    // Legacy OPS data is optional.
                }
            }
            return missionBrief;
        },

        applyToDashboard(dashboard, missionBrief, config) {
            const value = String(missionBrief ?? config.defaultMissionBrief);
            config.updateMissionStaticText(dashboard, value);
            dashboard.querySelectorAll("[data-mission-field]").forEach((field) => {
                field.value = value;
            });
        },

        applyToOpenDashboards(missionBrief, config) {
            document.querySelectorAll(".imperial-star-log-app .isl-dashboard").forEach((dashboard) => {
                this.applyToDashboard(dashboard, missionBrief, config);
                config.setMissionStatus(dashboard, "Confidential mission data synchronized.", "");
            });
        },

        async saveFromDashboard(dashboard, config) {
            if (!game.user?.isGM) {
                config.setMissionStatus(dashboard, "GM clearance required to save mission orders.", "error");
                return;
            }
            const missionBrief = dashboard.querySelector("[data-mission-field]")?.value ?? config.defaultMissionBrief;
            try {
                await this.persistMissionBrief(missionBrief, config);
                config.setMissionStatus(dashboard, "Mission orders saved.", "");
            } catch (error) {
                console.error(`${config.moduleId} | Failed to save mission brief`, error);
                config.setMissionStatus(dashboard, "Mission orders save failed.", "error");
            }
        },

        async persistMissionBrief(missionBrief, config) {
            if (!game.user?.isGM) return;
            const value = String(missionBrief ?? config.defaultMissionBrief);
            await game.settings.set(config.moduleId, config.missionBriefSettingKey, value);
            this.applyToOpenDashboards(value, config);
            game.socket?.emit(config.socketName, { type: "missionBriefSaved", missionBrief: value });
        }
    };
})();

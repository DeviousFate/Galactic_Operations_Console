(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    let activePan = null;
    let pendingMapClick = null;

    modules.mapUi = {
        renderGridOverlay(dashboard, calibration, config) {
            const svg = dashboard.querySelector("#isl-grid-overlay");
            if (!svg) return;

            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("preserveAspectRatio", "none");
            const fragment = document.createDocumentFragment();
            const navData = config.getDashboardNavData(dashboard);

            if (!config.getDashboardMapIndicatorsHidden(dashboard)) {
                const access = config.getDashboardRestrictionTierAccess(dashboard);
                config.restrictedGridEntries.forEach((entry) => {
                    const authorizedEntry = getAuthorizedEntry(entry, access, config);
                    const cell = gridToCell(entry.grid, calibration, config);
                    if (authorizedEntry && cell) renderRestrictedMarker(fragment, authorizedEntry, cell, calibration, config);
                });
            }

            renderNavDataFog(fragment, svg, calibration, navData, config);

            for (let col = 0; col <= config.gridColumns.length; col += 1) {
                fragment.appendChild(createSvgElement("line", {
                    class: col % 5 === 0 ? "isl-grid-line isl-grid-major-line" : "isl-grid-line",
                    x1: gridX(col, calibration, config), y1: gridY(0, calibration),
                    x2: gridX(col, calibration, config), y2: gridY(calibration.rows, calibration)
                }));
            }
            for (let row = 0; row <= calibration.rows; row += 1) {
                fragment.appendChild(createSvgElement("line", {
                    class: row % 5 === 0 ? "isl-grid-line isl-grid-major-line" : "isl-grid-line",
                    x1: gridX(0, calibration, config), y1: gridY(row, calibration),
                    x2: gridX(config.gridColumns.length, calibration, config), y2: gridY(row, calibration)
                }));
            }
            svg.replaceChildren(fragment);
        },

        getSpecialPositionPoint(mapPosition, calibration, config) {
            return getSpecialPositionPoint(mapPosition, calibration, config);
        },

        gridToCell(grid, calibration, config) {
            return gridToCell(grid, calibration, config);
        },

        cellWidth(calibration, config) {
            return cellWidth(calibration, config);
        },

        cellHeight(calibration) {
            return cellHeight(calibration);
        },

        gridX(col, calibration, config) {
            return gridX(col, calibration, config);
        },

        gridY(row, calibration) {
            return gridY(row, calibration);
        },

        gridToPoint(grid, calibration, config) {
            return gridToPoint(grid, calibration, config);
        },

        gridFromPointer(event, calibration, stage, config) {
            const rect = stage?.getBoundingClientRect?.();
            if (!rect?.width || !rect.height) return "";
            const rawX = Math.min(rect.width - 1, Math.max(0, event.clientX - rect.left)) / rect.width;
            const rawY = Math.min(rect.height - 1, Math.max(0, event.clientY - rect.top)) / rect.height;
            const relativeX = (rawX - calibration.left) / calibration.width;
            const relativeY = (rawY - calibration.top) / calibration.height;
            if (relativeX < 0 || relativeX >= 1 || relativeY < 0 || relativeY >= 1) return "";
            const column = config.gridColumns[Math.floor(relativeX * config.gridColumns.length)];
            const row = Math.floor(relativeY * calibration.rows) + 1;
            return column ? `${column}${row}` : "";
        },

        queueMapStageClick(dashboard, event, config) {
            if (event.button !== 0 || event.detail !== 1) return;
            if (pendingMapClick?.timer) clearTimeout(pendingMapClick.timer);

            const mapEvent = {
                target: event.target,
                currentTarget: event.currentTarget,
                clientX: event.clientX,
                clientY: event.clientY
            };
            const timer = setTimeout(() => {
                if (pendingMapClick?.timer !== timer || !dashboard.isConnected) return;
                pendingMapClick = null;
                void config.moveShipTokenFromMapClick(dashboard, mapEvent);
            }, 240);
            pendingMapClick = { dashboard, timer };
        },

        beginPan(dashboard, event) {
            if (event.button !== 2) return;
            const viewport = dashboard.querySelector("#isl-map-viewport");
            const stage = event.currentTarget;
            if (!viewport || !stage) return;

            activePan = {
                dashboard,
                viewport,
                stage,
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                scrollLeft: viewport.scrollLeft,
                scrollTop: viewport.scrollTop
            };
            stage.classList.add("isl-map-panning");
            stage.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
        },

        updatePan(event) {
            const pan = activePan;
            if (!pan || event.pointerId !== pan.pointerId || !pan.dashboard?.isConnected) return;
            pan.viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
            pan.viewport.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
            event.preventDefault();
            event.stopPropagation();
        },

        endPan(event) {
            const pan = activePan;
            if (!pan || event.pointerId !== pan.pointerId) return;
            if (pan.stage?.hasPointerCapture?.(event.pointerId)) pan.stage.releasePointerCapture(event.pointerId);
            pan.stage?.classList.remove("isl-map-panning");
            activePan = null;
            event.preventDefault();
            event.stopPropagation();
        },

        zoomAtCursorGrid(dashboard, event, config) {
            if (pendingMapClick?.dashboard === dashboard && pendingMapClick.timer) {
                clearTimeout(pendingMapClick.timer);
                pendingMapClick = null;
            }
            if (event.target.closest("#isl-ship-token, #isl-route-token, #isl-grid-edit-layer")) return;
            if (dashboard.dataset.routePlacement === "true") return;

            const grid = config.gridFromMapPointer(event);
            const point = config.gridToMapPoint(grid);
            const viewport = dashboard.querySelector("#isl-map-viewport");
            const stage = dashboard.querySelector("#isl-map-stage");
            if (!grid || !point || !viewport || !stage) return;

            const currentZoom = Number.parseFloat(stage.style.getPropertyValue("--isl-map-focus-zoom")) || 100;
            if (currentZoom > 100) {
                config.clearPlanetMapFocus(dashboard);
                event.preventDefault();
                return;
            }

            stage.style.setProperty("--isl-map-focus-zoom", `${config.cursorGridZoom}%`);
            config.centerMapViewport(viewport, stage, point);
            event.preventDefault();
        }
    };

    function getAuthorizedEntry(entry, access, config) {
        const restrictions = entry.restrictions?.length
            ? entry.restrictions
            : [{ tier: entry.tier, stronghold: entry.stronghold }];
        const authorized = restrictions
            .filter((restriction) => config.hasRestrictionTierAccess(restriction.tier, access))
            .sort((left, right) => right.tier.id - left.tier.id);
        if (!authorized.length) return null;
        return {
            ...entry,
            tier: authorized[0].tier,
            stronghold: authorized.some((restriction) => restriction.stronghold)
        };
    }

    function renderNavDataFog(fragment, svg, calibration, navData, config) {
        if (!config.getNavDataFogEnabled()) return;

        const unknownGrids = [];
        for (let column = 0; column < config.gridColumns.length; column += 1) {
            for (let row = 0; row < calibration.rows; row += 1) {
                const grid = `${config.gridColumns[column]}${row + 1}`;
                if (!config.hasGridMapVision(grid, navData)) unknownGrids.push({ column, row });
            }
        }
        if (!unknownGrids.length) return;

        const width = cellWidth(calibration, config);
        const height = cellHeight(calibration);
        const path = unknownGrids.map(({ column, row }) => {
            const x = gridX(column, calibration, config);
            const y = gridY(row, calibration);
            return `M${x} ${y}h${width}v${height}h-${width}Z`;
        }).join("");
        fragment.appendChild(createSvgElement("path", {
            class: "isl-navdata-fog",
            d: path
        }));
    }

    function renderRestrictedMarker(fragment, entry, cell, calibration, config) {
        const width = cellWidth(calibration, config);
        const height = cellHeight(calibration);
        const point = getMarkerPoint(entry, cell, calibration, config);
        const radius = Math.min(width, height) * 0.28;
        const tierClass = `isl-restricted-tier-${entry.tier.id}`;

        if (!entry.stronghold) {
            fragment.appendChild(createSvgElement("circle", {
                class: `isl-restricted-dot ${tierClass}`, cx: point.x, cy: point.y, r: radius * 0.44
            }));
            return;
        }

        ["isl-stronghold-pulse isl-stronghold-pulse-primary", "isl-stronghold-pulse isl-stronghold-pulse-secondary"]
            .forEach((className) => fragment.appendChild(createSvgElement("circle", {
                class: className, cx: point.x, cy: point.y, r: radius * 0.92
            })));
        fragment.appendChild(createSvgElement("polygon", {
            class: "isl-stronghold-diamond isl-stronghold-diamond-outer", points: diamondPoints(point.x, point.y, radius)
        }));
        fragment.appendChild(createSvgElement("polygon", {
            class: "isl-stronghold-diamond isl-stronghold-diamond-inner", points: diamondPoints(point.x, point.y, radius * 0.57)
        }));
        fragment.appendChild(createSvgElement("polygon", {
            class: "isl-stronghold-star", points: starPoints(point.x, point.y, radius * 0.52, radius * 0.24, 8)
        }));
    }

    function getMarkerPoint(entry, cell, calibration, config) {
        if (entry.planets?.some((planet) => config.normalizePlanetName(planet) === "CORUSCANT")) {
            return getSpecialPositionPoint("K9/K10/L9/L10 intersection", calibration, config);
        }
        return {
            x: gridX(cell.col, calibration, config) + (cellWidth(calibration, config) / 2),
            y: gridY(cell.row, calibration) + (cellHeight(calibration) / 2)
        };
    }

    function getSpecialPositionPoint(mapPosition, calibration, config) {
        if (String(mapPosition ?? "").trim().toUpperCase() !== "K9/K10/L9/L10 INTERSECTION") return null;
        return { x: gridX(config.gridColumns.indexOf("L"), calibration, config), y: gridY(9, calibration) };
    }

    function gridToCell(grid, calibration, config) {
        const match = config.normalizeGrid(grid).match(/^([A-Z])(\d+)$/);
        if (!match) return null;
        const col = config.gridColumns.indexOf(match[1]);
        const row = Number(match[2]) - 1;
        return col < 0 || row < 0 || row >= calibration.rows ? null : { col, row };
    }

    function cellWidth(calibration, config) {
        return (calibration.width / config.gridColumns.length) * 100;
    }

    function cellHeight(calibration) {
        return (calibration.height / calibration.rows) * 100;
    }

    function gridX(col, calibration, config) {
        return (calibration.left + ((col / config.gridColumns.length) * calibration.width)) * 100;
    }

    function gridY(row, calibration) {
        return (calibration.top + ((row / calibration.rows) * calibration.height)) * 100;
    }

    function gridToPoint(grid, calibration, config) {
        const cell = gridToCell(grid, calibration, config);
        return cell ? {
            x: gridX(cell.col + 0.5, calibration, config),
            y: gridY(cell.row + 0.5, calibration)
        } : null;
    }

    function diamondPoints(centerX, centerY, radius) {
        return [`${centerX},${centerY - radius}`, `${centerX + radius},${centerY}`, `${centerX},${centerY + radius}`, `${centerX - radius},${centerY}`].join(" ");
    }

    function starPoints(centerX, centerY, outerRadius, innerRadius, points) {
        const coordinates = [];
        for (let index = 0; index < points * 2; index += 1) {
            const radius = index % 2 === 0 ? outerRadius : innerRadius;
            const angle = (-Math.PI / 2) + ((Math.PI * index) / points);
            coordinates.push(`${centerX + (Math.cos(angle) * radius)},${centerY + (Math.sin(angle) * radius)}`);
        }
        return coordinates.join(" ");
    }

    function createSvgElement(tagName, attributes) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
        return element;
    }
})();

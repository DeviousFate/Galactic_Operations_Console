(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};
    let nodesCache;
    let connectionsCache;
    const routeCache = new Map();

    modules.navRouting = {
        findDirect(origin, destination, config) {
            return findRouteByNode(normalizeNode(origin?.name, config), normalizeNode(destination?.name, config), config);
        },

        findAdjacent(gridRoute, origin, destination, { avoidRestricted = false } = {}, config) {
            const routeCoordinates = gridRoute.map((grid) => config.parseGrid(grid)).filter(Boolean);
            if (routeCoordinates.length < 2 || !origin.coordinate || !destination.coordinate) return null;

            const accessNodes = getNodes(config).filter((node) => {
                const nodeCoordinate = config.parseGrid(node.grid);
                return nodeCoordinate && routeCoordinates.some((routeCoordinate) => (
                    Math.abs(routeCoordinate.column - nodeCoordinate.column) <= config.adjacentGridDistance
                    && Math.abs(routeCoordinate.row - nodeCoordinate.row) <= config.adjacentGridDistance
                ));
            });

            const approaches = new Map(accessNodes.map((entry) => [
                entry.node,
                config.calculateGridTransit(origin, buildAccessTarget(entry, origin.region, config), { avoidRestricted })
            ]));
            const departures = new Map(accessNodes.map((entry) => [
                entry.node,
                config.calculateGridTransit(buildAccessTarget(entry, destination.region, config), destination, { avoidRestricted })
            ]));

            let bestRoute = null;
            accessNodes.forEach((entry) => {
                accessNodes.forEach((exit) => {
                    if (entry.node === exit.node) return;

                    const laneRoute = findRouteByNode(entry.node, exit.node, config);
                    const approach = approaches.get(entry.node);
                    const departure = departures.get(exit.node);
                    if (!laneRoute || !Number.isFinite(approach?.hours) || !Number.isFinite(departure?.hours)) return;

                    const hours = approach.hours + laneRoute.hours + departure.hours;
                    if (bestRoute && hours >= bestRoute.hours) return;

                    bestRoute = {
                        ...laneRoute,
                        hours,
                        laneHours: laneRoute.hours,
                        access: { entryGrid: entry.grid, exitGrid: exit.grid },
                        grids: mergeGridPaths([approach.grids, laneRoute.grids, departure.grids], config)
                    };
                });
            });

            return bestRoute;
        },

        buildMajorRouteTransit(laneRoute, origin, destination, { avoidRestricted = false } = {}, config) {
            return buildMajorRouteTransit(laneRoute, origin, destination, { avoidRestricted }, config);
        },

        calculateGridTransit(origin, destination, { avoidRestricted = false } = {}, config) {
            if (!origin.coordinate || !destination.coordinate) return { hours: Infinity, grids: [] };
            if (origin.grid === destination.grid) return { hours: 0, grids: [origin.grid] };

            const grids = buildGridRoute(origin.coordinate, destination.coordinate, { avoidRestricted }, config);
            if (!grids.length) return { hours: Infinity, grids: [] };
            const hours = config.buildGridSegments(grids, origin, destination)
                .reduce((total, segment) => total + segment.hours, 0);
            return { hours, grids };
        },

        mergeGridPaths(paths, config) {
            return mergeGridPaths(paths, config);
        },

        buildGridRoute(originCoordinate, destinationCoordinate, options = {}, config) {
            return buildGridRoute(originCoordinate, destinationCoordinate, options, config);
        },

        getRestrictedEntries(gridRoute, options = {}, config) {
            return getRestrictedEntries(gridRoute, options, config);
        },

        getUnauthorizedRestrictedTransits(gridRoute, access, options = {}, config) {
            return getUnauthorizedRestrictedTransits(gridRoute, access, options, config);
        },

        getDirectTransitClearanceTarget(gridRoute, config) {
            return getDirectTransitClearanceTarget(gridRoute, config);
        },

        formatDirectTransitDenial(denial) {
            return `Direct transit denied at ${denial.grid}: Tier ${denial.tier.id} ${denial.tier.clearance} clearance required.`;
        },

        isMajorRouteAvailable(route, transitMode, origin, destination, access, authorizedGrids, config) {
            if (!route) return false;
            if (transitMode === "avoid-restricted") {
                return !getRestrictedEntries(route.grids, {
                    ignoredGrids: [origin.grid, destination.grid]
                }, config).length;
            }

            return !getUnauthorizedRestrictedTransits(route.grids, access, { authorizedGrids }, config).length;
        },

        calculateRoute(input, config) {
            const {
                origin,
                destination,
                transitMode,
                restrictionAccess,
                authorizedGrids,
                hyperdriveClass,
                realspaceLeg,
                regionTravelHours
            } = input;
            const isGridToGridRoute = Boolean(origin.coordinate && destination.coordinate);
            const directGridRoute = isGridToGridRoute
                ? buildGridRoute(origin.coordinate, destination.coordinate, {}, config)
                : [];
            const gridRoute = isGridToGridRoute
                ? buildGridRoute(origin.coordinate, destination.coordinate, {
                    avoidRestricted: transitMode === "avoid-restricted"
                }, config)
                : [];

            if (isGridToGridRoute && !gridRoute.length) {
                return { error: "No unrestricted hyperspace corridor is available for this route." };
            }

            const unauthorizedDirectTransit = transitMode === "direct-transit"
                ? getUnauthorizedRestrictedTransits(directGridRoute, restrictionAccess, { authorizedGrids }, config)
                : [];
            if (unauthorizedDirectTransit.length) {
                return { error: this.formatDirectTransitDenial(unauthorizedDirectTransit[0]) };
            }

            const gridSegments = gridRoute.length > 1
                ? config.buildGridSegments(gridRoute, origin, destination)
                : [];
            const sameGrid = Boolean(origin.grid && origin.grid === destination.grid);
            const baseHours = sameGrid
                ? 0
                : gridSegments.length
                ? gridSegments.reduce((total, segment) => total + segment.hours, 0)
                : regionTravelHours[origin.region]?.[destination.region] ?? 0;
            const directMajorHyperlaneRoute = this.buildMajorRouteTransit(
                this.findDirect(origin, destination, config),
                origin,
                destination,
                { avoidRestricted: transitMode === "avoid-restricted" },
                config
            );
            const adjacentMajorHyperlaneRoute = this.findAdjacent(gridRoute, origin, destination, {
                avoidRestricted: transitMode === "avoid-restricted"
            }, config);
            const availableMajorHyperlaneRoute = [directMajorHyperlaneRoute, adjacentMajorHyperlaneRoute]
                .filter((route) => this.isMajorRouteAvailable(
                    route,
                    transitMode,
                    origin,
                    destination,
                    restrictionAccess,
                    authorizedGrids,
                    config
                ))
                .sort((left, right) => left.hours - right.hours)[0] || null;
            const usesMajorHyperlane = Boolean(availableMajorHyperlaneRoute
                && (baseHours <= 0 || availableMajorHyperlaneRoute.hours < baseHours));
            const travelHours = usesMajorHyperlane ? availableMajorHyperlaneRoute.hours : baseHours;
            const hours = travelHours * hyperdriveClass;
            const days = hours / 24;
            const totalMinHours = hours + realspaceLeg.minHours;
            const totalMaxHours = hours + realspaceLeg.maxHours;
            const hyperspaceFuelUnits = hours > 0 ? Math.max(1, Math.ceil(days)) : 0;
            const realspaceFuelMin = realspaceLeg.minHours / 24;
            const realspaceFuelMax = realspaceLeg.maxHours / 24;
            const fuelUsedMin = hyperspaceFuelUnits + realspaceFuelMin;
            const fuelUsedMax = hyperspaceFuelUnits + realspaceFuelMax;

            return {
                origin,
                destination,
                transitMode,
                gridRoute,
                gridSegments,
                baseHours,
                travelHours,
                availableMajorHyperlaneRoute,
                majorHyperlaneRoute: usesMajorHyperlane ? availableMajorHyperlaneRoute : null,
                hyperdriveClass,
                realspaceLeg,
                hyperspaceFuelUnits,
                realspaceFuelMin,
                realspaceFuelMax,
                fuelUsedMin,
                fuelUsedMax,
                fuelRequiredMin: Math.ceil(fuelUsedMin),
                fuelRequiredMax: Math.ceil(fuelUsedMax),
                hours,
                days,
                totalMinHours,
                totalMaxHours
            };
        }
    };

    function findRouteByNode(originNode, destinationNode, config) {
        if (!originNode || !destinationNode || originNode === destinationNode) return null;

        const cacheKey = `${originNode}|${destinationNode}`;
        if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

        const distances = new Map([[originNode, 0]]);
        const routes = new Map([[originNode, { legs: [], grids: [] }]]);
        const pending = [{ node: originNode, hours: 0 }];
        const connections = getConnections(config);

        while (pending.length) {
            pending.sort((left, right) => left.hours - right.hours);
            const current = pending.shift();
            if (!current || current.hours !== distances.get(current.node)) continue;
            if (current.node === destinationNode) break;

            (connections.get(current.node) || []).forEach((edge) => {
                const totalHours = current.hours + edge.hours;
                if (totalHours >= (distances.get(edge.to) ?? Infinity)) return;

                const previousRoute = routes.get(current.node) || { legs: [], grids: [] };
                distances.set(edge.to, totalHours);
                routes.set(edge.to, {
                    legs: [...previousRoute.legs, edge],
                    grids: [...previousRoute.grids, edge.fromGrid, edge.toGrid]
                });
                pending.push({ node: edge.to, hours: totalHours });
            });
        }

        const route = routes.get(destinationNode);
        const hours = distances.get(destinationNode);
        if (!route?.legs.length || !Number.isFinite(hours)) {
            routeCache.set(cacheKey, null);
            return null;
        }

        const result = {
            hours,
            legs: route.legs,
            grids: route.grids.filter((grid, index, values) => grid && (index === 0 || values[index - 1] !== grid)),
            laneIds: [...new Set(route.legs.map((edge) => edge.lane.id))],
            laneNames: [...new Set(route.legs.map((edge) => `${edge.lane.id} ${edge.lane.name}`))]
        };
        routeCache.set(cacheKey, result);
        return result;
    }

    function buildMajorRouteTransit(laneRoute, origin, destination, { avoidRestricted = false } = {}, config) {
        if (!laneRoute?.legs?.length || !origin?.coordinate || !destination?.coordinate) return laneRoute;

        const entryLeg = laneRoute.legs[0];
        const exitLeg = laneRoute.legs.at(-1);
        const entry = buildAccessTarget({ node: entryLeg.from, grid: entryLeg.fromGrid }, origin.region, config);
        const exit = buildAccessTarget({ node: exitLeg.to, grid: exitLeg.toGrid }, destination.region, config);
        const approach = config.calculateGridTransit(origin, entry, { avoidRestricted });
        const departure = config.calculateGridTransit(exit, destination, { avoidRestricted });

        if (!Number.isFinite(approach?.hours) || !Number.isFinite(departure?.hours)) return null;

        return {
            ...laneRoute,
            hours: approach.hours + laneRoute.hours + departure.hours,
            laneHours: laneRoute.hours,
            access: { entryGrid: entry.grid, exitGrid: exit.grid },
            grids: mergeGridPaths([approach.grids, laneRoute.grids, departure.grids], config)
        };
    }

    function getConnections(config) {
        if (connectionsCache) return connectionsCache;

        const connections = new Map();
        const connect = (from, to, hours, lane, fromGrid, toGrid) => {
            const edges = connections.get(from) || [];
            edges.push({ from, to, hours, lane, fromGrid, toGrid });
            connections.set(from, edges);
        };

        config.hyperlanes.forEach((lane) => {
            lane.legs.forEach(([fromName, fromGrid, toName, toGrid, hours]) => {
                const from = normalizeNode(fromName, config);
                const to = normalizeNode(toName, config);
                connect(from, to, hours, lane, config.normalizeGrid(fromGrid), config.normalizeGrid(toGrid));
                connect(to, from, hours, lane, config.normalizeGrid(toGrid), config.normalizeGrid(fromGrid));
            });
        });

        connectionsCache = connections;
        return connectionsCache;
    }

    function getNodes(config) {
        if (nodesCache) return nodesCache;

        const nodes = new Map();
        config.hyperlanes.forEach((lane) => {
            lane.legs.forEach(([fromName, fromGrid, toName, toGrid]) => {
                addNode(nodes, fromName, fromGrid, config);
                addNode(nodes, toName, toGrid, config);
            });
        });

        nodesCache = [...nodes.values()];
        return nodesCache;
    }

    function addNode(nodes, name, grid, config) {
        const node = normalizeNode(name, config);
        const normalizedGrid = config.normalizeGrid(grid);
        if (!node || !normalizedGrid || nodes.has(node)) return;
        nodes.set(node, { node, grid: normalizedGrid });
    }

    function buildAccessTarget(node, fallbackRegion, config) {
        return {
            name: node.node,
            grid: node.grid,
            coordinate: config.parseGrid(node.grid),
            region: config.getGridRegion(node.grid, fallbackRegion)
        };
    }

    function normalizeNode(value, config) {
        const normalized = config.normalizePlanetName(value).replace(/[\u2018\u2019']/g, "");
        return config.aliases[normalized] || normalized;
    }

    function mergeGridPaths(paths, config) {
        return paths.flat().map(config.normalizeGrid).filter((grid, index, values) => (
            grid && (index === 0 || values[index - 1] !== grid)
        ));
    }

    function buildGridRoute(originCoordinate, destinationCoordinate, { avoidRestricted = false } = {}, config) {
        const directRoute = buildDirectGridRoute(originCoordinate, destinationCoordinate, config);
        if (!avoidRestricted || directRoute.length < 3) return directRoute;

        const restrictedTransit = getRestrictedEntries(directRoute, {
            ignoredGrids: [originCoordinate.grid, destinationCoordinate.grid]
        }, config);
        return restrictedTransit.length
            ? buildRestrictedGridAvoidanceRoute(originCoordinate, destinationCoordinate, config)
            : directRoute;
    }

    function buildDirectGridRoute(originCoordinate, destinationCoordinate, config) {
        const colDelta = destinationCoordinate.column - originCoordinate.column;
        const rowDelta = destinationCoordinate.row - originCoordinate.row;
        const steps = Math.max(Math.abs(colDelta), Math.abs(rowDelta));
        if (!steps) return [originCoordinate.grid];

        const route = [];
        for (let index = 0; index <= steps; index += 1) {
            const column = Math.round(originCoordinate.column + ((colDelta * index) / steps));
            const row = Math.round(originCoordinate.row + ((rowDelta * index) / steps));
            const grid = config.formatGrid(column, row);
            if (grid && route[route.length - 1] !== grid) route.push(grid);
        }
        return route;
    }

    function buildRestrictedGridAvoidanceRoute(originCoordinate, destinationCoordinate, config) {
        const originGrid = originCoordinate.grid;
        const destinationGrid = destinationCoordinate.grid;
        const blockedGrids = new Set(config.restrictedEntries.map((entry) => entry.grid));
        blockedGrids.delete(originGrid);
        blockedGrids.delete(destinationGrid);

        const previous = new Map();
        const visited = new Set([originGrid]);
        const pending = [originGrid];
        let cursor = 0;

        while (cursor < pending.length) {
            const currentGrid = pending[cursor++];
            if (currentGrid === destinationGrid) break;

            const coordinate = config.parseGrid(currentGrid);
            if (!coordinate) continue;
            getGridNeighbors(coordinate, config).forEach((neighbor) => {
                if (blockedGrids.has(neighbor) || visited.has(neighbor)) return;
                visited.add(neighbor);
                previous.set(neighbor, currentGrid);
                pending.push(neighbor);
            });
        }

        if (!visited.has(destinationGrid)) return [];
        const route = [];
        for (let grid = destinationGrid; grid; grid = previous.get(grid)) route.unshift(grid);
        return route;
    }

    function getGridNeighbors(coordinate, config) {
        const neighbors = [];
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
                if (!columnOffset && !rowOffset) continue;
                const grid = config.formatGrid(coordinate.column + columnOffset, coordinate.row + rowOffset);
                if (grid) neighbors.push(grid);
            }
        }
        return neighbors;
    }

    function getRestrictedEntries(gridRoute, { ignoredGrids = [] } = {}, config) {
        const ignored = new Set(ignoredGrids.map(config.normalizeGrid).filter(Boolean));
        const entries = new Map();
        expandGridRoute(gridRoute, config).forEach((grid) => {
            if (ignored.has(grid)) return;
            const entry = config.restrictedEntryByGrid.get(grid);
            if (entry) entries.set(grid, entry);
        });
        return [...entries.values()];
    }

    function expandGridRoute(gridRoute, config) {
        const grids = (Array.isArray(gridRoute) ? gridRoute : []).map(config.normalizeGrid).filter(Boolean);
        if (grids.length < 2) return grids;

        return grids.reduce((expanded, grid, index) => {
            if (!index) return [grid];
            const from = config.parseGrid(grids[index - 1]);
            const to = config.parseGrid(grid);
            return !from || !to
                ? mergeGridPaths([expanded, [grid]], config)
                : mergeGridPaths([expanded, buildDirectGridRoute(from, to, config)], config);
        }, []);
    }

    function getUnauthorizedRestrictedTransits(gridRoute, access, { authorizedGrids = [] } = {}, config) {
        const authorized = new Set(authorizedGrids.map(config.normalizeGrid).filter(Boolean));
        return getRestrictedEntries(gridRoute, {}, config)
            .map((entry) => {
                const restrictions = entry.restrictions?.length ? entry.restrictions : [{ tier: entry.tier }];
                const unauthorized = restrictions
                    .filter((restriction) => !authorized.has(entry.grid) && !config.hasRestrictionTierAccess(restriction.tier, access))
                    .sort((left, right) => right.tier.id - left.tier.id);
                return unauthorized.length ? { grid: entry.grid, tier: unauthorized[0].tier } : null;
            })
            .filter(Boolean);
    }

    function getDirectTransitClearanceTarget(gridRoute, config) {
        const entry = getRestrictedEntries(gridRoute, {}, config).find((candidate) => {
            const restriction = getTierThreeRestriction(candidate);
            return restriction && !config.hasNavigationClearance({ name: restriction.planet?.name, grid: candidate.grid });
        });
        if (!entry) return null;

        const restriction = getTierThreeRestriction(entry);
        return { name: restriction?.planet?.name || entry.grid, grid: entry.grid };
    }

    function getTierThreeRestriction(entry) {
        return (entry.restrictions ?? [])
            .filter((item) => Number(item.tier?.id) >= 3)
            .sort((left, right) => right.tier.id - left.tier.id)[0];
    }
})();

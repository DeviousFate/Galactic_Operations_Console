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
                        grids: config.mergeGridPaths(approach.grids, laneRoute.grids, departure.grids)
                    };
                });
            });

            return bestRoute;
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
})();

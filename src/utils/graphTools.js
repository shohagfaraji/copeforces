// Parses edge-list text into a graph object.
// Each line: "u v" or "u v w" (weighted). Nodes can be any token (numbers or names).
export function parseEdgeList(text) {
    const lines = text
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const nodeSet = new Set();
    const edges = [];

    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;
        const [u, v, w] = parts;
        const weight = w !== undefined ? Number(w) : 1;
        if (!Number.isFinite(weight)) continue;
        nodeSet.add(u);
        nodeSet.add(v);
        edges.push({ u, v, w: weight });
    }

    return { nodes: Array.from(nodeSet), edges };
}

export function buildAdjacency(nodes, edges, directed) {
    const adj = {};
    for (const node of nodes) adj[node] = [];
    for (const { u, v, w } of edges) {
        if (!adj[u]) adj[u] = [];
        if (!adj[v]) adj[v] = [];
        adj[u].push({ to: v, weight: w });
        if (!directed) adj[v].push({ to: u, weight: w });
    }
    return adj;
}

export function bfs(adj, start) {
    const visited = new Set([start]);
    const order = [start];
    const queue = [start];
    let head = 0;
    while (head < queue.length) {
        const current = queue[head++];
        for (const { to } of adj[current] || []) {
            if (!visited.has(to)) {
                visited.add(to);
                order.push(to);
                queue.push(to);
            }
        }
    }
    return order;
}

export function dfs(adj, start) {
    const visited = new Set();
    const order = [];
    const stack = [start];

    while (stack.length > 0) {
        const node = stack.pop();
        if (visited.has(node)) continue;
        visited.add(node);
        order.push(node);

        const neighbors = adj[node] || [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const { to } = neighbors[i];
            if (!visited.has(to)) stack.push(to);
        }
    }

    return order;
}

export function connectedComponents(nodes, adj) {
    const visited = new Set();
    const components = [];
    for (const node of nodes) {
        if (visited.has(node)) continue;
        const order = bfs(adj, node);
        order.forEach((n) => visited.add(n));
        components.push(order);
    }
    return components;
}

export function checkBipartite(nodes, adj) {
    const color = {};
    for (const start of nodes) {
        if (color[start] !== undefined) continue;
        color[start] = 0;
        const queue = [start];
        let head = 0;
        while (head < queue.length) {
            const current = queue[head++];
            for (const { to } of adj[current] || []) {
                if (color[to] === undefined) {
                    color[to] = 1 - color[current];
                    queue.push(to);
                } else if (color[to] === color[current]) {
                    return {
                        isBipartite: false,
                        color,
                        conflict: { u: current, v: to },
                    };
                }
            }
        }
    }
    return { isBipartite: true, color, conflict: null };
}

export function isBipartite(nodes, adj) {
    return checkBipartite(nodes, adj).isBipartite;
}

export function hasCycleUndirected(nodes, adj) {
    const visited = new Set();
    for (const start of nodes) {
        if (visited.has(start)) continue;
        const parent = {};
        const queue = [start];
        visited.add(start);
        let head = 0;
        while (head < queue.length) {
            const current = queue[head++];
            for (const { to } of adj[current] || []) {
                if (!visited.has(to)) {
                    visited.add(to);
                    parent[to] = current;
                    queue.push(to);
                } else if (to !== parent[current]) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function hasCycleDirected(nodes, adj) {
    const WHITE = 0,
        GRAY = 1,
        BLACK = 2;
    const color = {};
    nodes.forEach((n) => (color[n] = WHITE));

    for (const node of nodes) {
        if (color[node] !== WHITE) continue;

        color[node] = GRAY;
        const stack = [{ node, index: 0 }];

        while (stack.length > 0) {
            const frame = stack[stack.length - 1];
            const neighbors = adj[frame.node] || [];

            if (frame.index >= neighbors.length) {
                color[frame.node] = BLACK;
                stack.pop();
                continue;
            }

            const { to } = neighbors[frame.index++];
            if (color[to] === undefined) color[to] = WHITE;
            if (color[to] === GRAY) return true;
            if (color[to] === WHITE) {
                color[to] = GRAY;
                stack.push({ node: to, index: 0 });
            }
        }
    }
    return false;
}

export function analyzeDegrees(nodes, edges, directed) {
    const stats = {};
    const ensureNode = (node) => {
        if (!stats[node]) {
            stats[node] = {
                node,
                degree: 0,
                inDegree: 0,
                outDegree: 0,
            };
        }
        return stats[node];
    };

    nodes.forEach(ensureNode);

    for (const { u, v } of edges) {
        const from = ensureNode(u);
        const to = ensureNode(v);

        if (directed) {
            from.outDegree += 1;
            to.inDegree += 1;
        } else if (u === v) {
            from.degree += 2;
        } else {
            from.degree += 1;
            to.degree += 1;
        }
    }

    const rows = Object.values(stats);
    const edgeCount = edges.length;
    const selfLoops = edges.filter(({ u, v }) => u === v).length;

    if (directed) {
        const totalInDegree = rows.reduce((sum, row) => sum + row.inDegree, 0);
        const totalOutDegree = rows.reduce(
            (sum, row) => sum + row.outDegree,
            0,
        );
        return {
            directed: true,
            rows,
            edgeCount,
            selfLoops,
            totalInDegree,
            totalOutDegree,
            lawLabel: "sum in-degree = sum out-degree = |E|",
            lawHolds:
                totalInDegree === edgeCount && totalOutDegree === edgeCount,
        };
    }

    const totalDegree = rows.reduce((sum, row) => sum + row.degree, 0);
    return {
        directed: false,
        rows,
        edgeCount,
        selfLoops,
        totalDegree,
        lawLabel: "sum of degrees = 2|E|",
        lawHolds: totalDegree === 2 * edgeCount,
    };
}

export function dijkstra(nodes, adj, start) {
    const dist = {};
    const prev = {};
    nodes.forEach((n) => (dist[n] = Infinity));
    dist[start] = 0;
    const visited = new Set();

    for (const node of nodes) {
        for (const { weight } of adj[node] || []) {
            if (!Number.isFinite(weight) || weight < 0) {
                return {
                    dist,
                    prev,
                    error: "Dijkstra requires finite non-negative edge weights",
                };
            }
        }
    }

    while (visited.size < nodes.length) {
        let current = null;
        let best = Infinity;
        for (const node of nodes) {
            if (!visited.has(node) && dist[node] < best) {
                best = dist[node];
                current = node;
            }
        }
        if (current === null) break;
        visited.add(current);
        for (const { to, weight } of adj[current] || []) {
            if (dist[current] + weight < dist[to]) {
                dist[to] = dist[current] + weight;
                prev[to] = current;
            }
        }
    }

    return { dist, prev };
}

export function reconstructPath(prev, start, end) {
    if (start === end) return [start];
    if (prev[end] === undefined) return null;
    const path = [end];
    let current = end;
    while (current !== start) {
        current = prev[current];
        if (current === undefined) return null;
        path.push(current);
    }
    return path.reverse();
}

// Returns an array of {visiting, visited} snapshots, one per step,
// suitable for animated playback. "visiting" = the node just reached,
// "visited" = set of all nodes fully processed before this step.
export function bfsSteps(adj, start) {
    const steps = [];
    const visited = new Set([start]);
    const queue = [start];
    steps.push({ visiting: start, visited: new Set(), backtrackTo: null });

    let head = 0;
    while (head < queue.length) {
        const current = queue[head++];
        steps.push({
            visiting: current,
            visited: new Set(visited),
            backtrackTo: null,
        });
        for (const { to } of adj[current] || []) {
            if (!visited.has(to)) {
                visited.add(to);
                queue.push(to);
                steps.push({
                    visiting: to,
                    visited: new Set(visited),
                    backtrackTo: null,
                });
            }
        }
    }
    return steps;
}

export function dfsSteps(adj, start) {
    const steps = [];
    const visited = new Set();
    const stack = [{ node: start, index: 0, entered: false }];

    while (stack.length > 0) {
        const frame = stack[stack.length - 1];

        if (!frame.entered) {
            visited.add(frame.node);
            frame.entered = true;
            steps.push({
                visiting: frame.node,
                visited: new Set(visited),
                backtrackTo: null,
            });
        }

        const neighbors = adj[frame.node] || [];
        let next = null;
        while (frame.index < neighbors.length) {
            const { to } = neighbors[frame.index++];
            if (!visited.has(to)) {
                next = to;
                break;
            }
        }

        if (next !== null) {
            stack.push({ node: next, index: 0, entered: false });
            continue;
        }

        stack.pop();
        const parent = stack[stack.length - 1];
        if (parent) {
            steps.push({
                visiting: parent.node,
                visited: new Set(visited),
                backtrackTo: frame.node,
            });
        }
    }

    return steps;
}

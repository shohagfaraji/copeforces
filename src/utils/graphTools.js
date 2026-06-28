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
        nodeSet.add(u);
        nodeSet.add(v);
        edges.push({ u, v, w: w !== undefined ? Number(w) : 1 });
    }

    return { nodes: Array.from(nodeSet), edges };
}

export function buildAdjacency(nodes, edges, directed) {
    const adj = {};
    for (const node of nodes) adj[node] = [];
    for (const { u, v, w } of edges) {
        adj[u].push({ to: v, weight: w });
        if (!directed) adj[v].push({ to: u, weight: w });
    }
    return adj;
}

export function bfs(adj, start) {
    const visited = new Set([start]);
    const order = [start];
    const queue = [start];
    while (queue.length > 0) {
        const current = queue.shift();
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
    function visit(node) {
        visited.add(node);
        order.push(node);
        for (const { to } of adj[node] || []) {
            if (!visited.has(to)) visit(to);
        }
    }
    visit(start);
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

export function isBipartite(nodes, adj) {
    const color = {};
    for (const start of nodes) {
        if (color[start] !== undefined) continue;
        color[start] = 0;
        const queue = [start];
        while (queue.length > 0) {
            const current = queue.shift();
            for (const { to } of adj[current] || []) {
                if (color[to] === undefined) {
                    color[to] = 1 - color[current];
                    queue.push(to);
                } else if (color[to] === color[current]) {
                    return false;
                }
            }
        }
    }
    return true;
}

export function hasCycleUndirected(nodes, adj) {
    const visited = new Set();
    for (const start of nodes) {
        if (visited.has(start)) continue;
        const parent = {};
        const queue = [start];
        visited.add(start);
        while (queue.length > 0) {
            const current = queue.shift();
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

    function visit(node) {
        color[node] = GRAY;
        for (const { to } of adj[node] || []) {
            if (color[to] === GRAY) return true;
            if (color[to] === WHITE && visit(to)) return true;
        }
        color[node] = BLACK;
        return false;
    }

    for (const node of nodes) {
        if (color[node] === WHITE && visit(node)) return true;
    }
    return false;
}

export function dijkstra(nodes, adj, start) {
    const dist = {};
    const prev = {};
    nodes.forEach((n) => (dist[n] = Infinity));
    dist[start] = 0;
    const visited = new Set();

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

    while (queue.length > 0) {
        const current = queue.shift();
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

    function visit(node, parent) {
        visited.add(node);
        steps.push({
            visiting: node,
            visited: new Set(visited),
            backtrackTo: null,
        });

        for (const { to } of adj[node] || []) {
            if (!visited.has(to)) {
                visit(to, node);
                // Just returned from a deeper branch — show the backtrack
                // back to this node before continuing to the next neighbor.
                steps.push({
                    visiting: node,
                    visited: new Set(visited),
                    backtrackTo: to,
                });
            }
        }
    }

    visit(start, null);
    return steps;
}

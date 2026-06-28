// Parses either an edge list ("u v" per line) or a parent array
// ("child parent" per line, where parent -1 or 0 marks the root).
export function parseTreeInput(text) {
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
        const [a, b] = parts;
        nodeSet.add(a);
        if (b !== "-1" && b !== "0") {
            nodeSet.add(b);
            edges.push({ u: a, v: b, w: 1 });
        } else {
            nodeSet.add(a); // root with no parent — still a node
        }
    }

    return { nodes: Array.from(nodeSet), edges };
}

export function buildTreeAdjacency(nodes, edges) {
    const adj = {};
    nodes.forEach((n) => (adj[n] = []));
    for (const { u, v } of edges) {
        adj[u].push(v);
        adj[v].push(u);
    }
    return adj;
}

// Picks a root: the first node mentioned in input order that's
// also present in the node list. Caller can override.
export function pickRoot(nodes) {
    return nodes[0];
}

// Returns { parent, depth, order } via BFS from root.
export function buildTreeStructure(nodes, adj, root) {
    const parent = { [root]: null };
    const depth = { [root]: 0 };
    const order = [root];
    const queue = [root];
    const visited = new Set([root]);

    while (queue.length > 0) {
        const current = queue.shift();
        for (const neighbor of adj[current] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent[neighbor] = current;
                depth[neighbor] = depth[current] + 1;
                order.push(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return { parent, depth, order };
}

export function subtreeSizes(nodes, adj, root) {
    const sizes = {};
    const visited = new Set();

    function dfs(node) {
        visited.add(node);
        let size = 1;
        for (const neighbor of adj[node] || []) {
            if (!visited.has(neighbor)) {
                size += dfs(neighbor);
            }
        }
        sizes[node] = size;
        return size;
    }

    dfs(root);
    return sizes;
}

export function subtreeHeights(nodes, adj, root) {
    const heights = {};
    const visited = new Set();

    function dfs(node) {
        visited.add(node);
        let maxChildHeight = -1;
        for (const neighbor of adj[node] || []) {
            if (!visited.has(neighbor)) {
                maxChildHeight = Math.max(maxChildHeight, dfs(neighbor));
            }
        }
        heights[node] = maxChildHeight + 1;
        return heights[node];
    }

    dfs(root);
    return heights;
}

// LCA via parent-pointer climbing using depth — fine for hand-typed
// tree sizes; no need for binary lifting here.
export function findLCA(parent, depth, a, b) {
    let x = a,
        y = b;
    while (depth[x] > depth[y]) x = parent[x];
    while (depth[y] > depth[x]) y = parent[y];
    while (x !== y) {
        x = parent[x];
        y = parent[y];
    }
    return x;
}

export function pathToRoot(parent, node) {
    const path = [];
    let current = node;
    while (current !== null && current !== undefined) {
        path.push(current);
        current = parent[current];
    }
    return path;
}

// Diameter via two BFS passes: BFS from any node to find the farthest
// node u, then BFS from u to find the farthest node v — u..v is a
// diameter path. Returns { length, path }.
export function treeDiameter(nodes, adj) {
    function bfsFarthest(start) {
        const dist = { [start]: 0 };
        const parent = { [start]: null };
        const queue = [start];
        let farthest = start;
        while (queue.length > 0) {
            const current = queue.shift();
            for (const neighbor of adj[current] || []) {
                if (!(neighbor in dist)) {
                    dist[neighbor] = dist[current] + 1;
                    parent[neighbor] = current;
                    queue.push(neighbor);
                    if (dist[neighbor] > dist[farthest]) farthest = neighbor;
                }
            }
        }
        return { farthest, dist, parent };
    }

    if (nodes.length === 0) return { length: 0, path: [] };
    const first = bfsFarthest(nodes[0]);
    const second = bfsFarthest(first.farthest);

    const path = [];
    let current = second.farthest;
    while (current !== null && current !== undefined) {
        path.push(current);
        current = second.parent[current];
    }

    return { length: second.dist[second.farthest], path: path.reverse() };
}

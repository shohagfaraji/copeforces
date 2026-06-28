// Hierarchical top-down layout: BFS from the first node assigns each
// node a depth (row). Nodes within a row are spread evenly across
// the width. Disconnected nodes get appended as extra rows at the bottom.
export function computeLayout(nodes, edges, width, height) {
    const positions = {};
    if (nodes.length === 0) return positions;

    // Build undirected adjacency for layout purposes only (layout should
    // group connected nodes regardless of edge direction).
    const adjList = {};
    nodes.forEach((n) => (adjList[n] = []));
    for (const { u, v } of edges) {
        if (adjList[u]) adjList[u].push(v);
        if (adjList[v]) adjList[v].push(u);
    }

    const depth = {};
    const visited = new Set();
    let nextRow = 0;

    // BFS layering, starting a new BFS for each disconnected component,
    // in the order nodes first appeared in the input.
    for (const start of nodes) {
        if (visited.has(start)) continue;
        visited.add(start);
        depth[start] = nextRow;
        let queue = [start];
        let currentDepth = nextRow;

        while (queue.length > 0) {
            const nextQueue = [];
            for (const node of queue) {
                for (const neighbor of adjList[node]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        depth[neighbor] = currentDepth + 1;
                        nextQueue.push(neighbor);
                    }
                }
            }
            queue = nextQueue;
            currentDepth++;
        }
        nextRow = currentDepth + 1; // leave a gap before the next disconnected component
    }

    // Group nodes by row, preserving input order within each row
    const rows = {};
    for (const node of nodes) {
        const d = depth[node];
        if (!rows[d]) rows[d] = [];
        rows[d].push(node);
    }

    const rowCount = Math.max(...Object.values(depth)) + 1;
    const rowHeight = Math.max(70, (height - 60) / rowCount);
    const topMargin = 40;

    for (const rowIndexStr of Object.keys(rows)) {
        const rowIndex = Number(rowIndexStr);
        const rowNodes = rows[rowIndex];
        const y = topMargin + rowIndex * rowHeight;
        const spacing = width / (rowNodes.length + 1);

        rowNodes.forEach((node, i) => {
            positions[node] = {
                x: spacing * (i + 1),
                y,
            };
        });
    }

    return positions;
}

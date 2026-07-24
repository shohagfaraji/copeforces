export function computeLayout(nodes, edges, width, height) {
    const positions = {};
    if (nodes.length === 0) return positions;

    const adjList = {};
    nodes.forEach((n) => (adjList[n] = []));
    for (const { u, v } of edges) {
        if (adjList[u]) adjList[u].push(v);
        if (adjList[v]) adjList[v].push(u);
    }

    const depth = {};
    const visited = new Set();
    let nextRow = 0;

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
        nextRow = currentDepth + 1;
    }

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

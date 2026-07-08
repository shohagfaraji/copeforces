import { randomInt, shuffleArray, generateRandomArray } from "./debugTools.js";

export { generateRandomArray };

export function generateRandomString(length, alphabet = "lowercase") {
    const charsets = {
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        digits: "0123456789",
        alnum: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        binary: "01",
    };

    const chars = Object.prototype.hasOwnProperty.call(charsets, alphabet)
        ? charsets[alphabet]
        : String(alphabet ?? charsets.lowercase);
    const safeLength = Math.max(0, Math.trunc(Number(length)) || 0);
    if (chars.length === 0) return "";

    let result = "";

    for (let i = 0; i < safeLength; i++) {
        result += chars[randomInt(0, chars.length - 1)];
    }

    return result;
}

export function generateRandomPermutation(n) {
    const safeN = Math.max(0, Math.trunc(Number(n)) || 0);
    const base = Array.from({ length: safeN }, (_, i) => i + 1);
    return shuffleArray(base);
}

export function generateRandomTree(n, options = {}) {
    const { weighted = false, minWeight = 1, maxWeight = 10 } = options;
    const safeN = Math.max(0, Math.trunc(Number(n)) || 0);
    const edges = [];

    for (let child = 2; child <= safeN; child++) {
        const parent = randomInt(1, child - 1);
        const edge = { from: parent, to: child };

        if (weighted) edge.weight = randomInt(minWeight, maxWeight);

        edges.push(edge);
    }

    return edges;
}

export function generateRandomGraph(n, m, options = {}) {
    const nodeCount = Math.max(0, Math.trunc(Number(n)) || 0);
    const requestedEdges = Math.max(0, Math.trunc(Number(m)) || 0);
    const {
        directed = false,
        weighted = false,
        minWeight = 1,
        maxWeight = 10,
        allowSelfLoops = false,
        allowMultiEdges = false,
        connected = false,
    } = options;

    const edges = [];
    const seen = new Set();
    if (nodeCount === 0) return edges;

    const edgeKey = (u, v) =>
        directed ? `${u}-${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;

    const addEdge = (u, v) => {
        const edge = { from: u, to: v };
        if (weighted) edge.weight = randomInt(minWeight, maxWeight);
        edges.push(edge);
        seen.add(edgeKey(u, v));
    };

    const possibleEdges = (() => {
        if (allowMultiEdges) return Infinity;
        if (directed) {
            return allowSelfLoops
                ? nodeCount * nodeCount
                : nodeCount * (nodeCount - 1);
        }
        const withoutLoops = (nodeCount * (nodeCount - 1)) / 2;
        return allowSelfLoops ? withoutLoops + nodeCount : withoutLoops;
    })();

    const minimumConnectedEdges =
        connected && nodeCount > 1 ? nodeCount - 1 : 0;
    const targetEdges = Math.min(
        Math.max(requestedEdges, minimumConnectedEdges),
        possibleEdges,
    );

    if (connected && nodeCount > 1) {
        for (let child = 2; child <= nodeCount; child++) {
            const parent = randomInt(1, child - 1);
            addEdge(parent, child);
        }
    }

    // Bounded attempts: if the requested edge count is close to (or beyond)
    // what's actually possible under the no-multi-edge / no-self-loop
    // constraints, this stops instead of looping forever.
    let attempts = 0;
    const maxAttempts = Math.max(1000, targetEdges * 20);

    while (edges.length < targetEdges && attempts < maxAttempts) {
        attempts++;

        const u = randomInt(1, nodeCount);
        const v = randomInt(1, nodeCount);

        if (!allowSelfLoops && u === v) continue;
        if (!allowMultiEdges && seen.has(edgeKey(u, v))) continue;

        addEdge(u, v);
    }

    return edges;
}

export function generateRandomMatrix(rows, cols, min, max, options = {}) {
    const { symmetric = false } = options;
    const safeRows = Math.max(0, Math.trunc(Number(rows)) || 0);
    const safeCols = Math.max(0, Math.trunc(Number(cols)) || 0);
    const matrix = Array.from({ length: safeRows }, () =>
        new Array(safeCols).fill(0),
    );

    for (let i = 0; i < safeRows; i++) {
        for (let j = 0; j < safeCols; j++) {
            if (symmetric && safeRows === safeCols && j < i) {
                matrix[i][j] = matrix[j][i];
                continue;
            }

            matrix[i][j] = randomInt(min, max);
        }
    }

    return matrix;
}

export function generateRandomQueries(count, n, options = {}) {
    const { type = "range", valueMin = 1, valueMax = 100 } = options;
    const safeCount = Math.max(0, Math.trunc(Number(count)) || 0);
    const safeN = Math.max(0, Math.trunc(Number(n)) || 0);
    const queries = [];
    if (safeN === 0) return queries;

    for (let i = 0; i < safeCount; i++) {
        if (type === "point") {
            queries.push({
                index: randomInt(1, safeN),
                value: randomInt(valueMin, valueMax),
            });
        } else if (type === "update") {
            const l = randomInt(1, safeN);
            const r = randomInt(l, safeN);
            queries.push({ l, r, value: randomInt(valueMin, valueMax) });
        } else {
            const l = randomInt(1, safeN);
            const r = randomInt(l, safeN);
            queries.push({ l, r });
        }
    }

    return queries;
}

export function parseConstraints(text) {
    // Each line: "name min max", e.g. "n 1 100000"
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const parts = line.split(/\s+/);
            const [name, min, max] = parts;
            return {
                name: name || "?",
                min: Number(min),
                max: Number(max),
            };
        })
        .filter((c) => Number.isFinite(c.min) && Number.isFinite(c.max));
}

export function generateFromConstraints(constraints) {
    return constraints.map((c) => ({
        name: c.name,
        value: randomInt(Math.min(c.min, c.max), Math.max(c.min, c.max)),
    }));
}

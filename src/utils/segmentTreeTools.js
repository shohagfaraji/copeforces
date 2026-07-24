const MAX_VALUES = 32;

export function parseSegmentValues(input) {
    const tokens = String(input)
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean);

    if (tokens.length === 0) {
        return { values: [], error: "Enter at least one number." };
    }
    if (tokens.length > MAX_VALUES) {
        return {
            values: [],
            error: `Use at most ${MAX_VALUES} values so the tree stays readable.`,
        };
    }

    const values = tokens.map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
        return { values: [], error: "Every item must be a valid number." };
    }

    return { values, error: "" };
}

function combine(left, right) {
    return {
        sum: left.sum + right.sum,
        min: Math.min(left.min, right.min),
        max: Math.max(left.max, right.max),
    };
}

export function createSegmentTree(values) {
    if (!Array.isArray(values) || values.length === 0) {
        return { n: 0, nodes: [] };
    }

    const nodes = [];

    function build(index, left, right, depth) {
        if (left === right) {
            const value = values[left];
            nodes[index] = {
                index,
                left,
                right,
                depth,
                sum: value,
                min: value,
                max: value,
                lazy: 0,
            };
            return nodes[index];
        }

        const middle = Math.floor((left + right) / 2);
        const leftNode = build(index * 2, left, middle, depth + 1);
        const rightNode = build(index * 2 + 1, middle + 1, right, depth + 1);
        nodes[index] = {
            index,
            left,
            right,
            depth,
            ...combine(leftNode, rightNode),
            lazy: 0,
        };
        return nodes[index];
    }

    build(1, 0, values.length - 1, 0);
    return { n: values.length, nodes };
}

function cloneTree(tree) {
    return {
        n: tree.n,
        nodes: tree.nodes.map((node) => (node ? { ...node } : node)),
    };
}

function applyAdd(nodes, index, delta) {
    const node = nodes[index];
    const length = node.right - node.left + 1;
    node.sum += delta * length;
    node.min += delta;
    node.max += delta;
    node.lazy += delta;
}

function push(nodes, index) {
    const node = nodes[index];
    if (node.lazy === 0 || node.left === node.right) return;
    applyAdd(nodes, index * 2, node.lazy);
    applyAdd(nodes, index * 2 + 1, node.lazy);
    node.lazy = 0;
}

function pull(nodes, index) {
    const node = nodes[index];
    const aggregate = combine(nodes[index * 2], nodes[index * 2 + 1]);
    node.sum = aggregate.sum;
    node.min = aggregate.min;
    node.max = aggregate.max;
}

export function querySegmentTree(tree, queryLeft, queryRight, type = "sum") {
    if (!tree?.n || !["sum", "min", "max"].includes(type)) {
        return { value: null, visited: [] };
    }

    const visited = [];

    function query(index, inheritedLazy) {
        const node = tree.nodes[index];
        if (!node || queryRight < node.left || node.right < queryLeft) {
            return null;
        }

        visited.push(index);
        const length = node.right - node.left + 1;
        if (queryLeft <= node.left && node.right <= queryRight) {
            if (type === "sum") return node.sum + inheritedLazy * length;
            return node[type] + inheritedLazy;
        }

        const nextLazy = inheritedLazy + node.lazy;
        const leftValue = query(index * 2, nextLazy);
        const rightValue = query(index * 2 + 1, nextLazy);
        if (leftValue === null) return rightValue;
        if (rightValue === null) return leftValue;
        if (type === "sum") return leftValue + rightValue;
        if (type === "min") return Math.min(leftValue, rightValue);
        return Math.max(leftValue, rightValue);
    }

    return { value: query(1, 0), visited };
}

export function pointUpdateSegmentTree(tree, target, value) {
    const next = cloneTree(tree);
    const visited = [];

    function update(index) {
        const node = next.nodes[index];
        visited.push(index);
        if (node.left === node.right) {
            node.sum = value;
            node.min = value;
            node.max = value;
            node.lazy = 0;
            return;
        }

        push(next.nodes, index);
        const middle = Math.floor((node.left + node.right) / 2);
        update(target <= middle ? index * 2 : index * 2 + 1);
        pull(next.nodes, index);
    }

    update(1);
    return { tree: next, visited };
}

export function rangeAddSegmentTree(tree, updateLeft, updateRight, delta) {
    const next = cloneTree(tree);
    const visited = [];

    function update(index) {
        const node = next.nodes[index];
        if (!node || updateRight < node.left || node.right < updateLeft) return;

        visited.push(index);
        if (updateLeft <= node.left && node.right <= updateRight) {
            applyAdd(next.nodes, index, delta);
            return;
        }

        push(next.nodes, index);
        update(index * 2);
        update(index * 2 + 1);
        pull(next.nodes, index);
    }

    update(1);
    return { tree: next, visited };
}

export function segmentTreeValues(tree) {
    return Array.from(
        { length: tree.n },
        (_, index) => querySegmentTree(tree, index, index, "sum").value,
    );
}

export function segmentTreeLevels(tree) {
    const levels = [];
    for (const node of tree.nodes) {
        if (!node) continue;
        if (!levels[node.depth]) levels[node.depth] = [];
        levels[node.depth].push(node);
    }
    return levels;
}

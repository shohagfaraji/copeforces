export function parseMatrix(text) {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.split(/\s+/).map(Number));
}

export function parseIntegerMatrix(text) {
    const matrix = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.split(/\s+/));

    if (matrix.length === 0) return { matrix: [] };
    if (!isRectangular(matrix))
        return { error: "Matrix rows must have equal length" };

    for (const row of matrix) {
        for (const value of row) {
            if (!/^[+-]?\d+$/.test(value)) {
                return {
                    error: "Matrix multiplication and exponentiation require integer cells",
                };
            }
        }
    }

    return { matrix };
}

export function parseGrid(text) {
    return text
        .split("\n")
        .map((line) => line.replace(/\r$/, ""))
        .filter((line) => line.length > 0)
        .map((line) => [...line]);
}

export function isRectangular(matrix) {
    if (matrix.length === 0) return false;
    const width = matrix[0].length;
    return width > 0 && matrix.every((row) => row.length === width);
}

export function isNumericMatrix(matrix) {
    return (
        isRectangular(matrix) &&
        matrix.every((row) => row.every((value) => Number.isFinite(value)))
    );
}

export function transposeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const result = Array.from({ length: cols }, () => new Array(rows));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            result[c][r] = matrix[r][c];
        }
    }

    return result;
}

function rotate90CW(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const result = Array.from({ length: cols }, () => new Array(rows));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            result[c][rows - 1 - r] = matrix[r][c];
        }
    }

    return result;
}

function rotate90CCW(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const result = Array.from({ length: cols }, () => new Array(rows));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            result[cols - 1 - c][r] = matrix[r][c];
        }
    }

    return result;
}

export function rotateMatrix(matrix, times = 1, direction = "cw") {
    const normalizedTimes = ((times % 4) + 4) % 4;
    let result = matrix;

    for (let i = 0; i < normalizedTimes; i++) {
        result = direction === "ccw" ? rotate90CCW(result) : rotate90CW(result);
    }

    return result;
}

export function prefixSumMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const prefix = Array.from({ length: rows + 1 }, () =>
        new Array(cols + 1).fill(0),
    );

    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            prefix[r][c] =
                matrix[r - 1][c - 1] +
                prefix[r - 1][c] +
                prefix[r][c - 1] -
                prefix[r - 1][c - 1];
        }
    }

    return prefix;
}

export function rangeSum(prefix, r1, c1, r2, c2) {
    // inclusive, 0-indexed cell coordinates into the original matrix
    return (
        prefix[r2 + 1][c2 + 1] -
        prefix[r1][c2 + 1] -
        prefix[r2 + 1][c1] +
        prefix[r1][c1]
    );
}

// Matrix multiplication and exponentiation use BigInt internally.
// Regular doubles lose precision once products exceed 2^53 (which
// happens quickly once values get mod'ed by something like 1e9+7 and
// then multiplied), so this keeps results exact regardless of size.

export function multiplyMatricesBig(a, b, mod = null) {
    const rowsA = a.length;
    const colsA = a[0]?.length || 0;
    const rowsB = b.length;
    const colsB = b[0]?.length || 0;

    if (!isRectangular(a) || !isRectangular(b)) {
        return { error: "Matrix rows must have equal length" };
    }

    if (colsA !== rowsB) {
        return {
            error: `Dimension mismatch: A is ${rowsA}x${colsA}, B is ${rowsB}x${colsB}`,
        };
    }

    let modBig;
    try {
        modBig = mod != null && mod !== "" ? BigInt(mod) : null;
    } catch {
        return { error: "Mod must be a positive integer" };
    }
    if (modBig !== null && modBig <= 0n) {
        return { error: "Mod must be a positive integer" };
    }

    let A;
    let B;
    try {
        A = a.map((row) => row.map((x) => BigInt(x)));
        B = b.map((row) => row.map((x) => BigInt(x)));
    } catch {
        return { error: "Matrix multiplication requires integer cells" };
    }

    const result = Array.from({ length: rowsA }, () =>
        new Array(colsB).fill(0n),
    );

    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0n;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
                if (modBig) sum = ((sum % modBig) + modBig) % modBig;
            }
            result[i][j] = sum;
        }
    }

    return { matrix: result.map((row) => row.map((x) => x.toString())) };
}

export function identityMatrixBig(n) {
    return Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1n : 0n)),
    );
}

export function matrixPowerBig(matrix, power, mod = null) {
    const n = matrix.length;

    if (matrix.some((row) => row.length !== n)) {
        return { error: "Matrix exponentiation requires a square matrix" };
    }

    let p;
    try {
        p = BigInt(power);
    } catch {
        return { error: "Power must be a non-negative integer" };
    }

    if (p < 0n) {
        return { error: "Power must be a non-negative integer" };
    }

    let modBig;
    try {
        modBig = mod != null && mod !== "" ? BigInt(mod) : null;
    } catch {
        return { error: "Mod must be a positive integer" };
    }
    if (modBig !== null && modBig <= 0n) {
        return { error: "Mod must be a positive integer" };
    }

    let base;
    try {
        base = matrix.map((row) => row.map((x) => BigInt(x)));
    } catch {
        return { error: "Matrix exponentiation requires integer cells" };
    }

    let result = identityMatrixBig(n);

    const multiply = (X, Y) => {
        const R = Array.from({ length: n }, () => new Array(n).fill(0n));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let sum = 0n;
                for (let k = 0; k < n; k++) {
                    sum += X[i][k] * Y[k][j];
                    if (modBig) sum = ((sum % modBig) + modBig) % modBig;
                }
                R[i][j] = sum;
            }
        }
        return R;
    };

    while (p > 0n) {
        if (p % 2n === 1n) result = multiply(result, base);
        base = multiply(base, base);
        p /= 2n;
    }

    return { matrix: result.map((row) => row.map((x) => x.toString())) };
}

// ---------- Grid algorithms ----------

const FOUR_DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

export function floodFill(grid, sr, sc, newChar) {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    if (!isRectangular(grid)) {
        return { error: "Grid rows must have equal length" };
    }

    if (sr < 0 || sr >= rows || sc < 0 || sc >= cols) {
        return { error: "Start cell is outside the grid" };
    }

    const target = grid[sr][sc];
    if (target === newChar) {
        return { grid, filledCount: 0 };
    }

    const result = grid.map((row) => [...row]);
    const stack = [[sr, sc]];
    result[sr][sc] = newChar;
    let filledCount = 0;

    while (stack.length > 0) {
        const [r, c] = stack.pop();
        filledCount++;

        for (const [dr, dc] of FOUR_DIRS) {
            const nr = r + dr;
            const nc = c + dc;

            if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                result[nr][nc] === target
            ) {
                result[nr][nc] = newChar;
                stack.push([nr, nc]);
            }
        }
    }

    return { grid: result, filledCount };
}

export function gridBFS(grid, sr, sc, wallChar = "#") {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));

    if (!isRectangular(grid)) {
        return { error: "Grid rows must have equal length" };
    }

    if (
        sr < 0 ||
        sr >= rows ||
        sc < 0 ||
        sc >= cols ||
        grid[sr][sc] === wallChar
    ) {
        return { error: "Start cell is outside the grid or on a wall" };
    }

    dist[sr][sc] = 0;
    const queue = [[sr, sc]];
    let head = 0;
    let reachable = 1;

    while (head < queue.length) {
        const [r, c] = queue[head++];

        for (const [dr, dc] of FOUR_DIRS) {
            const nr = r + dr;
            const nc = c + dc;

            if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                grid[nr][nc] !== wallChar &&
                dist[nr][nc] === -1
            ) {
                dist[nr][nc] = dist[r][c] + 1;
                reachable++;
                queue.push([nr, nc]);
            }
        }
    }

    return { dist, reachable };
}

export function gridDFS(grid, sr, sc, wallChar = "#") {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const order = Array.from({ length: rows }, () => new Array(cols).fill(-1));

    if (!isRectangular(grid)) {
        return { error: "Grid rows must have equal length" };
    }

    if (
        sr < 0 ||
        sr >= rows ||
        sc < 0 ||
        sc >= cols ||
        grid[sr][sc] === wallChar
    ) {
        return { error: "Start cell is outside the grid or on a wall" };
    }

    let visitCounter = 1;
    const stack = [[sr, sc]];
    order[sr][sc] = visitCounter;

    while (stack.length > 0) {
        const [r, c] = stack.pop();

        for (const [dr, dc] of FOUR_DIRS) {
            const nr = r + dr;
            const nc = c + dc;

            if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                grid[nr][nc] !== wallChar &&
                order[nr][nc] === -1
            ) {
                order[nr][nc] = ++visitCounter;
                stack.push([nr, nc]);
            }
        }
    }

    return { order, visited: visitCounter };
}

export function spiralOrder(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const result = [];

    let top = 0;
    let bottom = rows - 1;
    let left = 0;
    let right = cols - 1;

    while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) result.push(matrix[top][c]);
        top++;

        for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
        right--;

        if (top <= bottom) {
            for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
            bottom--;
        }

        if (left <= right) {
            for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
            left++;
        }
    }

    return result;
}

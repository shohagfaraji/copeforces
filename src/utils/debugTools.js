// Normalize output for comparison
export function normalizeOutput(
    text,
    {
        ignoreWhitespace = false,
        ignoreBlankLines = false,
        trimTrailing = true,
    } = {},
) {
    let lines = text.replace(/\r/g, "").split("\n");

    if (trimTrailing) {
        lines = lines.map((line) => line.replace(/\s+$/, ""));
    }

    if (ignoreWhitespace) {
        lines = lines.map((line) => line.trim().replace(/\s+/g, " "));
    }

    if (ignoreBlankLines) {
        lines = lines.filter((line) => line.length > 0);
    }

    return lines;
}

// Compare two outputs
export function compareOutputs(expected, actual, options = {}) {
    const left = normalizeOutput(expected, options);
    const right = normalizeOutput(actual, options);

    const max = Math.max(left.length, right.length);

    for (let i = 0; i < max; i++) {
        if (left[i] !== right[i]) {
            return {
                identical: false,
                line: i + 1,
                expected: left[i] ?? "",
                actual: right[i] ?? "",
            };
        }
    }

    return {
        identical: true,
    };
}

// Full line diff
export function lineDifferences(expected, actual, options = {}) {
    const left = normalizeOutput(expected, options);
    const right = normalizeOutput(actual, options);

    const max = Math.max(left.length, right.length);

    const differences = [];

    for (let i = 0; i < max; i++) {
        if (left[i] !== right[i]) {
            differences.push({
                line: i + 1,
                expected: left[i] ?? "",
                actual: right[i] ?? "",
            });
        }
    }

    return differences;
}

// Character diff
export function characterDifference(expected, actual, options = {}) {
    const left = normalizeOutput(expected, options);
    const right = normalizeOutput(actual, options);

    const maxLines = Math.max(left.length, right.length);

    for (let line = 0; line < maxLines; line++) {
        const a = left[line] ?? "";
        const b = right[line] ?? "";

        const maxChars = Math.max(a.length, b.length);

        for (let col = 0; col < maxChars; col++) {
            if (a[col] !== b[col]) {
                return {
                    line: line + 1,
                    column: col + 1,
                    expected: a[col] ?? "",
                    actual: b[col] ?? "",
                    expectedLine: a,
                    actualLine: b,
                };
            }
        }
    }

    return null;
}

// Parse numbers from text
export function parseNumberArray(text) {
    return text
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite);
}

// Fisher–Yates shuffle
export function shuffleArray(array) {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

// Random integer
export function randomInt(min, max) {
    let lo = Math.ceil(Number(min));
    let hi = Math.floor(Number(max));

    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return 0;
    if (lo > hi) [lo, hi] = [hi, lo];

    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// Random array
export function generateRandomArray(
    length,
    min,
    max,
    {
        unique = false,
        sorted = false,
        reverse = false,
        permutation = false,
    } = {},
) {
    const safeLength = Math.max(0, Math.trunc(Number(length)) || 0);
    const lo = Math.ceil(Math.min(Number(min), Number(max)));
    const hi = Math.floor(Math.max(Number(min), Number(max)));
    let result = [];

    if (permutation) {
        result = Array.from({ length: safeLength }, (_, i) => i + 1);
        return shuffleArray(result);
    }

    if (unique) {
        const used = new Set();
        const possible = Math.max(0, hi - lo + 1);

        while (result.length < safeLength && used.size < possible) {
            const x = randomInt(lo, hi);

            if (!used.has(x)) {
                used.add(x);
                result.push(x);
            }
        }
    } else {
        for (let i = 0; i < safeLength; i++) {
            result.push(randomInt(lo, hi));
        }
    }

    if (sorted) {
        result.sort((a, b) => a - b);
    }

    if (reverse) {
        result.sort((a, b) => b - a);
    }

    return result;
}

// Sorted check
export function checkSorted(array, descending = false) {
    if (array.length <= 1) {
        return {
            sorted: true,
        };
    }

    for (let i = 1; i < array.length; i++) {
        if (!descending) {
            if (array[i] < array[i - 1]) {
                return {
                    sorted: false,
                    index: i,
                    left: array[i - 1],
                    right: array[i],
                };
            }
        } else {
            if (array[i] > array[i - 1]) {
                return {
                    sorted: false,
                    index: i,
                    left: array[i - 1],
                    right: array[i],
                };
            }
        }
    }

    return {
        sorted: true,
    };
}

// Duplicate finder
export function findDuplicates(array) {
    const frequency = new Map();

    for (const value of array) {
        frequency.set(value, (frequency.get(value) ?? 0) + 1);
    }

    const duplicates = [];

    for (const [value, count] of frequency) {
        if (count > 1) {
            duplicates.push({
                value,
                count,
            });
        }
    }

    duplicates.sort((a, b) => a.value - b.value);

    return duplicates;
}

// Frequency map
export function frequencyMap(array) {
    const map = new Map();

    for (const value of array) {
        map.set(value, (map.get(value) ?? 0) + 1);
    }

    return map;
}

// Compare frequencies
export function compareFrequencies(a, b) {
    const left = frequencyMap(a);
    const right = frequencyMap(b);

    const values = new Set([...left.keys(), ...right.keys()]);

    const differences = [];

    for (const value of values) {
        const c1 = left.get(value) ?? 0;
        const c2 = right.get(value) ?? 0;

        if (c1 !== c2) {
            differences.push({
                value,
                left: c1,
                right: c2,
            });
        }
    }

    return {
        identical: differences.length === 0,
        differences,
    };
}

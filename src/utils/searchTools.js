export function parseSortedArray(text) {
    return text
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
}

export function binarySearchTrace(arr, target) {
    let lo = 0;
    let hi = arr.length - 1;
    const steps = [];
    let foundIndex = -1;

    while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        const value = arr[mid];

        if (value === target) {
            steps.push({ lo, hi, mid, value, action: "found" });
            foundIndex = mid;
            break;
        } else if (value < target) {
            steps.push({ lo, hi, mid, value, action: "lo = mid + 1" });
            lo = mid + 1;
        } else {
            steps.push({ lo, hi, mid, value, action: "hi = mid - 1" });
            hi = mid - 1;
        }
    }

    return { steps, foundIndex };
}

export function lowerBound(arr, target) {
    let lo = 0;
    let hi = arr.length;

    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }

    return lo;
}

export function upperBound(arr, target) {
    let lo = 0;
    let hi = arr.length;

    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (arr[mid] <= target) lo = mid + 1;
        else hi = mid;
    }

    return lo;
}

export function firstOccurrence(arr, target) {
    const idx = lowerBound(arr, target);
    return idx < arr.length && arr[idx] === target ? idx : -1;
}

export function lastOccurrence(arr, target) {
    const idx = upperBound(arr, target) - 1;
    return idx >= 0 && arr[idx] === target ? idx : -1;
}

export function findAllOccurrences(arr, target) {
    // Plain O(n) scan — works regardless of whether arr is sorted.
    const indices = [];

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) indices.push(i);
    }

    return indices;
}

export function binarySearchOnAnswer(lo, hi, predicate) {
    // Finds the smallest x in [lo, hi] such that predicate(x) is true,
    // assuming predicate(x) is false...false, true...true (monotonic)
    // over the range. Returns answer = null if predicate(hi) is false.
    const steps = [];

    if (!predicate(hi)) {
        return { answer: null, steps };
    }

    let low = lo;
    let high = hi;

    while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        const ok = predicate(mid);
        steps.push({ lo: low, hi: high, mid, result: ok });

        if (ok) high = mid;
        else low = mid + 1;
    }

    return { answer: low, steps };
}

export function ternarySearch(f, lo, hi, options = {}) {
    const { mode = "min", integer = false, iterations = 60 } = options;
    const steps = [];
    const better = (a, b) => (mode === "min" ? a < b : a > b);

    let low = lo;
    let high = hi;

    if (integer) {
        while (high - low > 2) {
            const m1 = low + Math.floor((high - low) / 3);
            const m2 = high - Math.floor((high - low) / 3);
            const f1 = f(m1);
            const f2 = f(m2);

            steps.push({ lo: low, hi: high, m1, m2, f1, f2 });

            if (better(f1, f2)) high = m2 - 1;
            else if (better(f2, f1)) low = m1 + 1;
            else {
                low = m1;
                high = m2;
            }
        }

        let bestX = low;
        let bestVal = f(low);

        for (let x = low + 1; x <= high; x++) {
            const val = f(x);
            if (better(val, bestVal)) {
                bestVal = val;
                bestX = x;
            }
        }

        return { x: bestX, value: bestVal, steps };
    }

    for (let i = 0; i < iterations; i++) {
        const m1 = low + (high - low) / 3;
        const m2 = high - (high - low) / 3;
        const f1 = f(m1);
        const f2 = f(m2);

        if (i < 20) steps.push({ lo: low, hi: high, m1, m2, f1, f2 });

        if (better(f1, f2)) high = m2;
        else low = m1;
    }

    const x = (low + high) / 2;
    return { x, value: f(x), steps, totalIterations: iterations };
}

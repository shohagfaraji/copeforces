export const INT_MAX = 2147483647;
export const INT_MIN = -2147483648;
export const LLONG_MAX = Number("9223372036854775807");
export const INT_MAX_BIG = 2147483647n;
export const INT_MIN_BIG = -2147483648n;
export const LLONG_MAX_BIG = 9223372036854775807n;
export const LLONG_MIN_BIG = -9223372036854775808n;

function toExactBigInt(value) {
    if (typeof value === "bigint") return value;
    if (typeof value === "string" && /^[+-]?\d+$/.test(value.trim())) {
        return BigInt(value.trim());
    }
    if (
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        Number.isFinite(value)
    ) {
        return BigInt(value);
    }
    return null;
}

function absBigInt(value) {
    return value < 0n ? -value : value;
}

export function getDivisors(n) {
    const value = Math.abs(Math.trunc(Number(n)));
    if (!Number.isSafeInteger(value) || value <= 0) return [];
    const divisors = [];
    for (let i = 1; i <= Math.sqrt(value); i++) {
        if (value % i === 0) {
            divisors.push(i);
            if (i !== value / i) divisors.push(value / i);
        }
    }
    return divisors.sort((a, b) => a - b);
}

export function isPrime(n) {
    const value = Number(n);
    if (!Number.isSafeInteger(value) || value < 2) return false;
    if (value === 2) return true;
    if (value % 2 === 0) return false;
    for (let i = 3; i * i <= value; i += 2) {
        if (value % i === 0) return false;
    }
    return true;
}

export function toBinary(n) {
    if (n < 0) return "—";
    return n.toString(2);
}

export function gcdTwo(a, b) {
    let x = Math.abs(Math.trunc(Number(a)));
    let y = Math.abs(Math.trunc(Number(b)));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
    while (y !== 0) {
        [x, y] = [y, x % y];
    }
    return x;
}

export function lcmTwo(a, b) {
    const x = Math.trunc(Number(a));
    const y = Math.trunc(Number(b));
    if (!Number.isFinite(x) || !Number.isFinite(y) || x === 0 || y === 0) {
        return 0;
    }
    return Math.abs((x / gcdTwo(x, y)) * y);
}

export function gcdMany(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => gcdTwo(acc, n));
}

export function lcmMany(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => lcmTwo(acc, n));
}

export function primeFactorization(n) {
    const value = Math.abs(Math.trunc(Number(n)));
    if (!Number.isSafeInteger(value) || value < 2) return [];
    const factors = [];
    let remaining = value;
    for (let p = 2; p * p <= remaining; p++) {
        let exponent = 0;
        while (remaining % p === 0) {
            remaining /= p;
            exponent++;
        }
        if (exponent > 0) factors.push({ prime: p, exponent });
    }
    if (remaining > 1) factors.push({ prime: remaining, exponent: 1 });
    return factors;
}

export function sumOfDivisors(divisors) {
    return divisors.reduce((sum, d) => sum + d, 0);
}

export function eulerTotient(n) {
    const value = Math.abs(Math.trunc(Number(n)));
    if (!Number.isSafeInteger(value) || value < 1) return 0;
    let result = value;
    let remaining = value;
    for (let p = 2; p * p <= remaining; p++) {
        if (remaining % p === 0) {
            while (remaining % p === 0) remaining /= p;
            result -= result / p;
        }
    }
    if (remaining > 1) result -= result / remaining;
    return result;
}

export function digitSum(n) {
    const value = Math.abs(Math.trunc(Number(n)));
    if (!Number.isFinite(value)) return 0;
    return String(value)
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);
}

export function bitwiseAndMany(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => acc & n);
}

export function bitwiseOrMany(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => acc | n);
}

export function bitwiseXorMany(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => acc ^ n);
}

export function modPow(base, exponent, mod) {
    const modulus = BigInt(mod);
    const e = BigInt(exponent);
    if (modulus <= 0n || e < 0n) return null;
    if (modulus === 1n) return "0";

    let result = 1n;
    let b = ((BigInt(base) % modulus) + modulus) % modulus;
    let power = e;

    while (power > 0n) {
        if (power % 2n === 1n) {
            result = (result * b) % modulus;
        }
        power /= 2n;
        b = (b * b) % modulus;
    }

    return result.toString();
}

// --- C++ overflow awareness ---

// Returns "int", "long long", or "overflow" describing the smallest
// C++ integer type that can hold this value (assuming signed types).
export function cppTypeFor(value) {
    const exact = toExactBigInt(value);
    if (exact !== null) {
        if (exact >= INT_MIN_BIG && exact <= INT_MAX_BIG) return "int";
        if (exact >= LLONG_MIN_BIG && exact <= LLONG_MAX_BIG) {
            return "long long";
        }
        return "overflow";
    }

    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return "overflow";
    if (n >= INT_MIN && n <= INT_MAX) return "int";
    if (n >= -LLONG_MAX && n <= LLONG_MAX) return "long long";
    return "overflow";
}

// Checks whether a*b would exceed the given C++ type's max, without
// actually computing the (potentially huge/imprecise) product first.
export function multiplicationExceeds(a, b, limit) {
    const exactA = toExactBigInt(a);
    const exactB = toExactBigInt(b);
    const exactLimit = toExactBigInt(limit);

    if (exactA !== null && exactB !== null && exactLimit !== null) {
        if (exactA === 0n || exactB === 0n) return false;
        return absBigInt(exactA) > absBigInt(exactLimit) / absBigInt(exactB);
    }

    const x = Number(a);
    const y = Number(b);
    const max = Number(limit);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(max)) {
        return true;
    }
    if (x === 0 || y === 0) return false;
    return Math.abs(x) > Math.abs(max) / Math.abs(y);
}

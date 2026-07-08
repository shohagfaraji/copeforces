export const INT_MAX = 2147483647;
export const LLONG_MAX = Number("9223372036854775807");

export function getDivisors(n) {
    if (n <= 0) return [];
    const divisors = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            divisors.push(i);
            if (i !== n / i) divisors.push(n / i);
        }
    }
    return divisors.sort((a, b) => a - b);
}

export function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

export function toBinary(n) {
    if (n < 0) return "—";
    return n.toString(2);
}

export function gcdTwo(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function lcmTwo(a, b) {
    if (a === 0 || b === 0) return 0;
    return (a / gcdTwo(a, b)) * b;
}

export function gcdMany(numbers) {
    return numbers.reduce((acc, n) => gcdTwo(acc, n));
}

export function lcmMany(numbers) {
    return numbers.reduce((acc, n) => lcmTwo(acc, n));
}

export function primeFactorization(n) {
    if (n < 2) return [];
    const factors = [];
    let remaining = n;
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
    if (n < 1) return 0;
    let result = n;
    let remaining = n;
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
    return String(n)
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);
}

export function bitwiseAndMany(numbers) {
    return numbers.reduce((acc, n) => acc & n);
}

export function bitwiseOrMany(numbers) {
    return numbers.reduce((acc, n) => acc | n);
}

export function bitwiseXorMany(numbers) {
    return numbers.reduce((acc, n) => acc ^ n);
}

export function modPow(base, exponent, mod) {
    const modulus = BigInt(mod);
    if (modulus === 1n) return "0";

    let result = 1n;
    let b = ((BigInt(base) % modulus) + modulus) % modulus;
    let e = BigInt(exponent);

    while (e > 0n) {
        if (e % 2n === 1n) {
            result = (result * b) % modulus;
        }
        e /= 2n;
        b = (b * b) % modulus;
    }

    return result.toString();
}

// --- C++ overflow awareness ---

// Returns "int", "long long", or "overflow" describing the smallest
// C++ integer type that can hold this value (assuming signed types).
export function cppTypeFor(value) {
    const abs = Math.abs(value);
    if (abs <= INT_MAX) return "int";
    if (abs <= LLONG_MAX) return "long long";
    return "overflow";
}

// Checks whether a*b would exceed the given C++ type's max, without
// actually computing the (potentially huge/imprecise) product first.
export function multiplicationExceeds(a, b, limit) {
    if (a === 0 || b === 0) return false;
    return Math.abs(a) > limit / Math.abs(b);
}

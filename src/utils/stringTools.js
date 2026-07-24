export function isPalindrome(s) {
    const reversed = s.split("").reverse().join("");
    return s === reversed;
}

export function reverseString(s) {
    return s.split("").reverse().join("");
}

export function charFrequency(s) {
    const freq = {};
    for (const ch of s) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

export function polynomialHash(s, base, mod) {
    const b = BigInt(base);
    const m = BigInt(mod);
    if (m <= 0n) return null;

    let hash = 0n;
    for (let i = 0; i < s.length; i++) {
        const code = BigInt(s.charCodeAt(i));
        hash = (hash * b + code) % m;
    }
    return hash <= BigInt(Number.MAX_SAFE_INTEGER)
        ? Number(hash)
        : hash.toString();
}

export function prefixFunction(s) {
    const n = s.length;
    const pi = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
        let j = pi[i - 1];
        while (j > 0 && s[i] !== s[j]) {
            j = pi[j - 1];
        }
        if (s[i] === s[j]) j++;
        pi[i] = j;
    }
    return pi;
}

export function zFunction(s) {
    const n = s.length;
    const z = new Array(n).fill(0);
    let l = 0,
        r = 0;
    for (let i = 1; i < n; i++) {
        if (i < r) {
            z[i] = Math.min(r - i, z[i - l]);
        }
        while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
            z[i]++;
        }
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}

export function findOccurrences(text, pattern) {
    if (pattern.length === 0 || pattern.length > text.length) return [];
    const pi = prefixFunction(pattern);
    const positions = [];
    let matched = 0;

    for (let i = 0; i < text.length; i++) {
        while (matched > 0 && text[i] !== pattern[matched]) {
            matched = pi[matched - 1];
        }
        if (text[i] === pattern[matched]) matched++;
        if (matched === pattern.length) {
            positions.push(i - pattern.length + 1);
            matched = pi[matched - 1];
        }
    }
    return positions;
}

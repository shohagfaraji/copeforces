export function isPalindrome(s) {
    if (s.length === 0) return false;
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

// Polynomial hash: hash = (s[0]*base^(n-1) + s[1]*base^(n-2) + ... + s[n-1]) mod m
export function polynomialHash(s, base, mod) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        hash = (hash * base + code) % mod;
    }
    return hash;
}

// Prefix function (KMP failure function): pi[i] = length of the longest
// proper prefix of s[0..i] that is also a suffix of s[0..i].
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

// Z-function: z[i] = length of the longest substring starting at i
// that matches a prefix of s.
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

// Returns all starting indices (0-based) where pattern occurs in text, using KMP.
export function findOccurrences(text, pattern) {
    if (pattern.length === 0 || pattern.length > text.length) return [];
    const combined = pattern + "\u0001" + text;
    const pi = prefixFunction(combined);
    const positions = [];
    for (let i = pattern.length + 1; i < combined.length; i++) {
        if (pi[i] === pattern.length) {
            positions.push(i - 2 * pattern.length);
        }
    }
    return positions;
}

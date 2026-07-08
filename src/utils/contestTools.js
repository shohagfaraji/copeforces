export function convertBase(value, fromBase, toBase) {
    const clean = value.trim().toLowerCase();
    if (clean === "") return null;
    const negative = clean.startsWith("-");
    const digits = negative ? clean.slice(1) : clean;
    if (digits === "") return null;

    let n = 0n;
    const base = BigInt(fromBase);
    for (const ch of digits) {
        const d = parseInt(ch, 36);
        if (Number.isNaN(d) || d >= fromBase) return null;
        n = n * base + BigInt(d);
    }

    if (n === 0n) return "0";

    const outBase = BigInt(toBase);
    let result = "";
    while (n > 0n) {
        const digit = Number(n % outBase);
        result = digit.toString(36) + result;
        n = n / outBase;
    }
    return negative ? "-" + result : result;
}

const ROMAN_TABLE = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
];

export function toRoman(num) {
    if (!Number.isInteger(num) || num <= 0 || num > 3999) return null;
    let n = num;
    let result = "";
    for (const [value, symbol] of ROMAN_TABLE) {
        while (n >= value) {
            result += symbol;
            n -= value;
        }
    }
    return result;
}

const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const DECIMAL_INPUT_RE = /^[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:e[+-]?\d+)?$/i;

export function fromRoman(str) {
    const s = str.trim().toUpperCase();
    if (s === "" || !/^[IVXLCDM]+$/.test(s)) return null;

    let total = 0;
    let prevValue = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        const value = ROMAN_VALUES[s[i]];
        if (value < prevValue) {
            total -= value;
        } else {
            total += value;
            prevValue = value;
        }
    }
    if (toRoman(total) !== s) return null;
    return total;
}

const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };
const RIGHT_ASSOCIATIVE = new Set(["^"]);

function tokenize(expr) {
    const tokens = [];
    let i = 0;
    let expectOperand = true;

    while (i < expr.length) {
        const c = expr[i];
        if (/\s/.test(c)) {
            i++;
        } else if (
            (c === "+" || c === "-") &&
            expectOperand &&
            /[0-9.]/.test(expr[i + 1] || "")
        ) {
            let num = c;
            i++;
            let dots = 0;
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                if (expr[i] === ".") dots++;
                if (dots > 1) return null;
                num += expr[i];
                i++;
            }
            if (num === "+" || num === "-" || Number.isNaN(Number(num))) {
                return null;
            }
            tokens.push({ type: "num", value: Number(num) });
            expectOperand = false;
        } else if (
            (c === "+" || c === "-") &&
            expectOperand &&
            expr[i + 1] === "("
        ) {
            tokens.push({ type: "num", value: 0 });
            tokens.push({ type: "op", value: c });
            i++;
            expectOperand = true;
        } else if (/[0-9.]/.test(c)) {
            let num = "";
            let dots = 0;
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                if (expr[i] === ".") dots++;
                if (dots > 1) return null;
                num += expr[i];
                i++;
            }
            if (num === "." || Number.isNaN(Number(num))) return null;
            tokens.push({ type: "num", value: Number(num) });
            expectOperand = false;
        } else if ("+-*/%^()".includes(c)) {
            tokens.push({ type: "op", value: c });
            expectOperand = c !== ")";
            i++;
        } else {
            return null;
        }
    }
    return tokens;
}

export function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    if (!tokens || tokens.length === 0) return { error: "invalid expression" };

    const output = [];
    const opStack = [];

    for (const token of tokens) {
        if (token.type === "num") {
            output.push(token);
        } else if (token.value === "(") {
            opStack.push(token.value);
        } else if (token.value === ")") {
            while (opStack.length && opStack[opStack.length - 1] !== "(") {
                output.push({ type: "op", value: opStack.pop() });
            }
            if (opStack.length === 0)
                return { error: "mismatched parentheses" };
            opStack.pop();
        } else {
            while (
                opStack.length &&
                opStack[opStack.length - 1] !== "(" &&
                (RIGHT_ASSOCIATIVE.has(token.value)
                    ? PRECEDENCE[opStack[opStack.length - 1]] >
                      PRECEDENCE[token.value]
                    : PRECEDENCE[opStack[opStack.length - 1]] >=
                      PRECEDENCE[token.value])
            ) {
                output.push({ type: "op", value: opStack.pop() });
            }
            opStack.push(token.value);
        }
    }
    while (opStack.length) {
        const op = opStack.pop();
        if (op === "(") return { error: "mismatched parentheses" };
        output.push({ type: "op", value: op });
    }

    const evalStack = [];
    for (const token of output) {
        if (token.type === "num") {
            evalStack.push(token.value);
        } else {
            const b = evalStack.pop();
            const a = evalStack.pop();
            if (a === undefined || b === undefined) {
                return { error: "invalid expression" };
            }
            let result;
            switch (token.value) {
                case "+":
                    result = a + b;
                    break;
                case "-":
                    result = a - b;
                    break;
                case "*":
                    result = a * b;
                    break;
                case "/":
                    if (b === 0) return { error: "division by zero" };
                    result = a / b;
                    break;
                case "%":
                    if (b === 0) return { error: "division by zero" };
                    result = a % b;
                    break;
                case "^":
                    result = Math.pow(a, b);
                    break;
                default:
                    return { error: "unknown operator" };
            }
            evalStack.push(result);
        }
    }

    if (evalStack.length !== 1) return { error: "invalid expression" };
    return { result: evalStack[0] };
}

function pow10(exp) {
    return 10n ** BigInt(exp);
}

function parseExactDecimal(value) {
    const clean = value.trim();
    if (!DECIMAL_INPUT_RE.test(clean)) return null;

    const sign = clean.startsWith("-") ? -1n : 1n;
    const unsigned = clean.replace(/^[+-]/, "");
    const [mantissa, exponentPart = "0"] = unsigned.toLowerCase().split("e");
    const exponent = Number(exponentPart);
    if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 10000) {
        return null;
    }

    const [whole = "", fraction = ""] = mantissa.split(".");
    const digits = `${whole}${fraction}`.replace(/^0+(?=\d)/, "") || "0";
    const rawScale = fraction.length - exponent;

    if (rawScale <= 0) {
        return {
            int: sign * BigInt(digits) * pow10(-rawScale),
            scale: 0,
        };
    }

    return {
        int: sign * BigInt(digits),
        scale: rawScale,
    };
}

function normalizeExactDecimal(value) {
    let { int, scale } = value;
    while (scale > 0 && int % 10n === 0n) {
        int /= 10n;
        scale--;
    }
    return { int, scale };
}

function formatExactDecimal(value) {
    const normalized = normalizeExactDecimal(value);
    const negative = normalized.int < 0n;
    const digits = (negative ? -normalized.int : normalized.int).toString();

    if (normalized.scale === 0) {
        return `${negative ? "-" : ""}${digits}`;
    }

    const padded = digits.padStart(normalized.scale + 1, "0");
    const splitAt = padded.length - normalized.scale;
    const whole = padded.slice(0, splitAt);
    const fraction = padded.slice(splitAt).replace(/0+$/, "");

    return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

function alignExactDecimals(a, b) {
    const scale = Math.max(a.scale, b.scale);
    return {
        aInt: a.int * pow10(scale - a.scale),
        bInt: b.int * pow10(scale - b.scale),
        scale,
    };
}

function addExactDecimals(a, b) {
    const { aInt, bInt, scale } = alignExactDecimals(a, b);
    return { int: aInt + bInt, scale };
}

function subtractExactDecimals(a, b) {
    const { aInt, bInt, scale } = alignExactDecimals(a, b);
    return { int: aInt - bInt, scale };
}

function multiplyExactDecimals(a, b) {
    return { int: a.int * b.int, scale: a.scale + b.scale };
}

function divideExactDecimals(a, b, maxFractionDigits = 20) {
    if (b.int === 0n) return "÷0";

    const numerator = a.int * pow10(b.scale);
    const denominator = b.int * pow10(a.scale);
    const negative = numerator < 0n !== denominator < 0n;
    let dividend = numerator < 0n ? -numerator : numerator;
    const divisor = denominator < 0n ? -denominator : denominator;
    const integerPart = dividend / divisor;
    let remainder = dividend % divisor;

    if (remainder === 0n) {
        return `${negative ? "-" : ""}${integerPart}`;
    }

    let fraction = "";
    for (let i = 0; i < maxFractionDigits && remainder !== 0n; i++) {
        remainder *= 10n;
        fraction += (remainder / divisor).toString();
        remainder %= divisor;
    }

    return `${negative ? "-" : ""}${integerPart}.${fraction.replace(/0+$/, "")}${remainder === 0n ? "" : "..."}`;
}

function moduloExactDecimals(a, b) {
    if (b.int === 0n) return "÷0";

    const numerator = a.int * pow10(b.scale);
    const denominator = b.int * pow10(a.scale);
    const quotient = numerator / denominator;
    return formatExactDecimal(
        subtractExactDecimals(
            a,
            multiplyExactDecimals(b, {
                int: quotient,
                scale: 0,
            }),
        ),
    );
}

function powerExactDecimal(a, b) {
    const exponent = normalizeExactDecimal(b);
    if (exponent.scale !== 0) return "decimal exponent not supported";
    if (exponent.int < 0n) {
        if (exponent.int < -10000n) return "exponent too large";
        const positivePower = {
            int: a.int ** -exponent.int,
            scale: a.scale * Number(-exponent.int),
        };
        return divideExactDecimals({ int: 1n, scale: 0 }, positivePower);
    }
    if (exponent.int > 10000n) return "exponent too large";

    return formatExactDecimal({
        int: a.int ** exponent.int,
        scale: a.scale * Number(exponent.int),
    });
}

export function fastCalculate(aStr, bStr) {
    const cleanA = aStr.trim();
    const cleanB = bStr.trim();

    if (cleanA === "" || cleanB === "") {
        return { valid: false, error: "Enter valid numbers." };
    }

    const a = parseExactDecimal(cleanA);
    const b = parseExactDecimal(cleanB);
    if (!a || !b) {
        return { valid: false, error: "Enter valid numbers." };
    }

    return {
        valid: true,
        exact: true,
        ops: [
            {
                label: "a + b",
                value: formatExactDecimal(addExactDecimals(a, b)),
            },
            {
                label: "a − b",
                value: formatExactDecimal(subtractExactDecimals(a, b)),
            },
            {
                label: "a × b",
                value: formatExactDecimal(multiplyExactDecimals(a, b)),
            },
            { label: "a ÷ b", value: divideExactDecimals(a, b) },
            { label: "a mod b", value: moduloExactDecimals(a, b) },
            { label: "a ^ b", value: powerExactDecimal(a, b) },
        ],
    };
}

export function binaryCalculate(aStr, bStr, op) {
    const cleanA = aStr.trim();
    const cleanB = bStr.trim();

    if (!/^[01]+$/.test(cleanA) || !/^[01]+$/.test(cleanB)) {
        return { error: "Both values must be binary (0/1 only)." };
    }

    const a = BigInt(`0b${cleanA}`);
    const b = BigInt(`0b${cleanB}`);
    const width = BigInt(Math.max(cleanA.length, cleanB.length));
    let result;

    switch (op) {
        case "AND":
            result = a & b;
            break;
        case "OR":
            result = a | b;
            break;
        case "XOR":
            result = a ^ b;
            break;
        case "A+B":
            result = a + b;
            break;
        default:
            return { error: "unknown operator" };
    }

    const binary = result.toString(2);
    return {
        result: binary.padStart(Number(width), "0"),
        decimal: result.toString(),
    };
}

export function bigIntCalculate(aStr, bStr, op) {
    let a, b;
    try {
        a = BigInt(aStr.trim());
        b = BigInt(bStr.trim());
    } catch {
        return { error: "enter valid integers" };
    }

    let result;
    switch (op) {
        case "+":
            result = a + b;
            break;
        case "-":
            result = a - b;
            break;
        case "*":
            result = a * b;
            break;
        case "/":
            if (b === 0n) return { error: "division by zero" };
            result = a / b;
            break;
        case "%":
            if (b === 0n) return { error: "division by zero" };
            result = a % b;
            break;
        case "^":
            if (b < 0n) return { error: "negative exponent not supported" };
            if (b > 10000n) return { error: "exponent too large" };
            result = a ** b;
            break;
        default:
            return { error: "unknown operator" };
    }
    return {
        result: result.toString(),
        digits: result.toString().replace("-", "").length,
    };
}

export function floatPrecisionInfo(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;

    const exact = n.toPrecision(20);
    let decimalExpansion;
    try {
        decimalExpansion = n.toFixed(20);
    } catch {
        decimalExpansion = exact;
    }

    return {
        input: n,
        decimalExpansion,
        isSafeInteger: Number.isSafeInteger(n),
        epsilon: Number.EPSILON,
    };
}

export function compareFloatAddition(a, b) {
    const sum = a + b;
    return {
        sum,
        exactDecimal: sum.toFixed(20),
        looksClean: sum.toFixed(20).replace(/0+$/, "").length <= 4,
    };
}

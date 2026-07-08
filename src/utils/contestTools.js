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

import Decimal from "decimal.js";

const DEFAULT_PRECISION = 50;
const MAX_PRECISION = 1024;
const MAX_EXPRESSION_LENGTH = 20000;
const MAX_FACTORIAL = 5000n;
const MAX_COMBINATORIAL_STEPS = 2000n;
const MAX_INTEGER_EXPONENT = 100000n;
const MAX_ROOT_INDEX = 10000n;
const MAX_EXACT_RESULT_DIGITS = 50000n;
const MAX_DECIMAL_WORKING_PRECISION = 12000;
const MAX_EXP_INPUT = 1000;
const MAX_TRIG_INPUT = 1000000;

const performanceError = (detail) =>
    new Error(`Calculation blocked to keep the page responsive${detail ? ` (${detail})` : ""}`);

const FUNCTIONS = new Set([
    "sqrt",
    "cbrt",
    "root",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "ln",
    "log",
    "log2",
    "exp",
    "abs",
    "floor",
    "ceil",
    "round",
    "fact",
    "ncr",
    "npr",
    "gcd",
    "lcm",
]);

const CONSTANTS = new Set(["pi", "e", "ans"]);

const FUNCTION_ARITIES = {
    sqrt: [1],
    cbrt: [1],
    root: [2],
    sin: [1],
    cos: [1],
    tan: [1],
    asin: [1],
    acos: [1],
    atan: [1],
    sinh: [1],
    cosh: [1],
    tanh: [1],
    ln: [1],
    log: [1, 2],
    log2: [1],
    exp: [1],
    abs: [1],
    floor: [1],
    ceil: [1],
    round: [1],
    fact: [1],
    ncr: [2],
    npr: [2],
    gcd: [2],
    lcm: [2],
};

const EXACT_FUNCTIONS = new Set([
    "sqrt",
    "cbrt",
    "root",
    "fact",
    "npr",
    "ncr",
    "gcd",
    "lcm",
    "abs",
]);

function validateFunctionArity(node) {
    const allowed = FUNCTION_ARITIES[node.name];
    if (allowed.includes(node.args.length)) return;
    const expected = allowed.length === 1
        ? `${allowed[0]} ${allowed[0] === 1 ? "value" : "values"}`
        : `${allowed.slice(0, -1).join(", ")} or ${allowed.at(-1)} values`;
    throw new Error(`${node.name} expects ${expected}`);
}

function normalizeInput(expression) {
    return String(expression)
        .replace(/[×·]/g, "*")
        .replace(/÷/g, "/")
        .replace(/[−–]/g, "-")
        .replace(/π/g, "pi")
        .replace(/√/g, "sqrt")
        .replace(/²/g, "^2")
        .replace(/³/g, "^3");
}

function tokenize(expression) {
    const source = normalizeInput(expression);
    const tokens = [];
    let index = 0;

    while (index < source.length) {
        const char = source[index];
        if (/\s/.test(char)) {
            index += 1;
            continue;
        }

        if (/\d|\./.test(char)) {
            const start = index;
            let sawDot = false;
            if (char === ".") sawDot = true;
            index += 1;
            while (index < source.length && /\d|_/.test(source[index])) {
                index += 1;
            }
            if (!sawDot && source[index] === ".") {
                index += 1;
                while (index < source.length && /\d|_/.test(source[index])) {
                    index += 1;
                }
            }
            if (/[eE]/.test(source[index] || "")) {
                const exponentStart = index;
                index += 1;
                if (/[+-]/.test(source[index] || "")) index += 1;
                const digitsStart = index;
                while (index < source.length && /\d/.test(source[index])) {
                    index += 1;
                }
                if (digitsStart === index) index = exponentStart;
            }
            const value = source.slice(start, index).replaceAll("_", "");
            if (value === "." || !/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
                throw new Error(`Invalid number near position ${start + 1}`);
            }
            tokens.push({ type: "number", value });
            continue;
        }

        if (/[A-Za-z]/.test(char)) {
            const start = index;
            index += 1;
            while (index < source.length && /[A-Za-z0-9]/.test(source[index])) {
                index += 1;
            }
            tokens.push({
                type: "identifier",
                value: source.slice(start, index).toLowerCase(),
            });
            continue;
        }

        if ("+-*/%^!(),".includes(char)) {
            tokens.push({
                type: char === "(" || char === ")" ? "paren" : char === "," ? "comma" : "operator",
                value: char,
            });
            index += 1;
            continue;
        }

        throw new Error(`Unsupported character “${char}”`);
    }

    tokens.push({ type: "eof", value: "" });
    return tokens;
}

function startsPrimary(token) {
    return (
        token.type === "number" ||
        token.type === "identifier" ||
        (token.type === "paren" && token.value === "(")
    );
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }

    peek() {
        return this.tokens[this.index];
    }

    take() {
        const token = this.peek();
        this.index += 1;
        return token;
    }

    parse() {
        if (this.peek().type === "eof") throw new Error("Enter an expression");
        const expression = this.parseExpression(0);
        if (this.peek().type !== "eof") {
            throw new Error(`Unexpected “${this.peek().value}”`);
        }
        return expression;
    }

    parseExpression(minBindingPower) {
        let left = this.parsePrefix();

        while (true) {
            const token = this.peek();
            if (token.type === "operator" && token.value === "!") {
                if (40 < minBindingPower) break;
                this.take();
                left = { type: "postfix", operator: "!", argument: left };
                continue;
            }

            const implicit = startsPrimary(token);
            if (!implicit && token.type !== "operator") break;
            const operator = implicit ? "*" : token.value;
            const binding = {
                "+": [10, 11],
                "-": [10, 11],
                "*": [20, 21],
                "/": [20, 21],
                "%": [20, 21],
                "^": [30, 30],
            }[operator];
            if (!binding || binding[0] < minBindingPower) break;
            if (!implicit) this.take();
            const right = this.parseExpression(binding[1]);
            left = { type: "binary", operator, left, right, implicit };
        }

        return left;
    }

    parsePrefix() {
        const token = this.take();
        if (token.type === "number") return { type: "number", value: token.value };

        if (token.type === "operator" && (token.value === "+" || token.value === "-")) {
            return {
                type: "unary",
                operator: token.value,
                argument: this.parseExpression(25),
            };
        }

        if (token.type === "paren" && token.value === "(") {
            const expression = this.parseExpression(0);
            const closing = this.take();
            if (closing.type !== "paren" || closing.value !== ")") {
                throw new Error("Missing closing parenthesis");
            }
            return { type: "group", expression };
        }

        if (token.type === "identifier") {
            if (CONSTANTS.has(token.value) && this.peek().value !== "(") {
                return { type: "constant", name: token.value };
            }
            if (!FUNCTIONS.has(token.value)) {
                throw new Error(`Unknown function or constant “${token.value}”`);
            }
            const opening = this.take();
            if (opening.type !== "paren" || opening.value !== "(") {
                throw new Error(`${token.value} needs parentheses`);
            }
            const args = [];
            if (!(this.peek().type === "paren" && this.peek().value === ")")) {
                while (true) {
                    args.push(this.parseExpression(0));
                    if (this.peek().type !== "comma") break;
                    this.take();
                }
            }
            const closing = this.take();
            if (closing.type !== "paren" || closing.value !== ")") {
                throw new Error(`Missing closing parenthesis for ${token.value}`);
            }
            return { type: "function", name: token.value, args };
        }

        throw new Error(token.type === "eof" ? "Expression is incomplete" : `Unexpected “${token.value}”`);
    }
}

export function parseScientificExpression(expression) {
    try {
        if (String(expression).length > MAX_EXPRESSION_LENGTH) {
            throw performanceError("expression is too long");
        }
        return { ast: new Parser(tokenize(expression)).parse() };
    } catch (error) {
        return { error: error.message };
    }
}

function requireArgs(name, args, count) {
    if (args.length !== count) {
        throw new Error(`${name} expects ${count} ${count === 1 ? "value" : "values"}`);
    }
}

function requireInteger(value, label = "Value") {
    if (!value.isInteger()) throw new Error(`${label} must be an integer`);
    return BigInt(value.toFixed(0));
}

function bigintGcd(a, b) {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) [x, y] = [y, x % y];
    return x;
}

function bigintDigits(value) {
    return BigInt((value < 0n ? -value : value).toString().length);
}

function guardExactDigits(estimatedDigits) {
    if (estimatedDigits > MAX_EXACT_RESULT_DIGITS) {
        throw performanceError("exact result limit: about 50,000 digits");
    }
}

function factorialBigInt(n) {
    if (n < 0n) throw new Error("Factorial is only defined for non-negative integers");
    if (n > MAX_FACTORIAL) throw performanceError("factorial limit: 5,000");
    let result = 1n;
    for (let i = 2n; i <= n; i += 1n) result *= i;
    return result;
}

function permutations(n, r) {
    if (n < 0n || r < 0n || r > n) throw new Error("nPr requires 0 ≤ r ≤ n");
    if (r > MAX_COMBINATORIAL_STEPS) throw performanceError("nPr step limit: 2,000");
    guardExactDigits(bigintDigits(n) * r);
    let result = 1n;
    for (let i = 0n; i < r; i += 1n) result *= n - i;
    return result;
}

function combinations(n, r) {
    if (n < 0n || r < 0n || r > n) throw new Error("nCr requires 0 ≤ r ≤ n");
    let k = r > n - r ? n - r : r;
    if (k > MAX_COMBINATORIAL_STEPS) throw performanceError("nCr step limit: 2,000");
    guardExactDigits(bigintDigits(n) * k);
    let result = 1n;
    for (let i = 1n; i <= k; i += 1n) result = (result * (n - k + i)) / i;
    return result;
}

function exactNthRoot(value, degree) {
    if (degree > MAX_ROOT_INDEX) throw performanceError("root index limit: 10,000");
    if (degree <= 0n) return null;
    const negative = value < 0n;
    if (negative && degree % 2n === 0n) return null;
    const target = negative ? -value : value;
    if (target < 2n || degree === 1n) return negative ? -target : target;

    const bitLength = BigInt(target.toString(2).length);
    if (degree > bitLength) return null;
    let estimate = 1n << ((bitLength + degree - 1n) / degree);
    while (true) {
        const divisor = estimate ** (degree - 1n);
        const next = ((degree - 1n) * estimate + target / divisor) / degree;
        if (next >= estimate) break;
        estimate = next;
    }
    if (estimate ** degree !== target) return null;
    return negative ? -estimate : estimate;
}

function toRadians(value, angleMode, DecimalMath) {
    if (angleMode === "rad") return value;
    const pi = DecimalMath.acos(-1);
    return angleMode === "grad" ? value.times(pi).div(200) : value.times(pi).div(180);
}

function fromRadians(value, angleMode, DecimalMath) {
    if (angleMode === "rad") return value;
    const pi = DecimalMath.acos(-1);
    return angleMode === "grad" ? value.times(200).div(pi) : value.times(180).div(pi);
}

function guardMagnitude(value, maximum, detail) {
    if (value.abs().greaterThan(maximum)) throw performanceError(detail);
}

function evaluateFunction(node, values, context) {
    const { DecimalMath, angleMode } = context;
    const name = node.name;
    const args = values;
    const oneArg = () => requireArgs(name, args, 1);

    switch (name) {
        case "sqrt":
            oneArg();
            if (args[0].isNegative()) throw new Error("Square root needs a non-negative value");
            return args[0].sqrt();
        case "cbrt":
            oneArg();
            return args[0].isNegative() ? args[0].negated().pow(new DecimalMath(1).div(3)).negated() : args[0].pow(new DecimalMath(1).div(3));
        case "root": { // root(index, radicand)
            requireArgs(name, args, 2);
            const index = requireInteger(args[0], "Root index");
            if (index === 0n) throw new Error("Root index cannot be zero");
            if (index > MAX_ROOT_INDEX || index < -MAX_ROOT_INDEX) throw performanceError("root index limit: 10,000");
            if (args[1].isNegative() && index % 2n === 0n) throw new Error("Even roots need a non-negative value");
            const exponent = new DecimalMath(1).div(index.toString());
            return args[1].isNegative() ? args[1].negated().pow(exponent).negated() : args[1].pow(exponent);
        }
        case "sin": oneArg(); guardMagnitude(args[0], MAX_TRIG_INPUT, "trigonometric input limit: 1,000,000"); return DecimalMath.sin(toRadians(args[0], angleMode, DecimalMath));
        case "cos": oneArg(); guardMagnitude(args[0], MAX_TRIG_INPUT, "trigonometric input limit: 1,000,000"); return DecimalMath.cos(toRadians(args[0], angleMode, DecimalMath));
        case "tan": oneArg(); guardMagnitude(args[0], MAX_TRIG_INPUT, "trigonometric input limit: 1,000,000"); return DecimalMath.tan(toRadians(args[0], angleMode, DecimalMath));
        case "asin": oneArg(); return fromRadians(DecimalMath.asin(args[0]), angleMode, DecimalMath);
        case "acos": oneArg(); return fromRadians(DecimalMath.acos(args[0]), angleMode, DecimalMath);
        case "atan": oneArg(); return fromRadians(DecimalMath.atan(args[0]), angleMode, DecimalMath);
        case "sinh": oneArg(); guardMagnitude(args[0], MAX_EXP_INPUT, "hyperbolic input limit: 1,000"); return DecimalMath.sinh(args[0]);
        case "cosh": oneArg(); guardMagnitude(args[0], MAX_EXP_INPUT, "hyperbolic input limit: 1,000"); return DecimalMath.cosh(args[0]);
        case "tanh": oneArg(); guardMagnitude(args[0], MAX_EXP_INPUT, "hyperbolic input limit: 1,000"); return DecimalMath.tanh(args[0]);
        case "ln": oneArg(); if (!args[0].isPositive()) throw new Error("ln needs a positive value"); return DecimalMath.ln(args[0]);
        case "log": {
            if (args.length === 1) {
                if (!args[0].isPositive()) throw new Error("log needs a positive value");
                return DecimalMath.log10(args[0]);
            }
            requireArgs(name, args, 2);
            const [base, value] = args;
            if (!base.isPositive() || base.equals(1)) throw new Error("Log base must be positive and cannot be 1");
            if (!value.isPositive()) throw new Error("Log value must be positive");
            return value.log(base);
        }
        case "log2": oneArg(); if (!args[0].isPositive()) throw new Error("log2 needs a positive value"); return DecimalMath.log2(args[0]);
        case "exp": oneArg(); guardMagnitude(args[0], MAX_EXP_INPUT, "exp input limit: 1,000"); return DecimalMath.exp(args[0]);
        case "abs": oneArg(); return args[0].abs();
        case "floor": oneArg(); return args[0].floor();
        case "ceil": oneArg(); return args[0].ceil();
        case "round": oneArg(); return args[0].round();
        case "fact": oneArg(); return new DecimalMath(factorialBigInt(requireInteger(args[0])).toString());
        case "npr": requireArgs(name, args, 2); return new DecimalMath(permutations(requireInteger(args[0], "n"), requireInteger(args[1], "r")).toString());
        case "ncr": requireArgs(name, args, 2); return new DecimalMath(combinations(requireInteger(args[0], "n"), requireInteger(args[1], "r")).toString());
        case "gcd": requireArgs(name, args, 2); return new DecimalMath(bigintGcd(requireInteger(args[0]), requireInteger(args[1])).toString());
        case "lcm": {
            requireArgs(name, args, 2);
            const a = requireInteger(args[0]);
            const b = requireInteger(args[1]);
            const result = a === 0n || b === 0n ? 0n : (a / bigintGcd(a, b)) * b;
            return new DecimalMath((result < 0n ? -result : result).toString());
        }
        default: throw new Error(`Unsupported function “${name}”`);
    }
}

function evaluateAst(node, context) {
    const { DecimalMath } = context;
    switch (node.type) {
        case "number": return new DecimalMath(node.value);
        case "constant": {
            if (node.name === "pi") return DecimalMath.acos(-1);
            if (node.name === "e") return DecimalMath.exp(1);
            return new DecimalMath(context.ans || 0);
        }
        case "group": return evaluateAst(node.expression, context);
        case "unary": {
            const value = evaluateAst(node.argument, context);
            return node.operator === "-" ? value.negated() : value;
        }
        case "postfix": return new DecimalMath(factorialBigInt(requireInteger(evaluateAst(node.argument, context))).toString());
        case "function":
            validateFunctionArity(node);
            return evaluateFunction(node, node.args.map((arg) => evaluateAst(arg, context)), context);
        case "binary": {
            const left = evaluateAst(node.left, context);
            const right = evaluateAst(node.right, context);
            switch (node.operator) {
                case "+": return left.plus(right);
                case "-": return left.minus(right);
                case "*": return left.times(right);
                case "/": if (right.isZero()) throw new Error("Cannot divide by zero"); return left.div(right);
                case "%": if (right.isZero()) throw new Error("Cannot divide by zero"); return left.mod(right);
                case "^": {
                    guardMagnitude(right, 10000, "power exponent limit: 10,000");
                    if (right.isInteger()) {
                        const exponent = BigInt(right.toFixed(0));
                        if (exponent > MAX_INTEGER_EXPONENT || exponent < -MAX_INTEGER_EXPONENT) throw performanceError("integer exponent limit: 100,000");
                    }
                    if (left.isNegative() && !right.isInteger()) throw new Error("Fractional powers of negative values are not real");
                    return left.pow(right);
                }
                default: throw new Error(`Unsupported operator “${node.operator}”`);
            }
        }
        default: throw new Error("Invalid expression");
    }
}

function evaluateExactInteger(node, ans = "0") {
    switch (node.type) {
        case "number":
            return /^\d+$/.test(node.value) ? BigInt(node.value) : null;
        case "constant":
            return node.name === "ans" && /^-?\d+$/.test(String(ans))
                ? BigInt(ans)
                : null;
        case "group":
            return evaluateExactInteger(node.expression, ans);
        case "unary": {
            const value = evaluateExactInteger(node.argument, ans);
            if (value === null) return null;
            return node.operator === "-" ? -value : value;
        }
        case "postfix": {
            const value = evaluateExactInteger(node.argument, ans);
            return value === null ? null : factorialBigInt(value);
        }
        case "function": {
            validateFunctionArity(node);
            if (!EXACT_FUNCTIONS.has(node.name)) return null;
            const values = node.args.map((arg) => evaluateExactInteger(arg, ans));
            if (values.some((value) => value === null)) return null;
            if (node.name === "sqrt") return exactNthRoot(values[0], 2n);
            if (node.name === "cbrt") return exactNthRoot(values[0], 3n);
            if (node.name === "root") return exactNthRoot(values[1], values[0]);
            if (node.name === "fact") return factorialBigInt(values[0]);
            if (node.name === "npr") return permutations(values[0], values[1]);
            if (node.name === "ncr") return combinations(values[0], values[1]);
            if (node.name === "gcd") return bigintGcd(values[0], values[1]);
            if (node.name === "lcm") {
                if (values[0] === 0n || values[1] === 0n) return 0n;
                const result = (values[0] / bigintGcd(values[0], values[1])) * values[1];
                return result < 0n ? -result : result;
            }
            if (node.name === "abs") return values[0] < 0n ? -values[0] : values[0];
            return null;
        }
        case "binary": {
            const left = evaluateExactInteger(node.left, ans);
            const right = evaluateExactInteger(node.right, ans);
            if (left === null || right === null) return null;
            switch (node.operator) {
                case "+": return left + right;
                case "-": return left - right;
                case "*":
                    guardExactDigits(bigintDigits(left) + bigintDigits(right));
                    return left * right;
                case "/": return right !== 0n && left % right === 0n ? left / right : null;
                case "%": return right === 0n ? null : left % right;
                case "^":
                    if (right < 0n || right > MAX_INTEGER_EXPONENT) return null;
                    if (left !== 0n && left !== 1n && left !== -1n) {
                        guardExactDigits(bigintDigits(left) * right);
                    }
                    return left ** right;
                default: return null;
            }
        }
        default:
            return null;
    }
}

function countIntegerDigits(value) {
    if (value.isZero()) return 1;
    return value.abs().logarithm(10).floor().plus(1).toNumber();
}

export function evaluateScientificExpression(expression, options = {}) {
    const parsed = parseScientificExpression(expression);
    if (parsed.error) return parsed;

    const hasPrecision = options.precision !== undefined && options.precision !== null && options.precision !== "";
    const requestedPrecision = Number(options.precision);
    const precision = hasPrecision && Number.isFinite(requestedPrecision)
        ? Math.min(MAX_PRECISION, Math.max(0, Math.floor(requestedPrecision)))
        : DEFAULT_PRECISION;

    const calculateDecimal = (workingPrecision) => {
        const DecimalMath = Decimal.clone({
            precision: workingPrecision,
            rounding: Decimal.ROUND_HALF_UP,
            toExpNeg: -100,
            toExpPos: 1000,
        });
        return evaluateAst(parsed.ast, {
            DecimalMath,
            angleMode: ["deg", "rad", "grad"].includes(options.angleMode) ? options.angleMode : "deg",
            ans: options.ans ?? 0,
        });
    };

    try {
        const exactInteger = evaluateExactInteger(parsed.ast, options.ans ?? "0");
        if (exactInteger !== null) {
            const formatted = exactInteger.toString();
            const digits = formatted.replace("-", "").length;
            const leading = formatted.replace("-", "").slice(0, 25);
            const scientific = digits === 1
                ? `${formatted}e+0`
                : `${exactInteger < 0n ? "-" : ""}${leading[0]}.${leading.slice(1)}e+${digits - 1}`;
            return {
                ast: parsed.ast,
                value: formatted,
                formatted,
                scientific,
                integer: true,
                exact: true,
                digits,
                precision,
            };
        }

        let workingPrecision = Math.max(32, precision + 24);
        let value = calculateDecimal(workingPrecision);
        if (!value.isFinite()) throw new Error("Result is outside the supported range");

        const integerDigits = Math.max(0, (value.e ?? 0) + 1);
        const requiredPrecision = Math.max(32, integerDigits + precision + 16);
        if (requiredPrecision > MAX_DECIMAL_WORKING_PRECISION) {
            throw performanceError("decimal result is too large for the selected precision");
        }
        if (requiredPrecision > workingPrecision) {
            workingPrecision = requiredPrecision;
            value = calculateDecimal(workingPrecision);
        }

        const cropped = value.toDecimalPlaces(precision, Decimal.ROUND_DOWN);
        const integer = cropped.isInteger();
        const digits = integer ? countIntegerDigits(cropped) : null;
        const formatted = cropped.toFixed(precision);
        return {
            ast: parsed.ast,
            value: cropped.toString(),
            formatted,
            scientific: cropped.toExponential(Math.min(precision, 24)),
            integer,
            exact: false,
            digits,
            precision,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("[DecimalError] Precision limit exceeded")) {
            return {
                ast: parsed.ast,
                error: performanceError("decimal result exceeds the supported precision").message,
            };
        }
        return { ast: parsed.ast, error: message };
    }
}

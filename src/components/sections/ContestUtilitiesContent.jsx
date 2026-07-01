import { useState } from "react";
import {
    FaCalculator,
    FaExchangeAlt,
    FaTable,
    FaFont,
    FaMicrochip,
    FaLandmark,
    FaSuperscript,
    FaInfinity,
    FaExclamationTriangle,
    FaRulerCombined,
    FaCopy,
    FaCheck,
} from "react-icons/fa";
import {
    convertBase,
    toRoman,
    fromRoman,
    evaluateExpression,
    bigIntCalculate,
    compareFloatAddition,
} from "../../utils/contestTools";
import {
    cppTypeFor,
    multiplicationExceeds,
    INT_MAX,
    LLONG_MAX,
} from "../../utils/numberTheory";
import { sections } from "../../data/sections";

const ACCENT =
    sections.find((s) => s.id === "contest-utilities")?.color || "#e02020";

function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const full =
        clean.length === 3
            ? clean
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : clean;
    const int = parseInt(full, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ERROR_COLOR = "#c0392b";
const OK_COLOR = "#008000";

//  Shared building blocks

function CopyButton({ value, small = false }) {
    const [copied, setCopied] = useState(false);
    const text = value === null || value === undefined ? "" : String(value);
    const disabled = text.trim() === "";

    const handleCopy = async () => {
        if (disabled) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            /* clipboard unavailable — fail silently */
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={disabled}
            title={copied ? "Copied" : "Copy to clipboard"}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            className={`inline-flex items-center gap-1 flex-shrink-0 rounded-md border font-mono-cf transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                small ? "text-[10px] px-1.5 py-1" : "text-[11px] px-2 py-1"
            }`}
            style={{
                borderColor: "var(--line)",
                color: copied ? OK_COLOR : "var(--muted)",
            }}
        >
            {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
            {!small && (copied ? "Copied" : "Copy")}
        </button>
    );
}

function Field({
    label,
    value,
    onChange,
    width = "w-32",
    mono = true,
    invalid = false,
}) {
    return (
        <label
            className="text-xs font-mono-cf block"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className={`block mt-1 ${width} p-1.5 rounded-md border text-xs outline-none focus:ring-1 transition-colors ${mono ? "font-mono-cf" : ""}`}
                style={{
                    borderColor: invalid ? ERROR_COLOR : "var(--line)",
                    backgroundColor: "var(--bg)",
                    color: "var(--ink)",
                }}
            />
        </label>
    );
}

function Select({ label, value, onChange, options, width = "w-24" }) {
    return (
        <label
            className="text-xs font-mono-cf block"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`block mt-1 ${width} p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1 transition-colors`}
                style={{
                    borderColor: "var(--line)",
                    backgroundColor: "var(--bg)",
                    color: "var(--ink)",
                }}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

/** A single computed-result readout with an optional copy action and an
 *  explicit error state, used in place of ad-hoc paragraphs so every tool's
 *  output reads the same way. */
function OutputPanel({ label = "Result", value, error, hint, copyValue }) {
    const showCopy = !error && copyValue !== undefined && copyValue !== null;
    return (
        <div
            className="rounded-lg border pl-3 pr-2.5 py-2.5 flex items-start justify-between gap-3"
            style={{
                borderColor: error ? ERROR_COLOR : "var(--line)",
                borderLeftWidth: "3px",
                backgroundColor: error
                    ? hexToRgba(ERROR_COLOR, 0.06)
                    : "transparent",
            }}
            role={error ? "alert" : "status"}
        >
            <div className="min-w-0 flex-1">
                <div
                    className="text-[10px] font-mono-cf uppercase tracking-wider mb-0.5"
                    style={{ color: error ? ERROR_COLOR : "var(--muted)" }}
                >
                    {error ? "Error" : label}
                </div>
                <div
                    className="text-sm font-mono-cf font-bold break-all"
                    style={{ color: error ? ERROR_COLOR : "var(--ink)" }}
                >
                    {error ? error : value}
                </div>
                {hint && !error && (
                    <div
                        className="text-xs mt-1"
                        style={{ color: "var(--muted)" }}
                    >
                        {hint}
                    </div>
                )}
            </div>
            {showCopy && <CopyButton value={copyValue} small />}
        </div>
    );
}

function ToolCard({ id, icon: Icon, label, hint, children }) {
    return (
        <div
            id={id}
            className="cf-tool-card rounded-xl border p-4 sm:p-5 h-full scroll-mt-20"
            style={{ borderColor: "var(--line)" }}
        >
            <div
                className="flex items-center gap-2.5 mb-4 pb-3 border-b"
                style={{ borderColor: "var(--line)" }}
            >
                <span
                    className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                    style={{
                        backgroundColor: "var(--cu-accent-bg)",
                        color: "var(--cu-accent)",
                    }}
                >
                    <Icon size={12} />
                </span>
                <div className="min-w-0">
                    <h3
                        className="font-mono-cf text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--ink)" }}
                    >
                        {label}
                    </h3>
                    {hint && (
                        <p
                            className="text-[11px] mt-0.5 truncate"
                            style={{ color: "var(--muted)" }}
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function QuickNav({ tools }) {
    return (
        <nav
            aria-label="Jump to a utility"
            className="flex flex-wrap gap-1.5 mb-6"
        >
            {tools.map(({ id, label, icon: Icon }) => (
                <a
                    key={id}
                    href={`#${id}`}
                    className="cf-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono-cf"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--muted)",
                    }}
                >
                    <Icon size={10} />
                    {label}
                </a>
            ))}
        </nav>
    );
}

//  Individual tools

function FastCalculatorTool() {
    const [a, setA] = useState("17");
    const [b, setB] = useState("5");
    const [copiedKey, setCopiedKey] = useState(null);

    const numA = Number(a);
    const numB = Number(b);
    const valid =
        a.trim() !== "" &&
        b.trim() !== "" &&
        Number.isFinite(numA) &&
        Number.isFinite(numB);

    const ops = valid
        ? [
              ["a + b", numA + numB],
              ["a − b", numA - numB],
              ["a × b", numA * numB],
              ["a ÷ b", numB !== 0 ? numA / numB : "÷0"],
              ["a mod b", numB !== 0 ? numA % numB : "÷0"],
              ["a ^ b", Math.pow(numA, numB)],
          ]
        : [];

    const displayValue = (val) =>
        typeof val === "number" ? Number(val.toFixed(6)).toString() : val;

    const copyOp = async (label, val) => {
        try {
            await navigator.clipboard.writeText(String(displayValue(val)));
            setCopiedKey(label);
            window.setTimeout(() => setCopiedKey(null), 1000);
        } catch {
            /* clipboard unavailable — fail silently */
        }
    };

    return (
        <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: "var(--line)" }}
                >
                    <h4
                        className="text-xs font-bold uppercase mb-3"
                        style={{ color: "var(--muted)" }}
                    >
                        Input
                    </h4>

                    <div className="flex gap-4">
                        <Field
                            label="a"
                            value={a}
                            onChange={setA}
                            width="w-full"
                        />
                        <Field
                            label="b"
                            value={b}
                            onChange={setB}
                            width="w-full"
                        />
                    </div>
                </div>

                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: "var(--line)" }}
                >
                    <h4
                        className="text-xs font-bold uppercase mb-3 flex items-center justify-between"
                        style={{ color: "var(--muted)" }}
                    >
                        Output
                        {valid && (
                            <span className="normal-case font-normal text-[10px]">
                                click a result to copy
                            </span>
                        )}
                    </h4>

                    {!valid ? (
                        <p
                            className="text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Enter valid numbers.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {ops.map(([label, val]) => (
                                <button
                                    type="button"
                                    key={label}
                                    onClick={() => copyOp(label, val)}
                                    className="cf-pill text-left rounded-md border p-2"
                                    style={{ borderColor: "var(--line)" }}
                                    title="Copy value"
                                >
                                    <div
                                        className="text-[11px] flex items-center justify-between gap-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        {label}
                                        {copiedKey === label ? (
                                            <FaCheck
                                                size={9}
                                                style={{ color: OK_COLOR }}
                                            />
                                        ) : (
                                            <FaCopy
                                                size={9}
                                                className="opacity-0 cf-copy-hint"
                                            />
                                        )}
                                    </div>
                                    <div className="font-mono-cf font-bold text-base break-all">
                                        {displayValue(val)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BaseConverterTool() {
    const [value, setValue] = useState("255");
    const [fromBase, setFromBase] = useState("10");
    const [toBase, setToBase] = useState("2");

    const swapBases = () => {
        setFromBase(toBase);
        setToBase(fromBase);
    };

    const fb = Number(fromBase);
    const tb = Number(toBase);
    const validBases = fb >= 2 && fb <= 36 && tb >= 2 && tb <= 36;
    const result = validBases ? convertBase(value, fb, tb) : null;

    return (
        <div className="space-y-4">
            <div
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--line)" }}
            >
                <Field
                    label="Value"
                    value={value}
                    onChange={setValue}
                    width="w-full"
                />

                <div className="flex gap-3 mt-4 items-end">
                    <div className="flex-1">
                        <Field
                            label="From"
                            value={fromBase}
                            onChange={setFromBase}
                            width="w-full"
                            invalid={!(fb >= 2 && fb <= 36)}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (result !== null) setValue(result);
                            swapBases();
                        }}
                        className="cf-pill flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center rounded-lg border"
                        style={{ borderColor: "var(--line)" }}
                        title="Swap conversion direction"
                        aria-label="Swap conversion direction"
                    >
                        <FaExchangeAlt size={12} />
                    </button>

                    <div className="flex-1">
                        <Field
                            label="To"
                            value={toBase}
                            onChange={setToBase}
                            width="w-full"
                            invalid={!(tb >= 2 && tb <= 36)}
                        />
                    </div>
                </div>

                <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
                    Supported bases: 2–36.
                </p>
            </div>

            <OutputPanel
                label="Converted value"
                value={result}
                error={
                    !validBases
                        ? "Bases must be between 2 and 36."
                        : result === null
                          ? "Invalid digits for the selected source base."
                          : null
                }
                copyValue={result}
            />
        </div>
    );
}

function AsciiTableTool() {
    const [chars, setChars] = useState("A, Z");

    const parseTokens = (input) => {
        if (!input) return [];
        let parts;
        if (input.includes(",")) {
            parts = input.split(",");
        } else if (/\s/.test(input.trim())) {
            parts = input.trim().split(/\s+/);
        } else {
            parts = input.trim().split("");
        }
        return parts.map((p) => p.trim()).filter((p) => p.length > 0);
    };

    const tokens = parseTokens(chars).map((t) => t[0]);
    const codes = tokens.map((ch) => ch.charCodeAt(0));
    const outOfRange = codes.some((c) => c > 255);

    let displayCodes = [];
    let isRange = false;
    if (tokens.length === 2 && !outOfRange) {
        const lo = Math.min(codes[0], codes[1]);
        const hi = Math.max(codes[0], codes[1]);
        displayCodes = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
        isRange = true;
    } else if (!outOfRange) {
        const seen = new Set();
        displayCodes = codes.filter((c) => {
            if (seen.has(c)) return false;
            seen.add(c);
            return true;
        });
    }

    return (
        <div>
            <Field
                label="characters — two for a range (A, Z), or a list (@ # $ %)"
                value={chars}
                onChange={setChars}
                width="w-full sm:w-80"
            />
            <div className="mt-2 mb-3">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {outOfRange
                        ? "One of the typed characters is outside 0–255."
                        : isRange
                          ? `${displayCodes.length} code${displayCodes.length === 1 ? "" : "s"} in range`
                          : `${displayCodes.length} code${displayCodes.length === 1 ? "" : "s"}`}
                </span>
            </div>
            <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                    {displayCodes.map((code, i) => (
                        <div
                            key={`${code}-${i}`}
                            className="w-16 h-14 rounded-md border flex flex-col items-center justify-center text-xs font-mono-cf flex-shrink-0"
                            style={{ borderColor: "var(--line)" }}
                        >
                            <span style={{ color: "var(--muted)" }}>
                                {code}
                            </span>
                            <span className="font-bold">
                                {code < 32 || code === 127
                                    ? "ctrl"
                                    : JSON.stringify(
                                          String.fromCharCode(code),
                                      ).slice(1, -1) || "—"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CharacterTableTool() {
    const [text, setText] = useState("Codeforces!");

    const chars = text.slice(0, 40).split("");

    return (
        <div>
            <Field
                label="text (≤ 40 chars)"
                value={text}
                onChange={setText}
                width="w-full sm:w-64"
            />
            <div className="flex gap-1.5 flex-wrap mt-3">
                {chars.map((ch, i) => (
                    <div
                        key={i}
                        className="w-12 h-14 rounded-md border flex flex-col items-center justify-center text-xs font-mono-cf flex-shrink-0"
                        style={{ borderColor: "var(--line)" }}
                    >
                        <span className="font-bold text-sm">
                            {ch === " " ? "␣" : ch}
                        </span>
                        <span style={{ color: "var(--muted)" }}>
                            {ch.charCodeAt(0)}
                        </span>
                    </div>
                ))}
                {chars.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Type something above.
                    </p>
                )}
            </div>
        </div>
    );
}

function BinaryCalculatorTool() {
    const [a, setA] = useState("1010");
    const [b, setB] = useState("0110");
    const [op, setOp] = useState("AND");

    const validBinary = (s) => /^[01]+$/.test(s.trim());
    const aValid = validBinary(a);
    const bValid = validBinary(b);
    const valid = aValid && bValid;

    let result = null;
    if (valid) {
        const numA = parseInt(a, 2);
        const numB = parseInt(b, 2);
        const ops = {
            AND: numA & numB,
            OR: numA | numB,
            XOR: numA ^ numB,
            "A+B": numA + numB,
        };
        result = ops[op].toString(2);
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Field
                    label="a (binary)"
                    value={a}
                    onChange={setA}
                    width="w-full"
                    invalid={!aValid}
                />
                <Field
                    label="b (binary)"
                    value={b}
                    onChange={setB}
                    width="w-full"
                    invalid={!bValid}
                />
                <Select
                    label="operation"
                    value={op}
                    onChange={setOp}
                    width="w-32"
                    options={[
                        { value: "AND", label: "AND" },
                        { value: "OR", label: "OR" },
                        { value: "XOR", label: "XOR" },
                        { value: "A+B", label: "A+B" },
                    ]}
                />
            </div>
            <OutputPanel
                value={result}
                error={!valid ? "Both values must be binary (0/1 only)." : null}
                copyValue={result}
            />
        </div>
    );
}

function RomanConverterTool() {
    const [num, setNum] = useState("1994");
    const [roman, setRoman] = useState("MCMXCIV");

    const handleNumChange = (v) => {
        setNum(v);
        const n = Number(v);
        const r = Number.isInteger(n) ? toRoman(n) : null;
        if (r) setRoman(r);
    };

    const handleRomanChange = (v) => {
        setRoman(v);
        const n = fromRoman(v);
        if (n !== null) setNum(String(n));
    };

    const numValid =
        Number.isInteger(Number(num)) && toRoman(Number(num)) !== null;
    const romanValid = fromRoman(roman) !== null;

    return (
        <div className="flex gap-4 flex-wrap items-start">
            <div>
                <Field
                    label="number (1-3999)"
                    value={num}
                    onChange={handleNumChange}
                    width="w-32"
                    invalid={!numValid && num.trim() !== ""}
                />
                {!numValid && num.trim() !== "" && (
                    <p
                        className="text-xs font-mono-cf mt-1"
                        style={{ color: ERROR_COLOR }}
                    >
                        out of range
                    </p>
                )}
            </div>
            <div>
                <Field
                    label="roman numeral"
                    value={roman}
                    onChange={handleRomanChange}
                    width="w-32"
                    invalid={!romanValid && roman.trim() !== ""}
                />
                {!romanValid && roman.trim() !== "" && (
                    <p
                        className="text-xs font-mono-cf mt-1"
                        style={{ color: ERROR_COLOR }}
                    >
                        not a valid roman numeral
                    </p>
                )}
            </div>
            <CopyButton value={romanValid ? roman : ""} small />
        </div>
    );
}

function ExpressionEvaluatorTool() {
    const [expr, setExpr] = useState("(3 + 4) * 2 ^ 3");

    const { result, error } = evaluateExpression(expr);

    return (
        <div className="space-y-3">
            <Field
                label="expression (+ − × ÷ ^ % and parentheses)"
                value={expr}
                onChange={setExpr}
                width="w-full"
                invalid={!!error}
            />
            <OutputPanel
                value={`= ${result}`}
                error={error}
                copyValue={result}
            />
        </div>
    );
}

function BigIntCalculatorTool() {
    const [a, setA] = useState("99999999999999999999");
    const [b, setB] = useState("99999999999999999999");
    const [op, setOp] = useState("*");

    const { result, error, digits } = bigIntCalculate(a, b, op);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-3 flex-wrap items-end">
                <Field
                    label="a"
                    value={a}
                    onChange={setA}
                    width="w-full sm:w-64"
                />
                <Select
                    label="op"
                    value={op}
                    onChange={setOp}
                    width="w-16"
                    options={[
                        { value: "+", label: "+" },
                        { value: "-", label: "−" },
                        { value: "*", label: "×" },
                        { value: "/", label: "÷" },
                        { value: "%", label: "mod" },
                        { value: "^", label: "^" },
                    ]}
                />
                <Field
                    label="b"
                    value={b}
                    onChange={setB}
                    width="w-full sm:w-64"
                />
            </div>
            <OutputPanel
                value={result}
                error={error}
                hint={
                    !error ? `${digits} digit${digits === 1 ? "" : "s"}` : null
                }
                copyValue={result}
            />
        </div>
    );
}

function OverflowCheckerTool() {
    const [value, setValue] = useState("3000000000");
    const [a, setA] = useState("100000");
    const [b, setB] = useState("100000");

    const n = Number(value);
    const validN = Number.isFinite(n);
    const fitType = validN ? cppTypeFor(n) : null;

    const numA = Number(a);
    const numB = Number(b);
    const validMul = Number.isFinite(numA) && Number.isFinite(numB);
    const overflowsInt = validMul
        ? multiplicationExceeds(numA, numB, INT_MAX)
        : null;
    const overflowsLL = validMul
        ? multiplicationExceeds(numA, numB, LLONG_MAX)
        : null;

    return (
        <div className="flex flex-col gap-5">
            <div>
                <Field
                    label="value"
                    value={value}
                    onChange={setValue}
                    width="w-40"
                />
                {validN && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono-cf">
                        <span style={{ color: "var(--muted)" }}>
                            smallest fit:
                        </span>
                        <span
                            className="px-2 py-0.5 rounded-full border font-bold"
                            style={{
                                borderColor:
                                    fitType === "overflow"
                                        ? ERROR_COLOR
                                        : "var(--line)",
                                color:
                                    fitType === "overflow"
                                        ? ERROR_COLOR
                                        : "var(--ink)",
                            }}
                        >
                            {fitType}
                        </span>
                        {fitType === "overflow" && (
                            <span style={{ color: ERROR_COLOR }}>
                                won&apos;t fit in a 64-bit signed integer
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div>
                <div className="flex gap-3 flex-wrap">
                    <Field label="a ×" value={a} onChange={setA} width="w-24" />
                    <Field label="b" value={b} onChange={setB} width="w-24" />
                </div>
                {validMul && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono-cf">
                        <span style={{ color: "var(--muted)" }}>
                            overflows int:
                        </span>
                        <span
                            className="px-2 py-0.5 rounded-full border font-bold"
                            style={{
                                borderColor: overflowsInt
                                    ? ERROR_COLOR
                                    : OK_COLOR,
                                color: overflowsInt ? ERROR_COLOR : OK_COLOR,
                            }}
                        >
                            {String(overflowsInt)}
                        </span>
                        <span style={{ color: "var(--muted)" }}>
                            overflows long long:
                        </span>
                        <span
                            className="px-2 py-0.5 rounded-full border font-bold"
                            style={{
                                borderColor: overflowsLL
                                    ? ERROR_COLOR
                                    : OK_COLOR,
                                color: overflowsLL ? ERROR_COLOR : OK_COLOR,
                            }}
                        >
                            {String(overflowsLL)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function FloatPrecisionTool() {
    const [a, setA] = useState("0.1");
    const [b, setB] = useState("0.2");

    const numA = Number(a);
    const numB = Number(b);
    const valid = Number.isFinite(numA) && Number.isFinite(numB);
    const comparison = valid ? compareFloatAddition(numA, numB) : null;

    return (
        <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
                <Field label="a" value={a} onChange={setA} width="w-24" />
                <Field label="b" value={b} onChange={setB} width="w-24" />
            </div>
            {valid && comparison && (
                <OutputPanel
                    label="a + b"
                    value={comparison.sum}
                    hint={
                        comparison.looksClean
                            ? `actual stored value: ${comparison.exactDecimal}`
                            : `actual stored value: ${comparison.exactDecimal} — classic float rounding artifact, never compare floats with ==`
                    }
                    copyValue={comparison.sum}
                />
            )}
        </div>
    );
}

//  Section assembly

const TOOLS = [
    {
        id: "cu-fast-calculator",
        label: "Fast calculator",
        icon: FaCalculator,
        hint: "Quick arithmetic on two numbers",
        wide: true,
        Component: FastCalculatorTool,
    },
    {
        id: "cu-base-converter",
        label: "Base converter",
        icon: FaExchangeAlt,
        hint: "Convert integers between bases 2–36",
        Component: BaseConverterTool,
    },
    {
        id: "cu-binary-calculator",
        label: "Binary calculator",
        icon: FaMicrochip,
        hint: "Bitwise AND / OR / XOR / add",
        Component: BinaryCalculatorTool,
    },
    {
        id: "cu-ascii-table",
        label: "ASCII table",
        icon: FaTable,
        hint: "Look up character codes 0–255",
        wide: true,
        Component: AsciiTableTool,
    },
    {
        id: "cu-character-table",
        label: "Character table",
        icon: FaFont,
        hint: "Per-character codes for a string",
        wide: true,
        Component: CharacterTableTool,
    },
    {
        id: "cu-roman-converter",
        label: "Roman numerals",
        icon: FaLandmark,
        hint: "Number ⇄ Roman numeral",
        Component: RomanConverterTool,
    },
    {
        id: "cu-expression-evaluator",
        label: "Expression evaluator",
        icon: FaSuperscript,
        hint: "Evaluate arithmetic expressions",
        Component: ExpressionEvaluatorTool,
    },
    {
        id: "cu-bigint-calculator",
        label: "Big integer calculator",
        icon: FaInfinity,
        hint: "Arbitrary-precision arithmetic",
        wide: true,
        Component: BigIntCalculatorTool,
    },
    {
        id: "cu-overflow-checker",
        label: "Overflow checker",
        icon: FaExclamationTriangle,
        hint: "Smallest fitting type & multiplication overflow",
        Component: OverflowCheckerTool,
    },
    {
        id: "cu-float-precision",
        label: "Float precision tester",
        icon: FaRulerCombined,
        hint: "Spot floating-point rounding artifacts",
        Component: FloatPrecisionTool,
    },
];

function ContestUtilitiesContent() {
    return (
        <div
            style={{
                "--cu-accent": ACCENT,
                "--cu-accent-soft": hexToRgba(ACCENT, 0.5),
                "--cu-accent-bg": hexToRgba(ACCENT, 0.12),
            }}
        >
            <QuickNav tools={TOOLS} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {TOOLS.map(({ id, label, icon, hint, wide, Component }) => (
                    <div key={id} className={wide ? "lg:col-span-2" : ""}>
                        <ToolCard id={id} icon={icon} label={label} hint={hint}>
                            <Component />
                        </ToolCard>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContestUtilitiesContent;

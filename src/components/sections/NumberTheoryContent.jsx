import { useState } from "react";
import {
    getDivisors,
    isPrime,
    toBinary,
    gcdMany,
    lcmMany,
    primeFactorization,
    sumOfDivisors,
    eulerTotient,
    digitSum,
    bitwiseAndMany,
    bitwiseOrMany,
    bitwiseXorMany,
    modPow,
    cppTypeFor,
    multiplicationExceeds,
    INT_MAX,
    LLONG_MAX,
} from "../../utils/numberTheory";

function ToolBlock({ label, children }) {
    return (
        <div className="mb-8">
            <h3
                className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{ color: "var(--muted)", borderColor: "var(--line)" }}
            >
                {label}
            </h3>
            {children}
        </div>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-2">
            <span
                className="flex-shrink-0 sm:min-w-[140px]"
                style={{ color: "var(--muted)" }}
            >
                {label}:
            </span>
            <span
                className="font-mono-cf break-all"
                style={{ color: "var(--ink)" }}
            >
                {children}
            </span>
        </div>
    );
}

function OverflowWarning({ value }) {
    const type = cppTypeFor(value);
    if (type === "int") return null;

    const message =
        type === "long long"
            ? "Exceeds int range — use long long here."
            : "Exceeds long long range — use unsigned long long, __int128, or double/floating point for an approximation.";

    return (
        <div
            className="text-xs font-mono-cf px-2 py-1.5 rounded-sm border mt-1"
            style={{ borderColor: "#c0392b", color: "#c0392b" }}
        >
            ⚠ {message}
        </div>
    );
}

function NumberCard({ n }) {
    const divisors = getDivisors(n);
    const prime = isPrime(n);
    const factors = primeFactorization(n);
    const divisorSum = sumOfDivisors(divisors);

    const factorizationStr = factors.length
        ? factors
              .map((f) =>
                  f.exponent > 1 ? `${f.prime}^${f.exponent}` : `${f.prime}`,
              )
              .join(" × ")
        : "—";

    return (
        <div
            className="p-3 rounded-md border"
            style={{ borderColor: "var(--line)" }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono-cf font-bold text-lg">{n}</span>
                <span
                    className="font-mono-cf text-xs px-2 py-0.5 rounded-sm border"
                    style={{
                        borderColor: prime ? "#008000" : "var(--line)",
                        color: prime ? "#008000" : "var(--muted)",
                    }}
                >
                    {n < 2 ? "neither" : prime ? "prime" : "composite"}
                </span>
            </div>

            <div
                className="text-sm space-y-1"
                style={{ color: "var(--muted)" }}
            >
                <Row label="Binary">{toBinary(n)}</Row>
                <Row label="Prime factors">{factorizationStr}</Row>
                <Row label={`Divisors (${divisors.length})`}>
                    {divisors.join(", ") || "—"}
                </Row>
                <Row label="Sum of divisors">{divisorSum}</Row>
                <Row label="Euler's totient φ(n)">{eulerTotient(n)}</Row>
                <Row label="Digit sum">{digitSum(n)}</Row>
            </div>
            <OverflowWarning value={divisorSum} />
        </div>
    );
}

function BitwiseRow({ op, symbol, result }) {
    return (
        <div
            className="flex items-center justify-between p-2.5 rounded-md border"
            style={{ borderColor: "var(--line)" }}
        >
            <span
                className="font-mono-cf text-sm"
                style={{ color: "var(--muted)" }}
            >
                {op} ({symbol})
            </span>
            <div className="text-right">
                <div className="font-mono-cf font-bold">{result}</div>
                <div
                    className="font-mono-cf text-xs"
                    style={{ color: "var(--muted)" }}
                >
                    {toBinary(result)}
                </div>
            </div>
        </div>
    );
}

function BitwiseResult({ numbers }) {
    const andResult = bitwiseAndMany(numbers);
    const orResult = bitwiseOrMany(numbers);
    const xorResult = bitwiseXorMany(numbers);

    return (
        <div className="space-y-3">
            <div
                className="text-xs font-mono-cf"
                style={{ color: "var(--muted)" }}
            >
                {numbers.join(" , ")}
            </div>
            <BitwiseRow op="AND" symbol="&" result={andResult} />
            <BitwiseRow op="OR" symbol="|" result={orResult} />
            <BitwiseRow op="XOR" symbol="^" result={xorResult} />
        </div>
    );
}

function GcdLcmResult({ numbers }) {
    const gcd = gcdMany(numbers);
    const lcm = lcmMany(numbers);
    const lcmOverflows =
        numbers.length > 1 &&
        multiplicationExceeds(numbers[0], numbers[1], LLONG_MAX);

    return (
        <div>
            <div
                className="p-3 rounded-md border font-mono-cf text-sm flex gap-6 flex-wrap"
                style={{ borderColor: "var(--line)" }}
            >
                <span>
                    <span style={{ color: "var(--muted)" }}>GCD: </span>
                    {gcd}
                </span>
                <span>
                    <span style={{ color: "var(--muted)" }}>LCM: </span>
                    {lcmOverflows ? "—" : lcm}
                </span>
            </div>
            {!lcmOverflows && <OverflowWarning value={lcm} />}
            {lcmOverflows && (
                <div
                    className="text-xs font-mono-cf px-2 py-1.5 rounded-sm border mt-1"
                    style={{ borderColor: "#c0392b", color: "#c0392b" }}
                >
                    ⚠ LCM exceeds even long long range — not computed. Consider
                    working with prime factorizations directly instead of the
                    raw product.
                </div>
            )}
        </div>
    );
}

function LabeledInput({ label, value, onChange }) {
    return (
        <label
            className="text-xs font-mono-cf"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block mt-1 w-28 p-2 rounded-md border font-mono-cf text-sm outline-none focus:ring-1"
                style={{
                    borderColor: "var(--line)",
                    backgroundColor: "var(--bg)",
                    color: "var(--ink)",
                }}
            />
        </label>
    );
}

function ModPowCalculator() {
    const [base, setBase] = useState("");
    const [exponent, setExponent] = useState("");
    const [mod, setMod] = useState("");

    const b = Number(base);
    const e = Number(exponent);
    const m = Number(mod);

    const allFilled = base !== "" && exponent !== "" && mod !== "";
    const allIntegers =
        Number.isInteger(b) && Number.isInteger(e) && Number.isInteger(m);
    const inRange = b >= 0 && e >= 0 && m >= 1;
    const valid = allFilled && allIntegers && inRange;

    const hasFloatInput =
        allFilled &&
        (!Number.isInteger(b) || !Number.isInteger(e) || !Number.isInteger(m));

    const result = valid ? modPow(b, e, m) : null;

    return (
        <div>
            <div className="flex gap-3 flex-wrap">
                <LabeledInput label="base" value={base} onChange={setBase} />
                <LabeledInput
                    label="exponent"
                    value={exponent}
                    onChange={setExponent}
                />
                <LabeledInput label="mod" value={mod} onChange={setMod} />
            </div>

            {hasFloatInput && (
                <p
                    className="text-xs font-mono-cf mt-2"
                    style={{ color: "#c0392b" }}
                >
                    ⚠ Decimal values aren't valid here — base, exponent, and mod
                    must all be whole numbers.
                </p>
            )}

            <div
                className="mt-3 p-3 rounded-md border font-mono-cf text-sm"
                style={{ borderColor: "var(--line)" }}
            >
                {result !== null ? (
                    <span>
                        <span style={{ color: "var(--muted)" }}>result: </span>
                        <span className="font-bold">
                            {base}^{exponent} mod {mod} = {result}
                        </span>
                    </span>
                ) : (
                    <span style={{ color: "var(--muted)" }}>
                        Enter base, exponent, and mod (mod ≥ 1, whole numbers
                        only).
                    </span>
                )}
            </div>

            {b > INT_MAX && (
                <p
                    className="text-xs font-mono-cf mt-1.5"
                    style={{ color: "#c0392b" }}
                >
                    ⚠ Base exceeds INT_MAX — in C++ you'd need long long for
                    this base.
                </p>
            )}
        </div>
    );
}

function NumberTheoryContent() {
    const [input, setInput] = useState("");
    const [numbers, setNumbers] = useState([]);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const raw = e.target.value;
        setInput(raw);

        const trimmed = raw.trim();
        if (trimmed === "") {
            setNumbers([]);
            setError("");
            return;
        }

        const parts = trimmed.split(/\s+/);
        const parsed = [];
        let hadFloat = false;
        let hadInvalid = false;

        for (const part of parts) {
            const n = Number(part);
            if (Number.isNaN(n)) {
                hadInvalid = true;
                continue;
            }
            if (!Number.isInteger(n)) {
                hadFloat = true;
                continue;
            }
            if (n < 0) {
                hadInvalid = true;
                continue;
            }
            parsed.push(n);
        }

        if (hadFloat) {
            setError(
                "Decimal numbers aren't supported here — only whole numbers. Decimals were skipped.",
            );
        } else if (hadInvalid) {
            setError(
                "Some entries weren't valid non-negative whole numbers — they were skipped.",
            );
        } else {
            setError("");
        }

        setNumbers(parsed);
    };

    return (
        <div>
            <ToolBlock label="Number breakdown">
                <textarea
                    value={input}
                    onChange={handleChange}
                    placeholder="Paste numbers separated by spaces, e.g. 12 17 100 7"
                    rows={3}
                    className="w-full p-3 rounded-md border font-mono-cf text-sm resize-none outline-none focus:ring-1"
                    style={{
                        borderColor: "var(--line)",
                        backgroundColor: "var(--bg)",
                        color: "var(--ink)",
                    }}
                />

                {error && (
                    <p
                        className="text-xs font-mono-cf mt-1.5"
                        style={{ color: "#c0392b" }}
                    >
                        ⚠ {error}
                    </p>
                )}

                {numbers.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {numbers.map((n, idx) => (
                            <NumberCard key={idx} n={n} />
                        ))}

                        {numbers.length > 1 && (
                            <GcdLcmResult numbers={numbers} />
                        )}
                    </div>
                )}
            </ToolBlock>

            {numbers.length > 1 && (
                <ToolBlock label="Bitwise operations across all numbers">
                    <BitwiseResult numbers={numbers} />
                </ToolBlock>
            )}

            <ToolBlock label="Modular exponentiation">
                <ModPowCalculator />
            </ToolBlock>
        </div>
    );
}

export default NumberTheoryContent;

import { useState } from "react";
import {
    FaClock,
    FaLayerGroup,
    FaSquareRootAlt,
    FaDrawPolygon,
    FaMicrochip,
    FaPercentage,
    FaRulerCombined,
    FaDotCircle,
    FaInfinity,
    FaCopy,
    FaCheck,
} from "react-icons/fa";

import { sections } from "../../data/sections";

const ACCENT =
    sections.find((s) => s.id === "quick-reference")?.color || "#0000FF";

const OK_COLOR = "#008000";

function CopyButton({ value }) {
    const [copied, setCopied] = useState(false);

    const disabled =
        value === undefined || value === null || String(value).trim() === "";

    async function handleCopy() {
        if (disabled) return;

        try {
            await navigator.clipboard.writeText(String(value));

            setCopied(true);

            setTimeout(() => setCopied(false), 1200);
        } catch {}
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono-cf flex-shrink-0"
            style={{
                borderColor: "var(--line)",
                color: copied ? OK_COLOR : "var(--muted)",
            }}
        >
            {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
        </button>
    );
}

function RefTable({ columns, rows }) {
    return (
        <div
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--line)" }}
        >
            <table className="w-full text-xs font-mono-cf">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        {columns.map((col) => (
                            <th
                                key={col}
                                className="text-left px-3 py-2 whitespace-nowrap"
                                style={{ color: "var(--muted)" }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i) => (
                        <tr
                            key={i}
                            style={{
                                borderBottom:
                                    i < rows.length - 1
                                        ? "1px solid var(--line)"
                                        : "none",
                            }}
                        >
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="px-3 py-2 align-top whitespace-nowrap"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FormulaList({ items }) {
    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div
                    key={item.name}
                    className="rounded-lg border p-3"
                    style={{ borderColor: "var(--line)" }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <div
                            className="text-[11px] font-bold"
                            style={{ color: "var(--muted)" }}
                        >
                            {item.name}
                        </div>

                        <CopyButton value={item.formula} />
                    </div>

                    <div className="font-mono-cf text-sm mt-1 break-all">
                        {item.formula}
                    </div>

                    {item.note ? (
                        <div
                            className="text-[11px] mt-1"
                            style={{ color: "var(--muted)" }}
                        >
                            {item.note}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

// ---------- Tool: Time Complexity ----------

function TimeComplexityTool() {
    return (
        <RefTable
            columns={["Complexity", "Max N (~1s)", "Example"]}
            rows={[
                ["O(log n)", "~10^18", "binary search"],
                ["O(√n)", "~10^14", "trial division"],
                ["O(n)", "~10^8", "linear scan"],
                ["O(n log n)", "~10^6", "sorting"],
                ["O(n√n)", "~10^5 – 10^6", "Mo's algorithm"],
                ["O(n^2)", "~10^4", "nested loops"],
                ["O(n^2 log n)", "~3×10^3 – 4×10^3", "2D DP + binary search"],
                ["O(n^3)", "~500", "Floyd–Warshall"],
                ["O(2^n)", "~20 – 24", "subset DP"],
                ["O(2^n · n)", "~18 – 20", "bitmask DP"],
                ["O(n!)", "~10 – 11", "brute-force permutations"],
            ]}
        />
    );
}

// ---------- Tool: STL Complexity ----------

function StlComplexityTool() {
    return (
        <RefTable
            columns={["Structure / Operation", "Complexity"]}
            rows={[
                ["vector push_back / pop_back", "O(1) amortized"],
                ["vector[i] / .at(i)", "O(1)"],
                ["vector insert/erase (middle)", "O(n)"],
                ["set / map insert, erase, find", "O(log n)"],
                ["unordered_set / map insert, find", "O(1) avg, O(n) worst"],
                ["priority_queue push / pop", "O(log n)"],
                ["deque push/pop front/back", "O(1)"],
                ["stack / queue push / pop", "O(1)"],
                ["sort()", "O(n log n)"],
                ["binary_search / lower_bound / upper_bound", "O(log n)"],
                ["next_permutation", "O(n)"],
            ]}
        />
    );
}

// ---------- Tool: Math Formulas ----------

function MathFormulasTool() {
    return (
        <FormulaList
            items={[
                { name: "Sum 1..n", formula: "n(n + 1) / 2" },
                {
                    name: "Sum of squares 1..n",
                    formula: "n(n + 1)(2n + 1) / 6",
                },
                {
                    name: "Sum of cubes 1..n",
                    formula: "[n(n + 1) / 2]^2",
                },
                {
                    name: "GCD · LCM",
                    formula: "gcd(a, b) × lcm(a, b) = a × b",
                },
                { name: "Permutations nPr", formula: "n! / (n − r)!" },
                { name: "Combinations nCr", formula: "n! / (r!(n − r)!)" },
                {
                    name: "Modular inverse (prime p)",
                    formula: "a^(p − 2) mod p",
                    note: "Fermat's little theorem, requires p prime",
                },
                {
                    name: "Euler's totient",
                    formula: "φ(n) = n · Π(1 − 1/p)",
                    note: "product over distinct prime factors p of n",
                },
                {
                    name: "Geometric series sum",
                    formula: "a(r^n − 1) / (r − 1)",
                },
            ]}
        />
    );
}

// ---------- Tool: Geometry Formulas ----------

function GeometryFormulasTool() {
    return (
        <FormulaList
            items={[
                {
                    name: "Distance between points",
                    formula: "√((x2 − x1)^2 + (y2 − y1)^2)",
                },
                {
                    name: "Triangle area (3 points)",
                    formula: "|x1(y2 − y3) + x2(y3 − y1) + x3(y1 − y2)| / 2",
                },
                {
                    name: "Polygon area (shoelace)",
                    formula: "|Σ(xi·yi+1 − xi+1·yi)| / 2",
                },
                { name: "Dot product", formula: "a·b = ax·bx + ay·by" },
                {
                    name: "Cross product (2D)",
                    formula: "a×b = ax·by − ay·bx",
                },
                { name: "Circle area", formula: "π r^2" },
                { name: "Circle circumference", formula: "2 π r" },
            ]}
        />
    );
}

// ---------- Tool: Bit Tricks ----------

function BitTricksTool() {
    return (
        <FormulaList
            items={[
                {
                    name: "Check power of 2",
                    formula: "(n & (n - 1)) == 0",
                    note: "true only for n > 0",
                },
                {
                    name: "Count set bits",
                    formula: "__builtin_popcount(n)",
                },
                { name: "Lowest set bit", formula: "n & (-n)" },
                { name: "Clear lowest set bit", formula: "n & (n - 1)" },
                { name: "Get bit i", formula: "(n >> i) & 1" },
                { name: "Set bit i", formula: "n | (1 << i)" },
                { name: "Clear bit i", formula: "n & ~(1 << i)" },
                { name: "Toggle bit i", formula: "n ^ (1 << i)" },
                {
                    name: "XOR swap",
                    formula: "a ^= b; b ^= a; a ^= b;",
                },
            ]}
        />
    );
}

// ---------- Tool: Common Mod Values ----------

function CommonModValuesTool() {
    return (
        <RefTable
            columns={["Value", "Notes"]}
            rows={[
                ["1000000007 (1e9+7)", "most common prime modulus"],
                ["998244353", "NTT-friendly prime (2^23 · 119 + 1)"],
                [
                    "1000000009 (1e9+9)",
                    "alternative prime, use alongside 1e9+7 to dodge hash hacks",
                ],
                [
                    "1e9+7 & 998244353 together",
                    "common double-hash pair to avoid collisions",
                ],
            ]}
        />
    );
}

// ---------- Tool: Common Limits ----------

function CommonLimitsTool() {
    return (
        <RefTable
            columns={["Limit", "Typical Value"]}
            rows={[
                ["Time limit", "1 – 2 seconds"],
                ["Memory limit", "256 MB"],
                ["Default recursion depth", "~10^4 – 10^5 (judge-dependent)"],
                ["Static int array before MLE (256MB)", "~6×10^7 elements"],
                ["n ≤ 10^5 – 10^6", "expect O(n log n)"],
                ["n ≤ 10^3 – 10^4", "expect O(n^2)"],
                ["n ≤ 20", "expect O(2^n)"],
            ]}
        />
    );
}

// ---------- Tool: Floating EPS Values ----------

function FloatingEpsTool() {
    return (
        <FormulaList
            items={[
                { name: "Standard epsilon", formula: "1e-9" },
                {
                    name: "Loose epsilon (geometry)",
                    formula: "1e-6",
                },
                {
                    name: "double precision",
                    formula: "~15 – 17 significant digits",
                },
                {
                    name: "Safe comparison",
                    formula: "fabs(a - b) < EPS",
                },
            ]}
        />
    );
}

// ---------- Tool: Maximum Integer Ranges ----------

function IntegerRangesTool() {
    return (
        <RefTable
            columns={["Type", "Range", "Approx"]}
            rows={[
                ["int32", "-2,147,483,648 to 2,147,483,647", "~±2.1×10^9"],
                ["uint32", "0 to 4,294,967,295", "~4.3×10^9"],
                [
                    "int64 (long long)",
                    "-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807",
                    "~±9.2×10^18",
                ],
                ["uint64", "0 to 18,446,744,073,709,551,615", "~1.8×10^19"],
                ["JS safe integer", "-(2^53 − 1) to (2^53 − 1)", "~±9×10^15"],
            ]}
        />
    );
}

const TOOLS = [
    {
        id: "ref-time-complexity",
        label: "Time Complexity",
        icon: FaClock,
        hint: "Complexity class vs. feasible n for ~1s",
        wide: true,
        Component: TimeComplexityTool,
    },

    {
        id: "ref-stl-complexity",
        label: "STL Complexity",
        icon: FaLayerGroup,
        hint: "Common container/algorithm complexities",
        wide: true,
        Component: StlComplexityTool,
    },

    {
        id: "ref-math-formulas",
        label: "Math Formulas",
        icon: FaSquareRootAlt,
        hint: "Sums, combinatorics, modular inverse",
        Component: MathFormulasTool,
    },

    {
        id: "ref-geometry-formulas",
        label: "Geometry Formulas",
        icon: FaDrawPolygon,
        hint: "Distance, area, dot/cross product",
        Component: GeometryFormulasTool,
    },

    {
        id: "ref-bit-tricks",
        label: "Bit Tricks",
        icon: FaMicrochip,
        hint: "Common bitwise idioms",
        Component: BitTricksTool,
    },

    {
        id: "ref-mod-values",
        label: "Common Mod Values",
        icon: FaPercentage,
        hint: "Frequently used moduli",
        Component: CommonModValuesTool,
    },

    {
        id: "ref-common-limits",
        label: "Common Limits",
        icon: FaRulerCombined,
        hint: "Typical time/memory/constraint limits",
        wide: true,
        Component: CommonLimitsTool,
    },

    {
        id: "ref-eps-values",
        label: "Floating EPS Values",
        icon: FaDotCircle,
        hint: "Epsilon constants for float comparisons",
        Component: FloatingEpsTool,
    },

    {
        id: "ref-integer-ranges",
        label: "Maximum Integer Ranges",
        icon: FaInfinity,
        hint: "Min/max values per integer type",
        wide: true,
        Component: IntegerRangesTool,
    },
];

function QuickNav({ tools }) {
    return (
        <div className="flex flex-wrap gap-1.5 mb-5">
            {tools.map(({ id, label, icon: Icon }) => (
                <a
                    key={id}
                    href={`#${id}`}
                    className="cf-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono-cf transition-colors"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--muted)",
                    }}
                >
                    <Icon size={10} />
                    {label}
                </a>
            ))}
        </div>
    );
}

function ToolCard({ id, icon: Icon, label, hint, children }) {
    return (
        <div
            id={id}
            className="cf-tool-card rounded-xl border p-4 h-full"
            style={{
                borderColor: "var(--line)",
            }}
        >
            <div
                className="flex items-center gap-2.5 mb-3 pb-2 border-b"
                style={{
                    borderColor: "var(--line)",
                }}
            >
                <span
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                        background: "var(--sec-accent-bg)",
                        color: "var(--sec-accent)",
                    }}
                >
                    <Icon size={13} />
                </span>

                <div>
                    <h3 className="font-mono-cf text-xs uppercase font-bold">
                        {label}
                    </h3>

                    <p
                        className="text-[11px]"
                        style={{
                            color: "var(--muted)",
                        }}
                    >
                        {hint}
                    </p>
                </div>
            </div>

            {children}
        </div>
    );
}

function QuickReferenceContent() {
    return (
        <div
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav tools={TOOLS} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOOLS.map(({ id, label, icon, hint, wide, Component }) => (
                    <div key={id} className={wide ? "md:col-span-2" : ""}>
                        <ToolCard id={id} icon={icon} label={label} hint={hint}>
                            <Component />
                        </ToolCard>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuickReferenceContent;

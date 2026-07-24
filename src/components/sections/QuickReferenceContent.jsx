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
    sections.find((section) => section.id === "quick-reference")?.color ||
    "#008000";

function Fraction({ numerator, denominator }) {
    return (
        <span className="ref-math-fraction">
            <span>{numerator}</span>
            <span>{denominator}</span>
        </span>
    );
}

function Radical({ children }) {
    return (
        <span className="ref-math-radical">
            <span className="ref-math-root">√</span>
            <span className="ref-math-radicand">{children}</span>
        </span>
    );
}

function MathInline({ children }) {
    return <span className="ref-math-inline">{children}</span>;
}

function PowerOfTen({ exponent }) {
    return (
        <>
            10<sup>{exponent}</sup>
        </>
    );
}

const REFERENCE_TOOLS = [
    {
        id: "ref-time-complexity",
        label: "Time Complexity",
        icon: FaClock,
        hint: "Complexity class vs. feasible n for ~1s",
        columns: ["Complexity", "Max N (~1s)", "Example"],
        rows: [
            [
                <MathInline>
                    O(log n)
                </MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="18" />
                </MathInline>,
                "binary search",
            ],
            [
                <MathInline>
                    O(<Radical>n</Radical>)
                </MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="14" />
                </MathInline>,
                "trial division",
            ],
            [
                <MathInline>O(n)</MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="8" />
                </MathInline>,
                "linear scan",
            ],
            [
                <MathInline>O(n log n)</MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="6" />
                </MathInline>,
                "sorting",
            ],
            [
                <MathInline>
                    O(n<Radical>n</Radical>)
                </MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="5" /> – <PowerOfTen exponent="6" />
                </MathInline>,
                "Mo's algorithm",
            ],
            [
                <MathInline>
                    O(n<sup>2</sup>)
                </MathInline>,
                <MathInline>
                    ≈ <PowerOfTen exponent="4" />
                </MathInline>,
                "nested loops",
            ],
            [
                <MathInline>
                    O(n<sup>2</sup> log n)
                </MathInline>,
                <MathInline>
                    ≈ 3 × <PowerOfTen exponent="3" /> – 4 ×{" "}
                    <PowerOfTen exponent="3" />
                </MathInline>,
                "2D DP + binary search",
            ],
            [
                <MathInline>
                    O(n<sup>3</sup>)
                </MathInline>,
                <MathInline>≈ 500</MathInline>,
                "Floyd-Warshall",
            ],
            [
                <MathInline>
                    O(2<sup>n</sup>)
                </MathInline>,
                <MathInline>≈ 20 – 24</MathInline>,
                "subset DP",
            ],
            [
                <MathInline>
                    O(2<sup>n</sup> · n)
                </MathInline>,
                <MathInline>≈ 18 – 20</MathInline>,
                "bitmask DP",
            ],
            [
                <MathInline>O(n!)</MathInline>,
                <MathInline>≈ 10 – 11</MathInline>,
                "brute-force permutations",
            ],
        ],
    },
    {
        id: "ref-stl-complexity",
        label: "STL Complexity",
        icon: FaLayerGroup,
        hint: "Common container/algorithm complexities",
        columns: ["Structure / Operation", "Complexity"],
        rows: [
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
        ],
    },
    {
        id: "ref-math-formulas",
        label: "Math Formulas",
        icon: FaSquareRootAlt,
        hint: "Sums, combinatorics, modular inverse",
        formulas: [
            {
                name: "Sum 1..n",
                formula: "n(n + 1) / 2",
                display: (
                    <Fraction
                        numerator={
                            <>
                                n(n + 1)
                            </>
                        }
                        denominator="2"
                    />
                ),
            },
            {
                name: "Sum of squares 1..n",
                formula: "n(n + 1)(2n + 1) / 6",
                display: (
                    <Fraction
                        numerator={
                            <>
                                n(n + 1)(2n + 1)
                            </>
                        }
                        denominator="6"
                    />
                ),
            },
            {
                name: "Sum of cubes 1..n",
                formula: "[n(n + 1) / 2]^2",
                display: (
                    <>
                        (
                        <Fraction
                            numerator={
                                <>
                                    n(n + 1)
                                </>
                            }
                            denominator="2"
                        />
                        )<sup>2</sup>
                    </>
                ),
            },
            {
                name: "GCD / LCM",
                formula: "gcd(a, b) * lcm(a, b) = a * b",
                display: (
                    <>
                        gcd(a, b) · lcm(a, b) = ab
                    </>
                ),
            },
            {
                name: "Permutations nPr",
                formula: "n! / (n - r)!",
                display: (
                    <>
                        <sub>n</sub>P<sub>r</sub> ={" "}
                        <Fraction
                            numerator={<>n!</>}
                            denominator={
                                <>
                                    (n − r)!
                                </>
                            }
                        />
                    </>
                ),
            },
            {
                name: "Combinations nCr",
                formula: "n! / (r!(n - r)!)",
                display: (
                    <>
                        <sub>n</sub>C<sub>r</sub> ={" "}
                        <Fraction
                            numerator={<>n!</>}
                            denominator={
                                <>
                                    r!(n − r)!
                                </>
                            }
                        />
                    </>
                ),
            },
            {
                name: "Modular inverse (prime p)",
                formula: "a^(p - 2) mod p",
                display: (
                    <>
                        a<sup>−1</sup> ≡ a<sup>p−2</sup> (mod p)
                    </>
                ),
                note: "Fermat's little theorem, requires p prime",
            },
            {
                name: "Euler's totient",
                formula: "phi(n) = n * product(1 - 1/p)",
                display: (
                    <>
                        φ(n) = n
                        <span className="ref-math-product">
                            ∏<sub>p∣n</sub>
                        </span>
                        (1 − <Fraction numerator="1" denominator="p" />)
                    </>
                ),
                note: "product over distinct prime factors p of n",
            },
            {
                name: "Geometric series sum",
                formula: "a(r^n - 1) / (r - 1)",
                display: (
                    <Fraction
                        numerator={
                            <>
                                a(r<sup>n</sup> − 1)
                            </>
                        }
                        denominator={
                            <>
                                r − 1
                            </>
                        }
                    />
                ),
            },
        ],
    },
    {
        id: "ref-geometry-formulas",
        label: "Geometry Formulas",
        icon: FaDrawPolygon,
        hint: "Distance, area, dot/cross product",
        formulas: [
            {
                name: "Distance between points",
                formula: "sqrt((x2 - x1)^2 + (y2 - y1)^2)",
                display: (
                    <Radical>
                        (x<sub>2</sub> − x<sub>1</sub>)<sup>2</sup> + (y
                        <sub>2</sub> − y<sub>1</sub>)<sup>2</sup>
                    </Radical>
                ),
            },
            {
                name: "Triangle area (3 points)",
                formula: "|x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)| / 2",
                display: (
                    <Fraction
                        numerator={
                            <>
                                |x<sub>1</sub>(y<sub>2</sub> − y<sub>3</sub>) +
                                x<sub>2</sub>(y<sub>3</sub> − y<sub>1</sub>) + x
                                <sub>3</sub>(y<sub>1</sub> − y<sub>2</sub>)|
                            </>
                        }
                        denominator="2"
                    />
                ),
            },
            {
                name: "Polygon area (shoelace)",
                formula: "|sum(xi*yi+1 - xi+1*yi)| / 2",
                display: (
                    <Fraction
                        numerator={
                            <>
                                |∑(x<sub>i</sub>y<sub>i+1</sub> − x
                                <sub>i+1</sub>y<sub>i</sub>)|
                            </>
                        }
                        denominator="2"
                    />
                ),
            },
            {
                name: "Dot product",
                formula: "a.b = ax*bx + ay*by",
                display: (
                    <>
                        a · b = a<sub>x</sub>b<sub>x</sub> + a<sub>y</sub>b
                        <sub>y</sub>
                    </>
                ),
            },
            {
                name: "Cross product (2D)",
                formula: "a x b = ax*by - ay*bx",
                display: (
                    <>
                        a × b = a<sub>x</sub>b<sub>y</sub> − a<sub>y</sub>b
                        <sub>x</sub>
                    </>
                ),
            },
            {
                name: "Circle area",
                formula: "pi * r^2",
                display: (
                    <>
                        πr<sup>2</sup>
                    </>
                ),
            },
            {
                name: "Circle circumference",
                formula: "2 * pi * r",
                display: <>2πr</>,
            },
        ],
    },
    {
        id: "ref-bit-tricks",
        label: "Bit Tricks",
        icon: FaMicrochip,
        hint: "Common bitwise idioms",
        formulas: [
            {
                name: "Check power of 2",
                formula: "(n & (n - 1)) == 0",
                note: "true only for n > 0",
            },
            { name: "Count set bits", formula: "__builtin_popcount(n)" },
            { name: "Lowest set bit", formula: "n & (-n)" },
            { name: "Clear lowest set bit", formula: "n & (n - 1)" },
            { name: "Get bit i", formula: "(n >> i) & 1" },
            { name: "Set bit i", formula: "n | (1 << i)" },
            { name: "Clear bit i", formula: "n & ~(1 << i)" },
            { name: "Toggle bit i", formula: "n ^ (1 << i)" },
            { name: "XOR swap", formula: "a ^= b; b ^= a; a ^= b;" },
        ],
    },
    {
        id: "ref-mod-values",
        label: "Common Mod Values",
        icon: FaPercentage,
        hint: "Frequently used moduli",
        columns: ["Value", "Notes"],
        rows: [
            ["1000000007 (1e9+7)", "most common prime modulus"],
            ["998244353", "NTT-friendly prime (2^23 * 119 + 1)"],
            [
                "1000000009 (1e9+9)",
                "alternative prime, use alongside 1e9+7 to dodge hash hacks",
            ],
            [
                "1e9+7 & 998244353 together",
                "common double-hash pair to avoid collisions",
            ],
        ],
    },
    {
        id: "ref-eps-values",
        label: "Floating EPS Values",
        icon: FaDotCircle,
        hint: "Epsilon constants for float comparisons",
        formulas: [
            {
                name: "Standard epsilon",
                formula: "1e-9",
                display: (
                    <>
                        10<sup>−9</sup>
                    </>
                ),
            },
            {
                name: "Loose epsilon (geometry)",
                formula: "1e-6",
                display: (
                    <>
                        10<sup>−6</sup>
                    </>
                ),
            },
            {
                name: "double precision",
                formula: "~15 - 17 significant digits",
                display: <>≈ 15–17 significant digits</>,
            },
            {
                name: "Safe comparison",
                formula: "fabs(a - b) < EPS",
                display: (
                    <>
                        |a − b| &lt; ε
                    </>
                ),
            },
        ],
    },
    {
        id: "ref-common-limits",
        label: "Common Limits",
        icon: FaRulerCombined,
        hint: "Typical time/memory/constraint limits",
        columns: ["Limit", "Typical Value"],
        rows: [
            ["Time limit", <MathInline>1 – 2 seconds</MathInline>],
            ["Memory limit", "256 MB"],
            [
                "Default recursion depth",
                <MathInline>
                    ≈ <PowerOfTen exponent="4" /> – <PowerOfTen exponent="5" />{" "}
                    (judge-dependent)
                </MathInline>,
            ],
            [
                "Static int array before MLE (256 MB)",
                <MathInline>
                    ≈ 6 × <PowerOfTen exponent="7" /> elements
                </MathInline>,
            ],
            [
                <MathInline>
                    n ≤ <PowerOfTen exponent="5" /> –{" "}
                    <PowerOfTen exponent="6" />
                </MathInline>,
                <MathInline>expect O(n log n)</MathInline>,
            ],
            [
                <MathInline>
                    n ≤ <PowerOfTen exponent="3" /> –{" "}
                    <PowerOfTen exponent="4" />
                </MathInline>,
                <MathInline>
                    expect O(n<sup>2</sup>)
                </MathInline>,
            ],
            [
                <MathInline>n ≤ 20</MathInline>,
                <MathInline>
                    expect O(2<sup>n</sup>)
                </MathInline>,
            ],
        ],
    },
    {
        id: "ref-integer-ranges",
        label: "Maximum Integer Ranges",
        icon: FaInfinity,
        hint: "Min/max values per integer type",
        columns: ["Type", "Range", "Approx"],
        rows: [
            [
                "int32",
                <MathInline>
                    −2,147,483,648 ≤ x ≤ 2,147,483,647
                </MathInline>,
                <MathInline>
                    ≈ ±2.1 × <PowerOfTen exponent="9" />
                </MathInline>,
            ],
            [
                "uint32",
                <MathInline>0 ≤ x ≤ 4,294,967,295</MathInline>,
                <MathInline>
                    ≈ 4.3 × <PowerOfTen exponent="9" />
                </MathInline>,
            ],
            [
                "int64 (long long)",
                <MathInline>
                    −9,223,372,036,854,775,808 ≤ x ≤{" "}
                    9,223,372,036,854,775,807
                </MathInline>,
                <MathInline>
                    ≈ ±9.2 × <PowerOfTen exponent="18" />
                </MathInline>,
            ],
            [
                "uint64",
                <MathInline>
                    0 ≤ x ≤ 18,446,744,073,709,551,615
                </MathInline>,
                <MathInline>
                    ≈ 1.8 × <PowerOfTen exponent="19" />
                </MathInline>,
            ],
            [
                "JS safe integer",
                <MathInline>
                    −(2<sup>53</sup> − 1) ≤ x ≤ 2<sup>53</sup> − 1
                </MathInline>,
                <MathInline>
                    ≈ ±9 × <PowerOfTen exponent="15" />
                </MathInline>,
            ],
        ],
    },
];

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
        } catch {
            setCopied(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono-cf flex-shrink-0"
            style={{
                borderColor: copied
                    ? "var(--sec-accent-soft)"
                    : "var(--line)",
                color: copied ? "var(--sec-accent)" : "var(--muted)",
            }}
        >
            {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
        </button>
    );
}

function RefTable({ columns, rows }) {
    return (
        <div
            className="ref-table-shell overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--line)" }}
        >
            <table className="cf-readable-table w-full text-xs font-mono-cf">
                <thead className="ref-table-head">
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        {columns.map((column) => (
                            <th
                                key={column}
                                className="text-left px-3 py-2 whitespace-nowrap"
                                style={{ color: "var(--sec-accent)" }}
                            >
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="ref-table-row"
                            style={{
                                borderBottom:
                                    rowIndex < rows.length - 1
                                        ? "1px solid var(--line)"
                                        : "none",
                            }}
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-3 py-2 align-top"
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
                    className={`ref-formula-card rounded-lg border p-3 ${
                        item.display ? "is-math" : ""
                    }`}
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
                    <div
                        className={`ref-formula-value mt-1 ${
                            item.display
                                ? "ref-math-display"
                                : "font-mono-cf text-sm break-all"
                        }`}
                        aria-label={item.formula}
                    >
                        {item.display || item.formula}
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

function ToolCard({ id, icon: Icon, label, hint, columns, rows, formulas }) {
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

            {formulas ? (
                <FormulaList items={formulas} />
            ) : (
                <RefTable columns={columns} rows={rows} />
            )}
        </div>
    );
}

function QuickReferenceContent() {
    return (
        <div
            className="ref-content"
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav tools={REFERENCE_TOOLS} />

            <div className="cf-tool-grid ref-tool-grid">
                {REFERENCE_TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        className={`ref-grid-${tool.id.replace("ref-", "")}`}
                    >
                        <ToolCard {...tool} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuickReferenceContent;

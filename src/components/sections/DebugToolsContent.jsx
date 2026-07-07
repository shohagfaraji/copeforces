import { useState, useMemo, useRef } from "react";
import {
    FaBalanceScale,
    FaStream,
    FaFont,
    FaCopy,
    FaCheck,
    FaRandom,
    FaSortAmountDown,
    FaClone,
    FaEquals,
    FaRedo,
} from "react-icons/fa";
import {
    normalizeOutput,
    compareOutputs,
    lineDifferences,
    characterDifference,
    parseNumberArray,
    shuffleArray,
    generateRandomArray,
    checkSorted,
    findDuplicates,
    compareFrequencies,
} from "../../utils/debugTools";

import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "debug-tools")?.color || "#8b5cf6";

const ERROR_COLOR = "#c0392b";
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
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono-cf"
            style={{
                borderColor: "var(--line)",
                color: copied ? OK_COLOR : "var(--muted)",
            }}
        >
            {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function RefreshButton({ onClick, label = "Regenerate" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono-cf"
            style={{
                borderColor: "var(--line)",
                color: "var(--muted)",
            }}
        >
            <FaRedo size={10} />
            {label}
        </button>
    );
}

function TextArea({ label, value, onChange, rows = 10 }) {
    return (
        <label
            className="block text-xs font-mono-cf"
            style={{ color: "var(--muted)" }}
        >
            {label}

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                spellCheck={false}
                className="mt-1 w-full rounded-lg border p-3 font-mono-cf text-xs resize-y outline-none"
                style={{
                    borderColor: "var(--line)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                }}
            />
        </label>
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

const TOOLS = [
    {
        id: "dbg-compare",
        label: "Compare Outputs",
        icon: FaBalanceScale,
        hint: "Compare expected and actual output",
        wide: true,
        Component: CompareOutputsTool,
    },

    {
        id: "dbg-line-diff",
        label: "Line Difference",
        icon: FaStream,
        hint: "Show differing lines",
        wide: true,
        Component: LineDifferenceTool,
    },

    {
        id: "dbg-char-diff",
        label: "Character Difference",
        icon: FaFont,
        hint: "Find the first differing character",
        wide: true,
        Component: CharacterDifferenceTool,
    },

    {
        id: "dbg-random-array",
        label: "Random Array",
        icon: FaRandom,
        hint: "Generate random test arrays",
        wide: true,
        Component: RandomArrayGeneratorTool,
    },

    {
        id: "dbg-shuffle",
        label: "Shuffle Array",
        icon: FaRandom,
        hint: "Shuffle an existing array",
        Component: ShuffleArrayTool,
    },

    {
        id: "dbg-check-sorted",
        label: "Check Sorted",
        icon: FaSortAmountDown,
        hint: "Verify ascending or descending order",
        Component: CheckSortedTool,
    },

    {
        id: "dbg-find-duplicates",
        label: "Find Duplicates",
        icon: FaClone,
        hint: "List repeated values and counts",
        Component: FindDuplicatesTool,
    },

    {
        id: "dbg-compare-frequencies",
        label: "Compare Frequencies",
        icon: FaEquals,
        hint: "Check if two arrays are the same multiset",
        Component: CompareFrequenciesTool,
    },
];

function CompareOutputsTool() {
    const [expected, setExpected] = useState("");
    const [actual, setActual] = useState("");

    const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);

    const [ignoreBlankLines, setIgnoreBlankLines] = useState(false);

    const result = compareOutputs(expected, actual, {
        ignoreWhitespace,
        ignoreBlankLines,
    });

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
                <TextArea
                    label="Expected Output"
                    value={expected}
                    onChange={setExpected}
                />

                <TextArea
                    label="Actual Output"
                    value={actual}
                    onChange={setActual}
                />
            </div>

            <div className="flex flex-wrap gap-5 text-xs font-mono-cf">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={ignoreWhitespace}
                        onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                    />
                    Ignore whitespace
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={ignoreBlankLines}
                        onChange={(e) => setIgnoreBlankLines(e.target.checked)}
                    />
                    Ignore blank lines
                </label>
            </div>

            {result.identical ? (
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: OK_COLOR,
                    }}
                >
                    <div
                        className="font-bold"
                        style={{
                            color: OK_COLOR,
                        }}
                    >
                        ✓ Outputs are identical
                    </div>
                </div>
            ) : (
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: ERROR_COLOR,
                    }}
                >
                    <div
                        className="font-bold mb-3"
                        style={{
                            color: ERROR_COLOR,
                        }}
                    >
                        First mismatch at line {result.line}
                    </div>

                    <div className="space-y-2">
                        <div>
                            <div
                                className="text-xs mb-1"
                                style={{
                                    color: "var(--muted)",
                                }}
                            >
                                Expected
                            </div>

                            <pre className="font-mono-cf whitespace-pre-wrap break-all">
                                {result.expected}
                            </pre>
                        </div>

                        <div>
                            <div
                                className="text-xs mb-1"
                                style={{
                                    color: "var(--muted)",
                                }}
                            >
                                Actual
                            </div>

                            <pre className="font-mono-cf whitespace-pre-wrap break-all">
                                {result.actual}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LineDifferenceTool() {
    const [expected, setExpected] = useState("");
    const [actual, setActual] = useState("");

    const diff = lineDifferences(expected, actual);

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
                <TextArea
                    label="Expected"
                    value={expected}
                    onChange={setExpected}
                    rows={8}
                />

                <TextArea
                    label="Actual"
                    value={actual}
                    onChange={setActual}
                    rows={8}
                />
            </div>

            {diff.length === 0 ? (
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: OK_COLOR,
                    }}
                >
                    <span
                        style={{
                            color: OK_COLOR,
                        }}
                    >
                        ✓ No line differences
                    </span>
                </div>
            ) : (
                <div className="space-y-3">
                    {diff.map((d) => (
                        <div
                            key={d.line}
                            className="rounded-lg border p-3"
                            style={{
                                borderColor: "var(--line)",
                            }}
                        >
                            <div className="font-bold mb-2">Line {d.line}</div>

                            <div className="text-xs">
                                <div>
                                    <strong>Expected:</strong> {d.expected}
                                </div>

                                <div>
                                    <strong>Actual:</strong> {d.actual}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function HighlightedLine({ line, column }) {
    const idx = column - 1;
    const before = line.slice(0, idx);
    const target = line[idx];
    const after = line.slice(idx + 1);

    return (
        <pre className="font-mono-cf whitespace-pre-wrap break-all">
            {before}
            <span
                className="rounded-sm px-0.5"
                style={{
                    background: ERROR_COLOR,
                    color: "#fff",
                }}
            >
                {target !== undefined ? target : "\u00A0"}
            </span>
            {after}
        </pre>
    );
}

function CharacterDifferenceTool() {
    const [expected, setExpected] = useState("");
    const [actual, setActual] = useState("");

    const diff = characterDifference(expected, actual);

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
                <TextArea
                    label="Expected"
                    value={expected}
                    onChange={setExpected}
                    rows={8}
                />

                <TextArea
                    label="Actual"
                    value={actual}
                    onChange={setActual}
                    rows={8}
                />
            </div>

            {!diff ? (
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: OK_COLOR,
                    }}
                >
                    <span style={{ color: OK_COLOR }}>
                        ✓ Character perfect match
                    </span>
                </div>
            ) : (
                <div
                    className="rounded-lg border p-4 space-y-3"
                    style={{
                        borderColor: ERROR_COLOR,
                    }}
                >
                    <div
                        className="font-bold"
                        style={{
                            color: ERROR_COLOR,
                        }}
                    >
                        Difference found
                    </div>

                    <div className="text-sm">
                        Line <strong>{diff.line}</strong>, Column{" "}
                        <strong>{diff.column}</strong>
                    </div>

                    <div>
                        <div
                            className="text-xs mb-1"
                            style={{
                                color: "var(--muted)",
                            }}
                        >
                            Expected
                        </div>

                        <HighlightedLine
                            line={diff.expectedLine}
                            column={diff.column}
                        />
                    </div>

                    <div>
                        <div
                            className="text-xs mb-1"
                            style={{
                                color: "var(--muted)",
                            }}
                        >
                            Actual
                        </div>

                        <HighlightedLine
                            line={diff.actualLine}
                            column={diff.column}
                        />
                    </div>

                    <div className="text-xs">
                        Expected character:
                        <strong> {diff.expected || "(none)"}</strong>
                        <br />
                        Actual character:
                        <strong> {diff.actual || "(none)"}</strong>
                    </div>
                </div>
            )}
        </div>
    );
}

function RandomArrayGeneratorTool() {
    const [length, setLength] = useState(10);
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);

    const [unique, setUnique] = useState(false);
    const [sorted, setSorted] = useState(false);
    const [reverse, setReverse] = useState(false);
    const [permutation, setPermutation] = useState(false);

    // Bumping this is the "regenerate" trigger — it's the only thing that
    // forces a fresh array when none of the actual parameters changed.
    const [seed, setSeed] = useState(0);

    // Only the last result is kept (O(1) space) so we can avoid handing back
    // the exact same combination twice in a row. Retries are capped at 5
    // (O(1) extra time) rather than looping until a different array appears.
    const lastResultRef = useRef("");

    const result = useMemo(() => {
        const options = { unique, sorted, reverse, permutation };

        let generated = generateRandomArray(
            Number(length),
            Number(min),
            Number(max),
            options,
        );

        let attempts = 0;
        while (generated.join(",") === lastResultRef.current && attempts < 5) {
            generated = generateRandomArray(
                Number(length),
                Number(min),
                Number(max),
                options,
            );
            attempts++;
        }

        lastResultRef.current = generated.join(",");
        return generated;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, min, max, unique, sorted, reverse, permutation, seed]);

    return (
        <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
                <label className="text-xs font-mono-cf">
                    Length
                    <input
                        type="number"
                        value={length}
                        min={1}
                        onChange={(e) => setLength(e.target.value)}
                        className="mt-1 w-full rounded-md border p-2"
                    />
                </label>

                <label className="text-xs font-mono-cf">
                    Minimum
                    <input
                        type="number"
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                        className="mt-1 w-full rounded-md border p-2"
                    />
                </label>

                <label className="text-xs font-mono-cf">
                    Maximum
                    <input
                        type="number"
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                        className="mt-1 w-full rounded-md border p-2"
                    />
                </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <label>
                    <input
                        type="checkbox"
                        checked={unique}
                        onChange={(e) => setUnique(e.target.checked)}
                    />{" "}
                    Unique
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={sorted}
                        onChange={(e) => setSorted(e.target.checked)}
                    />{" "}
                    Sorted
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={reverse}
                        onChange={(e) => setReverse(e.target.checked)}
                    />{" "}
                    Reverse sorted
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={permutation}
                        onChange={(e) => setPermutation(e.target.checked)}
                    />{" "}
                    Permutation
                </label>
            </div>

            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "var(--line)",
                }}
            >
                <div className="font-mono-cf break-all">{result.join(" ")}</div>

                <div className="mt-3 flex items-center gap-2">
                    <CopyButton value={result.join(" ")} />
                    <RefreshButton
                        label="Regenerate"
                        onClick={() => setSeed((s) => s + 1)}
                    />
                </div>
            </div>
        </div>
    );
}

function ShuffleArrayTool() {
    const [input, setInput] = useState("1 2 3 4 5");

    // Same idea as the random array tool: bump `seed` to force a reshuffle
    // even when the input text hasn't changed.
    const [seed, setSeed] = useState(0);
    const lastResultRef = useRef("");

    const numbers = parseNumberArray(input);

    const shuffled = useMemo(() => {
        let arr = shuffleArray(numbers);

        let attempts = 0;
        while (
            numbers.length > 1 &&
            arr.join(",") === lastResultRef.current &&
            attempts < 5
        ) {
            arr = shuffleArray(numbers);
            attempts++;
        }

        lastResultRef.current = arr.join(",");
        return arr;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, seed]);

    return (
        <div className="space-y-4">
            <TextArea
                label="Array"
                rows={5}
                value={input}
                onChange={setInput}
            />

            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "var(--line)",
                }}
            >
                <div className="font-mono-cf break-all">
                    {shuffled.join(" ")}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <CopyButton value={shuffled.join(" ")} />
                    <RefreshButton
                        label="Reshuffle"
                        onClick={() => setSeed((s) => s + 1)}
                    />
                </div>
            </div>
        </div>
    );
}

function CheckSortedTool() {
    const [input, setInput] = useState("1 2 3 4 5");
    const [descending, setDescending] = useState(false);

    const numbers = parseNumberArray(input);
    const result = checkSorted(numbers, descending);

    return (
        <div className="space-y-4">
            <TextArea
                label="Array"
                rows={5}
                value={input}
                onChange={setInput}
            />

            <label className="flex items-center gap-2 text-xs font-mono-cf">
                <input
                    type="checkbox"
                    checked={descending}
                    onChange={(e) => setDescending(e.target.checked)}
                />
                Check descending order
            </label>

            {numbers.length === 0 ? (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: "var(--line)" }}
                >
                    <span style={{ color: "var(--muted)" }}>
                        Enter numbers to check.
                    </span>
                </div>
            ) : result.sorted ? (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: OK_COLOR }}
                >
                    <span style={{ color: OK_COLOR }}>
                        ✓ Array is sorted (
                        {descending ? "descending" : "ascending"})
                    </span>
                </div>
            ) : (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: ERROR_COLOR }}
                >
                    <div className="font-bold" style={{ color: ERROR_COLOR }}>
                        Not sorted — break at index {result.index}
                    </div>
                    <div className="text-sm mt-2 font-mono-cf">
                        {result.left} {descending ? "<" : ">"} {result.right}
                    </div>
                </div>
            )}
        </div>
    );
}

function FindDuplicatesTool() {
    const [input, setInput] = useState("1 2 2 3 4 4 4 5");

    const numbers = parseNumberArray(input);
    const duplicates = findDuplicates(numbers);

    return (
        <div className="space-y-4">
            <TextArea
                label="Array"
                rows={5}
                value={input}
                onChange={setInput}
            />

            {duplicates.length === 0 ? (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: OK_COLOR }}
                >
                    <span style={{ color: OK_COLOR }}>
                        ✓ No duplicates found
                    </span>
                </div>
            ) : (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: ERROR_COLOR }}
                >
                    <div
                        className="font-bold mb-3"
                        style={{ color: ERROR_COLOR }}
                    >
                        {duplicates.length} duplicate value(s) found
                    </div>
                    <div className="space-y-1 font-mono-cf text-sm">
                        {duplicates.map((d) => (
                            <div key={d.value} className="flex justify-between">
                                <span>{d.value}</span>
                                <span style={{ color: "var(--muted)" }}>
                                    ×{d.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function CompareFrequenciesTool() {
    const [a, setA] = useState("1 2 2 3");
    const [b, setB] = useState("1 2 3 3");

    const arrA = parseNumberArray(a);
    const arrB = parseNumberArray(b);
    const result = compareFrequencies(arrA, arrB);

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
                <TextArea label="Array A" rows={5} value={a} onChange={setA} />
                <TextArea label="Array B" rows={5} value={b} onChange={setB} />
            </div>

            {result.identical ? (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: OK_COLOR }}
                >
                    <span style={{ color: OK_COLOR }}>
                        ✓ Same element frequencies (multisets match)
                    </span>
                </div>
            ) : (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: ERROR_COLOR }}
                >
                    <div
                        className="font-bold mb-3"
                        style={{ color: ERROR_COLOR }}
                    >
                        Frequency mismatch
                    </div>
                    <div className="space-y-1 font-mono-cf text-sm">
                        {result.differences.map((d) => (
                            <div key={d.value} className="flex justify-between">
                                <span>{d.value}</span>
                                <span style={{ color: "var(--muted)" }}>
                                    A:{d.left} vs B:{d.right}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DebugToolsContent() {
    return (
        <div
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav tools={TOOLS} />

            <div className="cf-tool-grid">
                {TOOLS.map(({ id, label, icon, hint, wide, Component }) => (
                    <div key={id} className={wide ? "cf-tool-wide" : ""}>
                        <ToolCard id={id} icon={icon} label={label} hint={hint}>
                            <Component />
                        </ToolCard>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DebugToolsContent;

import { useState } from "react";
import { FaBriefcase, FaLink, FaCoins, FaChartLine } from "react-icons/fa";
import {
    knapsack01,
    longestCommonSubsequence,
    minCoinChange,
    longestIncreasingSubsequence,
} from "../../utils/dpTools";
import { sections } from "../../data/sections";

const ACCENT =
    sections.find((s) => s.id === "dynamic-programming")?.color || "#AA00AA";

function ToolBlock({
    id,
    label,
    icon: Icon,
    children,
    className = "",
}) {
    return (
        <div
            id={id}
            className={`cf-tool-card rounded-xl border p-4 h-full ${className}`}
            style={{ borderColor: "var(--line)" }}
        >
            <div
                className="flex items-center gap-2 mb-2 pb-1.5 border-b"
                style={{ borderColor: "var(--line)" }}
            >
                <span
                    className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                    style={{
                        backgroundColor: "var(--sec-accent-bg)",
                        color: "var(--sec-accent)",
                    }}
                >
                    <Icon size={12} />
                </span>

                <h3
                    className="font-mono-cf text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                >
                    {label}
                </h3>
            </div>
            {children}
        </div>
    );
}

function QuickNav({ items }) {
    return (
        <nav
            aria-label="Jump to a tool"
            className="flex flex-wrap gap-1.5 mb-6"
        >
            {items.map(({ id, label, icon: Icon }) => (
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

const TOOLS = [
    {
        id: "dp-knapsack",
        label: "0/1 knapsack",
        icon: FaBriefcase,
    },
    {
        id: "dp-lcs",
        label: "Longest common subsequence",
        icon: FaLink,
    },
    {
        id: "dp-coin-change",
        label: "Coin change (DP)",
        icon: FaCoins,
    },
    {
        id: "dp-lis",
        label: "Longest increasing subsequence",
        icon: FaChartLine,
    },
];

function TextArea({ value, onChange, placeholder, rows = 4, wide = false }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full p-2 rounded-md border font-mono-cf text-xs resize-none outline-none focus:ring-1 ${
                wide ? "" : "sm:w-48"
            }`}
            style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--bg)",
                color: "var(--ink)",
            }}
        />
    );
}

function DpTable({
    table,
    rowLabels,
    colLabels,
    rowAxisLabel,
    colAxisLabel,
    caption,
    highlight = [],
    path = [],
    resultCell,
}) {
    const highlightCells = new Set(
        highlight.map(([row, column]) => `${row}:${column}`),
    );
    const pathCells = new Set(
        path.map(([row, column]) => `${row}:${column}`),
    );

    return (
        <div className="dp-matrix">
            <div className="dp-matrix-guide">
                <span>
                    <strong>Columns →</strong> {colAxisLabel}
                </span>
                <span>
                    <strong>Rows ↓</strong> {rowAxisLabel}
                </span>
                {path.length > 0 && (
                    <span className="dp-matrix-legend">
                        <i className="dp-path-swatch" aria-hidden="true" />
                        traceback
                        <i className="dp-match-swatch" aria-hidden="true" />
                        selected
                    </span>
                )}
            </div>
            <div className="dp-matrix-scroll">
                <table
                    className="dp-matrix-table font-mono-cf"
                    aria-label={caption}
                >
                    {colLabels && (
                        <thead>
                            <tr>
                                <th
                                    className="dp-matrix-corner"
                                    aria-label="Rows down, columns right"
                                >
                                    ↓ / →
                                </th>
                                {colLabels.map((label, column) => (
                                    <th key={column} scope="col">
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {table.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {rowLabels && (
                                    <th scope="row">{rowLabels[rowIndex]}</th>
                                )}
                                {row.map((cell, columnIndex) => {
                                    const key = `${rowIndex}:${columnIndex}`;
                                    const isHighlighted =
                                        highlightCells.has(key);
                                    const isOnPath = pathCells.has(key);
                                    const isResult =
                                        resultCell?.[0] === rowIndex &&
                                        resultCell?.[1] === columnIndex;

                                    return (
                                        <td
                                            key={columnIndex}
                                            className={[
                                                isOnPath
                                                    ? "dp-matrix-cell-path"
                                                    : "",
                                                isHighlighted
                                                    ? "dp-matrix-cell-highlight"
                                                    : "",
                                                isResult
                                                    ? "dp-matrix-cell-result"
                                                    : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KnapsackTool() {
    const [text, setText] = useState(
        "apple 4 2\nBread 7 3\nCandy 9 4\nDates 11 5\nEggs 15 9",
    );
    const [capacity, setCapacity] = useState("12");

    const items = text
        .trim()
        .split("\n")
        .map((line) => line.trim().split(/\s+/))
        .filter((parts) => parts.length === 3)
        .map(([name, value, weight]) => ({
            name,
            value: Number(value),
            weight: Number(weight),
        }))
        .filter(
            (item) =>
                Number.isFinite(item.value) &&
                Number.isFinite(item.weight) &&
                Number.isInteger(item.weight) &&
                item.weight > 0,
        );

    const cap = Number(capacity);
    const validCap = Number.isInteger(cap) && cap > 0 && cap <= 60;
    const { dp, best, taken } =
        items.length > 0 && validCap
            ? knapsack01(items, cap)
            : { dp: [], best: 0, taken: [] };
    const takenNames = new Set(taken.map((t) => t.name));
    const traceback = [];
    const selectedCells = [];
    if (dp.length > 0) {
        let remainingCapacity = cap;
        for (let row = items.length; row > 0; row--) {
            traceback.push([row, remainingCapacity]);
            if (dp[row][remainingCapacity] !== dp[row - 1][remainingCapacity]) {
                selectedCells.push([row, remainingCapacity]);
                remainingCapacity -= items[row - 1].weight;
            }
        }
        traceback.push([0, remainingCapacity]);
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label
                    className="block text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    <span className="block mb-1">
                        items — name value weight
                    </span>
                    <TextArea
                        value={text}
                        onChange={setText}
                        placeholder={"name value weight"}
                        rows={5}
                        wide
                    />
                </label>
                <label
                    className="block text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    capacity (≤ 60)
                    <input
                        type="text"
                        inputMode="numeric"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="block mt-1 w-full p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>
            <div className="min-w-0">
                {!validCap && (
                    <p
                        className="text-xs font-mono-cf"
                        style={{ color: "var(--muted)" }}
                    >
                        Pick a capacity between 1 and 60 to keep the table
                        readable.
                    </p>
                )}
                {validCap && items.length > 0 && (
                    <div className="space-y-3">
                        <div className="dp-result-summary">
                            <div>
                                <span>Best value</span>
                                <strong>{best}</strong>
                            </div>
                            <div>
                                <span>Selected items</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {items.map((item) => (
                                        <span
                                            key={item.name}
                                            className={
                                                takenNames.has(item.name)
                                                    ? "dp-choice-chip is-selected"
                                                    : "dp-choice-chip"
                                            }
                                        >
                                            {item.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DpTable
                            table={dp}
                            rowLabels={[
                                "No items",
                                ...items.map((item) => item.name),
                            ]}
                            colLabels={Array.from(
                                { length: cap + 1 },
                                (_, weight) => weight,
                            )}
                            rowAxisLabel="items considered"
                            colAxisLabel={`capacity 0–${cap}`}
                            caption="0/1 knapsack dynamic programming matrix"
                            path={traceback}
                            highlight={selectedCells}
                            resultCell={[items.length, cap]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function LcsTool() {
    const [a, setA] = useState("ACDBACADB");
    const [b, setB] = useState("BCBACDA");

    const cleanA = a.trim().slice(0, 16);
    const cleanB = b.trim().slice(0, 16);
    const { dp, length, subsequence, path, matches } =
        cleanA.length > 0 && cleanB.length > 0
            ? longestCommonSubsequence(cleanB, cleanA)
            : {
                  dp: [],
                  length: 0,
                  subsequence: "",
                  path: [],
                  matches: [],
              };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    string A (≤ 16 chars)
                    <input
                        type="text"
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        className="block mt-1 w-full p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    string B (≤ 16 chars)
                    <input
                        type="text"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        className="block mt-1 w-full p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>
            <div className="flex-1 min-w-0">
                {cleanA && cleanB && (
                    <>
                        <DpTable
                            table={dp}
                            rowLabels={["∅", ...cleanB.split("")]}
                            colLabels={["∅", ...cleanA.split("")]}
                            rowAxisLabel={`String B: ${cleanB}`}
                            colAxisLabel={`String A: ${cleanA}`}
                            caption="Longest common subsequence dynamic programming matrix"
                            path={path}
                            highlight={matches}
                            resultCell={[cleanB.length, cleanA.length]}
                        />
                        <div className="dp-result-summary mt-3">
                            <div>
                                <span>LCS length</span>
                                <strong>{length}</strong>
                            </div>
                            <div>
                                <span>Subsequence</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {subsequence ? (
                                        subsequence
                                            .split("")
                                            .map((character, index) => (
                                                <span
                                                    key={`${character}-${index}`}
                                                    className="dp-choice-chip is-selected"
                                                >
                                                    {character}
                                                </span>
                                            ))
                                    ) : (
                                        <strong>∅</strong>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function MinCoinChangeTool() {
    const [coins, setCoins] = useState("1 3 4");
    const [target, setTarget] = useState("6");

    const denominations = coins
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite);
    const t = Number(target);
    const valid =
        denominations.length > 0 && Number.isInteger(t) && t >= 0 && t <= 100;

    const result = valid ? minCoinChange(denominations, t) : null;

    return (
        <div>
            <div className="flex gap-3 flex-wrap mb-3">
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    denominations
                    <input
                        type="text"
                        value={coins}
                        onChange={(e) => setCoins(e.target.value)}
                        className="block mt-1 w-48 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    target (≤ 100)
                    <input
                        type="text"
                        inputMode="numeric"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="block mt-1 w-28 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>

            {result && (
                <>
                    <div className="overflow-x-auto -mx-1 px-1">
                        <table className="font-mono-cf text-[11px] sm:text-xs border-collapse">
                            <thead>
                                <tr>
                                    {result.dp.map((_, amount) => (
                                        <th
                                            key={amount}
                                            className="px-1.5 py-1 text-center font-normal"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            {amount}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {result.dp.map((v, amount) => (
                                        <td
                                            key={amount}
                                            className="w-7 h-7 text-center rounded-sm"
                                            style={{ color: "var(--ink)" }}
                                        >
                                            {v === Infinity ? "∞" : v}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p
                        className="text-xs font-mono-cf mt-3"
                        style={{ color: "var(--muted)" }}
                    >
                        {result.success ? (
                            <>
                                min coins:{" "}
                                <strong style={{ color: "var(--ink)" }}>
                                    {result.used.join(" + ")}
                                </strong>{" "}
                                ({result.used.length} coins)
                            </>
                        ) : (
                            <span style={{ color: "#c0392b" }}>
                                target can't be reached with these coins
                            </span>
                        )}
                    </p>
                </>
            )}
        </div>
    );
}

function LisTool() {
    const [text, setText] = useState("10 9 2 5 3 7 101 18");

    const nums = text
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite)
        .slice(0, 20);

    const { dp, length, subsequence, indices } =
        nums.length > 0
            ? longestIncreasingSubsequence(nums)
            : { dp: [], length: 0, subsequence: [], indices: [] };
    const highlightedIdx = new Set(indices);

    return (
        <div className="space-y-3">
            <label
                className="block text-xs font-mono-cf"
                style={{ color: "var(--muted)" }}
            >
                <span className="block mb-1">sequence (≤ 20 numbers):</span>
                <input
                    type="text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={"10 9 2 5 3 7 101 18"}
                    className="block w-full p-2 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                    style={{
                        borderColor: "var(--line)",
                        backgroundColor: "var(--bg)",
                        color: "var(--ink)",
                    }}
                />
            </label>
            <div className="min-w-0">
                {nums.length > 0 && (
                    <>
                        <div className="flex gap-2 flex-wrap">
                            {nums.map((n, i) => (
                                <div
                                    key={i}
                                    className="min-w-14 min-h-14 rounded-md border flex flex-col items-center justify-center gap-1 px-2 py-2 text-sm font-mono-cf leading-tight flex-shrink-0"
                                    style={{
                                        borderColor: highlightedIdx.has(i)
                                            ? "var(--sec-accent)"
                                            : "var(--line)",
                                        backgroundColor: highlightedIdx.has(i)
                                            ? "var(--sec-accent)"
                                            : "transparent",
                                        color: highlightedIdx.has(i)
                                            ? "#fff"
                                            : "var(--ink)",
                                    }}
                                >
                                    <span className="font-bold">{n}</span>
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: highlightedIdx.has(i)
                                                ? "inherit"
                                                : "var(--muted)",
                                        }}
                                    >
                                        dp={dp[i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p
                            className="text-xs font-mono-cf mt-3"
                            style={{ color: "var(--muted)" }}
                        >
                            LIS:{" "}
                            <strong style={{ color: "var(--ink)" }}>
                                {subsequence.join(", ")}
                            </strong>{" "}
                            (length {length})
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

function DynamicProgrammingContent() {
    return (
        <div
            className="dp-content"
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav items={TOOLS} />
            <div className="cf-tool-grid dp-tool-grid">
                <ToolBlock
                    id="dp-knapsack"
                    icon={FaBriefcase}
                    label="0/1 knapsack"
                    className="dp-tool-knapsack"
                >
                    <KnapsackTool />
                </ToolBlock>

                <ToolBlock
                    id="dp-lcs"
                    icon={FaLink}
                    label="Longest common subsequence"
                    className="dp-tool-lcs"
                >
                    <LcsTool />
                </ToolBlock>

                <ToolBlock
                    id="dp-coin-change"
                    icon={FaCoins}
                    label="Coin change — minimum coins (DP)"
                    className="dp-tool-coin"
                >
                    <MinCoinChangeTool />
                </ToolBlock>

                <ToolBlock
                    id="dp-lis"
                    icon={FaChartLine}
                    label="Longest increasing subsequence"
                    className="dp-tool-lis"
                >
                    <LisTool />
                </ToolBlock>
            </div>
        </div>
    );
}

export default DynamicProgrammingContent;

import { useState } from "react";
import {
    knapsack01,
    longestCommonSubsequence,
    minCoinChange,
    longestIncreasingSubsequence,
} from "../../utils/dpTools";

function ToolBlock({ label, children }) {
    return (
        <div className="mb-6">
            <h3
                className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-2 pb-1.5 border-b"
                style={{ color: "var(--muted)", borderColor: "var(--line)" }}
            >
                {label}
            </h3>
            {children}
        </div>
    );
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full sm:w-48 p-2 rounded-md border font-mono-cf text-xs resize-none outline-none focus:ring-1"
            style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--bg)",
                color: "var(--ink)",
            }}
        />
    );
}

function DpTable({ table, rowLabels, colLabels, highlight = [] }) {
    const isHighlighted = (r, c) =>
        highlight.some(([hr, hc]) => hr === r && hc === c);

    return (
        <div className="overflow-x-auto -mx-1 px-1">
            <table className="font-mono-cf text-[11px] sm:text-xs border-collapse">
                {colLabels && (
                    <thead>
                        <tr>
                            <th className="w-7"></th>
                            {colLabels.map((label, c) => (
                                <th
                                    key={c}
                                    className="px-1.5 py-1 text-center font-normal"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {table.map((row, r) => (
                        <tr key={r}>
                            {rowLabels && (
                                <td
                                    className="px-1.5 py-1 text-right font-bold flex-shrink-0"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {rowLabels[r]}
                                </td>
                            )}
                            {row.map((cell, c) => (
                                <td
                                    key={c}
                                    className="w-7 h-7 text-center rounded-sm"
                                    style={{
                                        backgroundColor: isHighlighted(r, c)
                                            ? "var(--accent-blue)"
                                            : "transparent",
                                        color: isHighlighted(r, c)
                                            ? "#fff"
                                            : "var(--ink)",
                                        fontWeight: isHighlighted(r, c)
                                            ? 700
                                            : 400,
                                    }}
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
                item.weight > 0,
        );

    const cap = Number(capacity);
    const validCap = Number.isInteger(cap) && cap > 0 && cap <= 60;
    const { dp, best, taken } =
        items.length > 0 && validCap
            ? knapsack01(items, cap)
            : { dp: [], best: 0, taken: [] };
    const takenNames = new Set(taken.map((t) => t.name));

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div>
                <TextArea
                    value={text}
                    onChange={setText}
                    placeholder={"name value weight"}
                    rows={6}
                />
                <label
                    className="block text-xs font-mono-cf mt-2"
                    style={{ color: "var(--muted)" }}
                >
                    capacity (≤ 60)
                    <input
                        type="text"
                        inputMode="numeric"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="block mt-1 w-24 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>
            <div className="flex-1 min-w-0">
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
                    <>
                        <DpTable
                            table={dp}
                            rowLabels={["—", ...items.map((it) => it.name)]}
                            colLabels={Array.from(
                                { length: cap + 1 },
                                (_, w) => w,
                            )}
                        />
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {items.map((item) => (
                                <span
                                    key={item.name}
                                    className="font-mono-cf text-xs px-2 py-1 rounded-sm border"
                                    style={{
                                        borderColor: takenNames.has(item.name)
                                            ? "var(--accent-blue)"
                                            : "var(--line)",
                                        color: takenNames.has(item.name)
                                            ? "var(--accent-blue)"
                                            : "var(--muted)",
                                    }}
                                >
                                    {item.name}
                                </span>
                            ))}
                        </div>
                        <p
                            className="text-xs font-mono-cf mt-2"
                            style={{ color: "var(--muted)" }}
                        >
                            best value:{" "}
                            <strong style={{ color: "var(--ink)" }}>
                                {best}
                            </strong>
                        </p>
                    </>
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
    const { dp, length, subsequence } =
        cleanA.length > 0 && cleanB.length > 0
            ? longestCommonSubsequence(cleanB, cleanA)
            : { dp: [], length: 0, subsequence: "" };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
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
                        className="block mt-1 w-full sm:w-40 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
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
                        className="block mt-1 w-full sm:w-40 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
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
                            rowLabels={["—", ...cleanB.split("")]}
                            colLabels={["—", ...cleanA.split("")]}
                        />
                        <p
                            className="text-xs font-mono-cf mt-3"
                            style={{ color: "var(--muted)" }}
                        >
                            LCS:{" "}
                            <strong style={{ color: "var(--ink)" }}>
                                {subsequence || "—"}
                            </strong>{" "}
                            (length {length})
                        </p>
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
                        className="block mt-1 w-32 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
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
                        className="block mt-1 w-20 p-1.5 rounded-md border font-mono-cf text-xs outline-none focus:ring-1"
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
        <div className="flex flex-col sm:flex-row gap-4">
            <label
                className="text-xs font-mono-cf flex-shrink-0"
                style={{ color: "var(--muted)" }}
            >
                <span className="block mb-1">sequence (≤ 20 numbers):</span>
                <TextArea
                    value={text}
                    onChange={setText}
                    placeholder={"10 9 2 5 3 7 101 18"}
                    rows={3}
                />
            </label>
            <div className="flex-1 min-w-0">
                {nums.length > 0 && (
                    <>
                        <div className="flex gap-1.5 flex-wrap sm:mt-5">
                            {nums.map((n, i) => (
                                <div
                                    key={i}
                                    className="w-11 h-11 rounded-md border flex flex-col items-center justify-center text-xs font-mono-cf flex-shrink-0"
                                    style={{
                                        borderColor: "var(--line)",
                                        backgroundColor: highlightedIdx.has(i)
                                            ? "var(--accent-blue)"
                                            : "transparent",
                                        color: highlightedIdx.has(i)
                                            ? "#fff"
                                            : "var(--ink)",
                                    }}
                                >
                                    <span className="font-bold">{n}</span>
                                    <span
                                        className="text-[10px]"
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
        <div>
            <ToolBlock label="0/1 knapsack">
                <KnapsackTool />
            </ToolBlock>

            <ToolBlock label="Longest common subsequence">
                <LcsTool />
            </ToolBlock>

            <ToolBlock label="Coin change — minimum coins (DP)">
                <MinCoinChangeTool />
            </ToolBlock>

            <ToolBlock label="Longest increasing subsequence">
                <LisTool />
            </ToolBlock>
        </div>
    );
}

export default DynamicProgrammingContent;

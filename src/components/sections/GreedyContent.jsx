import { useState } from "react";
import { FaClock, FaBriefcase, FaCoins, FaTasks } from "react-icons/fa";
import {
    activitySelection,
    fractionalKnapsack,
    greedyCoinChange,
    optimalCoinChange,
    jobSequencing,
} from "../../utils/greedyTools";
import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "greedy")?.color || "#FF8C00";

function ToolBlock({ id, label, icon: Icon, children }) {
    return (
        <div id={id} className="mb-6 scroll-mt-24">
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
        id: "gd-activity-selection",
        label: "Activity selection",
        icon: FaClock,
    },
    {
        id: "gd-fractional-knapsack",
        label: "Fractional knapsack",
        icon: FaBriefcase,
    },
    {
        id: "gd-coin-change",
        label: "Coin change",
        icon: FaCoins,
    },
    {
        id: "gd-job-sequencing",
        label: "Job sequencing",
        icon: FaTasks,
    },
];

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

// --- Activity Selection ---

function ActivitySelectionTool() {
    const [text, setText] = useState(
        "1 4\n3 5\n0 6\n5 7\n3 9\n5 9\n6 10\n8 11",
    );

    const activities = text
        .trim()
        .split("\n")
        .map((line) => line.trim().split(/\s+/).map(Number))
        .filter((parts) => parts.length === 2 && parts.every(Number.isFinite))
        .map(([start, end], idx) => ({ name: `A${idx + 1}`, start, end }));

    const { selected, rejected } =
        activities.length > 0
            ? activitySelection(activities)
            : { selected: [], rejected: [] };
    const maxTime =
        activities.length > 0 ? Math.max(...activities.map((a) => a.end)) : 1;
    const selectedNames = new Set(selected.map((a) => a.name));

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <TextArea
                value={text}
                onChange={setText}
                placeholder={"start end"}
                rows={8}
            />
            <div className="flex-1 min-w-0">
                <div className="space-y-1.5">
                    {activities.map((act) => {
                        const isSelected = selectedNames.has(act.name);
                        const leftPct = (act.start / maxTime) * 100;
                        const widthPct =
                            ((act.end - act.start) / maxTime) * 100;
                        return (
                            <div
                                key={act.name}
                                className="flex items-center gap-2 text-xs font-mono-cf"
                            >
                                <span
                                    className="w-7 flex-shrink-0"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {act.name}
                                </span>
                                <div
                                    className="flex-1 h-5 relative rounded-sm"
                                    style={{ backgroundColor: "var(--line)" }}
                                >
                                    <div
                                        className="absolute h-full rounded-sm flex items-center justify-center text-[10px] font-bold"
                                        style={{
                                            left: `${leftPct}%`,
                                            width: `${Math.max(widthPct, 4)}%`,
                                            backgroundColor: isSelected
                                                ? "#008000"
                                                : "#c0392b",
                                            color: "#fff",
                                        }}
                                    >
                                        {act.start}-{act.end}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p
                    className="text-xs font-mono-cf mt-3"
                    style={{ color: "var(--muted)" }}
                >
                    selected:{" "}
                    <strong style={{ color: "#008000" }}>
                        {selected.length}
                    </strong>{" "}
                    · rejected:{" "}
                    <strong style={{ color: "#c0392b" }}>
                        {rejected.length}
                    </strong>
                </p>
            </div>
        </div>
    );
}

// --- Fractional Knapsack ---

function FractionalKnapsackTool() {
    const [text, setText] = useState("apple 60 10\ngold 100 20\nsilver 120 30");
    const [capacity, setCapacity] = useState("50");

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
    const { taken, totalValue } =
        items.length > 0 && Number.isFinite(cap) && cap > 0
            ? fractionalKnapsack(items, cap)
            : { taken: [], totalValue: 0 };

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
                    capacity
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
                <table className="font-mono-cf text-xs w-full">
                    <thead>
                        <tr style={{ color: "var(--muted)" }}>
                            <th className="text-left py-1 pr-3">item</th>
                            <th className="text-left py-1 pr-3">v/w ratio</th>
                            <th className="text-left py-1">taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taken.map((item) => (
                            <tr
                                key={item.name}
                                style={{ borderTop: "1px solid var(--line)" }}
                            >
                                <td
                                    className="py-1 pr-3 font-bold"
                                    style={{ color: "var(--ink)" }}
                                >
                                    {item.name}
                                </td>
                                <td
                                    className="py-1 pr-3"
                                    style={{ color: "var(--ink)" }}
                                >
                                    {item.ratio.toFixed(2)}
                                </td>
                                <td
                                    className="py-1"
                                    style={{ color: "var(--ink)" }}
                                >
                                    {(item.fraction * 100).toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p
                    className="text-xs font-mono-cf mt-3"
                    style={{ color: "var(--muted)" }}
                >
                    total value:{" "}
                    <strong style={{ color: "var(--ink)" }}>
                        {totalValue.toFixed(2)}
                    </strong>
                </p>
            </div>
        </div>
    );
}

// --- Greedy Coin Change (with optimal comparison) ---

function CoinChangeTool() {
    const [coins, setCoins] = useState("1 3 4");
    const [target, setTarget] = useState("6");

    const denominations = coins
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite);
    const t = Number(target);
    const valid = denominations.length > 0 && Number.isInteger(t) && t >= 0;

    const greedyResult = valid ? greedyCoinChange(denominations, t) : null;
    const optimalResult = valid ? optimalCoinChange(denominations, t) : null;
    const mismatch =
        greedyResult &&
        optimalResult &&
        greedyResult.success &&
        optimalResult.success &&
        greedyResult.used.length !== optimalResult.used.length;

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
                    target
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

            {greedyResult && (
                <div
                    className="space-y-2 text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    <p>
                        greedy:{" "}
                        <strong style={{ color: "var(--ink)" }}>
                            {greedyResult.used.join(" + ") || "—"}
                        </strong>
                        {greedyResult.success ? (
                            <> ({greedyResult.used.length} coins)</>
                        ) : (
                            <span style={{ color: "#c0392b" }}>
                                {" "}
                                — can't reach target exactly
                            </span>
                        )}
                    </p>
                    {optimalResult && optimalResult.success && (
                        <p>
                            optimal:{" "}
                            <strong style={{ color: "var(--ink)" }}>
                                {optimalResult.used.join(" + ")}
                            </strong>{" "}
                            ({optimalResult.used.length} coins)
                        </p>
                    )}
                    {mismatch && (
                        <p
                            className="px-2 py-1.5 rounded-sm border mt-1"
                            style={{ borderColor: "#c0392b", color: "#c0392b" }}
                        >
                            ⚠ Greedy is suboptimal here — uses more coins than
                            necessary. This is the classic case where greedy
                            coin change fails.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Job Sequencing ---

function JobSequencingTool() {
    const [text, setText] = useState("a 2 100\nb 1 19\nc 2 27\nd 1 25\ne 3 15");

    const jobs = text
        .trim()
        .split("\n")
        .map((line) => line.trim().split(/\s+/))
        .filter((parts) => parts.length === 3)
        .map(([name, deadline, profit]) => ({
            name,
            deadline: Number(deadline),
            profit: Number(profit),
        }))
        .filter(
            (j) => Number.isFinite(j.deadline) && Number.isFinite(j.profit),
        );

    const { slots, totalProfit } =
        jobs.length > 0 ? jobSequencing(jobs) : { slots: [], totalProfit: 0 };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <TextArea
                value={text}
                onChange={setText}
                placeholder={"name deadline profit"}
                rows={6}
            />
            <div className="flex-1 min-w-0">
                <div className="flex gap-1.5 flex-wrap">
                    {slots.map((job, idx) => (
                        <div
                            key={idx}
                            className="w-16 h-16 rounded-md border flex flex-col items-center justify-center text-xs font-mono-cf flex-shrink-0"
                            style={{
                                borderColor: "var(--line)",
                                backgroundColor: job
                                    ? "var(--accent-blue)"
                                    : "transparent",
                                color: job ? "#fff" : "var(--muted)",
                            }}
                        >
                            <span className="text-[10px]">slot {idx + 1}</span>
                            <span className="font-bold">
                                {job ? job.name : "—"}
                            </span>
                        </div>
                    ))}
                </div>
                <p
                    className="text-xs font-mono-cf mt-3"
                    style={{ color: "var(--muted)" }}
                >
                    total profit:{" "}
                    <strong style={{ color: "var(--ink)" }}>
                        {totalProfit}
                    </strong>
                </p>
            </div>
        </div>
    );
}

function GreedyContent() {
    return (
        <div
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav items={TOOLS} />

            <ToolBlock
                id="gd-activity-selection"
                icon={FaClock}
                label="Activity selection"
            >
                <ActivitySelectionTool />
            </ToolBlock>

            <ToolBlock
                id="gd-fractional-knapsack"
                icon={FaBriefcase}
                label="Fractional knapsack"
            >
                <FractionalKnapsackTool />
            </ToolBlock>

            <ToolBlock
                id="gd-coin-change"
                icon={FaCoins}
                label="Coin change — greedy vs optimal"
            >
                <CoinChangeTool />
            </ToolBlock>

            <ToolBlock
                id="gd-job-sequencing"
                icon={FaTasks}
                label="Job sequencing with deadlines"
            >
                <JobSequencingTool />
            </ToolBlock>
        </div>
    );
}

export default GreedyContent;

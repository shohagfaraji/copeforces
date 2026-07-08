import { useState, useMemo } from "react";
import {
    FaSearch,
    FaArrowsAltV,
    FaListOl,
    FaCrosshairs,
    FaChartLine,
    FaEye,
    FaChevronLeft,
    FaChevronRight,
    FaCopy,
    FaCheck,
} from "react-icons/fa";
import {
    parseSortedArray,
    binarySearchTrace,
    lowerBound,
    upperBound,
    findAllOccurrences,
    binarySearchOnAnswer,
    ternarySearch,
} from "../../utils/searchTools";

import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "search")?.color || "#FF8C00";

const OK_COLOR = "#008000";
const ERROR_COLOR = "#cc0000";

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

function TextArea({ label, value, onChange, rows = 3 }) {
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

function NumberField({ label, value, onChange }) {
    return (
        <label
            className="block text-xs font-mono-cf"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 font-mono-cf text-xs outline-none"
                style={{
                    borderColor: "var(--line)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                }}
            />
        </label>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <label
            className="block text-xs font-mono-cf"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 font-mono-cf text-xs outline-none"
                style={{
                    borderColor: "var(--line)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function CheckField({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2 text-xs font-mono-cf">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    );
}

function ErrorBlock({ message }) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor: ERROR_COLOR }}
        >
            <span style={{ color: ERROR_COLOR }}>{message}</span>
        </div>
    );
}

function TraceTable({ columns, rows, highlightRow = -1 }) {
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
                                background:
                                    highlightRow === i
                                        ? "var(--sec-accent-bg)"
                                        : "transparent",
                            }}
                        >
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="px-3 py-2 whitespace-nowrap"
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

function SortedArrayInput({
    label,
    value,
    onChange,
    rows = 3,
    showPreview = true,
}) {
    function handleChange(e) {
        const raw = e.target.value;

        // Once a value is "finished" (a space or newline was just typed),
        // re-sort immediately so the box always reflects sorted order.
        if (raw.endsWith(" ") || raw.endsWith("\n")) {
            const nums = parseSortedArray(raw).sort((a, b) => a - b);
            onChange(nums.length > 0 ? `${nums.join(" ")} ` : "");
        } else {
            onChange(raw);
        }
    }

    function handlePaste(e) {
        e.preventDefault();

        const pasted = e.clipboardData.getData("text");
        const target = e.target;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const combined = value.slice(0, start) + pasted + value.slice(end);

        const nums = parseSortedArray(combined).sort((a, b) => a - b);
        onChange(nums.join(" "));
    }

    const preview = parseSortedArray(value);

    return (
        <div className="space-y-2">
            <label
                className="block text-xs font-mono-cf"
                style={{ color: "var(--muted)" }}
            >
                {label} (auto-sorts as you type or paste)
                <textarea
                    value={value}
                    onChange={handleChange}
                    onPaste={handlePaste}
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

            {showPreview && preview.length > 0 ? (
                <div className="overflow-x-auto">
                    <div className="inline-flex gap-1.5 pb-1">
                        {preview.map((v, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center gap-0.5"
                            >
                                <div
                                    className="text-[9px] font-mono-cf leading-none"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {idx}
                                </div>

                                <div
                                    className="w-8 h-7 rounded-md border flex items-center justify-center text-[11px] font-mono-cf flex-shrink-0"
                                    style={{
                                        borderColor: "var(--line)",
                                        color: "var(--ink)",
                                    }}
                                >
                                    {v}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

// ---------- Tool: Binary Search (Trace Table) ----------

function BinarySearchTraceTool() {
    const [input, setInput] = useState("1 3 5 7 9 11 13 15 17 19");
    const [target, setTarget] = useState(13);

    const arr = parseSortedArray(input);

    const { steps, foundIndex } = useMemo(
        () => binarySearchTrace(arr, Number(target)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [input, target],
    );

    return (
        <div className="space-y-4">
            <SortedArrayInput
                label="Sorted array"
                value={input}
                onChange={setInput}
                rows={2}
            />

            <NumberField label="Target" value={target} onChange={setTarget} />

            {arr.length === 0 ? (
                <ErrorBlock message="Enter a sorted array to search." />
            ) : steps.length === 0 ? (
                <ErrorBlock message="Array is empty." />
            ) : (
                <>
                    <TraceTable
                        columns={[
                            "Step",
                            "lo",
                            "hi",
                            "mid",
                            "arr[mid]",
                            "action",
                        ]}
                        rows={steps.map((s, i) => [
                            i + 1,
                            s.lo,
                            s.hi,
                            s.mid,
                            s.value,
                            s.action,
                        ])}
                        highlightRow={foundIndex !== -1 ? steps.length - 1 : -1}
                    />

                    <div
                        className="rounded-lg border p-3 flex items-center justify-between gap-2 flex-wrap"
                        style={{
                            borderColor:
                                foundIndex !== -1 ? OK_COLOR : ERROR_COLOR,
                        }}
                    >
                        {foundIndex !== -1 ? (
                            <>
                                <span style={{ color: OK_COLOR }}>
                                    ✓ Found at index {foundIndex}
                                </span>
                                <CopyButton value={foundIndex} />
                            </>
                        ) : (
                            <span style={{ color: ERROR_COLOR }}>
                                Not found in this array.
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Tool: Search Visualizer ----------

function SearchVisualizerTool() {
    const [input, setInput] = useState("1 3 5 7 9 11 13 15 17 19");
    const [target, setTarget] = useState(13);
    const [stepIndex, setStepIndex] = useState(0);

    const arr = parseSortedArray(input);

    const { steps, foundIndex } = useMemo(
        () => binarySearchTrace(arr, Number(target)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [input, target],
    );

    const maxStep = Math.max(steps.length - 1, 0);
    const clampedStep = Math.min(stepIndex, maxStep);
    const current = steps[clampedStep];

    function handleInputChange(value) {
        setInput(value);
        setStepIndex(0);
    }

    function handleTargetChange(value) {
        setTarget(value);
        setStepIndex(0);
    }

    return (
        <div className="space-y-4">
            <SortedArrayInput
                label="Sorted array"
                value={input}
                onChange={handleInputChange}
                rows={2}
                showPreview={false}
            />

            <NumberField
                label="Target"
                value={target}
                onChange={handleTargetChange}
            />

            {arr.length === 0 ? (
                <ErrorBlock message="Enter a sorted array to visualize." />
            ) : steps.length === 0 ? (
                <ErrorBlock message="Array is empty." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <div className="inline-flex gap-2 pb-3">
                            {arr.map((value, idx) => {
                                const isMid = current.mid === idx;
                                const outOfRange =
                                    idx < current.lo || idx > current.hi;

                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center gap-1.5"
                                    >
                                        <div
                                            className="min-h-4 text-[11px] font-mono-cf leading-4"
                                            style={{
                                                color: "var(--sec-accent)",
                                            }}
                                        >
                                            {isMid
                                                ? "mid"
                                                : current.lo === idx
                                                  ? "lo"
                                                  : current.hi === idx
                                                    ? "hi"
                                                    : ""}
                                        </div>

                                        <div
                                            className="w-10 h-10 rounded-md border flex items-center justify-center px-1 text-sm font-mono-cf flex-shrink-0"
                                            style={{
                                                borderColor: isMid
                                                    ? "var(--sec-accent)"
                                                    : "var(--line)",
                                                background: isMid
                                                    ? "var(--sec-accent-bg)"
                                                    : "transparent",
                                                color: outOfRange
                                                    ? "var(--muted)"
                                                    : "var(--ink)",
                                                opacity: outOfRange ? 0.35 : 1,
                                            }}
                                        >
                                            {value}
                                        </div>

                                        <div
                                            className="min-h-4 text-[11px] font-mono-cf leading-4"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            {idx}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        className="rounded-lg border p-3 font-mono-cf text-xs"
                        style={{ borderColor: "var(--line)" }}
                    >
                        Step {clampedStep + 1} / {steps.length} — lo=
                        {current.lo}, hi={current.hi}, mid={current.mid},
                        arr[mid]={current.value} → {current.action}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={clampedStep === 0}
                            onClick={() =>
                                setStepIndex((s) => Math.max(0, s - 1))
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-mono-cf disabled:opacity-40"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            <FaChevronLeft size={10} />
                            Prev
                        </button>

                        <button
                            type="button"
                            disabled={clampedStep === maxStep}
                            onClick={() =>
                                setStepIndex((s) => Math.min(maxStep, s + 1))
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-mono-cf disabled:opacity-40"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            Next
                            <FaChevronRight size={10} />
                        </button>

                        {clampedStep === steps.length - 1 ? (
                            <span
                                className="text-xs font-mono-cf"
                                style={{
                                    color:
                                        foundIndex !== -1
                                            ? OK_COLOR
                                            : ERROR_COLOR,
                                }}
                            >
                                {foundIndex !== -1
                                    ? `✓ Found at index ${foundIndex}`
                                    : "Not found"}
                            </span>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Tool: Lower & Upper Bound ----------

function BoundsTool() {
    const [input, setInput] = useState("1 3 3 3 5 7 9 9 11 13");
    const [target, setTarget] = useState(3);

    const arr = parseSortedArray(input);
    const lower = arr.length > 0 ? lowerBound(arr, Number(target)) : null;
    const upper = arr.length > 0 ? upperBound(arr, Number(target)) : null;

    return (
        <div className="space-y-4">
            <SortedArrayInput
                label="Sorted array"
                value={input}
                onChange={setInput}
                rows={2}
            />

            <NumberField label="Target" value={target} onChange={setTarget} />

            {arr.length === 0 ? (
                <ErrorBlock message="Enter a sorted array." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                        className="rounded-lg border p-4"
                        style={{ borderColor: "var(--line)" }}
                    >
                        <div
                            className="text-[11px] mb-1"
                            style={{ color: "var(--muted)" }}
                        >
                            Lower bound — first index with arr[i] ≥ target
                        </div>
                        <div className="font-mono-cf text-sm">
                            index = <strong>{lower}</strong>
                            {lower < arr.length
                                ? ` (arr[${lower}] = ${arr[lower]})`
                                : " — past the end"}
                        </div>
                    </div>

                    <div
                        className="rounded-lg border p-4"
                        style={{ borderColor: "var(--line)" }}
                    >
                        <div
                            className="text-[11px] mb-1"
                            style={{ color: "var(--muted)" }}
                        >
                            Upper bound — first index with arr[i] &gt; target
                        </div>
                        <div className="font-mono-cf text-sm">
                            index = <strong>{upper}</strong>
                            {upper < arr.length
                                ? ` (arr[${upper}] = ${arr[upper]})`
                                : " — past the end"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------- Tool: Occurrences (first, last, all) ----------

function OccurrencesTool() {
    const [input, setInput] = useState("4 2 3 3 1 3 5 3 2");
    const [target, setTarget] = useState(3);

    const arr = parseSortedArray(input);
    const indices = findAllOccurrences(arr, Number(target));
    const occurrenceSet = new Set(indices);

    return (
        <div className="space-y-4">
            <TextArea
                label="Array (any order — sorted not required)"
                value={input}
                onChange={setInput}
                rows={2}
            />

            <NumberField label="Target" value={target} onChange={setTarget} />

            {arr.length > 0 && (
                <div className="overflow-x-auto">
                    <div className="inline-flex gap-1.5 pb-1">
                        {arr.map((v, idx) => {
                            const isOccurrence = occurrenceSet.has(idx);

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center gap-0.5"
                                >
                                    <div
                                        className="text-[9px] font-mono-cf leading-none"
                                        style={{
                                            color: isOccurrence
                                                ? OK_COLOR
                                                : "var(--muted)",
                                            fontWeight: isOccurrence
                                                ? 700
                                                : 400,
                                        }}
                                    >
                                        {idx}
                                    </div>

                                    <div
                                        className="w-8 h-7 rounded-md border flex items-center justify-center text-[11px] font-mono-cf flex-shrink-0"
                                        style={{
                                            borderColor: isOccurrence
                                                ? OK_COLOR
                                                : "var(--line)",
                                            background: isOccurrence
                                                ? `${OK_COLOR}20`
                                                : "transparent",
                                            color: isOccurrence
                                                ? OK_COLOR
                                                : "var(--ink)",
                                        }}
                                    >
                                        {v}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {arr.length === 0 ? (
                <ErrorBlock message="Enter an array." />
            ) : indices.length === 0 ? (
                <ErrorBlock message="Target does not appear in the array." />
            ) : (
                <div
                    className="rounded-lg border p-4 space-y-2"
                    style={{ borderColor: OK_COLOR }}
                >
                    <div style={{ color: OK_COLOR }}>
                        Found <strong>{indices.length}</strong> occurrence(s) —
                        first at index <strong>{indices[0]}</strong>, last at
                        index <strong>{indices[indices.length - 1]}</strong>
                    </div>

                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div
                            className="font-mono-cf text-xs break-all"
                            style={{ color: "var(--ink)" }}
                        >
                            indices: {indices.join(", ")}
                        </div>

                        <CopyButton value={indices.join(", ")} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------- Tool: Binary Search on Answer ----------

const ANSWER_PRESETS = [
    { id: "sqrt", label: "min x such that x² ≥ N", fn: (x) => x * x },
    { id: "pow2", label: "min x such that 2^x ≥ N", fn: (x) => Math.pow(2, x) },
    {
        id: "triangular",
        label: "min x such that x(x+1)/2 ≥ N",
        fn: (x) => (x * (x + 1)) / 2,
    },
];

function BinarySearchOnAnswerTool() {
    const [presetId, setPresetId] = useState("sqrt");
    const [n, setN] = useState(50);
    const [lo, setLo] = useState(0);
    const [hi, setHi] = useState(1000);

    const preset = ANSWER_PRESETS.find((p) => p.id === presetId);

    const result = useMemo(() => {
        return binarySearchOnAnswer(
            Number(lo),
            Number(hi),
            (x) => preset.fn(x) >= Number(n),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presetId, n, lo, hi]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                    label="Problem"
                    value={presetId}
                    onChange={setPresetId}
                    options={ANSWER_PRESETS.map((p) => ({
                        value: p.id,
                        label: p.label,
                    }))}
                />
                <NumberField label="N (target)" value={n} onChange={setN} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberField label="Search lo" value={lo} onChange={setLo} />
                <NumberField label="Search hi" value={hi} onChange={setHi} />
            </div>

            {result.answer === null ? (
                <ErrorBlock
                    message={
                        result.error ||
                        "No answer in [lo, hi] satisfies the predicate — try a larger hi."
                    }
                />
            ) : (
                <>
                    <div
                        className="rounded-lg border p-4 flex items-center justify-between gap-2 flex-wrap"
                        style={{ borderColor: OK_COLOR }}
                    >
                        <span style={{ color: OK_COLOR }}>
                            answer = <strong>{result.answer}</strong>
                        </span>
                        <CopyButton value={result.answer} />
                    </div>

                    <TraceTable
                        columns={["Step", "lo", "hi", "mid", "predicate(mid)"]}
                        rows={result.steps.map((s, i) => [
                            i + 1,
                            s.lo,
                            s.hi,
                            s.mid,
                            s.result ? "true" : "false",
                        ])}
                    />
                </>
            )}
        </div>
    );
}

// ---------- Tool: Ternary Search ----------

const TERNARY_PRESETS = [
    {
        id: "parabola_min",
        label: "f(x) = (x − c)² — find minimum",
        mode: "min",
        fn: (x, c) => Math.pow(x - c, 2),
    },
    {
        id: "parabola_max",
        label: "f(x) = −(x − c)² — find maximum",
        mode: "max",
        fn: (x, c) => -Math.pow(x - c, 2),
    },
    {
        id: "abs_min",
        label: "f(x) = |x − c| — find minimum",
        mode: "min",
        fn: (x, c) => Math.abs(x - c),
    },
];

function TernarySearchTool() {
    const [presetId, setPresetId] = useState("parabola_min");
    const [c, setC] = useState(7);
    const [lo, setLo] = useState(0);
    const [hi, setHi] = useState(20);
    const [integer, setInteger] = useState(true);

    const preset = TERNARY_PRESETS.find((p) => p.id === presetId);

    const result = useMemo(() => {
        return ternarySearch(
            (x) => preset.fn(x, Number(c)),
            Number(lo),
            Number(hi),
            { mode: preset.mode, integer },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presetId, c, lo, hi, integer]);

    return (
        <div className="space-y-4">
            <SelectField
                label="Function"
                value={presetId}
                onChange={setPresetId}
                options={TERNARY_PRESETS.map((p) => ({
                    value: p.id,
                    label: p.label,
                }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NumberField label="c" value={c} onChange={setC} />
                <NumberField label="Search lo" value={lo} onChange={setLo} />
                <NumberField label="Search hi" value={hi} onChange={setHi} />
            </div>

            <CheckField
                label="Integer search (vs. continuous)"
                checked={integer}
                onChange={setInteger}
            />

            <div
                className="rounded-lg border p-4 flex items-center justify-between gap-2 flex-wrap"
                style={{ borderColor: OK_COLOR }}
            >
                <span style={{ color: OK_COLOR }}>
                    {preset.mode === "min" ? "minimum" : "maximum"} at x ={" "}
                    <strong>
                        {integer ? result.x : Number(result.x).toFixed(4)}
                    </strong>{" "}
                    → f(x) ={" "}
                    <strong>
                        {integer
                            ? result.value
                            : Number(result.value).toFixed(6)}
                    </strong>
                </span>
                <CopyButton
                    value={integer ? result.x : Number(result.x).toFixed(4)}
                />
            </div>

            <TraceTable
                columns={["Step", "lo", "hi", "m1", "m2", "f(m1)", "f(m2)"]}
                rows={result.steps.map((s, i) => [
                    i + 1,
                    integer ? s.lo : s.lo.toFixed(3),
                    integer ? s.hi : s.hi.toFixed(3),
                    integer ? s.m1 : s.m1.toFixed(3),
                    integer ? s.m2 : s.m2.toFixed(3),
                    integer ? s.f1 : s.f1.toFixed(4),
                    integer ? s.f2 : s.f2.toFixed(4),
                ])}
            />

            {!integer ? (
                <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                    Showing the first {result.steps.length} of{" "}
                    {result.totalIterations} iterations used to converge.
                </div>
            ) : null}
        </div>
    );
}

const TOOLS = [
    {
        id: "sr-binary-search",
        label: "Binary Search",
        icon: FaSearch,
        hint: "Full lo/hi/mid trace table for a target",
        wide: true,
        Component: BinarySearchTraceTool,
    },

    {
        id: "sr-visualizer",
        label: "Search Visualizer",
        icon: FaEye,
        hint: "Step through binary search on a number line",
        wide: true,
        Component: SearchVisualizerTool,
    },

    {
        id: "sr-bounds",
        label: "Lower & Upper Bound",
        icon: FaArrowsAltV,
        hint: "Both boundary indices for a target, side by side",
        wide: true,
        Component: BoundsTool,
    },

    {
        id: "sr-occurrences",
        label: "Occurrences",
        icon: FaListOl,
        hint: "First, last, and all occurrences — O(n) scan, any order",
        wide: true,
        Component: OccurrencesTool,
    },

    {
        id: "sr-binary-search-answer",
        label: "Binary Search on Answer",
        icon: FaCrosshairs,
        hint: "Find the boundary of a monotonic predicate",
        wide: true,
        Component: BinarySearchOnAnswerTool,
    },

    {
        id: "sr-ternary-search",
        label: "Ternary Search",
        icon: FaChartLine,
        hint: "Find the min/max of a unimodal function",
        wide: true,
        Component: TernarySearchTool,
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

function SearchContent() {
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

export default SearchContent;

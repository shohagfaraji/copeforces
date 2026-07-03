import { useState, useMemo, useRef } from "react";
import {
    FaHashtag,
    FaFont,
    FaTree,
    FaProjectDiagram,
    FaTh,
    FaRandom,
    FaListUl,
    FaSlidersH,
    FaCopy,
    FaCheck,
    FaRedo,
} from "react-icons/fa";
import {
    generateRandomArray,
    generateRandomString,
    generateRandomPermutation,
    generateRandomTree,
    generateRandomGraph,
    generateRandomMatrix,
    generateRandomQueries,
    parseConstraints,
    generateFromConstraints,
} from "../../utils/testGenerator";

import { sections } from "../../data/sections";

const ACCENT =
    sections.find((s) => s.id === "test-generator")?.color || "#03A89E";

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

function NumberField({ label, value, onChange, min, max }) {
    return (
        <label
            className="block text-xs font-mono-cf"
            style={{ color: "var(--muted)" }}
        >
            {label}
            <input
                type="number"
                value={value}
                min={min}
                max={max}
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

function TextArea({ label, value, onChange, rows = 6 }) {
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

function OutputBlock({ text, onRegenerate, regenerateLabel }) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--line)" }}
        >
            <pre className="font-mono-cf text-xs whitespace-pre-wrap break-all">
                {text}
            </pre>

            <div className="mt-3 flex items-center gap-2">
                <CopyButton value={text} />
                {onRegenerate ? (
                    <RefreshButton
                        label={regenerateLabel || "Regenerate"}
                        onClick={onRegenerate}
                    />
                ) : null}
            </div>
        </div>
    );
}

// ---------- Tool: Random Integer Arrays ----------

function RandomIntArrayTool() {
    const [length, setLength] = useState(10);
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [unique, setUnique] = useState(false);
    const [sorted, setSorted] = useState(false);

    const [seed, setSeed] = useState(0);
    const lastResultRef = useRef("");

    const result = useMemo(() => {
        const options = { unique, sorted };
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
    }, [length, min, max, unique, sorted, seed]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <NumberField
                    label="Length"
                    value={length}
                    onChange={setLength}
                    min={1}
                />
                <NumberField label="Min" value={min} onChange={setMin} />
                <NumberField label="Max" value={max} onChange={setMax} />
            </div>

            <div className="flex flex-wrap gap-4">
                <CheckField
                    label="Unique values"
                    checked={unique}
                    onChange={setUnique}
                />
                <CheckField
                    label="Sorted ascending"
                    checked={sorted}
                    onChange={setSorted}
                />
            </div>

            <OutputBlock
                text={`${length}\n${result.join(" ")}`}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Random Strings ----------

function RandomStringTool() {
    const [length, setLength] = useState(10);
    const [alphabet, setAlphabet] = useState("lowercase");

    const [seed, setSeed] = useState(0);
    const lastResultRef = useRef("");

    const result = useMemo(() => {
        let generated = generateRandomString(Number(length), alphabet);

        let attempts = 0;
        while (generated === lastResultRef.current && attempts < 5) {
            generated = generateRandomString(Number(length), alphabet);
            attempts++;
        }

        lastResultRef.current = generated;
        return generated;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, alphabet, seed]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <NumberField
                    label="Length"
                    value={length}
                    onChange={setLength}
                    min={1}
                />
                <SelectField
                    label="Alphabet"
                    value={alphabet}
                    onChange={setAlphabet}
                    options={[
                        { value: "lowercase", label: "lowercase a-z" },
                        { value: "uppercase", label: "UPPERCASE A-Z" },
                        { value: "digits", label: "digits 0-9" },
                        { value: "alnum", label: "alphanumeric" },
                        { value: "binary", label: "binary 0/1" },
                    ]}
                />
            </div>

            <OutputBlock
                text={result}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Random Trees ----------

function RandomTreeTool() {
    const [n, setN] = useState(8);
    const [weighted, setWeighted] = useState(false);
    const [minWeight, setMinWeight] = useState(1);
    const [maxWeight, setMaxWeight] = useState(10);

    const [seed, setSeed] = useState(0);

    const edges = useMemo(() => {
        return generateRandomTree(Number(n), {
            weighted,
            minWeight: Number(minWeight),
            maxWeight: Number(maxWeight),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n, weighted, minWeight, maxWeight, seed]);

    const text = `${n}\n${edges
        .map((e) =>
            weighted ? `${e.from} ${e.to} ${e.weight}` : `${e.from} ${e.to}`,
        )
        .join("\n")}`;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <NumberField
                    label="Nodes (n)"
                    value={n}
                    onChange={setN}
                    min={1}
                />
                <NumberField
                    label="Min weight"
                    value={minWeight}
                    onChange={setMinWeight}
                />
                <NumberField
                    label="Max weight"
                    value={maxWeight}
                    onChange={setMaxWeight}
                />
            </div>

            <CheckField
                label="Weighted edges"
                checked={weighted}
                onChange={setWeighted}
            />

            <OutputBlock
                text={text}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Random Graphs ----------

function RandomGraphTool() {
    const [n, setN] = useState(6);
    const [m, setM] = useState(8);
    const [directed, setDirected] = useState(false);
    const [weighted, setWeighted] = useState(false);
    const [allowSelfLoops, setAllowSelfLoops] = useState(false);
    const [allowMultiEdges, setAllowMultiEdges] = useState(false);
    const [connected, setConnected] = useState(false);

    const [seed, setSeed] = useState(0);

    const edges = useMemo(() => {
        return generateRandomGraph(Number(n), Number(m), {
            directed,
            weighted,
            allowSelfLoops,
            allowMultiEdges,
            connected,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        n,
        m,
        directed,
        weighted,
        allowSelfLoops,
        allowMultiEdges,
        connected,
        seed,
    ]);

    const text = `${n} ${edges.length}\n${edges
        .map((e) =>
            weighted ? `${e.from} ${e.to} ${e.weight}` : `${e.from} ${e.to}`,
        )
        .join("\n")}`;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <NumberField
                    label="Nodes (n)"
                    value={n}
                    onChange={setN}
                    min={1}
                />
                <NumberField
                    label="Edges (m)"
                    value={m}
                    onChange={setM}
                    min={0}
                />
            </div>

            <div className="flex flex-wrap gap-4">
                <CheckField
                    label="Directed"
                    checked={directed}
                    onChange={setDirected}
                />
                <CheckField
                    label="Weighted"
                    checked={weighted}
                    onChange={setWeighted}
                />
                <CheckField
                    label="Connected"
                    checked={connected}
                    onChange={setConnected}
                />
                <CheckField
                    label="Allow self-loops"
                    checked={allowSelfLoops}
                    onChange={setAllowSelfLoops}
                />
                <CheckField
                    label="Allow multi-edges"
                    checked={allowMultiEdges}
                    onChange={setAllowMultiEdges}
                />
            </div>

            <OutputBlock
                text={text}
                onRegenerate={() => setSeed((s) => s + 1)}
            />

            {edges.length < m ? (
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                    Only {edges.length} of {m} edges could be generated under
                    the current constraints (self-loop / multi-edge limits).
                    Increase n, or allow multi-edges, for more.
                </div>
            ) : null}
        </div>
    );
}

// ---------- Tool: Random Matrices ----------

function RandomMatrixTool() {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(9);
    const [symmetric, setSymmetric] = useState(false);

    const [seed, setSeed] = useState(0);

    const matrix = useMemo(() => {
        return generateRandomMatrix(
            Number(rows),
            Number(cols),
            Number(min),
            Number(max),
            {
                symmetric,
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, cols, min, max, symmetric, seed]);

    const text = `${rows} ${cols}\n${matrix.map((row) => row.join(" ")).join("\n")}`;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
                <NumberField
                    label="Rows"
                    value={rows}
                    onChange={setRows}
                    min={1}
                />
                <NumberField
                    label="Cols"
                    value={cols}
                    onChange={setCols}
                    min={1}
                />
                <NumberField label="Min" value={min} onChange={setMin} />
                <NumberField label="Max" value={max} onChange={setMax} />
            </div>

            <CheckField
                label="Symmetric (square matrices only)"
                checked={symmetric}
                onChange={setSymmetric}
            />

            <OutputBlock
                text={text}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Random Permutations ----------

function RandomPermutationTool() {
    const [n, setN] = useState(8);

    const [seed, setSeed] = useState(0);
    const lastResultRef = useRef("");

    const result = useMemo(() => {
        let generated = generateRandomPermutation(Number(n));

        let attempts = 0;
        while (
            n > 1 &&
            generated.join(",") === lastResultRef.current &&
            attempts < 5
        ) {
            generated = generateRandomPermutation(Number(n));
            attempts++;
        }

        lastResultRef.current = generated.join(",");
        return generated;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n, seed]);

    return (
        <div className="space-y-4">
            <NumberField label="Size (n)" value={n} onChange={setN} min={1} />

            <OutputBlock
                text={`${n}\n${result.join(" ")}`}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Random Queries ----------

function RandomQueriesTool() {
    const [count, setCount] = useState(5);
    const [n, setN] = useState(20);
    const [type, setType] = useState("range");
    const [valueMin, setValueMin] = useState(1);
    const [valueMax, setValueMax] = useState(100);

    const [seed, setSeed] = useState(0);

    const queries = useMemo(() => {
        return generateRandomQueries(Number(count), Number(n), {
            type,
            valueMin: Number(valueMin),
            valueMax: Number(valueMax),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, n, type, valueMin, valueMax, seed]);

    const text = `${count}\n${queries
        .map((q) => {
            if (type === "point") return `${q.index} ${q.value}`;
            if (type === "update") return `${q.l} ${q.r} ${q.value}`;
            return `${q.l} ${q.r}`;
        })
        .join("\n")}`;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <NumberField
                    label="Query count"
                    value={count}
                    onChange={setCount}
                    min={1}
                />
                <NumberField
                    label="Array size (n)"
                    value={n}
                    onChange={setN}
                    min={1}
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <SelectField
                    label="Query type"
                    value={type}
                    onChange={setType}
                    options={[
                        { value: "range", label: "Range [l, r]" },
                        { value: "point", label: "Point (index, value)" },
                        { value: "update", label: "Range update [l, r, val]" },
                    ]}
                />
                <NumberField
                    label="Value min"
                    value={valueMin}
                    onChange={setValueMin}
                />
                <NumberField
                    label="Value max"
                    value={valueMax}
                    onChange={setValueMax}
                />
            </div>

            <OutputBlock
                text={text}
                onRegenerate={() => setSeed((s) => s + 1)}
            />
        </div>
    );
}

// ---------- Tool: Custom Constraints ----------

function CustomConstraintsTool() {
    const [spec, setSpec] = useState("n 1 100000\nm 1 100000\nq 1 200000");

    const [seed, setSeed] = useState(0);

    const constraints = useMemo(() => parseConstraints(spec), [spec]);

    const values = useMemo(() => {
        return generateFromConstraints(constraints);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [constraints, seed]);

    const text = values.map((v) => v.value).join(" ");
    const labeled = values.map((v) => `${v.name}=${v.value}`).join("\n");

    return (
        <div className="space-y-4">
            <TextArea
                label="Constraints — one per line: name min max"
                value={spec}
                onChange={setSpec}
                rows={5}
            />

            {constraints.length === 0 ? (
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                    Add at least one line like{" "}
                    <span className="font-mono-cf">n 1 100000</span> to generate
                    values.
                </div>
            ) : (
                <>
                    <div
                        className="rounded-lg border p-4"
                        style={{ borderColor: "var(--line)" }}
                    >
                        <div
                            className="text-[11px] mb-2"
                            style={{ color: "var(--muted)" }}
                        >
                            Labeled
                        </div>
                        <pre className="font-mono-cf text-xs whitespace-pre-wrap">
                            {labeled}
                        </pre>
                    </div>

                    <OutputBlock
                        text={text}
                        onRegenerate={() => setSeed((s) => s + 1)}
                    />
                </>
            )}
        </div>
    );
}

const TOOLS = [
    {
        id: "gen-int-array",
        label: "Random Integer Arrays",
        icon: FaHashtag,
        hint: "Generate arrays with length/range/uniqueness options",
        Component: RandomIntArrayTool,
    },

    {
        id: "gen-string",
        label: "Random Strings",
        icon: FaFont,
        hint: "Generate strings from a chosen alphabet",
        Component: RandomStringTool,
    },

    {
        id: "gen-tree",
        label: "Random Trees",
        icon: FaTree,
        hint: "Generate a random labeled tree as an edge list",
        Component: RandomTreeTool,
    },

    {
        id: "gen-graph",
        label: "Random Graphs",
        icon: FaProjectDiagram,
        hint: "Generate directed/undirected graphs with constraints",
        wide: true,
        Component: RandomGraphTool,
    },

    {
        id: "gen-matrix",
        label: "Random Matrices",
        icon: FaTh,
        hint: "Generate a matrix with a value range",
        Component: RandomMatrixTool,
    },

    {
        id: "gen-permutation",
        label: "Random Permutations",
        icon: FaRandom,
        hint: "Generate a random permutation of 1..n",
        Component: RandomPermutationTool,
    },

    {
        id: "gen-queries",
        label: "Random Queries",
        icon: FaListUl,
        hint: "Generate range, point, or update queries",
        wide: true,
        Component: RandomQueriesTool,
    },

    {
        id: "gen-constraints",
        label: "Custom Constraints",
        icon: FaSlidersH,
        hint: "Define named variables with min/max to generate together",
        wide: true,
        Component: CustomConstraintsTool,
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

function TestGeneratorContent() {
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

export default TestGeneratorContent;

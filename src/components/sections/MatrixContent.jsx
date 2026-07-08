import { useState, useMemo } from "react";
import {
    FaSyncAlt,
    FaExchangeAlt,
    FaTable,
    FaTimes,
    FaSuperscript,
    FaFillDrip,
    FaRoute,
    FaSitemap,
    FaThLarge,
    FaCopy,
    FaCheck,
} from "react-icons/fa";
import {
    parseMatrix,
    parseIntegerMatrix,
    isNumericMatrix,
    isRectangular,
    parseGrid,
    transposeMatrix,
    rotateMatrix,
    prefixSumMatrix,
    rangeSum,
    multiplyMatricesBig,
    matrixPowerBig,
    floodFill,
    gridBFS,
    gridDFS,
    spiralOrder,
} from "../../utils/matrixTools";

import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "matrix")?.color || "#AA00AA";

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
            /* clipboard unavailable */
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

function MatrixOutput({ matrix, sep = " " }) {
    const text = matrix.map((row) => row.join(sep)).join("\n");

    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--line)" }}
        >
            <pre className="font-mono-cf text-xs whitespace-pre-wrap break-all">
                {text}
            </pre>

            <div className="mt-3">
                <CopyButton value={text} />
            </div>
        </div>
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

function matrixError(matrix, emptyMessage) {
    if (matrix.length === 0) return emptyMessage;
    if (!isRectangular(matrix)) return "Matrix rows must have equal length.";
    if (!isNumericMatrix(matrix)) {
        return "Matrix cells must be valid numbers.";
    }
    return null;
}

// ---------- Tool: Rotation ----------

function RotationTool() {
    const [input, setInput] = useState("1 2 3\n4 5 6\n7 8 9");
    const [direction, setDirection] = useState("cw");
    const [times, setTimes] = useState(1);

    const matrix = parseMatrix(input);
    const error = matrixError(matrix, "Enter a matrix to rotate.");
    const rotated = useMemo(
        () => (error ? [] : rotateMatrix(matrix, Number(times), direction)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [input, direction, times, error],
    );

    return (
        <div className="space-y-4">
            <TextArea
                label="Matrix"
                value={input}
                onChange={setInput}
                rows={6}
            />

            <div className="grid grid-cols-2 gap-3">
                <SelectField
                    label="Direction"
                    value={direction}
                    onChange={setDirection}
                    options={[
                        { value: "cw", label: "Clockwise" },
                        { value: "ccw", label: "Counter-clockwise" },
                    ]}
                />
                <NumberField
                    label="Times (90° turns)"
                    value={times}
                    onChange={setTimes}
                    min={0}
                />
            </div>

            {error ? (
                <ErrorBlock message={error} />
            ) : (
                <MatrixOutput matrix={rotated} />
            )}
        </div>
    );
}

// ---------- Tool: Transpose ----------

function TransposeTool() {
    const [input, setInput] = useState("1 2 3\n4 5 6");

    const matrix = parseMatrix(input);
    const error = matrixError(matrix, "Enter a matrix to transpose.");
    const transposed = error ? [] : transposeMatrix(matrix);

    return (
        <div className="space-y-4">
            <TextArea
                label="Matrix"
                value={input}
                onChange={setInput}
                rows={6}
            />

            {error ? (
                <ErrorBlock message={error} />
            ) : (
                <MatrixOutput matrix={transposed} />
            )}
        </div>
    );
}

// ---------- Tool: Prefix Matrix ----------

function PrefixMatrixTool() {
    const [input, setInput] = useState("1 2 3\n4 5 6\n7 8 9");
    const [r1, setR1] = useState(0);
    const [c1, setC1] = useState(0);
    const [r2, setR2] = useState(1);
    const [c2, setC2] = useState(1);

    const matrix = parseMatrix(input);
    const error = matrixError(
        matrix,
        "Enter a matrix to build a prefix sum table.",
    );
    const prefix = error ? null : prefixSumMatrix(matrix);

    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    const inBounds =
        prefix &&
        r1 >= 0 &&
        c1 >= 0 &&
        r2 < rows &&
        c2 < cols &&
        r1 <= r2 &&
        c1 <= c2;

    const sum = inBounds
        ? rangeSum(prefix, Number(r1), Number(c1), Number(r2), Number(c2))
        : null;

    return (
        <div className="space-y-4">
            <TextArea
                label="Matrix"
                value={input}
                onChange={setInput}
                rows={6}
            />

            <div className="grid grid-cols-4 gap-3">
                <NumberField label="r1" value={r1} onChange={setR1} min={0} />
                <NumberField label="c1" value={c1} onChange={setC1} min={0} />
                <NumberField label="r2" value={r2} onChange={setR2} min={0} />
                <NumberField label="c2" value={c2} onChange={setC2} min={0} />
            </div>

            {error ? (
                <ErrorBlock message={error} />
            ) : (
                <>
                    <MatrixOutput matrix={prefix} />

                    <div
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: inBounds ? OK_COLOR : ERROR_COLOR,
                        }}
                    >
                        {inBounds ? (
                            <span style={{ color: OK_COLOR }}>
                                Sum of rectangle (r1..r2, c1..c2) ={" "}
                                <strong>{sum}</strong>
                            </span>
                        ) : (
                            <span style={{ color: ERROR_COLOR }}>
                                Rectangle is out of bounds for this matrix (
                                {rows}×{cols}).
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Tool: Matrix Multiplication ----------

function MatrixMultiplicationTool() {
    const [a, setA] = useState("1 2\n3 4");
    const [b, setB] = useState("5 6\n7 8");
    const [useMod, setUseMod] = useState(false);
    const [mod, setMod] = useState(1000000007);

    const parsedA = parseIntegerMatrix(a);
    const parsedB = parseIntegerMatrix(b);

    const result = useMemo(() => {
        if (parsedA.error) return { error: `Matrix A: ${parsedA.error}` };
        if (parsedB.error) return { error: `Matrix B: ${parsedB.error}` };
        if (parsedA.matrix.length === 0 || parsedB.matrix.length === 0) {
            return null;
        }
        return multiplyMatricesBig(
            parsedA.matrix,
            parsedB.matrix,
            useMod ? String(mod).trim() : null,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [a, b, useMod, mod]);

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
                <TextArea label="Matrix A" value={a} onChange={setA} rows={6} />
                <TextArea label="Matrix B" value={b} onChange={setB} rows={6} />
            </div>

            <div className="space-y-3">
                <CheckField
                    label="Apply modulus"
                    checked={useMod}
                    onChange={setUseMod}
                />
                {useMod ? (
                    <NumberField
                        label="Mod"
                        value={mod}
                        onChange={setMod}
                        min={1}
                    />
                ) : null}
            </div>

            {!result ? (
                <ErrorBlock message="Enter both matrices to multiply." />
            ) : result.error ? (
                <ErrorBlock message={result.error} />
            ) : (
                <MatrixOutput matrix={result.matrix} />
            )}
        </div>
    );
}

// ---------- Tool: Matrix Exponentiation ----------

function MatrixExponentiationTool() {
    const [input, setInput] = useState("1 1\n1 0");
    const [power, setPower] = useState(10);
    const [useMod, setUseMod] = useState(true);
    const [mod, setMod] = useState(1000000007);

    const parsedMatrix = parseIntegerMatrix(input);

    const result = useMemo(() => {
        if (parsedMatrix.error) return { error: parsedMatrix.error };
        if (parsedMatrix.matrix.length === 0) return null;
        return matrixPowerBig(
            parsedMatrix.matrix,
            String(power).trim(),
            useMod ? String(mod).trim() : null,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, power, useMod, mod]);

    return (
        <div className="space-y-4">
            <TextArea
                label="Square matrix"
                value={input}
                onChange={setInput}
                rows={5}
            />

            <CheckField
                label="Apply modulus"
                checked={useMod}
                onChange={setUseMod}
            />

            <div
                className={
                    useMod
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                        : "grid grid-cols-1 gap-3"
                }
            >
                <NumberField
                    label="Power"
                    value={power}
                    onChange={setPower}
                    min={0}
                />
                {useMod ? (
                    <NumberField
                        label="Mod"
                        value={mod}
                        onChange={setMod}
                        min={1}
                    />
                ) : null}
            </div>

            {!result ? (
                <ErrorBlock message="Enter a square matrix to exponentiate." />
            ) : result.error ? (
                <ErrorBlock message={result.error} />
            ) : (
                <MatrixOutput matrix={result.matrix} />
            )}

            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                Uses exact big-integer arithmetic internally (fast
                exponentiation by squaring), so results stay correct even past
                2^53 — handy for things like Fibonacci via matrix power.
            </div>
        </div>
    );
}

// ---------- Tool: Flood Fill ----------

function FloodFillTool() {
    const [input, setInput] = useState("..#..\n..#..\n.....\n.#.#.\n.....");
    const [sr, setSr] = useState(0);
    const [sc, setSc] = useState(0);
    const [newChar, setNewChar] = useState("X");

    const grid = parseGrid(input);

    const result = useMemo(() => {
        if (grid.length === 0) return null;
        return floodFill(grid, Number(sr), Number(sc), newChar || "X");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, sr, sc, newChar]);

    return (
        <div className="space-y-4">
            <TextArea
                label="Grid (any characters, e.g. . and #)"
                value={input}
                onChange={setInput}
                rows={6}
            />

            <div className="grid grid-cols-3 gap-3 items-end">
                <NumberField
                    label="Start row"
                    value={sr}
                    onChange={setSr}
                    min={0}
                />
                <NumberField
                    label="Start col"
                    value={sc}
                    onChange={setSc}
                    min={0}
                />
                <label
                    className="block text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    Fill with
                    <input
                        type="text"
                        maxLength={1}
                        value={newChar}
                        onChange={(e) => setNewChar(e.target.value)}
                        className="mt-1 w-full rounded-lg border p-2 font-mono-cf text-xs outline-none"
                        style={{
                            borderColor: "var(--line)",
                            background: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>

            {!result ? (
                <ErrorBlock message="Enter a grid to flood fill." />
            ) : result.error ? (
                <ErrorBlock message={result.error} />
            ) : (
                <MatrixOutput matrix={result.grid} sep="" />
            )}

            {result && !result.error ? (
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {result.filledCount} cell(s) filled.
                </div>
            ) : null}
        </div>
    );
}

// ---------- Tool: Grid BFS ----------

function GridBFSTool() {
    const [input, setInput] = useState("..#..\n..#..\n.....\n.#.#.\n.....");
    const [sr, setSr] = useState(0);
    const [sc, setSc] = useState(0);
    const [wallChar, setWallChar] = useState("#");

    const grid = parseGrid(input);

    const result = useMemo(() => {
        if (grid.length === 0) return null;
        return gridBFS(grid, Number(sr), Number(sc), wallChar || "#");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, sr, sc, wallChar]);

    return (
        <div className="space-y-4">
            <TextArea label="Grid" value={input} onChange={setInput} rows={6} />

            <div className="grid grid-cols-3 gap-3 items-end">
                <NumberField
                    label="Start row"
                    value={sr}
                    onChange={setSr}
                    min={0}
                />
                <NumberField
                    label="Start col"
                    value={sc}
                    onChange={setSc}
                    min={0}
                />
                <label
                    className="block text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    Wall char
                    <input
                        type="text"
                        maxLength={1}
                        value={wallChar}
                        onChange={(e) => setWallChar(e.target.value)}
                        className="mt-1 w-full rounded-lg border p-2 font-mono-cf text-xs outline-none"
                        style={{
                            borderColor: "var(--line)",
                            background: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>

            {!result ? (
                <ErrorBlock message="Enter a grid to run BFS." />
            ) : result.error ? (
                <ErrorBlock message={result.error} />
            ) : (
                <>
                    <MatrixOutput matrix={result.dist} />
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {result.reachable} cell(s) reachable from the start. -1
                        means unreachable (or a wall).
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Tool: Grid DFS ----------

function GridDFSTool() {
    const [input, setInput] = useState("..#..\n..#..\n.....\n.#.#.\n.....");
    const [sr, setSr] = useState(0);
    const [sc, setSc] = useState(0);
    const [wallChar, setWallChar] = useState("#");

    const grid = parseGrid(input);

    const result = useMemo(() => {
        if (grid.length === 0) return null;
        return gridDFS(grid, Number(sr), Number(sc), wallChar || "#");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, sr, sc, wallChar]);

    return (
        <div className="space-y-4">
            <TextArea label="Grid" value={input} onChange={setInput} rows={6} />

            <div className="grid grid-cols-3 gap-3 items-end">
                <NumberField
                    label="Start row"
                    value={sr}
                    onChange={setSr}
                    min={0}
                />
                <NumberField
                    label="Start col"
                    value={sc}
                    onChange={setSc}
                    min={0}
                />
                <label
                    className="block text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    Wall char
                    <input
                        type="text"
                        maxLength={1}
                        value={wallChar}
                        onChange={(e) => setWallChar(e.target.value)}
                        className="mt-1 w-full rounded-lg border p-2 font-mono-cf text-xs outline-none"
                        style={{
                            borderColor: "var(--line)",
                            background: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                </label>
            </div>

            {!result ? (
                <ErrorBlock message="Enter a grid to run DFS." />
            ) : result.error ? (
                <ErrorBlock message={result.error} />
            ) : (
                <>
                    <MatrixOutput matrix={result.order} />
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {result.visited} cell(s) visited. Numbers show visit
                        order (1 = start); -1 means unreached (or a wall).
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Tool: Spiral Traversal ----------

function SpiralTraversalTool() {
    const [input, setInput] = useState("10 11 12 13\n14 15 16 17\n18 19 20 21");

    const matrix = parseMatrix(input);
    const error = matrixError(
        matrix,
        "Enter a matrix to walk in spiral order.",
    );
    const spiral = error ? [] : spiralOrder(matrix);

    return (
        <div className="space-y-4">
            <TextArea
                label="Matrix"
                value={input}
                onChange={setInput}
                rows={6}
            />

            {error ? (
                <ErrorBlock message={error} />
            ) : (
                <div
                    className="rounded-lg border p-4"
                    style={{ borderColor: "var(--line)" }}
                >
                    <pre className="font-mono-cf text-xs whitespace-pre-wrap break-all">
                        {spiral.join(" ")}
                    </pre>

                    <div className="mt-3">
                        <CopyButton value={spiral.join(" ")} />
                    </div>
                </div>
            )}
        </div>
    );
}

const TOOLS = [
    {
        id: "mx-rotation",
        label: "Rotation",
        icon: FaSyncAlt,
        hint: "Rotate a matrix 90° clockwise or counter-clockwise",
        Component: RotationTool,
    },

    {
        id: "mx-transpose",
        label: "Transpose",
        icon: FaExchangeAlt,
        hint: "Flip a matrix across its main diagonal",
        Component: TransposeTool,
    },

    {
        id: "mx-prefix",
        label: "Prefix Matrix",
        icon: FaTable,
        hint: "2D prefix sums with rectangle range queries",
        Component: PrefixMatrixTool,
    },

    {
        id: "mx-multiply",
        label: "Matrix Multiplication",
        icon: FaTimes,
        hint: "Multiply two matrices, with optional modulus",
        Component: MatrixMultiplicationTool,
    },

    {
        id: "mx-exponentiation",
        label: "Matrix Exponentiation",
        icon: FaSuperscript,
        hint: "Fast matrix power via repeated squaring",
        Component: MatrixExponentiationTool,
    },

    {
        id: "mx-flood-fill",
        label: "Flood Fill",
        icon: FaFillDrip,
        hint: "4-directional flood fill from a start cell",
        Component: FloodFillTool,
    },

    {
        id: "mx-grid-bfs",
        label: "Grid BFS",
        icon: FaRoute,
        hint: "Shortest-path distances from a start cell",
        Component: GridBFSTool,
    },

    {
        id: "mx-grid-dfs",
        label: "Grid DFS",
        icon: FaSitemap,
        hint: "Depth-first visit order from a start cell",
        Component: GridDFSTool,
    },

    {
        id: "mx-spiral",
        label: "Spiral Traversal",
        icon: FaThLarge,
        hint: "Walk a matrix in clockwise spiral order",
        Component: SpiralTraversalTool,
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

function MatrixContent() {
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

export default MatrixContent;

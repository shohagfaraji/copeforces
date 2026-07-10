import { useMemo, useState } from "react";
import {
    FaCheckCircle,
    FaProjectDiagram,
    FaBalanceScale,
    FaSyncAlt,
} from "react-icons/fa";
import {
    analyzeDegrees,
    buildAdjacency,
    checkBipartite,
    hasCycleDirected,
    hasCycleUndirected,
    parseEdgeList,
} from "../../utils/graphTools";
import GraphCanvas from "../GraphCanvas";
import AlgorithmRunner from "../AlgorithmRunner";
import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "graphs")?.color || "#0000FF";
const ERROR_COLOR = "#c0392b";
const OK_COLOR = "#008000";

function ToolBlock({
    id,
    label,
    icon: Icon,
    badge = "",
    className = "",
    children,
}) {
    return (
        <div
            id={id}
            className={`cf-tool-card rounded-xl border p-4 h-full ${className}`}
            style={{ borderColor: "var(--line)" }}
        >
            <div
                className="flex items-center gap-2 mb-3 pb-2 border-b"
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

                <div className="min-w-0 flex flex-wrap items-center gap-2">
                    <h3
                        className="font-mono-cf text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                    >
                        {label}
                    </h3>
                    {badge && (
                        <span
                            className="rounded-full border px-1 py-px text-[8px] font-semibold uppercase tracking-wide"
                            style={{
                                color: "var(--sec-accent)",
                                borderColor: "var(--sec-accent-soft)",
                                backgroundColor: "var(--sec-accent-bg)",
                            }}
                        >
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function QuickNav({ items }) {
    return (
        <nav
            aria-label="Jump to a graph tool"
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

function ResultBanner({ ok, label, detail }) {
    return (
        <div
            className="rounded-lg border px-3 py-2.5"
            style={{
                borderColor: ok ? OK_COLOR : ERROR_COLOR,
                backgroundColor: ok
                    ? "rgba(0, 128, 0, 0.07)"
                    : "rgba(192, 57, 43, 0.07)",
            }}
        >
            <div
                className="font-mono-cf text-sm font-bold"
                style={{ color: ok ? OK_COLOR : ERROR_COLOR }}
            >
                {label}
            </div>
            {detail && (
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {detail}
                </p>
            )}
        </div>
    );
}

function NodeChips({ nodes, emptyText = "none" }) {
    if (!nodes.length) {
        return <span style={{ color: "var(--muted)" }}>{emptyText}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {nodes.map((node) => (
                <span
                    key={node}
                    className="rounded-md border px-2 py-1 font-mono-cf text-xs"
                    style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                >
                    {node}
                </span>
            ))}
        </div>
    );
}

function InfoRow({ label, children }) {
    return (
        <div className="space-y-1.5">
            <div
                className="text-[11px] font-mono-cf uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
            >
                {label}
            </div>
            {children}
        </div>
    );
}

function CycleDetectionTool({ nodes, directed, hasCycle }) {
    if (nodes.length === 0) {
        return (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                Paste an edge list first.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <ResultBanner
                ok={!hasCycle}
                label={hasCycle ? "Cycle detected" : "No cycle detected"}
                detail={`Checked as a ${directed ? "directed" : "undirected"} graph.`}
            />
            <InfoRow label="Nodes checked">
                <NodeChips nodes={nodes} />
            </InfoRow>
        </div>
    );
}

function BipartiteTool({ nodes, result }) {
    if (nodes.length === 0) {
        return (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                Paste an edge list first.
            </p>
        );
    }

    const left = nodes.filter((node) => result.color[node] === 0);
    const right = nodes.filter((node) => result.color[node] === 1);

    return (
        <div className="space-y-3">
            <ResultBanner
                ok={result.isBipartite}
                label={result.isBipartite ? "Bipartite" : "Not bipartite"}
                detail={
                    result.isBipartite
                        ? "Checked on the undirected version of the graph."
                        : `Conflict edge: ${result.conflict?.u} - ${result.conflict?.v}`
                }
            />
            {result.isBipartite && (
                <div className="grid sm:grid-cols-2 gap-3">
                    <InfoRow label="Group A">
                        <NodeChips nodes={left} />
                    </InfoRow>
                    <InfoRow label="Group B">
                        <NodeChips nodes={right} />
                    </InfoRow>
                </div>
            )}
        </div>
    );
}

function StatTile({ label, value, hint, tone = "neutral" }) {
    const toneStyle =
        tone === "ok"
            ? { borderColor: OK_COLOR, color: OK_COLOR }
            : tone === "warn"
              ? { borderColor: ERROR_COLOR, color: ERROR_COLOR }
              : { borderColor: "var(--line)", color: "var(--ink)" };

    return (
        <div
            className="rounded-lg border px-3 py-2.5"
            style={{
                borderColor: toneStyle.borderColor,
                backgroundColor: "var(--panel)",
            }}
        >
            <div
                className="text-[11px] font-mono-cf uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
            >
                {label}
            </div>
            <div
                className="mt-1 font-mono-cf text-lg font-bold leading-none"
                style={{ color: toneStyle.color }}
            >
                {value}
            </div>
            {hint && (
                <div
                    className="mt-1 text-[11px]"
                    style={{ color: "var(--muted)" }}
                >
                    {hint}
                </div>
            )}
        </div>
    );
}

function DegreeBar({ value, max }) {
    const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 0;

    return (
        <div className="flex items-center gap-2 min-w-[8rem]">
            <span className="w-8 font-bold">{value}</span>
            <div
                className="h-2 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--panel-soft)" }}
            >
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${width}%`,
                        backgroundColor: "var(--sec-accent)",
                    }}
                />
            </div>
        </div>
    );
}

function DegreeAnalysisTool({ nodes, directed, analysis }) {
    if (nodes.length === 0) {
        return (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                Paste an edge list first.
            </p>
        );
    }

    const valueForRow = (row) =>
        directed ? row.inDegree + row.outDegree : row.degree;
    const maxDegree = Math.max(0, ...analysis.rows.map(valueForRow));
    const leaders = analysis.rows
        .filter((row) => valueForRow(row) === maxDegree && maxDegree > 0)
        .map((row) => row.node);
    const isolated = analysis.rows
        .filter((row) => valueForRow(row) === 0)
        .map((row) => row.node);
    const lawValue = directed
        ? `${analysis.totalInDegree} / ${analysis.totalOutDegree}`
        : `${analysis.totalDegree} / ${analysis.edgeCount * 2}`;

    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile
                    label="Mode"
                    value={directed ? "Directed" : "Undirected"}
                    hint={
                        directed ? "in/out degree tracked" : "self-loop adds 2"
                    }
                />
                <StatTile
                    label="Edges"
                    value={analysis.edgeCount}
                    hint={`${analysis.selfLoops} self-loop${analysis.selfLoops === 1 ? "" : "s"}`}
                />
                <StatTile
                    label={directed ? "In / out sum" : "Degree / 2|E|"}
                    value={lawValue}
                    hint={analysis.lawLabel}
                    tone={analysis.lawHolds ? "ok" : "warn"}
                />
                <StatTile
                    label="Max total"
                    value={maxDegree}
                    hint={leaders.length ? leaders.join(", ") : "no edges"}
                />
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-3">
                    <ResultBanner
                        ok={analysis.lawHolds}
                        label={
                            analysis.lawHolds
                                ? "Degree law holds"
                                : "Degree law failed"
                        }
                        detail="Parallel edges are counted individually. Self-loops follow standard degree rules."
                    />
                    <InfoRow label="Isolated nodes">
                        <NodeChips nodes={isolated} />
                    </InfoRow>
                </div>

                <div
                    className="overflow-hidden rounded-lg border"
                    style={{
                        borderColor: "var(--line)",
                        backgroundColor: "var(--panel)",
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="cf-readable-table min-w-full text-left font-mono-cf text-xs">
                            <thead
                                style={{
                                    color: "var(--muted)",
                                    backgroundColor: "var(--panel-soft)",
                                }}
                            >
                                <tr>
                                    <th className="px-3 py-2">node</th>
                                    {directed ? (
                                        <>
                                            <th className="px-3 py-2 text-right">
                                                in
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                out
                                            </th>
                                            <th className="px-3 py-2">total</th>
                                        </>
                                    ) : (
                                        <th className="px-3 py-2">degree</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.rows.map((row) => {
                                    const total = valueForRow(row);
                                    return (
                                        <tr
                                            key={row.node}
                                            className="border-t"
                                            style={{
                                                borderColor: "var(--line)",
                                            }}
                                        >
                                            <td className="px-3 py-2 font-bold">
                                                {row.node}
                                            </td>
                                            {directed ? (
                                                <>
                                                    <td className="px-3 py-2 text-right">
                                                        {row.inDegree}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {row.outDegree}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <DegreeBar
                                                            value={total}
                                                            max={maxDegree}
                                                        />
                                                    </td>
                                                </>
                                            ) : (
                                                <td className="px-3 py-2">
                                                    <DegreeBar
                                                        value={total}
                                                        max={maxDegree}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TOOLS = [
    {
        id: "gr-graph-builder",
        label: "Graph builder",
        icon: FaProjectDiagram,
    },
    {
        id: "gr-cycle-detection",
        label: "Cycle detection",
        icon: FaSyncAlt,
    },
    {
        id: "gr-bipartite-check",
        label: "Bipartite check",
        icon: FaCheckCircle,
    },
    {
        id: "gr-degree-analysis",
        label: "Degree analysis",
        icon: FaBalanceScale,
    },
];

function GraphsContent() {
    const [edgeText, setEdgeText] = useState(
        "1 2\n1 3\n2 4\n2 5\n3 6\n3 7\n2 3\n4 8\n4 9\n9 10",
    );
    const [directed, setDirected] = useState(false);
    const [nodeStates, setNodeStates] = useState({});

    const { nodes, edges } = parseEdgeList(edgeText);
    const adj = useMemo(
        () => buildAdjacency(nodes, edges, directed),
        [nodes, edges, directed],
    );
    const undirectedAdj = useMemo(
        () => buildAdjacency(nodes, edges, false),
        [nodes, edges],
    );
    const hasCycle = directed
        ? hasCycleDirected(nodes, adj)
        : hasCycleUndirected(nodes, adj);
    const bipartite = checkBipartite(nodes, undirectedAdj);
    const degreeAnalysis = analyzeDegrees(nodes, edges, directed);

    return (
        <div
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav items={TOOLS} />
            <div className="cf-tool-grid">
                <ToolBlock
                    id="gr-graph-builder"
                    icon={FaProjectDiagram}
                    label="Graph builder and traversal"
                    className="cf-tool-wide"
                >
                    <div className="cf-builder-layout">
                        <textarea
                            value={edgeText}
                            onChange={(e) => {
                                setEdgeText(e.target.value);
                                setNodeStates({});
                            }}
                            placeholder={"u v\nu v w"}
                            rows={10}
                            className="cf-builder-textarea p-2 rounded-md border font-mono-cf text-xs resize-none outline-none focus:ring-1"
                            style={{
                                borderColor: "var(--line)",
                                backgroundColor: "var(--bg)",
                                color: "var(--ink)",
                            }}
                        />

                        <div className="cf-builder-controls">
                            <label
                                className="flex items-center gap-2 mb-3 text-xs font-mono-cf"
                                style={{ color: "var(--muted)" }}
                            >
                                <input
                                    type="checkbox"
                                    checked={directed}
                                    onChange={(e) =>
                                        setDirected(e.target.checked)
                                    }
                                />
                                Directed
                            </label>

                            {nodes.length > 0 && (
                                <p
                                    className="text-xs font-mono-cf mb-3"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {nodes.length} node(s), {edges.length}{" "}
                                    edge(s)
                                </p>
                            )}

                            {nodes.length > 0 && (
                                <AlgorithmRunner
                                    nodes={nodes}
                                    adj={adj}
                                    onStateChange={setNodeStates}
                                />
                            )}
                        </div>

                        <div className="cf-builder-canvas">
                            <GraphCanvas
                                nodes={nodes}
                                edges={edges}
                                directed={directed}
                                nodeStates={nodeStates}
                            />
                        </div>
                    </div>
                </ToolBlock>

                <ToolBlock
                    id="gr-cycle-detection"
                    icon={FaSyncAlt}
                    label="Cycle detection"
                    badge="New"
                >
                    <CycleDetectionTool
                        nodes={nodes}
                        directed={directed}
                        hasCycle={hasCycle}
                    />
                </ToolBlock>

                <ToolBlock
                    id="gr-bipartite-check"
                    icon={FaCheckCircle}
                    label="Bipartite check"
                    badge="New"
                >
                    <BipartiteTool nodes={nodes} result={bipartite} />
                </ToolBlock>

                <ToolBlock
                    id="gr-degree-analysis"
                    icon={FaBalanceScale}
                    label="Degree analysis"
                    badge="New"
                    className="cf-tool-wide"
                >
                    <DegreeAnalysisTool
                        nodes={nodes}
                        directed={directed}
                        analysis={degreeAnalysis}
                    />
                </ToolBlock>
            </div>
        </div>
    );
}

export default GraphsContent;

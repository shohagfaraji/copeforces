import { useState } from "react";
import {
    FaTree,
    FaTable,
    FaProjectDiagram,
    FaRoute,
} from "react-icons/fa";
import {
    parseTreeInput,
    buildTreeAdjacency,
    pickRoot,
    buildTreeStructure,
    subtreeSizes,
    subtreeHeights,
    findLCA,
    pathToRoot,
    treeDiameter,
} from "../../utils/treeTools";
import GraphCanvas from "../GraphCanvas";
import AlgorithmRunner from "../AlgorithmRunner";
import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "trees")?.color || "#03A89E";

function ToolBlock({
    id,
    label,
    hint,
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

                <div className="min-w-0">
                    <h3 className="font-mono-cf text-xs font-bold uppercase tracking-wider">
                        {label}
                    </h3>
                    {hint ? (
                        <p
                            className="text-[11px]"
                            style={{ color: "var(--muted)" }}
                        >
                            {hint}
                        </p>
                    ) : null}
                </div>
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
        id: "tr-tree-input",
        label: "Tree workspace",
        icon: FaTree,
    },
    {
        id: "tr-node-stats",
        label: "Node stats",
        icon: FaTable,
    },
    {
        id: "tr-lca",
        label: "Lowest common ancestor",
        icon: FaProjectDiagram,
    },
    {
        id: "tr-diameter",
        label: "Tree diameter",
        icon: FaRoute,
    },
];

function StatTable({ nodes, depth, sizes, heights }) {
    return (
        <div
            className="tr-table-shell overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--line)" }}
        >
            <table className="cf-readable-table tr-stat-table font-mono-cf w-full">
                <thead className="tr-table-head">
                    <tr>
                        <th className="text-left px-3 py-2">Node</th>
                        <th className="text-left px-3 py-2">Depth</th>
                        <th className="text-left px-3 py-2">Subtree size</th>
                        <th className="text-left px-3 py-2">Height</th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map((n) => (
                        <tr
                            key={n}
                            className="tr-table-row"
                            style={{ borderTop: "1px solid var(--line)" }}
                        >
                            <td
                                className="px-3 py-2 font-bold"
                                style={{ color: "var(--sec-accent)" }}
                            >
                                {n}
                            </td>
                            <td className="px-3 py-2" style={{ color: "var(--ink)" }}>
                                {depth[n]}
                            </td>
                            <td className="px-3 py-2" style={{ color: "var(--ink)" }}>
                                {sizes[n]}
                            </td>
                            <td className="px-3 py-2" style={{ color: "var(--ink)" }}>
                                {heights[n]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TreesContent() {
    const [treeText, setTreeText] = useState("1 2\n1 3\n2 4\n2 5\n3 6");
    const [nodeStates, setNodeStates] = useState({});

    const { nodes, edges } = parseTreeInput(treeText);
    const adj = buildTreeAdjacency(nodes, edges);
    const runnerAdj = {};
    for (const node of nodes) {
        runnerAdj[node] = (adj[node] || []).map((to) => ({ to }));
    }
    const root = nodes.length > 0 ? pickRoot(nodes) : null;
    const { parent, depth } = root
        ? buildTreeStructure(nodes, adj, root)
        : { parent: {}, depth: {} };
    const sizes = root ? subtreeSizes(nodes, adj, root) : {};
    const heights = root ? subtreeHeights(nodes, adj, root) : {};
    const diameter =
        nodes.length > 0 ? treeDiameter(nodes, adj) : { length: 0, path: [] };

    const showDiameter = () => {
        const states = {};
        diameter.path.forEach((n) => (states[n] = "path"));
        setNodeStates(states);
    };

    const showLcaStates = (states) => setNodeStates(states);

    return (
        <div
            className="tr-content"
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <QuickNav items={TOOLS} />
            <div className="cf-tool-grid tr-tool-grid">
                <ToolBlock
                    id="tr-tree-input"
                    icon={FaTree}
                    label="Tree workspace"
                    hint="Edit the edge list, run a traversal, and inspect the tree"
                    className="tr-tool-builder"
                >
                    <div className="cf-builder-layout">
                        <label
                            className="tr-input-field font-mono-cf"
                            style={{ color: "var(--muted)" }}
                        >
                            Edge list
                            <textarea
                                value={treeText}
                                onChange={(e) => {
                                    setTreeText(e.target.value);
                                    setNodeStates({});
                                }}
                                placeholder={"u v\nu v"}
                                rows={10}
                                className="cf-builder-textarea mt-1 p-2 rounded-md border font-mono-cf resize-none outline-none focus:ring-1"
                                style={{
                                    borderColor: "var(--line)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--ink)",
                                }}
                            />
                        </label>

                        <div className="cf-builder-controls">
                            {nodes.length > 0 && (
                                <div
                                    className="tr-tree-summary"
                                    aria-label="Tree summary"
                                >
                                    <span>
                                        <strong>{nodes.length}</strong> nodes
                                    </span>
                                    <span>
                                        <strong>{edges.length}</strong> edges
                                    </span>
                                    <span>
                                        root <strong>{root}</strong>
                                    </span>
                                </div>
                            )}

                            <AlgorithmRunner
                                nodes={nodes}
                                adj={runnerAdj}
                                onStateChange={setNodeStates}
                            />
                        </div>

                        <div className="cf-builder-canvas">
                            <GraphCanvas
                                nodes={nodes}
                                edges={edges}
                                directed={false}
                                nodeStates={nodeStates}
                                edgeColor="var(--sec-accent)"
                                stateColors={{
                                    unvisited: {
                                        fill: "var(--panel)",
                                        stroke: "var(--line-strong)",
                                        text: "var(--muted)",
                                        strokeWidth: 1.5,
                                    },
                                    visiting: {
                                        fill: "var(--sec-accent)",
                                        stroke: "var(--sec-accent)",
                                        text: "#fff",
                                        strokeWidth: 2.5,
                                    },
                                    backtracking: {
                                        fill: "var(--panel)",
                                        stroke: "var(--sec-accent)",
                                        text: "var(--sec-accent)",
                                        strokeWidth: 4,
                                    },
                                    visited: {
                                        fill: "color-mix(in srgb, var(--sec-accent) 34%, var(--panel))",
                                        stroke: "var(--sec-accent)",
                                        text: "var(--ink)",
                                        strokeWidth: 2.2,
                                    },
                                    path: {
                                        fill: "color-mix(in srgb, var(--sec-accent) 82%, #000)",
                                        stroke: "var(--sec-accent)",
                                        text: "#fff",
                                        strokeWidth: 2.5,
                                    },
                                }}
                            />
                        </div>
                    </div>
                </ToolBlock>

                {nodes.length > 0 && (
                    <>
                        <ToolBlock
                            id="tr-lca"
                            icon={FaProjectDiagram}
                            label="Lowest common ancestor"
                            hint="Compare two nodes in the rooted tree"
                            className="tr-tool-lca"
                        >
                            <LcaToolWrapper
                                nodes={nodes}
                                parent={parent}
                                depth={depth}
                                onHighlight={showLcaStates}
                            />
                        </ToolBlock>

                        <ToolBlock
                            id="tr-diameter"
                            icon={FaRoute}
                            label="Tree diameter"
                            hint="The longest path measured in edges"
                            className="tr-tool-diameter"
                        >
                            <div className="tr-result-panel">
                                <span>Length</span>
                                <strong>{diameter.length}</strong>
                            </div>
                            {diameter.path.length > 0 ? (
                                <div className="tr-path-output">
                                    <span>Path</span>
                                    <strong>
                                        {diameter.path.join(" → ")}
                                    </strong>
                                </div>
                            ) : null}
                            <button
                                type="button"
                                onClick={showDiameter}
                                className="tr-primary-button mt-3"
                            >
                                <FaRoute aria-hidden="true" />
                                Highlight diameter
                            </button>
                        </ToolBlock>

                        <ToolBlock
                            id="tr-node-stats"
                            icon={FaTable}
                            label="Node stats"
                            hint="Depth and subtree values from the selected root"
                            className="tr-tool-stats"
                        >
                            <StatTable
                                nodes={nodes}
                                depth={depth}
                                sizes={sizes}
                                heights={heights}
                            />
                        </ToolBlock>
                    </>
                )}
            </div>
        </div>
    );
}

function LcaToolWrapper({ nodes, parent, depth, onHighlight }) {
    const [a, setA] = useState(nodes[0] || "");
    const [b, setB] = useState(nodes[1] || nodes[0] || "");

    const selectedA = nodes.includes(a) ? a : nodes[0] || "";
    const selectedB = nodes.includes(b) ? b : nodes[1] || nodes[0] || "";
    const valid = nodes.includes(selectedA) && nodes.includes(selectedB);
    const lca = valid ? findLCA(parent, depth, selectedA, selectedB) : null;

    const highlight = () => {
        if (lca === null) return;
        const pathA = pathToRoot(parent, selectedA);
        const pathB = pathToRoot(parent, selectedB);
        const states = {};
        pathA.forEach((n) => (states[n] = "visited"));
        pathB.forEach((n) => (states[n] = "visited"));
        states[selectedA] = "visiting";
        states[selectedB] = "visiting";
        states[lca] = "path";
        onHighlight(states);
    };

    return (
        <div className="tr-lca-tool">
            <div className="tr-lca-fields">
                <label
                    className="font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    Node A
                    <select
                        value={selectedA}
                        onChange={(e) => setA(e.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf outline-none"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    >
                        {nodes.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
                <label
                    className="font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    Node B
                    <select
                        value={selectedB}
                        onChange={(e) => setB(e.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf outline-none"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    >
                        {nodes.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <button
                type="button"
                onClick={highlight}
                className="tr-primary-button"
            >
                <FaProjectDiagram aria-hidden="true" />
                Find and highlight LCA
            </button>

            {lca !== null && (
                <div className="tr-result-panel">
                    <span>
                        LCA({selectedA}, {selectedB})
                    </span>
                    <strong>{lca}</strong>
                </div>
            )}
        </div>
    );
}

export default TreesContent;

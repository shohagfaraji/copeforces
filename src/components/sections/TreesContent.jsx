import { useState } from "react";
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

function ToolBlock({ label, children }) {
    return (
        <div className="mb-8">
            <h3
                className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{ color: "var(--muted)", borderColor: "var(--line)" }}
            >
                {label}
            </h3>
            {children}
        </div>
    );
}

function StatTable({ nodes, depth, sizes, heights }) {
    return (
        <div className="overflow-x-auto">
            <table className="font-mono-cf text-xs w-full">
                <thead>
                    <tr style={{ color: "var(--muted)" }}>
                        <th className="text-left py-1 pr-4">node</th>
                        <th className="text-left py-1 pr-4">depth</th>
                        <th className="text-left py-1 pr-4">subtree size</th>
                        <th className="text-left py-1">subtree height</th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map((n) => (
                        <tr
                            key={n}
                            style={{ borderTop: "1px solid var(--line)" }}
                        >
                            <td
                                className="py-1 pr-4 font-bold"
                                style={{ color: "var(--ink)" }}
                            >
                                {n}
                            </td>
                            <td
                                className="py-1 pr-4"
                                style={{ color: "var(--ink)" }}
                            >
                                {depth[n]}
                            </td>
                            <td
                                className="py-1 pr-4"
                                style={{ color: "var(--ink)" }}
                            >
                                {sizes[n]}
                            </td>
                            <td
                                className="py-1"
                                style={{ color: "var(--ink)" }}
                            >
                                {heights[n]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function LcaTool({ nodes, parent, depth }) {
    const [a, setA] = useState(nodes[0] || "");
    const [b, setB] = useState(nodes[1] || nodes[0] || "");

    const valid = nodes.includes(a) && nodes.includes(b);
    const lca = valid ? findLCA(parent, depth, a, b) : null;
    const pathA = lca ? pathToRoot(parent, a) : [];
    const pathB = lca ? pathToRoot(parent, b) : [];

    const highlightSet = new Set([...pathA, ...pathB]);

    return (
        <div>
            <div className="flex gap-3 mb-3">
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    node A
                    <select
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        className="block mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
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
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    node B
                    <select
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        className="block mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
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
            {lca && (
                <p
                    className="text-sm font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    LCA(<strong style={{ color: "var(--ink)" }}>{a}</strong>,{" "}
                    <strong style={{ color: "var(--ink)" }}>{b}</strong>) ={" "}
                    <strong style={{ color: "var(--accent-violet)" }}>
                        {lca}
                    </strong>
                </p>
            )}
            <LcaPreview
                nodes={nodes}
                highlightSet={highlightSet}
                lca={lca}
                a={a}
                b={b}
                treeNodes={nodes}
                treeEdges={[]}
            />
        </div>
    );
}

function LcaPreview({ highlightSet, lca, a, b }) {
    const nodeStates = {};
    highlightSet.forEach((n) => (nodeStates[n] = "visited"));
    if (lca) nodeStates[lca] = "path";
    if (a) nodeStates[a] = nodeStates[a] === "path" ? "path" : "visiting";
    if (b) nodeStates[b] = nodeStates[b] === "path" ? "path" : "visiting";
    return nodeStates;
}

function TreesContent() {
    const [treeText, setTreeText] = useState("1 2\n1 3\n2 4\n2 5\n3 6");
    const [nodeStates, setNodeStates] = useState({});
    const [activeTool, setActiveTool] = useState("stats");

    const { nodes, edges } = parseTreeInput(treeText);
    const adj = buildTreeAdjacency(nodes, edges);
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
        <div>
            <ToolBlock label="Tree input">
                <div className="flex gap-4 items-start flex-wrap">
                    <textarea
                        value={treeText}
                        onChange={(e) => {
                            setTreeText(e.target.value);
                            setNodeStates({});
                        }}
                        placeholder={"child parent\nor\nu v (edge)"}
                        rows={10}
                        className="w-32 flex-shrink-0 p-2 rounded-md border font-mono-cf text-xs resize-none outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />
                    <div className="flex-1 min-w-[280px]">
                        <GraphCanvas
                            nodes={nodes}
                            edges={edges}
                            directed={false}
                            nodeStates={nodeStates}
                        />
                    </div>
                </div>
                {nodes.length > 0 && (
                    <p
                        className="text-xs font-mono-cf mt-2"
                        style={{ color: "var(--muted)" }}
                    >
                        {nodes.length} node(s), root ={" "}
                        <strong style={{ color: "var(--ink)" }}>{root}</strong>
                    </p>
                )}
            </ToolBlock>

            {nodes.length > 0 && (
                <>
                    <ToolBlock label="Node stats (depth, subtree size, subtree height)">
                        <StatTable
                            nodes={nodes}
                            depth={depth}
                            sizes={sizes}
                            heights={heights}
                        />
                    </ToolBlock>

                    <ToolBlock label="Lowest common ancestor">
                        <LcaToolWrapper
                            nodes={nodes}
                            parent={parent}
                            depth={depth}
                            onHighlight={showLcaStates}
                        />
                    </ToolBlock>

                    <ToolBlock label="Tree diameter">
                        <button
                            onClick={showDiameter}
                            className="font-mono-cf text-xs px-3 py-2 rounded-md border hover:opacity-70"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--accent-blue)",
                            }}
                        >
                            Highlight longest path
                        </button>
                        <p
                            className="text-sm font-mono-cf mt-2"
                            style={{ color: "var(--muted)" }}
                        >
                            Diameter (edges):{" "}
                            <strong style={{ color: "var(--ink)" }}>
                                {diameter.length}
                            </strong>
                            {diameter.path.length > 0 && (
                                <>
                                    {" "}
                                    · path:{" "}
                                    <strong style={{ color: "var(--ink)" }}>
                                        {diameter.path.join(" → ")}
                                    </strong>
                                </>
                            )}
                        </p>
                    </ToolBlock>

                    <ToolBlock label="BFS / DFS traversal">
                        <AlgorithmRunner
                            nodes={nodes}
                            adj={adj}
                            onStateChange={setNodeStates}
                        />
                    </ToolBlock>
                </>
            )}
        </div>
    );
}

function LcaToolWrapper({ nodes, parent, depth, onHighlight }) {
    const [a, setA] = useState(nodes[0] || "");
    const [b, setB] = useState(nodes[1] || nodes[0] || "");

    const valid = nodes.includes(a) && nodes.includes(b);
    const lca = valid ? findLCA(parent, depth, a, b) : null;

    const highlight = () => {
        if (!lca) return;
        const pathA = pathToRoot(parent, a);
        const pathB = pathToRoot(parent, b);
        const states = {};
        pathA.forEach((n) => (states[n] = "visited"));
        pathB.forEach((n) => (states[n] = "visited"));
        states[lca] = "path";
        states[a] = "visiting";
        states[b] = "visiting";
        onHighlight(states);
    };

    return (
        <div>
            <div className="flex gap-3 mb-3 items-end">
                <label
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    node A
                    <select
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        className="block mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
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
                    className="text-xs font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    node B
                    <select
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        className="block mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
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
                <button
                    onClick={highlight}
                    className="font-mono-cf text-xs px-3 py-2 rounded-md border hover:opacity-70"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--accent-blue)",
                    }}
                >
                    Find LCA
                </button>
            </div>
            {lca && (
                <p
                    className="text-sm font-mono-cf"
                    style={{ color: "var(--muted)" }}
                >
                    LCA(<strong style={{ color: "var(--ink)" }}>{a}</strong>,{" "}
                    <strong style={{ color: "var(--ink)" }}>{b}</strong>) ={" "}
                    <strong style={{ color: "var(--accent-violet)" }}>
                        {lca}
                    </strong>
                </p>
            )}
        </div>
    );
}

export default TreesContent;

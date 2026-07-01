import { useState } from "react";
import { FaProjectDiagram } from "react-icons/fa";
import { parseEdgeList, buildAdjacency } from "../../utils/graphTools";
import GraphCanvas from "../GraphCanvas";
import AlgorithmRunner from "../AlgorithmRunner";
import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "graphs")?.color || "#0000FF";

function ToolBlock({ id, label, icon: Icon, children }) {
    return (
        <div id={id} className="mb-8 scroll-mt-24">
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

function GraphsContent() {
    const [edgeText, setEdgeText] = useState(
        "1 2\n1 3\n2 4\n2 5\n3 6\n3 7\n2 3\n4 9\n4 10\n10 11",
    );
    const [directed, setDirected] = useState(false);
    const [nodeStates, setNodeStates] = useState({});

    const { nodes, edges } = parseEdgeList(edgeText);
    const adj = buildAdjacency(nodes, edges, directed);

    return (
        <div
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}80`,
                "--sec-accent-bg": `${ACCENT}20`,
            }}
        >
            <ToolBlock
                id="gr-graph-builder"
                icon={FaProjectDiagram}
                label="Graph builder and traversal"
            >
                <div className="flex gap-4 items-start flex-wrap">
                    <textarea
                        value={edgeText}
                        onChange={(e) => {
                            setEdgeText(e.target.value);
                            setNodeStates({});
                        }}
                        placeholder={"u v\nu v w"}
                        rows={10}
                        className="w-full sm:w-28 flex-shrink-0 p-2 rounded-md border font-mono-cf text-xs resize-none outline-none focus:ring-1"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    />

                    <div className="flex-shrink-0 w-full sm:w-64">
                        <label
                            className="flex items-center gap-2 mb-3 text-xs font-mono-cf"
                            style={{ color: "var(--muted)" }}
                        >
                            <input
                                type="checkbox"
                                checked={directed}
                                onChange={(e) => setDirected(e.target.checked)}
                            />
                            Directed
                        </label>

                        {nodes.length > 0 && (
                            <p
                                className="text-xs font-mono-cf mb-3"
                                style={{ color: "var(--muted)" }}
                            >
                                {nodes.length} node(s), {edges.length} edge(s)
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

                    <div className="flex-1 min-w-[240px] w-full">
                        <GraphCanvas
                            nodes={nodes}
                            edges={edges}
                            directed={directed}
                            nodeStates={nodeStates}
                        />
                    </div>
                </div>
            </ToolBlock>
        </div>
    );
}

export default GraphsContent;

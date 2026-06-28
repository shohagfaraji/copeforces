import { useState } from "react";
import { parseEdgeList, buildAdjacency } from "../../utils/graphTools";
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

function GraphsContent() {
    const [edgeText, setEdgeText] = useState(
        "1 2\n1 3\n2 4\n2 5\n3 6\n3 7\n2 3\n4 9\n4 10\n10 11",
    );
    const [directed, setDirected] = useState(false);
    const [nodeStates, setNodeStates] = useState({});

    const { nodes, edges } = parseEdgeList(edgeText);
    const adj = buildAdjacency(nodes, edges, directed);

    return (
        <div>
            <ToolBlock label="Graph builder and traversal">
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

import { useMemo } from "react";
import { computeLayout } from "../utils/graphLayout";

const STATE_COLORS = {
    unvisited: {
        fill: "var(--bg)",
        stroke: "var(--muted)",
        text: "var(--ink)",
    },
    visiting: { fill: "#FF8C00", stroke: "#FF8C00", text: "#fff" },
    backtracking: { fill: "#008000", stroke: "#008000", text: "#fff" },
    visited: { fill: "#3577D4", stroke: "#3577D4", text: "#fff" },
    path: { fill: "#AA00AA", stroke: "#AA00AA", text: "#fff" },
};

function GraphCanvas({
    nodes,
    edges,
    directed,
    nodeStates = {},
    width = 600,
    height = 360,
}) {
    const positions = useMemo(
        () => computeLayout(nodes, edges, width, height),
        [nodes, edges, width, height],
    );

    if (nodes.length === 0) {
        return (
            <div
                className="flex items-center justify-center text-sm rounded-md border"
                style={{
                    height,
                    borderColor: "var(--line)",
                    color: "var(--muted)",
                }}
            >
                Paste an edge list above to see the graph.
            </div>
        );
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            style={{
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--bg)",
            }}
        >
            <defs>
                <marker
                    id="graph-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path
                        d="M2 1L8 5L2 9"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="1.5"
                    />
                </marker>
            </defs>

            {edges.map((edge, idx) => {
                const from = positions[edge.u];
                const to = positions[edge.v];
                if (!from || !to) return null;

                // Curve every edge slightly, alternating bend direction by index,
                // so an edge can never lie exactly on top of / pass flush through
                // a node it doesn't connect to.
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const bend =
                    (idx % 2 === 0 ? 1 : -1) * Math.min(24, len * 0.18);
                const ctrlX = mx + (-dy / len) * bend;
                const ctrlY = my + (dx / len) * bend;

                return (
                    <g key={idx}>
                        <path
                            d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="1.2"
                            opacity="0.55"
                            markerEnd={
                                directed ? "url(#graph-arrow)" : undefined
                            }
                        />
                        {edge.w !== 1 && (
                            <text
                                x={ctrlX}
                                y={ctrlY - 4}
                                fontSize="11"
                                fontFamily="JetBrains Mono, monospace"
                                fill="var(--muted)"
                                textAnchor="middle"
                            >
                                {edge.w}
                            </text>
                        )}
                    </g>
                );
            })}

            {nodes.map((node) => {
                const pos = positions[node];
                if (!pos) return null;
                const state = nodeStates[node] || "unvisited";
                const colors = STATE_COLORS[state];
                return (
                    <g key={node}>
                        <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="18"
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth="1.5"
                        />
                        <text
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="12"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="700"
                            fill={colors.text}
                        >
                            {node}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default GraphCanvas;

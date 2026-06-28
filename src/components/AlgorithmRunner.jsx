import { useState, useEffect, useRef } from "react";
import { bfsSteps, dfsSteps } from "../utils/graphTools";

function AlgorithmRunner({ nodes, adj, onStateChange }) {
    const [algorithm, setAlgorithm] = useState("bfs");
    const [startNode, setStartNode] = useState(nodes[0] || "");
    const [steps, setSteps] = useState([]);
    const [stepIndex, setStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(600); // ms per step
    const intervalRef = useRef(null);

    const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
    const nodeStates = {};
    if (currentStep) {
        currentStep.visited.forEach((n) => (nodeStates[n] = "visited"));
        nodeStates[currentStep.visiting] = currentStep.backtrackTo
            ? "backtracking"
            : "visiting";
    }

    useEffect(() => {
        if (!nodes.includes(startNode)) {
            setStartNode(nodes[0] || "");
        }
    }, [nodes, startNode]);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const buildSteps = () => {
        if (!startNode) return;
        const newSteps =
            algorithm === "bfs"
                ? bfsSteps(adj, startNode)
                : dfsSteps(adj, startNode);
        setSteps(newSteps);
        setStepIndex(0);
        setIsPlaying(false);
        clearInterval(intervalRef.current);
    };

    const play = () => {
        if (steps.length === 0) return;
        setIsPlaying(true);
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStepIndex((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(intervalRef.current);
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, speed);
    };

    const pause = () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
    };

    const stepForward = () => {
        pause();
        setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const stepBack = () => {
        pause();
        setStepIndex((prev) => Math.max(prev - 1, 0));
    };

    const reset = () => {
        pause();
        setStepIndex(steps.length > 0 ? 0 : -1);
    };

    // Re-apply the interval whenever speed changes mid-play, so the
    // slider takes effect immediately instead of after the next tick.
    useEffect(() => {
        if (isPlaying) {
            play();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speed]);

    useEffect(() => {
        onStateChange(nodeStates);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepIndex, steps]);

    return (
        <div>
            <div className="flex items-end gap-2 mb-3">
                <label
                    className="text-xs font-mono-cf flex-1 min-w-0"
                    style={{ color: "var(--muted)" }}
                >
                    Algorithm
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--bg)",
                            color: "var(--ink)",
                        }}
                    >
                        <option value="bfs">BFS</option>
                        <option value="dfs">DFS</option>
                    </select>
                </label>

                <label
                    className="text-xs font-mono-cf flex-1 min-w-0"
                    style={{ color: "var(--muted)" }}
                >
                    Start node
                    <select
                        value={startNode}
                        onChange={(e) => setStartNode(e.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
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
                    onClick={buildSteps}
                    className="font-mono-cf text-xs px-3 py-2 rounded-md border hover:opacity-70 flex-shrink-0"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--accent-blue)",
                    }}
                >
                    Run
                </button>
            </div>

            {steps.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                    <div className="flex gap-1.5">
                        <button
                            onClick={stepBack}
                            className="font-mono-cf text-xs px-2 py-1.5 rounded-md border flex-1"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            ◂
                        </button>
                        {isPlaying ? (
                            <button
                                onClick={pause}
                                className="font-mono-cf text-xs px-2 py-1.5 rounded-md border flex-1"
                                style={{
                                    borderColor: "var(--line)",
                                    color: "var(--ink)",
                                }}
                            >
                                ❙❙
                            </button>
                        ) : (
                            <button
                                onClick={play}
                                className="font-mono-cf text-xs px-2 py-1.5 rounded-md border flex-1"
                                style={{
                                    borderColor: "var(--line)",
                                    color: "var(--ink)",
                                }}
                            >
                                ▶
                            </button>
                        )}
                        <button
                            onClick={stepForward}
                            className="font-mono-cf text-xs px-2 py-1.5 rounded-md border flex-1"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            ▸
                        </button>
                        <button
                            onClick={reset}
                            className="font-mono-cf text-xs px-2 py-1.5 rounded-md border flex-1"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            ↺
                        </button>
                    </div>

                    <label
                        className="flex items-center gap-2 text-xs font-mono-cf"
                        style={{ color: "var(--muted)" }}
                    >
                        speed
                        <input
                            type="range"
                            min="100"
                            max="1500"
                            step="100"
                            value={1600 - speed}
                            onChange={(e) =>
                                setSpeed(1600 - Number(e.target.value))
                            }
                            className="flex-1"
                        />
                    </label>

                    <span
                        className="text-xs font-mono-cf"
                        style={{ color: "var(--muted)" }}
                    >
                        step {stepIndex + 1}/{steps.length}
                        {currentStep?.backtrackTo && (
                            <>
                                {" "}
                                · back to{" "}
                                <strong style={{ color: "var(--ink)" }}>
                                    {currentStep.visiting}
                                </strong>
                            </>
                        )}
                        {currentStep && !currentStep.backtrackTo && (
                            <>
                                {" "}
                                · at{" "}
                                <strong style={{ color: "var(--ink)" }}>
                                    {currentStep.visiting}
                                </strong>
                            </>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}

// A tiny pass-through so GraphsContent can read the live nodeStates
// without prop-drilling through extra wrapper renders.
function NodeStatesContext() {
    return null;
}

export default AlgorithmRunner;

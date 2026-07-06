import { useEffect, useMemo, useRef, useState } from "react";
import { bfsSteps, dfsSteps } from "../utils/graphTools";

function AlgorithmRunner({ nodes, adj, onStateChange }) {
    const [algorithm, setAlgorithm] = useState("bfs");
    const [startNode, setStartNode] = useState(nodes[0] || "");
    const [steps, setSteps] = useState([]);
    const [stepIndex, setStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(600);
    const intervalRef = useRef(null);

    const selectedStartNode = nodes.includes(startNode)
        ? startNode
        : nodes[0] || "";
    const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
    const nodeStates = useMemo(() => {
        if (!currentStep) return {};

        const states = {};
        currentStep.visited.forEach((node) => {
            states[node] = "visited";
        });
        states[currentStep.visiting] = currentStep.backtrackTo
            ? "backtracking"
            : "visiting";
        return states;
    }, [currentStep]);

    const pause = () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
    };

    const play = () => {
        if (steps.length === 0) return;
        setIsPlaying(true);
    };

    const buildSteps = () => {
        if (!selectedStartNode) return;

        const nextSteps =
            algorithm === "bfs"
                ? bfsSteps(adj, selectedStartNode)
                : dfsSteps(adj, selectedStartNode);
        setSteps(nextSteps);
        setStepIndex(0);
        setIsPlaying(false);
        clearInterval(intervalRef.current);
    };

    const stepForward = () => {
        pause();
        setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
    };

    const stepBack = () => {
        pause();
        setStepIndex((previous) => Math.max(previous - 1, 0));
    };

    const reset = () => {
        pause();
        setStepIndex(steps.length > 0 ? 0 : -1);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        clearInterval(intervalRef.current);

        if (!isPlaying || steps.length === 0) {
            return undefined;
        }

        intervalRef.current = setInterval(() => {
            setStepIndex((previous) => {
                if (previous >= steps.length - 1) {
                    clearInterval(intervalRef.current);
                    setIsPlaying(false);
                    return previous;
                }
                return previous + 1;
            });
        }, speed);

        return () => clearInterval(intervalRef.current);
    }, [isPlaying, speed, steps.length]);

    useEffect(() => {
        onStateChange(nodeStates);
    }, [nodeStates, onStateChange]);

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
                        onChange={(event) => setAlgorithm(event.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--panel)",
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
                        value={selectedStartNode}
                        onChange={(event) => setStartNode(event.target.value)}
                        className="block w-full mt-1 p-2 rounded-md border font-mono-cf text-sm outline-none"
                        style={{
                            borderColor: "var(--line)",
                            backgroundColor: "var(--panel)",
                            color: "var(--ink)",
                        }}
                    >
                        {nodes.map((node) => (
                            <option key={node} value={node}>
                                {node}
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
                    <div className="grid grid-cols-4 gap-1.5">
                        <button
                            onClick={stepBack}
                            className="font-mono-cf text-[11px] px-2 py-1.5 rounded-md border"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            Prev
                        </button>
                        <button
                            onClick={isPlaying ? pause : play}
                            className="font-mono-cf text-[11px] px-2 py-1.5 rounded-md border"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--ink)",
                            }}
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        <button
                            onClick={stepForward}
                            className="font-mono-cf text-[11px] px-2 py-1.5 rounded-md border"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            Next
                        </button>
                        <button
                            onClick={reset}
                            className="font-mono-cf text-[11px] px-2 py-1.5 rounded-md border"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            Reset
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
                            onChange={(event) =>
                                setSpeed(1600 - Number(event.target.value))
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
                                - back to{" "}
                                <strong style={{ color: "var(--ink)" }}>
                                    {currentStep.visiting}
                                </strong>
                            </>
                        )}
                        {currentStep && !currentStep.backtrackTo && (
                            <>
                                {" "}
                                - at{" "}
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

export default AlgorithmRunner;

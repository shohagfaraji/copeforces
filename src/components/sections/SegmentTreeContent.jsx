import { useEffect, useMemo, useRef, useState } from "react";
import {
    FaBolt,
    FaCheck,
    FaEdit,
    FaHammer,
    FaPause,
    FaPlay,
    FaRedoAlt,
    FaSearch,
    FaStepBackward,
    FaStepForward,
} from "react-icons/fa";
import { sections } from "../../data/sections";
import {
    createSegmentTree,
    parseSegmentValues,
    pointUpdateSegmentTree,
    querySegmentTree,
    rangeAddSegmentTree,
    segmentTreeValues,
} from "../../utils/segmentTreeTools";

const ACCENT =
    sections.find((section) => section.id === "segment-tree")?.color ||
    "#7c3bb9";
const DEFAULT_VALUES = [1, 2, 3, 4, 5, 6, 7, 8];

const OPERATIONS = [
    {
        id: "query",
        label: "Range query",
        short: "Read",
        icon: FaSearch,
    },
    {
        id: "point",
        label: "Point update",
        short: "Replace",
        icon: FaEdit,
    },
    {
        id: "lazy",
        label: "Range add",
        short: "Lazy",
        icon: FaBolt,
    },
];

const METRICS = {
    sum: { label: "Sum", symbol: "Σ" },
    min: { label: "Minimum", symbol: "min" },
    max: { label: "Maximum", symbol: "max" },
};

function formatValue(value) {
    if (!Number.isFinite(value)) return "—";
    if (Number.isInteger(value)) return String(value);
    return String(Number(value.toFixed(3)));
}

function signed(value) {
    return `${value > 0 ? "+" : ""}${formatValue(value)}`;
}

function validIndex(value, size) {
    if (String(value).trim() === "") return false;
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && number < size;
}

function validNumber(value) {
    return String(value).trim() !== "" && Number.isFinite(Number(value));
}

function getResolvedNodes(tree) {
    const resolved = [];

    function visit(index, inheritedLazy) {
        const node = tree.nodes[index];
        if (!node) return;
        const length = node.right - node.left + 1;
        resolved[index] = {
            ...node,
            sum: node.sum + inheritedLazy * length,
            min: node.min + inheritedLazy,
            max: node.max + inheritedLazy,
        };
        const nextLazy = inheritedLazy + node.lazy;
        visit(index * 2, nextLazy);
        visit(index * 2 + 1, nextLazy);
    }

    if (tree.n) visit(1, 0);
    return resolved;
}

function InputField({
    label,
    value,
    onChange,
    min,
    max,
    step = "1",
    hint,
}) {
    return (
        <label className="sg-field">
            <span>{label}</span>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(event) => onChange(event.target.value)}
            />
            {hint && <small>{hint}</small>}
        </label>
    );
}

function DatasetBuilder({
    draft,
    setDraft,
    onBuild,
    error,
    size,
    root,
    showAggregates,
}) {
    const parsed = parseSegmentValues(draft);

    return (
        <div className="sg-dataset" id="sg-build">
            <div className="sg-panel-heading">
                <h3>Array setup</h3>
            </div>

            <form className="sg-build-form" onSubmit={onBuild}>
                <label>
                    <span>Array values</span>
                    <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        spellCheck={false}
                        aria-invalid={Boolean(error)}
                        placeholder="1 2 3 4 5 6 7 8"
                    />
                </label>
                <button className="sg-primary-button" type="submit">
                    <FaHammer size={12} />
                    Rebuild
                </button>
            </form>

            <div className="sg-build-footer">
                <span className={error ? "sg-inline-error" : ""}>
                    {error ||
                        (parsed.error
                            ? parsed.error
                            : `${parsed.values.length} values`)}
                </span>
                <div>
                    <span>n = {size}</span>
                    <span>
                        root Σ ={" "}
                        {showAggregates ? formatValue(root.sum) : "?"}
                    </span>
                    <span>
                        min/max ={" "}
                        {showAggregates
                            ? `${formatValue(root.min)}/${formatValue(root.max)}`
                            : "?/?"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function previewFor(operation, tree, fields) {
    if (operation === "point") {
        if (!validIndex(fields.pointIndex, tree.n)) return null;
        const index = Number(fields.pointIndex);
        return { left: index, right: index };
    }

    const left =
        operation === "query" ? fields.queryLeft : fields.rangeLeft;
    const right =
        operation === "query" ? fields.queryRight : fields.rangeRight;
    if (
        !validIndex(left, tree.n) ||
        !validIndex(right, tree.n) ||
        Number(left) > Number(right)
    ) {
        return null;
    }
    return { left: Number(left), right: Number(right) };
}

function OperationTabs({ operation, onChange }) {
    return (
        <div className="sg-operation-tabs" role="tablist">
            {OPERATIONS.map(({ id, label, short, icon: Icon }) => (
                <button
                    type="button"
                    key={id}
                    className={operation === id ? "is-active" : ""}
                    onClick={() => onChange(id)}
                    role="tab"
                    aria-selected={operation === id}
                    title={label}
                >
                    <Icon size={12} />
                    <span>{short}</span>
                </button>
            ))}
        </div>
    );
}

function QueryControls({ fields, setField, size }) {
    return (
        <div className="sg-field-grid">
            <InputField
                label="Left index"
                value={fields.queryLeft}
                onChange={(value) => setField("queryLeft", value)}
                min={0}
                max={size - 1}
            />
            <InputField
                label="Right index"
                value={fields.queryRight}
                onChange={(value) => setField("queryRight", value)}
                min={0}
                max={size - 1}
            />
        </div>
    );
}

function PointControls({ fields, setField, size }) {
    return (
        <>
            <div className="sg-field-grid">
                <InputField
                    label="Array index"
                    value={fields.pointIndex}
                    onChange={(value) => setField("pointIndex", value)}
                    min={0}
                    max={size - 1}
                />
                <InputField
                    label="New value"
                    value={fields.pointValue}
                    onChange={(value) => setField("pointValue", value)}
                    step="any"
                />
            </div>
        </>
    );
}

function LazyControls({ fields, setField, size }) {
    return (
        <>
            <div className="sg-field-grid sg-field-grid-three">
                <InputField
                    label="Left index"
                    value={fields.rangeLeft}
                    onChange={(value) => setField("rangeLeft", value)}
                    min={0}
                    max={size - 1}
                />
                <InputField
                    label="Right index"
                    value={fields.rangeRight}
                    onChange={(value) => setField("rangeRight", value)}
                    min={0}
                    max={size - 1}
                />
                <InputField
                    label="Add delta"
                    value={fields.rangeDelta}
                    onChange={(value) => setField("rangeDelta", value)}
                    step="any"
                />
            </div>
        </>
    );
}

function ResultCard({ activity, showResult }) {
    if (!activity || activity.kind === "ready" || !showResult) return null;

    return (
        <div
            className={`sg-result-card ${
                activity.kind === "query" ? "sg-result-query" : ""
            }`}
            aria-live="polite"
        >
            <span className="sg-result-label">Last result</span>
            <div className="sg-result-main">
                <span className="sg-result-icon">
                    <FaCheck />
                </span>
                <div>
                    <strong>{activity.title}</strong>
                </div>
                {activity.result !== undefined && (
                    <output>{formatValue(activity.result)}</output>
                )}
            </div>
        </div>
    );
}

function OperationPanel({
    operation,
    setOperation,
    fields,
    setField,
    tree,
    onRun,
    error,
    activity,
    showResult,
    trace,
    step,
    playing,
    animationSpeed,
    setAnimationSpeed,
    playback,
}) {
    return (
        <aside className="sg-operation-panel" id="sg-operations">
            <div className="sg-panel-heading">
                <h3>Operation</h3>
            </div>

            <OperationTabs operation={operation} onChange={setOperation} />

            <form className="sg-operation-form" onSubmit={onRun}>
                {operation === "query" && (
                    <QueryControls
                        fields={fields}
                        setField={setField}
                        size={tree.n}
                    />
                )}
                {operation === "point" && (
                    <PointControls
                        fields={fields}
                        setField={setField}
                        size={tree.n}
                    />
                )}
                {operation === "lazy" && (
                    <LazyControls
                        fields={fields}
                        setField={setField}
                        size={tree.n}
                    />
                )}

                {error && <p className="sg-form-error">{error}</p>}

                <button className="sg-run-button" type="submit">
                    <FaPlay size={11} />
                    Run & animate
                </button>
            </form>

            <PlaybackControls
                trace={trace}
                step={step}
                playing={playing}
                speed={animationSpeed}
                onSpeedChange={setAnimationSpeed}
                {...playback}
            />

            <ResultCard activity={activity} showResult={showResult} />
        </aside>
    );
}

function aggregateSnapshot(node) {
    return {
        sum: node.sum,
        min: node.min,
        max: node.max,
    };
}

function combineAggregate(metric, operands) {
    if (operands.length === 1) return operands[0];
    if (metric === "sum") return operands[0] + operands[1];
    if (metric === "min") return Math.min(...operands);
    return Math.max(...operands);
}

function createBottomUpTrace(
    tree,
    { kind = "build", rangeLeft = 0, rangeRight = tree.n - 1, metric = "sum" } = {},
) {
    const frames = [];
    const nodes = getResolvedNodes(tree);
    const isQuery = kind === "query";
    const computed = new Map();
    const computedRanges = new Map();

    function addSelectionFrames(parentIndex, children) {
        const selectedIndices = [];

        children.forEach((child) => {
            selectedIndices.push(child.index);
            frames.push({
                index: child.index,
                parentIndex,
                phase: "select",
                direction: "hold",
                selectedPosition:
                    children.length === 1
                        ? "only"
                        : child.index === parentIndex * 2
                          ? "left"
                          : "right",
                operandIndices: [...selectedIndices],
                ...(isQuery
                    ? { metric, selectedValue: child.value }
                    : { selectedValues: child.value }),
            });
        });
    }

    function calculate(index) {
        const node = nodes[index];
        if (!node) return undefined;

        if (node.left === node.right) {
            if (
                isQuery &&
                (node.left < rangeLeft || node.right > rangeRight)
            ) {
                return undefined;
            }

            const value = isQuery
                ? node[metric]
                : aggregateSnapshot(node);
            computed.set(index, value);
            computedRanges.set(index, {
                left: node.left,
                right: node.right,
            });
            if (tree.n === 1) {
                frames.push({
                    index,
                    phase: "leaf",
                    direction: "hold",
                    range: {
                        left: node.left,
                        right: node.right,
                    },
                    ...(isQuery
                        ? { metric, value }
                        : { values: value }),
                });
            }
            return value;
        }

        calculate(index * 2);
        calculate(index * 2 + 1);

        const children = [index * 2, index * 2 + 1]
            .filter((childIndex) => computed.has(childIndex))
            .map((childIndex) => ({
                index: childIndex,
                value: computed.get(childIndex),
                range: computedRanges.get(childIndex),
            }));
        if (children.length === 0) return undefined;

        addSelectionFrames(index, children);
        const includedRange = {
            left: Math.min(...children.map((child) => child.range.left)),
            right: Math.max(...children.map((child) => child.range.right)),
        };

        if (isQuery) {
            const operands = children.map((child) => child.value);
            const value = combineAggregate(metric, operands);
            computed.set(index, value);
            computedRanges.set(index, includedRange);
            frames.push({
                index,
                phase: "transfer",
                direction: "up",
                metric,
                range: includedRange,
                operands,
                operandIndices: children.map((child) => child.index),
            });
            frames.push({
                index,
                phase: "combine",
                direction: "receive",
                metric,
                range: includedRange,
                value,
                operands,
                operandIndices: children.map((child) => child.index),
            });
            return value;
        }

        const values = aggregateSnapshot(node);
        const operands = {
            sum: children.map((child) => child.value.sum),
            min: children.map((child) => child.value.min),
            max: children.map((child) => child.value.max),
        };
        computed.set(index, values);
        computedRanges.set(index, includedRange);
        frames.push({
            index,
            phase: "transfer",
            direction: "up",
            range: includedRange,
            operands,
            operandIndices: children.map((child) => child.index),
        });
        frames.push({
            index,
            phase: "combine",
            direction: "receive",
            range: includedRange,
            values,
            operands,
            operandIndices: children.map((child) => child.index),
        });
        return values;
    }

    calculate(1);

    return frames;
}

function frameAggregate(frame, selectedMetric, activity) {
    if (!frame) return null;
    if (activity.kind === "query" && frame.value !== undefined) {
        return {
            metric: frame.metric,
            value: frame.value,
            range: frame.range,
        };
    }
    if (frame.values) {
        return {
            metric: selectedMetric,
            value: frame.values[selectedMetric],
            range: frame.range,
        };
    }
    return null;
}

function TreeCanvas({
    tree,
    metric,
    trace,
    step,
    activity,
    preview,
    calculationCleared,
    animationSpeed,
}) {
    const nodes = useMemo(() => getResolvedNodes(tree), [tree]);
    const canvasRef = useRef(null);
    const lastFocusedIndexRef = useRef(null);
    const width = Math.max(760, tree.n * 92 + 120);
    const maxDepth = Math.max(
        0,
        ...nodes.filter(Boolean).map((node) => node.depth),
    );
    const height = 100 + maxDepth * 94;
    const tokenDuration = `${520 / animationSpeed}ms`;
    const padding = 68;
    const usableWidth = width - padding * 2;
    const visibleTrace = trace.slice(0, step);
    const visited = new Set(visibleTrace.map((frame) => frame.index));
    const currentFrame = step > 0 ? trace[step - 1] : null;
    const currentIndex = currentFrame?.index ?? null;
    const currentNode = currentIndex ? nodes[currentIndex] : null;
    const activeOperands = new Set(
        currentFrame?.phase === "transfer" ||
            currentFrame?.phase === "select"
            ? currentFrame.operandIndices || []
            : [],
    );
    const returnedAggregates = new Map();
    for (const frame of visibleTrace) {
        const aggregate = frameAggregate(frame, metric, activity);
        if (aggregate) returnedAggregates.set(frame.index, aggregate);
    }
    const previewNodes = new Set(
        nodes
            .filter(
                (node) =>
                    node &&
                    preview &&
                    node.right >= preview.left &&
                    node.left <= preview.right,
            )
            .map((node) => node.index),
    );

    function coordinates(node) {
        return {
            x:
                padding +
                ((node.left + node.right + 1) / (2 * tree.n)) * usableWidth,
            y: 48 + node.depth * 94,
        };
    }

    useEffect(() => {
        const container = canvasRef.current;
        const node = currentIndex ? nodes[currentIndex] : null;
        if (!container || !node) {
            if (!currentIndex) lastFocusedIndexRef.current = null;
            return undefined;
        }
        if (lastFocusedIndexRef.current === currentIndex) return undefined;
        lastFocusedIndexRef.current = currentIndex;

        const x =
            padding +
            ((node.left + node.right + 1) / (2 * tree.n)) * usableWidth;
        const y = 48 + node.depth * 94;
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        const frame = window.requestAnimationFrame(() => {
            container.scrollTo({
                left: Math.max(0, x - container.clientWidth / 2),
                top: Math.max(0, y - container.clientHeight / 2),
                behavior:
                    reducedMotion || step <= 1 ? "auto" : "smooth",
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [
        currentIndex,
        nodes,
        padding,
        step,
        tree.n,
        usableWidth,
    ]);

    const renderedNodes = nodes.filter(Boolean);

    return (
        <div className="sg-canvas-scroll" ref={canvasRef}>
            <svg
                    className="sg-tree-svg"
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    role="img"
                    aria-label={`Segment tree showing ${METRICS[metric].label.toLowerCase()} aggregates`}
                >
                    <defs>
                        <marker
                            id="sg-arrow-up"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" />
                        </marker>
                    </defs>
                    <g className="sg-tree-edges">
                        {renderedNodes
                            .filter((node) => node.index !== 1)
                            .map((node) => {
                                const parent = nodes[Math.floor(node.index / 2)];
                                const from = coordinates(parent);
                                const to = coordinates(node);
                                const isUpPath =
                                    currentFrame?.direction === "up" &&
                                    currentFrame?.phase === "transfer" &&
                                    currentIndex === parent.index &&
                                    activeOperands.has(node.index);
                                return (
                                    <line
                                        key={node.index}
                                        x1={from.x}
                                        y1={from.y + 29}
                                        x2={to.x}
                                        y2={to.y - 29}
                                        className={[
                                            visited.has(node.index)
                                                ? "is-reached"
                                                : "",
                                            isUpPath
                                                ? "is-current-up"
                                                : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        markerStart={
                                            isUpPath
                                                ? "url(#sg-arrow-up)"
                                                : undefined
                                        }
                                    />
                                );
                            })}
                    </g>

                    {currentFrame?.phase === "transfer" &&
                        currentNode && (
                        <g className="sg-merge-tokens" aria-hidden="true">
                            {[...activeOperands].map((childIndex) => {
                                const child = nodes[childIndex];
                                if (!child) return null;
                                const from = coordinates(child);
                                const to = coordinates(currentNode);
                                return (
                                    <circle key={childIndex} r="5">
                                        <animate
                                            attributeName="cx"
                                            values={`${from.x};${to.x}`}
                                            dur={tokenDuration}
                                            repeatCount="1"
                                        />
                                        <animate
                                            attributeName="cy"
                                            values={`${from.y - 29};${to.y + 29}`}
                                            dur={tokenDuration}
                                            repeatCount="1"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            values="0;1;1;0"
                                            dur={tokenDuration}
                                            repeatCount="1"
                                        />
                                    </circle>
                                );
                            })}
                        </g>
                    )}

                    <g className="sg-tree-nodes">
                        {renderedNodes.map((node) => {
                            const { x, y } = coordinates(node);
                            const isLeaf = node.left === node.right;
                            const isCurrent =
                                currentIndex === node.index &&
                                currentFrame?.phase !== "transfer";
                            const isVisited = visited.has(node.index);
                            const returnedAggregateRaw = returnedAggregates.get(
                                node.index,
                            );
                            const returnedAggregate =
                                returnedAggregateRaw?.metric === metric
                                    ? returnedAggregateRaw
                                    : null;
                            const displayedValue =
                                isLeaf || !calculationCleared
                                    ? node[metric]
                                    : returnedAggregate?.value;
                            const displayedRange =
                                activity.kind === "query" &&
                                returnedAggregate?.range
                                    ? returnedAggregate.range
                                    : node;
                            const classes = [
                                "sg-tree-node",
                                isLeaf ? "is-input-leaf" : "",
                                previewNodes.has(node.index)
                                    ? "is-preview"
                                    : "",
                                isVisited ? "is-visited" : "",
                                activeOperands.has(node.index)
                                    ? "is-operand"
                                    : "",
                                isCurrent ? "is-current" : "",
                                isCurrent &&
                                currentFrame?.phase === "combine"
                                    ? "is-returning"
                                    : "",
                                returnedAggregate ? "has-returned" : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <g
                                    key={node.index}
                                    className={classes}
                                    transform={`translate(${x}, ${y})`}
                                    aria-label={`Node ${node.index}, interval ${node.left} to ${node.right}, ${metric} ${node[metric]}`}
                                >
                                    <rect
                                        x="-52"
                                        y="-29"
                                        width="104"
                                        height="58"
                                        rx="10"
                                    />
                                    <text
                                        className="sg-svg-range"
                                        textAnchor="middle"
                                        y="-11"
                                    >
                                        {isLeaf
                                            ? `a[${node.left}]`
                                            : `[${displayedRange.left}, ${displayedRange.right}]`}
                                    </text>
                                    <text
                                        className="sg-svg-value"
                                        textAnchor="middle"
                                        y="8"
                                    >
                                        {isLeaf
                                            ? formatValue(node.sum)
                                            : `${METRICS[metric].symbol} ${
                                                  displayedValue === undefined
                                                      ? "?"
                                                      : formatValue(
                                                            displayedValue,
                                                        )
                                              }`}
                                    </text>
                                    <text
                                        className={`sg-svg-meta ${
                                            returnedAggregate
                                                ? "is-returned"
                                                : ""
                                        }`}
                                        textAnchor="middle"
                                        y="22"
                                    >
                                        {returnedAggregate
                                            ? isLeaf
                                                ? "✓ bottom value"
                                                : `✓ ${
                                                      METRICS[
                                                          returnedAggregate
                                                              .metric
                                                      ].symbol
                                                  } ${formatValue(
                                                      returnedAggregate.value,
                                                  )}`
                                            : isLeaf
                                              ? "input value"
                                            : calculationCleared
                                              ? "not calculated"
                                            : node.lazy !== 0
                                            ? `lazy ${signed(node.lazy)}`
                                            : `node #${node.index}`}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
            </svg>
        </div>
    );
}

function PlaybackControls({
    trace,
    step,
    playing,
    onRestart,
    onPrevious,
    onToggle,
    onNext,
    speed,
    onSpeedChange,
}) {
    const isPlaying = playing && step < trace.length;

    return (
        <div className="sg-playback-controls">
            <div className="sg-playback-buttons">
                <button
                    type="button"
                    className="sg-reset-button"
                    onClick={onRestart}
                    disabled={!trace.length}
                    aria-label="Reset animation"
                >
                    <FaRedoAlt size={14} />
                    <span>Reset</span>
                </button>
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={!trace.length || step === 0}
                    aria-label="Previous step (Left Arrow)"
                    aria-keyshortcuts="ArrowLeft"
                >
                    <FaStepBackward size={14} />
                </button>
                <button
                    type="button"
                    className="sg-play-toggle"
                    onClick={onToggle}
                    disabled={!trace.length}
                    aria-label={isPlaying ? "Pause animation" : "Play animation"}
                    aria-keyshortcuts="Space"
                >
                    {isPlaying ? (
                        <FaPause size={14} />
                    ) : (
                        <FaPlay size={14} />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!trace.length || step >= trace.length}
                    aria-label="Next step (Right Arrow)"
                    aria-keyshortcuts="ArrowRight"
                >
                    <FaStepForward size={14} />
                </button>
                <label className="sg-speed-control">
                    <span>Speed</span>
                    <select
                        value={speed}
                        onChange={(event) =>
                            onSpeedChange(Number(event.target.value))
                        }
                        aria-label="Animation speed"
                    >
                        <option value={0.25}>0.25×</option>
                        <option value={0.5}>0.5×</option>
                        <option value={0.75}>0.75×</option>
                        <option value={1}>1×</option>
                        <option value={1.5}>1.5×</option>
                        <option value={2}>2×</option>
                    </select>
                </label>
            </div>
        </div>
    );
}

function PlaybackProgress({ trace, step, speed }) {
    const progress = trace.length ? (step / trace.length) * 100 : 0;

    return (
        <div
            className="sg-playback-progress"
            style={{ "--sg-progress-duration": `${420 / speed}ms` }}
            aria-label={`Animation step ${step} of ${trace.length}`}
        >
            <div className="sg-progress-track" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
            </div>
            <span className="sg-progress-label">
                {trace.length ? `${step} / ${trace.length}` : "No trace"}
            </span>
        </div>
    );
}

function Viewer({
    tree,
    metric,
    setMetric,
    trace,
    step,
    activity,
    preview,
    calculationCleared,
    animationSpeed,
}) {
    return (
        <section className="sg-viewer" id="sg-viewer">
            <div className="sg-viewer-header">
                <h3>Tree visualization</h3>
                <div className="sg-view-metric" aria-label="Node aggregate">
                    {Object.entries(METRICS).map(([id, item]) => (
                        <button
                            type="button"
                            key={id}
                            className={metric === id ? "is-active" : ""}
                            onClick={() => setMetric(id)}
                            title={`Show ${item.label.toLowerCase()} in every node`}
                        >
                            {item.symbol}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sg-visual-legend">
                <span>
                    <i className="sg-legend-source" /> input leaf
                </span>
                <span>
                    <i className="sg-legend-preview" /> selected
                </span>
                <span>
                    <i className="sg-legend-operands" /> child operands
                </span>
                <span>
                    <i className="sg-legend-calculated" /> parent result
                </span>
            </div>

            <TreeCanvas
                tree={tree}
                metric={metric}
                trace={trace}
                step={step}
                activity={activity}
                preview={preview}
                calculationCleared={calculationCleared}
                animationSpeed={animationSpeed}
            />
            <PlaybackProgress
                trace={trace}
                step={step}
                speed={animationSpeed}
            />
        </section>
    );
}

function SegmentTreeContent() {
    const studioRef = useRef(null);
    const [tree, setTree] = useState(() =>
        createSegmentTree(DEFAULT_VALUES),
    );
    const [draft, setDraft] = useState(DEFAULT_VALUES.join(" "));
    const [buildError, setBuildError] = useState("");
    const [operationError, setOperationError] = useState("");
    const [operation, setOperation] = useState("query");
    const [viewMetric, setViewMetric] = useState("sum");
    const [fields, setFields] = useState({
        queryType: "sum",
        queryLeft: "2",
        queryRight: "6",
        pointIndex: "3",
        pointValue: "10",
        rangeLeft: "1",
        rangeRight: "5",
        rangeDelta: "2",
    });
    const [activity, setActivity] = useState({
        kind: "ready",
        title: "Ready",
        detail: "Choose an operation and run it.",
        before: DEFAULT_VALUES,
        after: DEFAULT_VALUES,
        changed: [],
        covered: [],
    });
    const [trace, setTrace] = useState([]);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [animationRun, setAnimationRun] = useState(0);
    const [calculationCleared, setCalculationCleared] = useState(false);

    const preview = previewFor(operation, tree, fields);
    const showCompletedCalculation =
        !calculationCleared ||
        (trace.length > 0 && step >= trace.length);

    useEffect(() => {
        if (!playing || step >= trace.length) return undefined;
        const currentFrame = step > 0 ? trace[step - 1] : null;
        const frameDuration =
            currentFrame?.phase === "select"
                ? 850
                : currentFrame?.phase === "transfer"
                  ? 720
                  : currentFrame?.phase === "combine"
                    ? 950
                    : 700;
        const delay = step === 0 ? 160 : frameDuration / animationSpeed;
        const nextStep = step + 1;
        const timer = window.setTimeout(() => {
            setStep(nextStep);
            if (nextStep >= trace.length) setPlaying(false);
        }, delay);
        return () => window.clearTimeout(timer);
    }, [animationRun, animationSpeed, playing, step, trace]);

    useEffect(() => {
        function handleStepShortcut(event) {
            if (
                !trace.length ||
                event.defaultPrevented ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey
            ) {
                return;
            }

            const target = event.target;
            const tagName = target?.tagName;
            if (
                tagName === "INPUT" ||
                tagName === "TEXTAREA" ||
                tagName === "SELECT" ||
                target?.isContentEditable
            ) {
                return;
            }

            const studio = studioRef.current;
            if (!studio) return;
            const bounds = studio.getBoundingClientRect();
            if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setPlaying(false);
                setStep((current) => Math.max(0, current - 1));
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                setPlaying(false);
                setStep((current) => Math.min(trace.length, current + 1));
            } else if (event.key === " " || event.code === "Space") {
                event.preventDefault();
                if (event.repeat || step >= trace.length) return;
                setPlaying((current) => !current);
            }
        }

        window.addEventListener("keydown", handleStepShortcut);
        return () => window.removeEventListener("keydown", handleStepShortcut);
    }, [step, trace.length]);

    function resetAnimation() {
        setPlaying(false);
        setTrace([]);
        setStep(0);
        setCalculationCleared(true);
        setAnimationRun((current) => current + 1);
    }

    function setField(name, value) {
        setFields((current) => ({ ...current, [name]: value }));
        setOperationError("");
        resetAnimation();
    }

    function startAnimation(nextTrace) {
        setTrace([...nextTrace]);
        setStep(0);
        setPlaying(nextTrace.length > 0);
        setCalculationCleared(true);
        setAnimationRun((current) => current + 1);
    }

    function applyDataset(nextValues) {
        const nextTree = createSegmentTree(nextValues);
        const nextTrace = createBottomUpTrace(nextTree, { kind: "build" });
        const nextActivity = {
            kind: "build",
            title: "Array built",
            detail: `${nextValues.length} leaf values replayed through ${nextTrace.length} bottom-up animation steps.`,
            before: nextValues,
            after: nextValues,
            changed: [],
            covered: nextTrace.map((frame) => frame.index),
        };
        setTree(nextTree);
        setDraft(nextValues.join(" "));
        setActivity(nextActivity);
        setBuildError("");
        setOperationError("");
        startAnimation(nextTrace);
    }

    function handleBuild(event) {
        event.preventDefault();
        const parsed = parseSegmentValues(draft);
        if (parsed.error) {
            setBuildError(parsed.error);
            return;
        }
        applyDataset(parsed.values);
    }

    function handleRun(event) {
        event.preventDefault();
        const previous = segmentTreeValues(tree);

        if (operation === "query") {
            if (
                !validIndex(fields.queryLeft, tree.n) ||
                !validIndex(fields.queryRight, tree.n) ||
                Number(fields.queryLeft) > Number(fields.queryRight)
            ) {
                setOperationError(
                    `Choose an inclusive range between 0 and ${tree.n - 1}.`,
                );
                return;
            }

            const left = Number(fields.queryLeft);
            const right = Number(fields.queryRight);
            const result = querySegmentTree(
                tree,
                left,
                right,
                fields.queryType,
            );
            const covered = result.visited.filter((index) => {
                const node = tree.nodes[index];
                return left <= node.left && node.right <= right;
            });
            setActivity({
                kind: "query",
                metric: fields.queryType,
                title: `${METRICS[fields.queryType].label} [${left}, ${right}]`,
                detail: `Result computed by the engine; the replay rebuilds it bottom-up from ${right - left + 1} selected leaf values.`,
                result: result.value,
                range: { left, right },
                before: previous,
                after: previous,
                changed: [],
                covered,
            });
            setViewMetric(fields.queryType);
            setOperationError("");
            startAnimation(
                createBottomUpTrace(tree, {
                    kind: "query",
                    rangeLeft: left,
                    rangeRight: right,
                    metric: fields.queryType,
                }),
            );
            return;
        }

        if (operation === "point") {
            if (
                !validIndex(fields.pointIndex, tree.n) ||
                !validNumber(fields.pointValue)
            ) {
                setOperationError(
                    `Choose an index from 0 to ${tree.n - 1} and enter a valid value.`,
                );
                return;
            }

            const index = Number(fields.pointIndex);
            const nextValue = Number(fields.pointValue);
            const result = pointUpdateSegmentTree(tree, index, nextValue);
            const after = segmentTreeValues(result.tree);
            setTree(result.tree);
            setActivity({
                kind: "point",
                title: `a[${index}]: ${formatValue(previous[index])} → ${formatValue(nextValue)}`,
                detail: `The engine recomputed ${result.visited.length} path nodes; the replay rebuilds from the updated leaf values upward.`,
                range: { left: index, right: index },
                before: previous,
                after,
                changed: [index],
                covered: [result.visited[result.visited.length - 1]],
            });
            setOperationError("");
            startAnimation(
                createBottomUpTrace(result.tree, { kind: "point" }),
            );
            return;
        }

        if (
            !validIndex(fields.rangeLeft, tree.n) ||
            !validIndex(fields.rangeRight, tree.n) ||
            Number(fields.rangeLeft) > Number(fields.rangeRight) ||
            !validNumber(fields.rangeDelta)
        ) {
            setOperationError(
                `Choose a range from 0 to ${tree.n - 1} and enter a valid delta.`,
            );
            return;
        }

        const left = Number(fields.rangeLeft);
        const right = Number(fields.rangeRight);
        const delta = Number(fields.rangeDelta);
        const result = rangeAddSegmentTree(tree, left, right, delta);
        const after = segmentTreeValues(result.tree);
        const changed = Array.from(
            { length: right - left + 1 },
            (_, offset) => left + offset,
        );
        const covered = result.visited.filter((index) => {
            const node = tree.nodes[index];
            return left <= node.left && node.right <= right;
        });
        setTree(result.tree);
        setActivity({
            kind: "lazy",
            title: `Added ${signed(delta)} to a[${left}…${right}]`,
            detail: `The engine changed ${changed.length} array values across ${covered.length} covered tree nodes; the replay rebuilds from the updated leaves upward.`,
            delta,
            range: { left, right },
            before: previous,
            after,
            changed,
            covered,
        });
        setOperationError("");
        startAnimation(createBottomUpTrace(result.tree, { kind: "lazy" }));
    }

    const root = tree.nodes[1];
    const playback = {
        onRestart: () => {
            setStep(0);
            setPlaying(false);
            setCalculationCleared(true);
            setAnimationRun((current) => current + 1);
        },
        onPrevious: () => {
            setPlaying(false);
            setStep((current) => Math.max(0, current - 1));
        },
        onToggle: () => {
            if (step >= trace.length) {
                setStep(0);
                setPlaying(trace.length > 0);
                setCalculationCleared(true);
                setAnimationRun((current) => current + 1);
                return;
            }
            setPlaying((current) => !current);
        },
        onNext: () => {
            setPlaying(false);
            setStep((current) => Math.min(trace.length, current + 1));
        },
    };

    return (
        <div
            className="sg-studio-shell"
            style={{
                "--sec-accent": ACCENT,
                "--sec-accent-soft": `${ACCENT}70`,
                "--sec-accent-bg": `${ACCENT}18`,
            }}
        >
            <div
                id="sg-segment-tree-studio"
                className="cf-tool-card sg-studio"
                data-tool-id="sg-segment-tree-studio"
                data-tool-label="Segment tree studio"
                ref={studioRef}
            >
                <DatasetBuilder
                    draft={draft}
                    setDraft={setDraft}
                    onBuild={handleBuild}
                    error={buildError}
                    size={tree.n}
                    root={root}
                    showAggregates={showCompletedCalculation}
                />

                <div className="sg-workspace">
                    <OperationPanel
                        operation={operation}
                        setOperation={(next) => {
                            setOperation(next);
                            setOperationError("");
                            resetAnimation();
                        }}
                        fields={fields}
                        setField={setField}
                        tree={tree}
                        onRun={handleRun}
                        error={operationError}
                        activity={activity}
                        showResult={showCompletedCalculation}
                        trace={trace}
                        step={step}
                        playing={playing}
                        animationSpeed={animationSpeed}
                        setAnimationSpeed={setAnimationSpeed}
                        playback={playback}
                    />
                    <Viewer
                        tree={tree}
                        metric={viewMetric}
                        setMetric={(metric) => {
                            setViewMetric(metric);
                            setFields((current) => ({
                                ...current,
                                queryType: metric,
                            }));
                            setOperationError("");
                            resetAnimation();
                        }}
                        trace={trace}
                        step={step}
                        activity={activity}
                        preview={preview}
                        calculationCleared={calculationCleared}
                        animationSpeed={animationSpeed}
                    />
                </div>
            </div>
        </div>
    );
}

export default SegmentTreeContent;

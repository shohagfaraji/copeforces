import { useMemo, useState } from "react";
import {
    FaFont,
    FaLink,
    FaProjectDiagram,
    FaSearch,
    FaStream,
} from "react-icons/fa";
import {
    isPalindrome,
    reverseString,
    charFrequency,
    prefixFunction,
    zFunction,
    findOccurrences,
} from "../../utils/stringTools";
import { sections } from "../../data/sections";

const ACCENT = sections.find((s) => s.id === "strings")?.color || "#808080";

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
        id: "st-basic-profile",
        label: "Basic profile",
        icon: FaFont,
    },
    {
        id: "st-prefix-function",
        label: "Prefix function (KMP)",
        icon: FaLink,
    },
    {
        id: "st-z-function",
        label: "Z-function",
        icon: FaStream,
    },
    {
        id: "st-pattern-search",
        label: "Pattern search",
        icon: FaSearch,
    },
    {
        id: "st-trie-visualization",
        label: "Trie visualization",
        icon: FaProjectDiagram,
    },
];

function Row({ label, children }) {
    return (
        <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-2">
            <span className="flex-shrink-0 sm:min-w-[140px]">{label}:</span>
            <span
                className="font-mono-cf break-all"
                style={{ color: "var(--ink)" }}
            >
                {children}
            </span>
        </div>
    );
}

function TextInput({ value, onChange, placeholder }) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 rounded-md border font-mono-cf text-sm outline-none focus:ring-1"
            style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--bg)",
                color: "var(--ink)",
            }}
        />
    );
}

function TextAreaInput({ value, onChange, placeholder }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full p-3 rounded-md border font-mono-cf text-sm outline-none focus:ring-1 resize-y"
            style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--bg)",
                color: "var(--ink)",
            }}
        />
    );
}

function ArrayDisplay({ values }) {
    return (
        <div className="flex flex-wrap gap-1.5 font-mono-cf text-xs">
            {values.map((v, idx) => (
                <span
                    key={idx}
                    className="px-2 py-1 rounded-sm border"
                    style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                >
                    {v}
                </span>
            ))}
        </div>
    );
}

function BasicProfile({ text }) {
    const palindrome = isPalindrome(text);
    const freq = charFrequency(text);

    return (
        <div className="space-y-1 text-sm" style={{ color: "var(--muted)" }}>
            <Row label="Length">{text.length}</Row>
            <Row label="Reversed">{reverseString(text)}</Row>
            <Row label="Palindrome">
                <span
                    style={{ color: palindrome ? "#008000" : "var(--muted)" }}
                >
                    {palindrome ? "yes" : "no"}
                </span>
            </Row>
            <Row label="Distinct characters">{freq.length}</Row>
            <div className="pt-1">
                <span style={{ minWidth: "140px", display: "inline-block" }}>
                    Frequency:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2 font-mono-cf">
                    {freq.map(([ch, count]) => (
                        <div
                            key={ch}
                            className="px-2 py-1.5 rounded-sm border text-xs text-center"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--ink)",
                                minWidth: "44px",
                            }}
                        >
                            <div className="font-bold text-sm">
                                {ch === " " ? "␣" : ch}
                            </div>
                            <div style={{ color: "var(--muted)" }}>
                                ×{count}
                            </div>
                            <div style={{ color: "var(--muted)" }}>
                                {ch.charCodeAt(0)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PrefixFunctionDisplay({ text }) {
    if (text.length === 0) {
        return (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                Paste a string above to compute its prefix function.
            </p>
        );
    }
    const pi = prefixFunction(text);
    return (
        <div className="space-y-2">
            <ArrayDisplay values={text.split("")} />
            <ArrayDisplay values={pi} />
        </div>
    );
}

function ZFunctionDisplay({ text }) {
    if (text.length === 0) {
        return (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                Paste a string above to compute its Z-function.
            </p>
        );
    }
    const z = zFunction(text);
    return (
        <div className="space-y-2">
            <ArrayDisplay values={text.split("")} />
            <ArrayDisplay values={z} />
        </div>
    );
}

function HighlightedText({ text, pattern, positions }) {
    if (positions.length === 0) {
        return <span className="font-mono-cf break-all">{text}</span>;
    }

    const matchSet = new Set();
    for (const start of positions) {
        for (let i = start; i < start + pattern.length; i++) {
            matchSet.add(i);
        }
    }

    return (
        <span className="font-mono-cf break-all">
            {text.split("").map((ch, idx) => (
                <span
                    key={idx}
                    style={
                        matchSet.has(idx)
                            ? {
                                  backgroundColor: "var(--accent-violet)",
                                  color: "#fff",
                                  borderRadius: "2px",
                              }
                            : undefined
                    }
                >
                    {ch}
                </span>
            ))}
        </span>
    );
}

function PatternSearch() {
    const [text, setText] = useState("");
    const [pattern, setPattern] = useState("");

    const positions = text && pattern ? findOccurrences(text, pattern) : [];

    return (
        <div className="space-y-3">
            <TextInput
                value={text}
                onChange={setText}
                placeholder="Text to search in"
            />
            <TextInput
                value={pattern}
                onChange={setPattern}
                placeholder="Pattern to find"
            />

            {text && pattern && (
                <div
                    className="p-3 rounded-md border text-sm leading-relaxed"
                    style={{ borderColor: "var(--line)" }}
                >
                    <HighlightedText
                        text={text}
                        pattern={pattern}
                        positions={positions}
                    />
                </div>
            )}

            <div
                className="p-3 rounded-md border font-mono-cf text-sm"
                style={{ borderColor: "var(--line)" }}
            >
                {!text || !pattern ? (
                    <span style={{ color: "var(--muted)" }}>
                        Enter both text and pattern.
                    </span>
                ) : positions.length === 0 ? (
                    <span style={{ color: "var(--muted)" }}>
                        No occurrences found.
                    </span>
                ) : (
                    <span>
                        <span style={{ color: "var(--muted)" }}>
                            Found {positions.length} occurrence(s) at
                            index:{" "}
                        </span>
                        <span className="font-bold">
                            {positions.join(", ")}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
}

const DEFAULT_TRIE_WORDS = "code\ncoder\ncope\nforce\nforces";
const MAX_TRIE_WORDS = 32;
const MAX_TRIE_NODES = 140;

function parseTrieWords(value) {
    return value
        .split(/[\s,]+/)
        .map((word) => word.trim())
        .filter(Boolean)
        .slice(0, MAX_TRIE_WORDS);
}

function createTrie(words) {
    const root = {
        id: "root",
        char: "root",
        depth: 0,
        count: 0,
        terminalWords: [],
        children: new Map(),
    };
    const nodes = [root];
    const edges = [];
    let truncated = false;

    for (const word of words) {
        let current = root;
        let wordComplete = true;
        current.count += 1;

        for (const char of Array.from(word)) {
            if (!current.children.has(char)) {
                if (nodes.length >= MAX_TRIE_NODES) {
                    truncated = true;
                    wordComplete = false;
                    break;
                }

                const node = {
                    id: `node-${nodes.length}`,
                    char,
                    depth: current.depth + 1,
                    count: 0,
                    terminalWords: [],
                    children: new Map(),
                };

                current.children.set(char, node);
                nodes.push(node);
                edges.push({ from: current, to: node, label: char });
            }

            current = current.children.get(char);
            current.count += 1;
        }

        if (wordComplete) {
            current.terminalWords.push(word);
        }
    }

    return {
        root,
        nodes,
        edges,
        truncated,
        terminalCount: nodes.filter((node) => node.terminalWords.length).length,
        height: nodes.reduce((max, node) => Math.max(max, node.depth), 0),
    };
}

function layoutTrie(root) {
    const positions = new Map();
    const xGap = 78;
    const yGap = 82;
    let leafIndex = 0;
    let maxDepth = 0;

    function orderedChildren(node) {
        return Array.from(node.children.values()).sort((a, b) =>
            a.char.localeCompare(b.char),
        );
    }

    function walk(node) {
        const children = orderedChildren(node);
        maxDepth = Math.max(maxDepth, node.depth);

        if (children.length === 0) {
            const position = {
                x: leafIndex * xGap + 48,
                y: node.depth * yGap + 40,
            };
            leafIndex += 1;
            positions.set(node.id, position);
            return position.x;
        }

        const childXs = children.map(walk);
        const x = (childXs[0] + childXs[childXs.length - 1]) / 2;
        positions.set(node.id, { x, y: node.depth * yGap + 40 });
        return x;
    }

    walk(root);

    return {
        positions,
        width: Math.max(420, leafIndex * xGap + 96),
        height: Math.max(220, (maxDepth + 1) * yGap + 72),
    };
}

function TrieMetric({ label, value }) {
    return (
        <div
            className="rounded-md border px-3 py-2"
            style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--panel)",
            }}
        >
            <div
                className="font-mono-cf text-xs uppercase"
                style={{ color: "var(--muted)" }}
            >
                {label}
            </div>
            <div className="font-mono-cf text-base font-bold">{value}</div>
        </div>
    );
}

function TrieNode({ node, position }) {
    const isRoot = node.id === "root";
    const isTerminal = node.terminalWords.length > 0;
    const variant = isRoot ? "root" : isTerminal ? "terminal" : "internal";
    const fillByVariant = {
        root: "url(#trie-root-gradient)",
        internal: "url(#trie-internal-gradient)",
        terminal: "url(#trie-terminal-gradient)",
    };
    const strokeByVariant = {
        root: "#1d4ed8",
        internal: "#047857",
        terminal: "#7e22ce",
    };
    const textByVariant = {
        root: "#1e3a8a",
        internal: "#064e3b",
        terminal: "#581c87",
    };

    return (
        <g transform={`translate(${position.x}, ${position.y})`}>
            <circle
                r={isRoot ? 19 : 17}
                fill={fillByVariant[variant]}
                stroke={strokeByVariant[variant]}
                strokeWidth={isTerminal || isRoot ? 2.5 : 1.8}
                filter="url(#trie-node-shadow)"
            />
            <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isRoot ? 10 : 13}
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                fill={textByVariant[variant]}
            >
                {isRoot ? "root" : node.char}
            </text>
            {isTerminal && (
                <text
                    textAnchor="middle"
                    y="35"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                    fill="#7e22ce"
                >
                    end
                </text>
            )}
        </g>
    );
}

function TrieEdge({ edge, from, to }) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const fromX = from.x + (dx / length) * 22;
    const fromY = from.y + (dy / length) * 22;
    const toX = to.x - (dx / length) * 21;
    const toY = to.y - (dy / length) * 21;
    const isFromTerminal = edge.from.terminalWords.length > 0;
    const labelRatio = isFromTerminal ? 0.9 : 0.5;
    const labelX = fromX + (toX - fromX) * labelRatio;
    const labelY =
        fromY + (toY - fromY) * labelRatio + (isFromTerminal ? 0 : -3);
    const labelWidth = Math.max(26, Array.from(edge.label).length * 10 + 12);
    const labelHeight = isFromTerminal ? 18 : 20;

    return (
        <g>
            <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke="#64748b"
                strokeOpacity="0.62"
                strokeWidth="1.65"
            />
            <rect
                x={labelX - labelWidth / 2}
                y={labelY - labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                rx="6"
                fill="var(--panel)"
                stroke="var(--line-strong)"
                strokeWidth="1"
            />
            <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink)"
            >
                {edge.label}
            </text>
        </g>
    );
}

function TrieVisualization() {
    const [input, setInput] = useState(DEFAULT_TRIE_WORDS);
    const words = useMemo(() => parseTrieWords(input), [input]);
    const trie = useMemo(() => createTrie(words), [words]);
    const layout = useMemo(() => layoutTrie(trie.root), [trie]);
    const terminalWords = trie.nodes
        .flatMap((node) => node.terminalWords)
        .slice(0, MAX_TRIE_WORDS);

    return (
        <div className="space-y-4">
            <div className="cf-trie-layout">
                <div className="space-y-3">
                    <TextAreaInput
                        value={input}
                        onChange={setInput}
                        placeholder="Enter words separated by spaces, commas, or new lines"
                    />
                    <div className="cf-trie-metrics">
                        <TrieMetric label="Words" value={words.length} />
                        <TrieMetric label="Nodes" value={trie.nodes.length} />
                        <TrieMetric label="Height" value={trie.height} />
                        <TrieMetric
                            label="Terminals"
                            value={trie.terminalCount}
                        />
                    </div>
                    {(words.length >= MAX_TRIE_WORDS || trie.truncated) && (
                        <p
                            className="rounded-md border p-2 text-sm"
                            style={{
                                borderColor: "var(--line)",
                                color: "var(--muted)",
                            }}
                        >
                            Showing the first {MAX_TRIE_WORDS} words and up to{" "}
                            {MAX_TRIE_NODES} trie nodes to keep the visual fast.
                        </p>
                    )}
                </div>

                <div
                    className="cf-trie-visual-panel"
                    style={{
                        borderColor: "var(--line)",
                        backgroundColor: "var(--bg)",
                    }}
                >
                    <div className="cf-trie-scroll">
                        <svg
                            className="cf-trie-svg"
                            style={{
                                "--trie-width": `${layout.width}px`,
                                "--trie-height": `${layout.height}px`,
                            }}
                            width={layout.width}
                            height={layout.height}
                            viewBox={`0 0 ${layout.width} ${layout.height}`}
                            role="img"
                            aria-label="Trie visualization"
                        >
                            <defs>
                                <linearGradient
                                    id="trie-root-gradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#eff6ff" />
                                    <stop offset="100%" stopColor="#93c5fd" />
                                </linearGradient>
                                <linearGradient
                                    id="trie-internal-gradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#d1fae5" />
                                    <stop offset="100%" stopColor="#5eead4" />
                                </linearGradient>
                                <linearGradient
                                    id="trie-terminal-gradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#fae8ff" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                                <filter
                                    id="trie-node-shadow"
                                    x="-35%"
                                    y="-35%"
                                    width="170%"
                                    height="170%"
                                >
                                    <feDropShadow
                                        dx="0"
                                        dy="3"
                                        stdDeviation="3"
                                        floodColor="#0f172a"
                                        floodOpacity="0.18"
                                    />
                                </filter>
                            </defs>
                            {trie.edges.map((edge) => (
                                <TrieEdge
                                    key={`${edge.from.id}-${edge.to.id}`}
                                    edge={edge}
                                    from={layout.positions.get(edge.from.id)}
                                    to={layout.positions.get(edge.to.id)}
                                />
                            ))}
                            {trie.nodes.map((node) => (
                                <TrieNode
                                    key={node.id}
                                    node={node}
                                    position={layout.positions.get(node.id)}
                                />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

            <div
                className="rounded-md border p-3 text-sm"
                style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
                <span className="font-semibold" style={{ color: "var(--ink)" }}>
                    Terminal words:{" "}
                </span>
                {terminalWords.length ? (
                    <span className="font-mono-cf break-all">
                        {terminalWords.join(", ")}
                    </span>
                ) : (
                    "Enter words to build a trie."
                )}
            </div>
        </div>
    );
}

function StringsContent() {
    const [text, setText] = useState("");

    const hasInput = text.trim().length > 0;

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
                    id="st-basic-profile"
                    icon={FaFont}
                    label="Basic profile"
                >
                    <TextInput
                        value={text}
                        onChange={setText}
                        placeholder="Paste a string, e.g. racecar"
                    />
                    {hasInput && (
                        <div className="mt-4">
                            <BasicProfile text={text} />
                        </div>
                    )}
                </ToolBlock>

                {hasInput && (
                    <>
                        <ToolBlock
                            id="st-prefix-function"
                            icon={FaLink}
                            label="Prefix function (KMP)"
                        >
                            <PrefixFunctionDisplay text={text} />
                        </ToolBlock>

                        <ToolBlock
                            id="st-z-function"
                            icon={FaStream}
                            label="Z-function"
                        >
                            <ZFunctionDisplay text={text} />
                        </ToolBlock>
                    </>
                )}

                <ToolBlock
                    id="st-pattern-search"
                    icon={FaSearch}
                    label="Pattern search"
                >
                    <PatternSearch />
                </ToolBlock>

                <ToolBlock
                    id="st-trie-visualization"
                    icon={FaProjectDiagram}
                    label="Trie visualization"
                    badge="New"
                    className="cf-tool-wide"
                >
                    <TrieVisualization />
                </ToolBlock>
            </div>
        </div>
    );
}

export default StringsContent;

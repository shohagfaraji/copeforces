import { useState } from "react";
import { FaFont, FaSearch, FaLink, FaStream } from "react-icons/fa";
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

function ToolBlock({ id, label, icon: Icon, children }) {
    return (
        <div
            id={id}
            className="cf-tool-card rounded-xl border p-4 h-full"
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
            </div>
        </div>
    );
}

export default StringsContent;

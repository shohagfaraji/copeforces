import { useState } from "react";
import {
    isPalindrome,
    reverseString,
    charFrequency,
    polynomialHash,
    prefixFunction,
    zFunction,
    findOccurrences,
} from "../../utils/stringTools";

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

// function HashCalculator({ text }) {
//     const [base, setBase] = useState("31");
//     const [mod, setMod] = useState("1000000007");

//     const b = Number(base);
//     const m = Number(mod);
//     const valid =
//         text.length > 0 &&
//         Number.isInteger(b) &&
//         Number.isInteger(m) &&
//         b > 0 &&
//         m > 0;
//     const hash = valid ? polynomialHash(text, b, m) : null;

//     return (
//         <div>
//             <div className="flex gap-3 flex-wrap mb-3">
//                 <label
//                     className="text-xs font-mono-cf"
//                     style={{ color: "var(--muted)" }}
//                 >
//                     base
//                     <input
//                         type="text"
//                         inputMode="numeric"
//                         value={base}
//                         onChange={(e) => setBase(e.target.value)}
//                         className="block mt-1 w-32 p-2 rounded-md border font-mono-cf text-sm outline-none focus:ring-1"
//                         style={{
//                             borderColor: "var(--line)",
//                             backgroundColor: "var(--bg)",
//                             color: "var(--ink)",
//                         }}
//                     />
//                 </label>
//                 <label
//                     className="text-xs font-mono-cf"
//                     style={{ color: "var(--muted)" }}
//                 >
//                     mod
//                     <input
//                         type="text"
//                         inputMode="numeric"
//                         value={mod}
//                         onChange={(e) => setMod(e.target.value)}
//                         className="block mt-1 w-40 p-2 rounded-md border font-mono-cf text-sm outline-none focus:ring-1"
//                         style={{
//                             borderColor: "var(--line)",
//                             backgroundColor: "var(--bg)",
//                             color: "var(--ink)",
//                         }}
//                     />
//                 </label>
//             </div>
//             <div
//                 className="p-3 rounded-md border font-mono-cf text-sm"
//                 style={{ borderColor: "var(--line)" }}
//             >
//                 {hash !== null ? (
//                     <span>
//                         <span style={{ color: "var(--muted)" }}>hash = </span>
//                         <span className="font-bold">{hash}</span>
//                     </span>
//                 ) : (
//                     <span style={{ color: "var(--muted)" }}>
//                         Paste a string above to compute its hash.
//                     </span>
//                 )}
//             </div>
//         </div>
//     );
// }

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

    return (
        <div>
            <ToolBlock label="Basic profile">
                <TextInput
                    value={text}
                    onChange={setText}
                    placeholder="Paste a string, e.g. racecar"
                />
                {text.length > 0 && (
                    <div className="mt-4">
                        <BasicProfile text={text} />
                    </div>
                )}
            </ToolBlock>

            {/* <ToolBlock label="Polynomial hash">
                <HashCalculator text={text} />
            </ToolBlock> */}

            <ToolBlock label="Prefix function (KMP)">
                <PrefixFunctionDisplay text={text} />
            </ToolBlock>

            <ToolBlock label="Z-function">
                <ZFunctionDisplay text={text} />
            </ToolBlock>

            <ToolBlock label="Pattern search">
                <PatternSearch />
            </ToolBlock>
        </div>
    );
}

export default StringsContent;

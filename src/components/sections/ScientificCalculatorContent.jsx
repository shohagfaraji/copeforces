import { useMemo, useRef, useState } from "react";
import {
    FaClock,
    FaKeyboard,
} from "react-icons/fa";
import {
    evaluateScientificExpression,
    parseScientificExpression,
} from "../../utils/scientificCalculator";

const KEY_GROUPS = {
    scientific: [
        { label: "x/y", value: "/", tone: "function", title: "Natural fraction" },
        { label: "x²", value: "^2", tone: "function" },
        { label: "xʸ", value: "^()", caretBack: 1, tone: "function" },
        { label: "√x", value: "sqrt()", caretBack: 1, tone: "function" },
        { label: "³√x", value: "cbrt()", caretBack: 1, tone: "function" },
        { label: "ⁿ√x", value: "root(,)", caretBack: 2, tone: "function", title: "root(index, value)" },
        { label: "sin", value: "sin()", caretBack: 1, tone: "function" },
        { label: "cos", value: "cos()", caretBack: 1, tone: "function" },
        { label: "tan", value: "tan()", caretBack: 1, tone: "function" },
        { label: "sin⁻¹", value: "asin()", caretBack: 1, tone: "function" },
        { label: "cos⁻¹", value: "acos()", caretBack: 1, tone: "function" },
        { label: "tan⁻¹", value: "atan()", caretBack: 1, tone: "function" },
        { label: "log", value: "log()", caretBack: 1, tone: "function" },
        { label: "ln", value: "ln()", caretBack: 1, tone: "function" },
        { label: "eˣ", value: "exp()", caretBack: 1, tone: "function" },
        { label: "π", value: "pi", tone: "function" },
        { label: "e", value: "e", tone: "function" },
        { label: "x!", value: "!", tone: "function" },
    ],
    advanced: [
        { label: "nCr", value: "ncr(,)", caretBack: 2, tone: "function" },
        { label: "nPr", value: "npr(,)", caretBack: 2, tone: "function" },
        { label: "gcd", value: "gcd(,)", caretBack: 2, tone: "function" },
        { label: "lcm", value: "lcm(,)", caretBack: 2, tone: "function" },
        { label: "|x|", value: "abs()", caretBack: 1, tone: "function" },
        { label: "floor", value: "floor()", caretBack: 1, tone: "function" },
        { label: "ceil", value: "ceil()", caretBack: 1, tone: "function" },
        { label: "round", value: "round()", caretBack: 1, tone: "function" },
        { label: "sinh", value: "sinh()", caretBack: 1, tone: "function" },
        { label: "cosh", value: "cosh()", caretBack: 1, tone: "function" },
        { label: "tanh", value: "tanh()", caretBack: 1, tone: "function" },
        { label: "log₂", value: "log2()", caretBack: 1, tone: "function" },
        { label: "logₓ", value: "log(,)", caretBack: 2, tone: "function", title: "log(base, value)" },
    ],
};

const CALCULATOR_KEYS = [
    ...KEY_GROUPS.scientific,
    ...KEY_GROUPS.advanced,
    { label: "ANS", value: "ans", tone: "function" },
];

const ACTION_KEYS = [
    { label: "DEL", action: "delete", tone: "delete" },
    { label: "AC", action: "clear", tone: "clear" },
    { label: "=", action: "evaluate", tone: "equals" },
];

const PRECEDENCE = { "+": 10, "-": 10, "*": 20, "/": 20, "%": 20, "^": 30 };

function additiveParts(node, parts = []) {
    if (node.type === "binary" && (node.operator === "+" || node.operator === "-")) {
        additiveParts(node.left, parts);
        parts.push({ type: "operator", value: node.operator });
        parts.push({ type: "term", node: node.right });
    } else {
        parts.push({ type: "term", node });
    }
    return parts;
}

function MathFence({ side }) {
    const path = side === "left"
        ? "M 8 2 C 3 22 3 78 8 98"
        : "M 2 2 C 7 22 7 78 2 98";
    return (
        <span className="sc-math-fence" aria-hidden="true">
            <svg
                viewBox="0 0 10 100"
                preserveAspectRatio="none"
                focusable="false"
            >
                <path d={path} vectorEffect="non-scaling-stroke" />
            </svg>
        </span>
    );
}

function MathNode({ node, parentPrecedence = 0 }) {
    if (!node) return <span className="sc-placeholder">□</span>;
    if (node.type === "number") return <span>{node.value}</span>;
    if (node.type === "constant") return <span>{node.name === "pi" ? "π" : node.name === "ans" ? "Ans" : "e"}</span>;
    if (node.type === "group") return <span className="sc-math-group"><MathFence side="left" /><span className="sc-math-group-content"><MathNode node={node.expression} /></span><MathFence side="right" /></span>;
    if (node.type === "unary") return <span>{node.operator}<MathNode node={node.argument} parentPrecedence={25} /></span>;
    if (node.type === "postfix") return <span><MathNode node={node.argument} parentPrecedence={40} />!</span>;

    if (node.type === "function") {
        const arg = node.args[0];
        if (node.name === "sqrt" || node.name === "cbrt") {
            return (
                <span className="sc-root">
                    {node.name === "cbrt" && <sup className="sc-root-index">3</sup>}
                    <span className="sc-radical">√</span><span className="sc-radicand"><MathNode node={arg} /></span>
                </span>
            );
        }
        if (node.name === "root") {
            return (
                <span className="sc-root">
                    <sup className="sc-root-index"><MathNode node={node.args[0]} /></sup>
                    <span className="sc-radical">√</span><span className="sc-radicand"><MathNode node={node.args[1]} /></span>
                </span>
            );
        }
        if (node.name === "abs") return <span>|<MathNode node={arg} />|</span>;
        if (node.name === "log" && node.args.length === 2) {
            return (
                <span className="sc-function">
                    <span className="sc-log-name">log<sub><MathNode node={node.args[0]} /></sub></span>
                    <MathFence side="left" /><span className="sc-math-group-content"><MathNode node={node.args[1]} /></span><MathFence side="right" />
                </span>
            );
        }
        if (node.name === "log2") {
            return (
                <span className="sc-function">
                    <span className="sc-log-name">log<sub>2</sub></span>
                    <MathFence side="left" /><span className="sc-math-group-content"><MathNode node={arg} /></span><MathFence side="right" />
                </span>
            );
        }
        return (
            <span className="sc-function"><span className="sc-function-name">{node.name}</span><MathFence side="left" /><span className="sc-math-group-content">{node.args.map((item, index) => <span key={index}>{index > 0 && <span>, </span>}<MathNode node={item} /></span>)}</span><MathFence side="right" /></span>
        );
    }

    if (node.type === "binary") {
        const precedence = PRECEDENCE[node.operator];
        let content;
        if (node.operator === "+" || node.operator === "-") {
            content = (
                <span className="sc-additive">
                    {additiveParts(node).map((part, index) =>
                        part.type === "operator" ? (
                            <span className="sc-additive-operator" key={index}>{part.value === "-" ? "−" : "+"}</span>
                        ) : (
                            <span className="sc-additive-term" key={index}><MathNode node={part.node} parentPrecedence={precedence + 1} /></span>
                        ),
                    )}
                </span>
            );
        } else if (node.operator === "/") {
            content = (
                <span className="sc-fraction">
                    <span className="sc-numerator"><MathNode node={node.left} /></span>
                    <span className="sc-denominator"><MathNode node={node.right} /></span>
                </span>
            );
        } else if (node.operator === "^") {
            content = <span><MathNode node={node.left} parentPrecedence={precedence} /><sup className="sc-power"><MathNode node={node.right} /></sup></span>;
        } else {
            const symbol = node.operator === "*" ? (node.implicit ? "" : " × ") : node.operator === "%" ? " mod " : ` ${node.operator} `;
            content = <span><MathNode node={node.left} parentPrecedence={precedence} />{symbol}<MathNode node={node.right} parentPrecedence={precedence + 1} /></span>;
        }
        return precedence < parentPrecedence ? <span className="sc-math-group"><MathFence side="left" /><span className="sc-math-group-content">{content}</span><MathFence side="right" /></span> : content;
    }

    return null;
}

function CopyableValue({ value, children, className = "" }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopied(false);
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            className={`sc-copyable-value ${className}`}
            data-copy-hint={copied ? "Copied" : "Click to copy"}
            aria-label={copied ? "Copied" : "Copy value"}
        >
            {children}
        </button>
    );
}

function ScientificCalculatorContent() {
    const [expression, setExpression] = useState("sqrt(2) + 1/3");
    const [precision, setPrecision] = useState(32);
    const [answer, setAnswer] = useState("0");
    const [expressionAnswer, setExpressionAnswer] = useState("0");
    const [history, setHistory] = useState([]);
    const [showError, setShowError] = useState(false);
    const inputRef = useRef(null);
    const undoStackRef = useRef([]);
    const redoStackRef = useRef([]);

    const parsed = useMemo(() => parseScientificExpression(expression), [expression]);
    const calculation = useMemo(
        () => evaluateScientificExpression(expression, { angleMode: "rad", precision, ans: expressionAnswer }),
        [expression, precision, expressionAnswer],
    );

    const recordExpression = (next) => {
        if (next === expression) return false;
        undoStackRef.current.push(expression);
        if (undoStackRef.current.length > 100) undoStackRef.current.shift();
        redoStackRef.current = [];
        setExpression(next);
        setExpressionAnswer(answer);
        setShowError(false);
        return true;
    };

    const focusAtEnd = (value) => {
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(value.length, value.length);
        });
    };

    const undoExpression = () => {
        const previous = undoStackRef.current.pop();
        if (previous === undefined) return;
        redoStackRef.current.push(expression);
        setExpression(previous);
        setExpressionAnswer(answer);
        setShowError(false);
        focusAtEnd(previous);
    };

    const redoExpression = () => {
        const next = redoStackRef.current.pop();
        if (next === undefined) return;
        undoStackRef.current.push(expression);
        if (undoStackRef.current.length > 100) undoStackRef.current.shift();
        setExpression(next);
        setExpressionAnswer(answer);
        setShowError(false);
        focusAtEnd(next);
    };

    const replaceSelection = (value, caretBack = 0) => {
        const input = inputRef.current;
        const start = input?.selectionStart ?? expression.length;
        const end = input?.selectionEnd ?? expression.length;
        const next = expression.slice(0, start) + value + expression.slice(end);
        const caret = start + value.length - caretBack;
        recordExpression(next);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(caret, caret);
        });
    };

    const deleteSelection = () => {
        const input = inputRef.current;
        const start = input?.selectionStart ?? expression.length;
        const end = input?.selectionEnd ?? expression.length;
        if (start !== end) {
            const next = expression.slice(0, start) + expression.slice(end);
            recordExpression(next);
            requestAnimationFrame(() => inputRef.current?.setSelectionRange(start, start));
        } else if (start > 0) {
            const next = expression.slice(0, start - 1) + expression.slice(end);
            recordExpression(next);
            requestAnimationFrame(() => inputRef.current?.setSelectionRange(start - 1, start - 1));
        }
        inputRef.current?.focus();
        setShowError(false);
    };

    const evaluate = () => {
        setShowError(true);
        if (calculation.error) return;
        setAnswer(calculation.value);
        setHistory((current) => [
            { expression, result: calculation.formatted },
            ...current.filter((item) => item.expression !== expression).slice(0, 7),
        ]);
    };

    const handleCalculatorKey = (key) => {
        if (key.action === "evaluate") {
            evaluate();
        } else if (key.action === "delete") {
            deleteSelection();
        } else if (key.action === "clear") {
            recordExpression("");
            inputRef.current?.focus();
        } else {
            replaceSelection(key.value, key.caretBack);
        }
    };

    const handleKeyDown = (event) => {
        const commandKey = event.ctrlKey || event.metaKey;
        if (commandKey && event.key.toLowerCase() === "z") {
            event.preventDefault();
            if (event.shiftKey) redoExpression();
            else undoExpression();
            return;
        }
        if (commandKey && event.key.toLowerCase() === "y") {
            event.preventDefault();
            redoExpression();
            return;
        }
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            evaluate();
        }
        if (event.key === "Escape") {
            recordExpression("");
        }
    };

    const resultText = calculation.error ? "—" : calculation.formatted;

    return (
        <div className="sc-shell">
            <div
                id="cal-scientific-calculator"
                className="sc-calculator"
                data-tool-id="cal-scientific-calculator"
                data-tool-label="Scientific calculator"
            >
                <div className="sc-display" onClick={() => inputRef.current?.focus()} role="presentation">
                    <div className={`sc-natural ${expression.trim() === "" ? "is-empty" : ""}`} aria-label="Typeset expression">
                        {expression.trim() === "" ? <span className="sc-empty">Enter a calculation</span> : parsed.ast ? <MathNode node={parsed.ast} /> : <span className="sc-source-fallback">{expression}</span>}
                    </div>
                    <textarea
                        ref={inputRef}
                        value={expression}
                        onChange={(event) => recordExpression(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        spellCheck={false}
                        autoCapitalize="none"
                        aria-label="Calculator expression"
                        placeholder="Example: root(3, 10^100) + sin(pi/6)"
                    />
                </div>

                <div className={`sc-result ${showError && calculation.error ? "is-error" : ""}`}>
                    <div className="sc-result-heading">
                        <span>{calculation.exact ? "Exact result" : "Result"}</span>
                        <div className="sc-result-actions">
                            <label className="sc-precision">Precision
                                <select value={precision} onChange={(event) => setPrecision(Number(event.target.value))}>
                                    {[0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                    {showError && calculation.error ? (
                        <div className="sc-error" role="alert">{calculation.error}</div>
                    ) : (
                        <>
                            <CopyableValue value={resultText} className="sc-result-value">
                                <span className="sc-result-value-text">{resultText}</span>
                            </CopyableValue>
                            {!calculation.error && (
                                <div className="sc-result-meta">
                                    {calculation.digits && <span>{calculation.digits.toLocaleString()} integer digits</span>}
                                    <CopyableValue value={calculation.scientific} className="sc-scientific-value">
                                        {calculation.scientific}
                                    </CopyableValue>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="sc-keypad">
                    <div className="sc-keypad-actions">
                        {ACTION_KEYS.map((key) => (
                            <button
                                type="button"
                                key={key.label}
                                className={`is-${key.tone}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleCalculatorKey(key)}
                            >{key.label}</button>
                        ))}
                    </div>
                    <div className="sc-keypad-grid">
                        {CALCULATOR_KEYS.map((key, index) => (
                            <button
                                type="button"
                                key={`${key.label}-${index}`}
                                className={key.tone ? `is-${key.tone}` : ""}
                                title={key.title || key.label}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleCalculatorKey(key)}
                            >{key.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="sc-help-grid">
                <div className="sc-guide-card">
                    <h3><FaKeyboard /> Input guide</h3>
                    <div className="sc-guide-items">
                        <span><code>1/2</code> fraction</span><span><code>sqrt(x)</code> square root</span>
                        <span><code>root(n,x)</code> nth root</span><span><code>x^y</code> power</span>
                        <span><code>100!</code> factorial</span><span><code>2pi</code> implicit multiply</span>
                    </div>
                </div>
                <div className="sc-guide-card">
                    <h3><FaClock /> Recent calculations</h3>
                    {history.length === 0 ? <p className="sc-history-empty">Press Enter or = to save a calculation here.</p> : (
                        <div className="sc-history-list">{history.map((item, index) => (
                            <button type="button" key={`${item.expression}-${index}`} onClick={() => { recordExpression(item.expression); focusAtEnd(item.expression); }}>
                                <span>{item.expression}</span><strong>= {item.result}</strong>
                            </button>
                        ))}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ScientificCalculatorContent;

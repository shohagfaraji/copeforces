import { useMemo, useRef } from "react";

function useLineNumbers(value) {
    return useMemo(() => {
        const lineCount = String(value ?? "").split("\n").length;
        return {
            gutterWidth: `${Math.max(2, String(lineCount).length) + 2}ch`,
            numbers: Array.from({ length: lineCount }, (_, index) => index + 1),
        };
    }, [value]);
}

function LineNumberGutter({ numbers, gutterWidth, innerRef }) {
    return (
        <div
            className="cf-line-number-gutter"
            style={{ width: gutterWidth }}
            aria-hidden="true"
        >
            <div ref={innerRef} className="cf-line-number-gutter-inner">
                {numbers.map((number) => (
                    <div key={number}>{number}</div>
                ))}
            </div>
        </div>
    );
}

export function LineNumberedTextarea({
    value,
    className = "",
    containerClassName = "",
    style,
    onScroll,
    ...props
}) {
    const gutterInnerRef = useRef(null);
    const { gutterWidth, numbers } = useLineNumbers(value);

    function handleScroll(event) {
        if (gutterInnerRef.current) {
            gutterInnerRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
        }
        onScroll?.(event);
    }

    return (
        <div
            className={`cf-line-numbered-editor ${containerClassName}`}
            style={{ "--line-number-gutter-width": gutterWidth }}
        >
            <LineNumberGutter
                numbers={numbers}
                gutterWidth={gutterWidth}
                innerRef={gutterInnerRef}
            />
            <textarea
                {...props}
                value={value}
                wrap="off"
                onScroll={handleScroll}
                className={`cf-line-numbered-textarea ${className}`}
                style={style}
            />
        </div>
    );
}

export function LineNumberedText({ value, className = "", style }) {
    const gutterInnerRef = useRef(null);
    const { gutterWidth, numbers } = useLineNumbers(value);

    function handleScroll(event) {
        if (gutterInnerRef.current) {
            gutterInnerRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
        }
    }

    return (
        <div
            className={`cf-line-numbered-output ${className}`}
            style={{ ...style, "--line-number-gutter-width": gutterWidth }}
            onScroll={handleScroll}
        >
            <LineNumberGutter
                numbers={numbers}
                gutterWidth={gutterWidth}
                innerRef={gutterInnerRef}
            />
            <pre className="cf-line-numbered-pre">
                <code>{String(value ?? "")}</code>
            </pre>
        </div>
    );
}

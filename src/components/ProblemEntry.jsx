function ProblemEntry({ name, url, source, rating, note }) {
    return (
        <div
            className="cf-problem-entry rounded-lg border px-3 py-3"
            style={{ borderColor: "var(--line)" }}
        >
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                    style={{ color: "var(--accent-blue)" }}
                >
                    {name}
                </a>
                <div
                    className="flex items-center gap-2 font-mono-cf text-xs flex-wrap"
                    style={{ color: "var(--muted)" }}
                >
                    <span>{source}</span>
                    {rating && (
                        <span
                            className="px-1.5 py-0.5 rounded-sm border"
                            style={{ borderColor: "var(--line)" }}
                        >
                            {rating}
                        </span>
                    )}
                </div>
            </div>
            {note && (
                <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
                    {note}
                </p>
            )}
        </div>
    );
}

export default ProblemEntry;

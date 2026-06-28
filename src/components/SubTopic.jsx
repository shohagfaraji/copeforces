function SubTopic({ title, children }) {
    return (
        <div className="mb-8">
            <h3
                className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--muted)" }}
            >
                {title}
            </h3>
            <div>{children}</div>
        </div>
    );
}

export default SubTopic;

function SubTopic({ title, children }) {
    return (
        <div className="cf-subtopic mb-8">
            <h3
                className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--muted)" }}
            >
                {title}
            </h3>
            <div>{children}</div>
        </div>
    );
}

export default SubTopic;

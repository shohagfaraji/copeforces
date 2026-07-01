function Section({ id, title, tag, color, children }) {
    return (
        <section
            id={id}
            className="py-5 px-4 sm:py-6 sm:px-6 lg:py-7 lg:px-10 border-b scroll-mt-4"
            style={{ borderColor: "var(--line)" }}
        >
            <div className="mb-3">
                <div className="flex items-baseline gap-2.5 sm:gap-3">
                    <span
                        className="font-mono-cf font-bold text-2xl sm:text-3xl leading-none"
                        style={{ color }}
                    >
                        {tag}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                        {title}
                    </h2>
                </div>
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export default Section;

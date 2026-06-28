function Section({ id, title, tag, color, blurb, children }) {
    return (
        <section
            id={id}
            className="py-8 px-4 sm:py-10 sm:px-6 lg:py-12 lg:px-10 border-b scroll-mt-4"
            style={{ borderColor: "var(--line)" }}
        >
            <div
                className="sticky top-0 py-3 -mt-3 mb-6 backdrop-blur"
                style={{ backgroundColor: "var(--bg)", opacity: 0.97 }}
            >
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
                <p
                    className="text-sm mt-1 ml-[3px]"
                    style={{ color: "var(--muted)" }}
                >
                    {blurb}
                </p>
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export default Section;

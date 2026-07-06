function Section({ id, title, tag, color, children }) {
    return (
        <section
            id={id}
            className="px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 scroll-mt-4"
            style={{
                "--sec-accent": color,
                "--sec-accent-soft": `${color}66`,
                "--sec-accent-bg": `${color}12`,
            }}
        >
            <div className="cf-section rounded-xl border p-4 sm:p-5 lg:p-6">
                <div className="cf-section-header flex items-center gap-3 mb-5 pb-4 border-b">
                    <span className="cf-section-tag font-mono-cf font-bold text-sm sm:text-base leading-none px-2.5 py-1.5 rounded-md border flex-shrink-0">
                        {tag}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="space-y-5">{children}</div>
            </div>
        </section>
    );
}

export default Section;

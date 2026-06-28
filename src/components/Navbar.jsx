function Navbar({ theme, toggleTheme }) {
    return (
        <header
            className="h-14 flex items-center justify-between px-5 border-b flex-shrink-0"
            style={{ borderColor: "var(--line)" }}
        >
            <div className="flex items-baseline gap-2">
                <span
                    className="font-mono-cf font-bold text-lg"
                    style={{ color: "var(--accent-violet)" }}
                >
                    {"<"}/{">"}
                </span>
                <span className="font-semibold text-base tracking-tight">
                    copeforces
                </span>
            </div>
            <button
                onClick={toggleTheme}
                className="font-mono-cf text-xs px-3 py-1.5 rounded border transition-colors hover:opacity-70"
                style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
                {theme === "dark" ? "[ light ]" : "[ dark ]"}
            </button>
        </header>
    );
}

export default Navbar;

import logoLight from "../assets/logo/logo-light.webp";
import logoDark from "../assets/logo/logo-dark.webp";

function Navbar({ theme, toggleTheme, collapsed, onToggleCollapse }) {
    return (
        <header
            className="hidden lg:flex h-14 items-center border-b flex-shrink-0 relative"
            style={{ borderColor: "var(--line)" }}
        >
            <div
                className={`flex items-center h-full flex-1 ${
                    collapsed ? "justify-center" : "px-4 gap-2.5"
                }`}
            >
                <button
                    onClick={toggleTheme}
                    aria-label={
                        theme === "dark"
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                    title={
                        theme === "dark"
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                    className="flex-shrink-0 rounded-lg overflow-hidden hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2"
                    style={{
                        width: "32px",
                        height: "32px",
                        outlineColor: "var(--accent-blue)",
                    }}
                >
                    <img
                        src={theme === "dark" ? logoDark : logoLight}
                        alt="copeforces"
                        className="w-full h-full"
                        draggable="false"
                    />
                </button>
                {!collapsed && (
                    <span className="font-semibold text-base tracking-tight truncate">
                        Copeforces
                    </span>
                )}
            </div>

            {!collapsed && (
                <button
                    onClick={onToggleCollapse}
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                    className="flex items-center justify-center w-7 h-7 rounded-md border mr-3 flex-shrink-0 hover:opacity-70 transition-opacity"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--muted)",
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M10 3L5 8l5 5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            {collapsed && (
                <button
                    onClick={onToggleCollapse}
                    aria-label="Expand sidebar"
                    title="Expand sidebar"
                    className="absolute flex items-center justify-center w-5 h-5 rounded-full border hover:opacity-80 transition-opacity"
                    style={{
                        borderColor: "var(--line)",
                        color: "var(--muted)",
                        backgroundColor: "var(--bg)",
                        left: "52px",
                        top: "18px",
                    }}
                >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M6 3l5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
        </header>
    );
}

export default Navbar;

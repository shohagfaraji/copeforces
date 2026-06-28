import logoLight from "../assets/logo/logo-light.webp";
import logoDark from "../assets/logo/logo-dark.webp";

function MobileTopBar({ theme, toggleTheme, onOpenMenu }) {
    return (
        <header
            className="lg:hidden h-14 flex items-center justify-between px-3 border-b flex-shrink-0"
            style={{ borderColor: "var(--line)" }}
        >
            <button
                onClick={onOpenMenu}
                aria-label="Open menu"
                className="flex items-center justify-center w-9 h-9 rounded-md hover:opacity-70 -ml-1"
                style={{ color: "var(--ink)" }}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M3 5.5h14M3 10h14M3 14.5h14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            <span className="font-semibold text-base tracking-tight">
                copeforces
            </span>

            <button
                onClick={toggleTheme}
                aria-label={
                    theme === "dark"
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
                className="flex-shrink-0 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                style={{ width: "30px", height: "30px" }}
            >
                <img
                    src={theme === "dark" ? logoDark : logoLight}
                    alt="copeforces"
                    className="w-full h-full"
                    draggable="false"
                />
            </button>
        </header>
    );
}

export default MobileTopBar;

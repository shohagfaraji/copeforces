import { sections } from "../data/sections";

function SectionLinks({ activeSection, collapsed, onNavigate }) {
    return (
        <ul className={collapsed ? "space-y-1.5 px-2" : "space-y-0.5 px-2"}>
            {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                    <li key={section.id}>
                        <a
                            href={`#${section.id}`}
                            onClick={onNavigate}
                            title={section.title}
                            className={
                                collapsed
                                    ? "flex items-center justify-center py-2 rounded-md text-sm transition-colors"
                                    : "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                            }
                            style={{
                                backgroundColor: isActive
                                    ? "var(--line)"
                                    : "transparent",
                                color: isActive ? "var(--ink)" : "var(--muted)",
                            }}
                        >
                            <span
                                className="font-mono-cf text-[11px] font-bold w-7 text-center rounded-sm py-0.5 flex-shrink-0"
                                style={{
                                    color: section.color,
                                    border: `1px solid ${section.color}`,
                                }}
                            >
                                {section.tag}
                            </span>
                            {!collapsed && (
                                <span className={isActive ? "font-medium" : ""}>
                                    {section.title}
                                </span>
                            )}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}

function Sidebar({ activeSection, collapsed }) {
    return (
        <nav
            className="hidden lg:block h-full flex-shrink-0 border-r py-4 overflow-y-auto"
            style={{ borderColor: "var(--line)" }}
        >
            <SectionLinks activeSection={activeSection} collapsed={collapsed} />
        </nav>
    );
}

export function MobileSidebarDrawer({ activeSection, open, onClose }) {
    return (
        <div
            className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            <div
                onClick={onClose}
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    opacity: open ? 1 : 0,
                }}
            />
            <nav
                className="absolute top-0 left-0 h-full w-64 max-w-[80vw] flex flex-col border-r shadow-xl transition-transform duration-200"
                style={{
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--line)",
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                }}
            >
                <div
                    className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0"
                    style={{ borderColor: "var(--line)" }}
                >
                    <span className="font-semibold text-base tracking-tight">
                        copeforces
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="flex items-center justify-center w-8 h-8 rounded-md hover:opacity-70"
                        style={{ color: "var(--muted)" }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <path
                                d="M3 3l10 10M13 3L3 13"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-3">
                    <SectionLinks
                        activeSection={activeSection}
                        collapsed={false}
                        onNavigate={onClose}
                    />
                </div>
            </nav>
        </div>
    );
}

export default Sidebar;

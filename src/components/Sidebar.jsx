import { sections } from "../data/sections";

function Sidebar({ activeSection }) {
    return (
        <nav
            className="w-52 flex-shrink-0 border-r py-5 px-2 overflow-y-auto"
            style={{ borderColor: "var(--line)" }}
        >
            <ul className="space-y-0.5">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                                style={{
                                    backgroundColor: isActive
                                        ? "var(--line)"
                                        : "transparent",
                                    color: isActive
                                        ? "var(--ink)"
                                        : "var(--muted)",
                                }}
                            >
                                <span
                                    className="font-mono-cf text-[11px] font-bold w-6 text-center rounded-sm py-0.5"
                                    style={{
                                        color: section.color,
                                        border: `1px solid ${section.color}`,
                                    }}
                                >
                                    {section.tag}
                                </span>
                                <span className={isActive ? "font-medium" : ""}>
                                    {section.title}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default Sidebar;

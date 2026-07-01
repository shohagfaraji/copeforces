import { useRef } from "react";
import Navbar from "./Navbar";
import MobileTopBar from "./MobileTopBar";
import Sidebar, { MobileSidebarDrawer } from "./Sidebar";
import Section from "./Section";
import Footer from "./Footer";
import { sections } from "../data/sections";
import { useActiveSection } from "../hooks/useActiveSection";
import { useSidebar } from "../hooks/useSidebar";
import StringsContent from "./sections/StringsContent";
import NumberTheoryContent from "./sections/NumberTheoryContent";
import TreesContent from "./sections/TreesContent";
import GraphsContent from "./sections/GraphsContent";
import DynamicProgrammingContent from "./sections/DynamicProgrammingContent";
import GreedyContent from "./sections/GreedyContent";
import ContestUtilitiesContent from "./sections/ContestUtilitiesContent";

function LeftContent({ theme, toggleTheme }) {
    const scrollRef = useRef(null);
    const activeSection = useActiveSection(scrollRef);
    const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar();

    const activeMeta = sections.find((s) => s.id === activeSection);
    const railWidth = collapsed
        ? "var(--rail-w-collapsed)"
        : "var(--rail-w-expanded)";

    return (
        <div
            className="h-full flex flex-col"
            style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}
        >
            <MobileTopBar
                theme={theme}
                toggleTheme={toggleTheme}
                onOpenMenu={toggle}
                activeMeta={activeMeta}
            />
            <MobileSidebarDrawer
                activeSection={activeSection}
                open={mobileOpen}
                onClose={closeMobile}
            />

            <div className="flex flex-1 overflow-hidden">
                <div
                    className="hidden lg:flex flex-col flex-shrink-0 h-full transition-[width] duration-150"
                    style={{ width: railWidth }}
                >
                    <Navbar
                        theme={theme}
                        toggleTheme={toggleTheme}
                        collapsed={collapsed}
                        onToggleCollapse={toggle}
                    />
                    <Sidebar
                        activeSection={activeSection}
                        collapsed={collapsed}
                    />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto">
                        {sections.map((section) => (
                            <Section
                                key={section.id}
                                id={section.id}
                                title={section.title}
                                tag={section.tag}
                                color={section.color}
                                blurb={section.blurb}
                            >
                                {section.id === "strings" ? (
                                    <StringsContent />
                                ) : section.id === "number-theory" ? (
                                    <NumberTheoryContent />
                                ) : section.id === "trees" ? (
                                    <TreesContent />
                                ) : section.id === "graphs" ? (
                                    <GraphsContent />
                                ) : section.id === "dynamic-programming" ? (
                                    <DynamicProgrammingContent />
                                ) : section.id === "greedy" ? (
                                    <GreedyContent />
                                ) : section.id === "contest-utilities" ? (
                                    <ContestUtilitiesContent />
                                ) : (
                                    <p style={{ color: "var(--muted)" }}>
                                        Problems and notes go here.
                                    </p>
                                )}
                            </Section>
                        ))}
                        <Footer theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftContent;

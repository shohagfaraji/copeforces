import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import MobileTopBar from "./MobileTopBar";
import { smoothScrollTo } from "../utils/smoothScroll";
import Sidebar, { MobileSidebarDrawer } from "./Sidebar";
import Section from "./Section";
import Footer from "./Footer";
import { sections } from "../data/sections";
import { useActiveSection } from "../hooks/useActiveSection";
import { useSidebar } from "../hooks/useSidebar";
import ContestUtilitiesContent from "./sections/ContestUtilitiesContent";
import DebugToolsContent from "./sections/DebugToolsContent";
import TestGeneratorContent from "./sections/TestGeneratorContent";
import StringsContent from "./sections/StringsContent";
import NumberTheoryContent from "./sections/NumberTheoryContent";
import MatrixContent from "./sections/MatrixContent";
import SearchContent from "./sections/SearchContent";
import TreesContent from "./sections/TreesContent";
import GraphsContent from "./sections/GraphsContent";
import DynamicProgrammingContent from "./sections/DynamicProgrammingContent";
import GreedyContent from "./sections/GreedyContent";
import QuickReferenceContent from "./sections/QuickReferenceContent";

const SECTION_CONTENT = {
    "contest-utilities": ContestUtilitiesContent,
    "debug-tools": DebugToolsContent,
    "test-generator": TestGeneratorContent,
    strings: StringsContent,
    "number-theory": NumberTheoryContent,
    matrix: MatrixContent,
    search: SearchContent,
    trees: TreesContent,
    graphs: GraphsContent,
    "dynamic-programming": DynamicProgrammingContent,
    greedy: GreedyContent,
    "quick-reference": QuickReferenceContent,
};

function LeftContent({ theme, toggleTheme }) {
    const scrollRef = useRef(null);
    const activeSection = useActiveSection(scrollRef);
    const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar();
    const [mobileTopBarHidden, setMobileTopBarHidden] = useState(false);
    const lastScrollTopRef = useRef(0);

    const activeMeta = sections.find((s) => s.id === activeSection);
    function handleSectionNavigate(sectionId) {
        const container = scrollRef.current;
        const target = document.getElementById(sectionId);
        smoothScrollTo(container, target);
    }

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return undefined;

        let ticking = false;
        const revealTopBar = () => setMobileTopBarHidden(false);

        const handleScroll = () => {
            if (ticking) return;

            ticking = true;
            requestAnimationFrame(() => {
                const currentScrollTop = container.scrollTop;
                const previousScrollTop = lastScrollTopRef.current;
                const delta = currentScrollTop - previousScrollTop;

                if (currentScrollTop <= 8 || delta < -6) {
                    setMobileTopBarHidden(false);
                } else if (delta > 8 && currentScrollTop > 56) {
                    setMobileTopBarHidden(true);
                }

                lastScrollTopRef.current = Math.max(currentScrollTop, 0);
                ticking = false;
            });
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("focus", revealTopBar);
        window.addEventListener("pageshow", revealTopBar);
        document.addEventListener("visibilitychange", revealTopBar);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("focus", revealTopBar);
            window.removeEventListener("pageshow", revealTopBar);
            document.removeEventListener("visibilitychange", revealTopBar);
        };
    }, []);

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
                hidden={mobileTopBarHidden}
            />
            <MobileSidebarDrawer
                activeSection={activeSection}
                open={mobileOpen}
                onClose={closeMobile}
                onNavigate={(id) => {
                    handleSectionNavigate(id);
                    closeMobile();
                }}
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
                        onNavigate={handleSectionNavigate}
                    />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div
                        ref={scrollRef}
                        className="cf-scroll-area flex-1 overflow-y-auto"
                    >
                        {sections.map((section) => {
                            const Content = SECTION_CONTENT[section.id];

                            return (
                                <Section
                                    key={section.id}
                                    id={section.id}
                                    title={section.title}
                                    tag={section.tag}
                                    color={section.color}
                                >
                                    {Content ? (
                                        <Content />
                                    ) : (
                                        <p style={{ color: "var(--muted)" }}>
                                            Problems and notes go here.
                                        </p>
                                    )}
                                </Section>
                            );
                        })}
                        <Footer theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftContent;

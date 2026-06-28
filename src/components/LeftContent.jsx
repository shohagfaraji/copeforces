import { useRef } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Section from "./Section";
import { sections } from "../data/sections";
import { useActiveSection } from "../hooks/useActiveSection";
import StringsContent from "./sections/StringsContent";
import NumberTheoryContent from "./sections/NumberTheoryContent";
import TreesContent from "./sections/TreesContent";
import GraphsContent from "./sections/GraphsContent";
import DynamicProgrammingContent from "./sections/DynamicProgrammingContent";
import GreedyContent from "./sections/GreedyContent";

function LeftContent({ theme, toggleTheme }) {
    const scrollRef = useRef(null);
    const activeSection = useActiveSection(scrollRef);

    return (
        <div
            className="h-full flex flex-col"
            style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}
        >
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar activeSection={activeSection} />
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
                            ) : (
                                <p style={{ color: "var(--muted)" }}>
                                    Problems and notes go here.
                                </p>
                            )}
                        </Section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LeftContent;

import { useState, useEffect } from "react";
import { sections } from "../data/sections";

export function useActiveSection(scrollContainerRef) {
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const containerTop = container.getBoundingClientRect().top;
            let current = sections[0].id;

            for (const section of sections) {
                const el = document.getElementById(section.id);
                if (!el) continue;
                const elTop = el.getBoundingClientRect().top - containerTop;
                if (elTop <= 80) {
                    current = section.id;
                }
            }
            setActiveSection(current);
        };

        container.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => container.removeEventListener("scroll", handleScroll);
    }, [scrollContainerRef]);

    return activeSection;
}

import { useState, useEffect, useCallback } from "react";

export function useSidebar() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("copeforces-sidebar-collapsed");
        return saved === "true";
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("copeforces-sidebar-collapsed", collapsed);
    }, [collapsed]);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const handle = (e) => {
            if (e.matches) setMobileOpen(false);
        };
        mq.addEventListener("change", handle);
        return () => mq.removeEventListener("change", handle);
    }, []);

    const toggle = useCallback(() => {
        const isMobile = window.matchMedia("(max-width: 1023px)").matches;
        if (isMobile) {
            setMobileOpen((prev) => !prev);
        } else {
            setCollapsed((prev) => !prev);
        }
    }, []);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    return { collapsed, mobileOpen, toggle, closeMobile };
}

import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("copeforces-theme");
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        localStorage.setItem("copeforces-theme", theme);
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return { theme, toggleTheme, setTheme };
}

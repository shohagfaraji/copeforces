import { useEffect } from "react";
import SplitLayout from "./components/SplitLayout";
import LeftContent from "./components/LeftContent";
import RightCanvas from "./components/RightCanvas";
import { useTheme } from "./hooks/useTheme";
import { useHomepageTracking } from "./hooks/useHomepageTracking";

function App() {
    useHomepageTracking();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const setAppHeight = () => {
            document.documentElement.style.setProperty(
                "--app-height",
                `${window.innerHeight}px`,
            );
        };
        setAppHeight();
        window.addEventListener("resize", setAppHeight);
        window.addEventListener("orientationchange", setAppHeight);
        return () => {
            window.removeEventListener("resize", setAppHeight);
            window.removeEventListener("orientationchange", setAppHeight);
        };
    }, []);

    return (
        <div
            className="w-screen overflow-hidden"
            style={{ height: "var(--app-height, 100vh)" }}
        >
            <SplitLayout
                left={<LeftContent theme={theme} toggleTheme={toggleTheme} />}
                right={<RightCanvas theme={theme} />}
            />
        </div>
    );
}

export default App;

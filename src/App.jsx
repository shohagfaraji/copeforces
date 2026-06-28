import SplitLayout from "./components/SplitLayout";
import LeftContent from "./components/LeftContent";
import RightCanvas from "./components/RightCanvas";
import { useTheme } from "./hooks/useTheme";

function App() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="h-screen w-screen overflow-hidden">
            <SplitLayout
                left={<LeftContent theme={theme} toggleTheme={toggleTheme} />}
                right={<RightCanvas theme={theme} />}
            />
        </div>
    );
}

export default App;

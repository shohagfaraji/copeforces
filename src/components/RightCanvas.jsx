import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function RightCanvas({ theme }) {
    return (
        <div className="h-full w-full">
            <Excalidraw theme={theme} />
        </div>
    );
}

export default RightCanvas;

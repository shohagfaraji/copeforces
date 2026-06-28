import { useState, useRef, useCallback, useEffect } from "react";

function SplitLayout({ left, right }) {
    const containerRef = useRef(null);
    const [rightWidthPercent, setRightWidthPercent] = useState(40);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastWidth, setLastWidth] = useState(40);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const movedRef = useRef(false);

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        movedRef.current = false;
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const totalMove = Math.abs(e.clientX - dragStartXRef.current);
        if (totalMove > 5) movedRef.current = true;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        let newRightPercent =
            ((containerWidth - mouseX) / containerWidth) * 100;
        newRightPercent = Math.min(80, Math.max(20, newRightPercent));

        setIsCollapsed(false);
        setRightWidthPercent(newRightPercent);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current && !movedRef.current) {
            // it was a click, not a drag — toggle collapse
            if (isCollapsed) {
                setIsCollapsed(false);
                setRightWidthPercent(lastWidth);
            } else {
                setLastWidth(rightWidthPercent);
                setIsCollapsed(true);
            }
        }
        isDraggingRef.current = false;
    }, [isCollapsed, lastWidth, rightWidthPercent]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const rightDisplayWidth = isCollapsed ? 0 : rightWidthPercent;

    return (
        <div ref={containerRef} className="flex h-full w-full">
            <div
                className="h-full"
                style={{ width: `${100 - rightDisplayWidth}%` }}
            >
                {left}
            </div>

            <div
                onMouseDown={handleMouseDown}
                className="h-full w-7 cursor-col-resize bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors relative group"
                title={
                    isCollapsed
                        ? "Click to open drawing board"
                        : "Drag to resize, click to collapse"
                }
            >
                {isCollapsed ? (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tracking-wide [writing-mode:vertical-rl] rotate-180 select-none whitespace-nowrap">
                        Drawing board
                    </span>
                ) : (
                    <div className="h-12 w-1 bg-gray-400 dark:bg-gray-600 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-500" />
                )}
            </div>

            <div
                className="h-full overflow-hidden relative flex-shrink-0"
                style={{ width: `${rightDisplayWidth}%` }}
            >
                <div
                    className="h-full absolute top-0 right-0"
                    style={{
                        width: isCollapsed ? `${lastWidth}%` : "100%",
                        visibility: isCollapsed ? "hidden" : "visible",
                    }}
                >
                    {right}
                </div>
            </div>
        </div>
    );
}

export default SplitLayout;

import { useState, useRef, useCallback, useEffect } from "react";

function SplitLayout({ left, right }) {
    const containerRef = useRef(null);
    const [rightWidthPercent, setRightWidthPercent] = useState(40);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastWidth, setLastWidth] = useState(40);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const movedRef = useRef(false);
    const [mobileBoardOpen, setMobileBoardOpen] = useState(false);

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
        <div ref={containerRef} className="relative h-full w-full">
            <div className="hidden lg:flex h-full w-full">
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

            <div className="lg:hidden h-full w-full relative">
                {left}

                <button
                    onClick={() => setMobileBoardOpen(true)}
                    aria-label="Open drawing board"
                    className="absolute bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-sm font-medium"
                    style={{
                        backgroundColor: "var(--accent-violet)",
                        color: "#fff",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M3 17l3.2-.6a2 2 0 0 0 1.06-.56L16 7a2 2 0 0 0 0-2.83l-.17-.17a2 2 0 0 0-2.83 0L4.16 12.74a2 2 0 0 0-.56 1.06L3 17z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Draw
                </button>

                <div
                    className={`fixed inset-0 z-40 flex flex-col transition-transform duration-200 ${
                        mobileBoardOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                    style={{ backgroundColor: "var(--bg)" }}
                >
                    <div
                        className="h-12 flex items-center justify-between px-4 border-b flex-shrink-0"
                        style={{ borderColor: "var(--line)" }}
                    >
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--muted)" }}
                        >
                            Drawing board
                        </span>
                        <button
                            onClick={() => setMobileBoardOpen(false)}
                            aria-label="Close drawing board"
                            className="flex items-center justify-center w-8 h-8 rounded-md hover:opacity-70"
                            style={{ color: "var(--ink)" }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M3 3l10 10M13 3L3 13"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {mobileBoardOpen && right}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SplitLayout;

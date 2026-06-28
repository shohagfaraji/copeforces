import { useState, useRef, useCallback, useEffect } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

function SplitLayout({ left, right }) {
    const containerRef = useRef(null);
    const [rightWidthPercent, setRightWidthPercent] = useState(40);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastWidth, setLastWidth] = useState(40);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const movedRef = useRef(false);

    // Drives desktop-split vs. mobile-sheet presentation. Read once on
    // mount (matchMedia, not window.innerWidth, so it's correct before
    // the first paint) and kept live via a listener.
    const [isDesktop, setIsDesktop] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia(DESKTOP_QUERY).matches,
    );

    // Mobile/tablet: the drawing board isn't a side pane, it's a
    // full-screen sheet opened on demand. It must never be moved with a
    // CSS transform while open: Excalidraw measures its canvas position
    // once on mount/resize and caches it for converting touch points to
    // canvas coordinates. A translateY slide-in changes the element's
    // on-screen position *after* that measurement, so every touch then
    // lands offset by roughly the slide distance — which is exactly the
    // "drawing appears higher up" bug. Hiding it with `display: none`
    // until opened (no transform) avoids that entirely.
    const [mobileBoardOpen, setMobileBoardOpen] = useState(false);

    const openMobileBoard = () => {
        setMobileBoardOpen(true);
        // Excalidraw already mounted while hidden (display: none gives it
        // a 0×0 box), so once it becomes visible we nudge it to
        // re-measure by firing the resize event it listens for.
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });
    };

    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_QUERY);
        const handle = (e) => setIsDesktop(e.matches);
        mq.addEventListener("change", handle);
        return () => mq.removeEventListener("change", handle);
    }, []);

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

    // `left` and `right` are each mounted exactly once below, no matter
    // the breakpoint. Rendering them a second time for a "mobile copy"
    // would duplicate every section's id in the DOM (breaking
    // getElementById-based scroll tracking) and mount a second
    // Excalidraw instance, so the desktop/mobile difference here is
    // purely CSS on shared wrappers, never a second copy of the content.
    return (
        <div ref={containerRef} className="relative h-full w-full flex">
            <div
                className="h-full"
                style={{
                    width: isDesktop ? `${100 - rightDisplayWidth}%` : "100%",
                }}
            >
                {left}
            </div>

            {isDesktop && (
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
            )}

            {!isDesktop && (
                <button
                    onClick={openMobileBoard}
                    aria-label="Open drawing board"
                    className="absolute bottom-5 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
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
                </button>
            )}

            <div
                className={
                    isDesktop
                        ? "h-full overflow-hidden relative flex-shrink-0"
                        : `fixed inset-0 z-40 flex-col ${
                              mobileBoardOpen ? "flex" : "hidden"
                          }`
                }
                style={{
                    width: isDesktop ? `${rightDisplayWidth}%` : undefined,
                    backgroundColor: isDesktop ? undefined : "var(--bg)",
                }}
            >
                {!isDesktop && (
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
                )}

                <div
                    className={
                        isDesktop
                            ? "h-full absolute top-0 right-0"
                            : "flex-1 overflow-hidden"
                    }
                    style={
                        isDesktop
                            ? {
                                  width: isCollapsed ? `${lastWidth}%` : "100%",
                                  visibility: isCollapsed
                                      ? "hidden"
                                      : "visible",
                              }
                            : undefined
                    }
                >
                    {right}
                </div>
            </div>
        </div>
    );
}

export default SplitLayout;

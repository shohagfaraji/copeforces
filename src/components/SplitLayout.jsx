import { useState, useRef, useCallback, useEffect } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const DEFAULT_RIGHT_WIDTH = 40;
const MIN_RIGHT_WIDTH = 20;
const MAX_RIGHT_WIDTH = 80;
const PANE_ANIMATION_MS = 420;
const easeOutQuint = (t) => 1 - (1 - t) ** 5;

function SplitLayout({ left, right }) {
    const containerRef = useRef(null);
    const [rightWidthPercent, setRightWidthPercent] =
        useState(DEFAULT_RIGHT_WIDTH);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastWidth, setLastWidth] = useState(DEFAULT_RIGHT_WIDTH);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const movedRef = useRef(false);
    const animationRef = useRef(null);

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
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        movedRef.current = false;
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const totalMove = Math.abs(e.clientX - dragStartXRef.current);
        if (totalMove > 5) {
            movedRef.current = true;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        let newRightPercent =
            ((containerWidth - mouseX) / containerWidth) * 100;
        newRightPercent = Math.min(
            MAX_RIGHT_WIDTH,
            Math.max(MIN_RIGHT_WIDTH, newRightPercent),
        );

        setIsCollapsed(false);
        setRightWidthPercent(newRightPercent);
    }, []);

    const animateRightPane = useCallback((from, to, onComplete) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startedAt = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - startedAt) / PANE_ANIMATION_MS, 1);
            const nextWidth = from + (to - from) * easeOutQuint(progress);
            setRightWidthPercent(nextWidth);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(tick);
                return;
            }

            animationRef.current = null;
            setRightWidthPercent(to);
            onComplete?.();
        };

        animationRef.current = requestAnimationFrame(tick);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current && !movedRef.current) {
            if (isCollapsed) {
                setIsCollapsed(false);
                animateRightPane(0, lastWidth);
            } else {
                setLastWidth(rightWidthPercent);
                animateRightPane(rightWidthPercent, 0, () => {
                    setIsCollapsed(true);
                });
            }
        }
        isDraggingRef.current = false;
    }, [animateRightPane, isCollapsed, lastWidth, rightWidthPercent]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const rightDisplayWidth = rightWidthPercent;

    useEffect(() => {
        if (!isDesktop) return;

        const resizeFrame = requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });
        const resizeAfterTransition = window.setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 440);

        return () => {
            cancelAnimationFrame(resizeFrame);
            window.clearTimeout(resizeAfterTransition);
        };
    }, [isDesktop, rightDisplayWidth]);

    const leftDisplayWidth = isDesktop ? 100 - rightDisplayWidth : 100;
    const paneTransition = "none";

    // `left` and `right` are each mounted exactly once below, no matter
    // the breakpoint. Rendering them a second time for a "mobile copy"
    // would duplicate every section's id in the DOM (breaking
    // getElementById-based scroll tracking) and mount a second
    // Excalidraw instance, so the desktop/mobile difference here is
    // purely CSS on shared wrappers, never a second copy of the content.
    return (
        <div ref={containerRef} className="relative h-full w-full flex">
            <div
                className="h-full min-w-0"
                style={{
                    width: `${leftDisplayWidth}%`,
                    transition: isDesktop ? paneTransition : undefined,
                }}
            >
                {left}
            </div>

            {isDesktop && (
                <div
                    onMouseDown={handleMouseDown}
                    className="cf-split-handle h-full w-8 cursor-col-resize flex items-center justify-center flex-shrink-0 relative group"
                    title={
                        isCollapsed
                            ? "Click to open drawing board"
                            : "Drag to resize, click to collapse"
                    }
                >
                    {isCollapsed ? (
                        <span className="text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180 select-none whitespace-nowrap">
                            Drawing board
                        </span>
                    ) : (
                        <div className="cf-split-grip h-14 w-1 rounded-full" />
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
                        ? "h-full overflow-hidden relative flex-shrink-0 cf-canvas-shell"
                        : `fixed inset-0 z-40 flex-col ${
                              mobileBoardOpen ? "flex" : "hidden"
                          }`
                }
                style={{
                    width: isDesktop ? `${rightDisplayWidth}%` : undefined,
                    transition: isDesktop ? paneTransition : undefined,
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
                            ? "h-full absolute top-0 right-0 transition-opacity duration-300 ease-out"
                            : "flex-1 overflow-hidden"
                    }
                    style={
                        isDesktop
                            ? {
                                  width: "100%",
                                  minWidth: `${lastWidth}%`,
                                  opacity: isCollapsed ? 0 : 1,
                                  pointerEvents: isCollapsed ? "none" : "auto",
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

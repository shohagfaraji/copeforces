export function smoothScrollTo(
    container,
    target,
    { duration = 350, offset = 0, respectReducedMotion = true } = {},
) {
    if (!container || !target) return;

    // Cancel any in-flight scroll animation on this container first, so
    // rapid successive clicks don't fight each other over scrollTop.
    if (container.__smoothScrollFrame) {
        cancelAnimationFrame(container.__smoothScrollFrame);
        container.__smoothScrollFrame = null;
    }

    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollMarginTop =
        parseFloat(getComputedStyle(target).scrollMarginTop) || 0;

    const startTop = container.scrollTop;
    const targetTop =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        startTop -
        scrollMarginTop -
        offset;

    const distance = targetTop - startTop;

    if (
        (respectReducedMotion && prefersReducedMotion) ||
        Math.abs(distance) < 1
    ) {
        container.scrollTop = targetTop;
        return;
    }

    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        container.scrollTop = startTop + distance * eased;

        if (progress < 1) {
            container.__smoothScrollFrame = requestAnimationFrame(step);
        } else {
            container.__smoothScrollFrame = null;
        }
    }

    container.__smoothScrollFrame = requestAnimationFrame(step);
}

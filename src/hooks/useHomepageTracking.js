import { useEffect, useRef } from "react";

export function useHomepageTracking() {
    const firedRef = useRef(false);

    useEffect(() => {
        if (firedRef.current) return;
        firedRef.current = true;

        fetch("/.netlify/functions/track-view", {
            method: "POST",
            keepalive: true,
        }).catch(() => {
            // Silently ignore — analytics must never affect the user's experience
        });
    }, []);
}

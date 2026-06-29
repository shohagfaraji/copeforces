import { useState, useEffect } from "react";
import { getHourlyMessage } from "../data/footerMessages";

// Picks the current hour's footer message and re-picks it the instant
// the clock crosses into the next hour, so a tab left open updates
// itself instead of being stuck on whatever line loaded first.
export function useHourlyMessage() {
    const [message, setMessage] = useState(() => getHourlyMessage());

    useEffect(() => {
        const msUntilNextHour = 3600000 - (Date.now() % 3600000) + 1000;
        const timeout = setTimeout(() => {
            setMessage(getHourlyMessage());
        }, msUntilNextHour);
        return () => clearTimeout(timeout);
    }, [message]);

    return message;
}

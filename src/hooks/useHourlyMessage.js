import { useState, useEffect } from "react";
import { getHourlyMessage } from "../data/footerMessages";

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

// 11 rotating footer lines — a mix of CP trivia, motivation, and the
// occasional joke. Picked by the current hour (see useHourlyMessage)
// so it changes once an hour with no timer or backend involved, and
// is already correct the instant the page loads.
export const FOOTER_MESSAGES = [
    "Every Codeforces handle was once 'newbie' — gray is just where the story starts.",
    "Fun fact: the first Codeforces round was held in 2010 — you've had 15+ years to catch up.",
    "Every TLE is just your O(n²) solution asking for a O(n log n) upgrade.",
    "Tourist, Petr, and Benq didn't start at red — they just never stopped solving.",
    "Reminder: reading the constraints carefully solves half your bugs before you write them.",
    "A binary search a day keeps the WA away.",
    "Fun fact: 'tourist' has held the #1 Codeforces rank for over a decade.",
    "Stuck on a problem? Sleep on it — your brain debugs in the background too.",
    "Greedy gets you far. Dynamic programming gets you further. Both get you a headache.",
    "Fun fact: Codeforces ratings are calculated using an Elo-based system, same family as chess ratings.",
    "Somewhere, someone just got AC on the problem you're about to give up on.",
];

// Deterministic pick: same formula everywhere, so server-rendered and
// client-rendered output always agree, and it advances exactly once
// per hour in the visitor's own local time.
export function getHourlyMessage(date = new Date()) {
    const hourBucket = Math.floor(date.getTime() / (1000 * 60 * 60));
    const index = hourBucket % FOOTER_MESSAGES.length;
    return FOOTER_MESSAGES[index];
}

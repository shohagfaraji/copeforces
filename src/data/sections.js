export const RANK_COLORS = [
    // "#990000", // Legendary Grandmaster
    // "#CC0000", // International Grandmaster
    "#FF0000", // Grandmaster
    // "#FFA500", // International Master
    "#FF8C00", // Master
    "#AA00AA", // Candidate Master
    "#0000FF", // Expert
    "#03A89E", // Specialist
    "#008000", // Pupil
    "#808080", // Newbie
];

const rawSections = [
    { id: "contest-utilities", title: "Contest Utilities", tag: "CU" },
    { id: "debug-tools", title: "Debug Tools", tag: "DBG" },
    { id: "test-generator", title: "Test Generator", tag: "GEN" },
    { id: "strings", title: "Strings", tag: "ST" },
    { id: "number-theory", title: "Number Theory", tag: "NT" },
    { id: "trees", title: "Trees", tag: "TR" },
    { id: "graphs", title: "Graphs", tag: "GR" },
    { id: "dynamic-programming", title: "Dynamic Programming", tag: "DP" },
    { id: "greedy", title: "Greedy", tag: "GD" },
    { id: "quick-reference", title: "Quick Reference", tag: "REF" },
];

export const sections = rawSections.map((section, index) => ({
    ...section,
    color: RANK_COLORS[index % RANK_COLORS.length],
}));

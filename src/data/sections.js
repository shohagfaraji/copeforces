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
    { id: "debug-tools", title: "Debug Tools", tag: "DBG" },
    {id: "contest-utilities", title: "Contest Utilities", tag: "CU", status: "Updated" },
    { id: "test-generator", title: "Test Generator", tag: "GEN" },
    { id: "strings", title: "Strings", tag: "ST", status: "Updated" },
    { id: "number-theory", title: "Number Theory", tag: "NT" },
    { id: "matrix", title: "Matrix", tag: "MX" },
    { id: "search", title: "Search", tag: "SR" },
    { id: "trees", title: "Trees", tag: "TR" },
    {
        id: "segment-tree",
        title: "Segment Tree",
        tag: "SG",
        status: "New",
    },
    { id: "graphs", title: "Graphs", tag: "GR", status: "Updated" },
    { id: "dynamic-programming", title: "Dynamic Programming", tag: "DP" },
    { id: "greedy", title: "Greedy", tag: "GD" },
    { id: "quick-reference", title: "Quick Reference", tag: "REF" },
];

let rankColorIndex = 0;
export const sections = rawSections.map((section) => {
    const color =
        section.color || RANK_COLORS[rankColorIndex % RANK_COLORS.length];
    if (!section.color) rankColorIndex += 1;
    return { ...section, color };
});

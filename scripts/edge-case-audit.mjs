import assert from "node:assert/strict";

import {
    binaryCalculate,
    bigIntCalculate,
    convertBase,
    evaluateExpression,
    evaluateFormula,
    extractFormulaVariables,
    fastCalculate,
} from "../src/utils/contestTools.js";
import {
    knapsack01,
    longestCommonSubsequence,
    longestIncreasingSubsequence,
    minCoinChange,
} from "../src/utils/dpTools.js";
import {
    analyzeDegrees,
    bfs,
    buildAdjacency,
    checkBipartite,
    dfs,
    dijkstra,
    hasCycleDirected,
    hasCycleUndirected,
    parseEdgeList,
} from "../src/utils/graphTools.js";
import {
    activitySelection,
    fractionalKnapsack,
    greedyCoinChange,
    jobSequencing,
    optimalCoinChange,
} from "../src/utils/greedyTools.js";
import {
    floodFill,
    gridBFS,
    matrixPowerBig,
    multiplyMatricesBig,
    parseIntegerMatrix,
    parseMatrix,
    prefixSumMatrix,
    rangeSum,
    rotateMatrix,
    spiralOrder,
    transposeMatrix,
} from "../src/utils/matrixTools.js";
import {
    INT_MAX_BIG,
    LLONG_MAX_BIG,
    cppTypeFor,
    digitSum,
    gcdTwo,
    getDivisors,
    isPrime,
    lcmTwo,
    modPow,
    multiplicationExceeds,
} from "../src/utils/numberTheory.js";
import {
    binarySearchOnAnswer,
    binarySearchTrace,
    findAllOccurrences,
    lowerBound,
    parseSortedArray,
    ternarySearch,
    upperBound,
} from "../src/utils/searchTools.js";
import {
    charFrequency,
    findOccurrences,
    isPalindrome,
    polynomialHash,
    prefixFunction,
    reverseString,
    zFunction,
} from "../src/utils/stringTools.js";
import {
    buildTreeAdjacency,
    buildTreeStructure,
    findLCA,
    parseTreeInput,
    subtreeHeights,
    subtreeSizes,
    treeDiameter,
} from "../src/utils/treeTools.js";
import {
    generateFromConstraints,
    generateRandomArray,
    generateRandomGraph,
    generateRandomMatrix,
    generateRandomPermutation,
    generateRandomQueries,
    generateRandomString,
    generateRandomTree,
    parseConstraints,
} from "../src/utils/testGenerator.js";

function test(name, fn) {
    try {
        fn();
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}

function referenceHash(s, base, mod) {
    let hash = 0n;
    const b = BigInt(base);
    const m = BigInt(mod);
    for (const ch of s) {
        hash = (hash * b + BigInt(ch.charCodeAt(0))) % m;
    }
    return Number(hash);
}

function absBig(value) {
    return value < 0n ? -value : value;
}

function gcdBigForTest(a, b) {
    let x = absBig(a);
    let y = absBig(b);
    while (y !== 0n) {
        [x, y] = [y, x % y];
    }
    return x;
}

function formatFractionForTest(numerator, denominator) {
    const divisor = gcdBigForTest(numerator, denominator);
    return denominator / divisor === 1n
        ? String(numerator / divisor)
        : `${numerator / divisor}/${denominator / divisor}`;
}

test("contest utilities handle signed, exact, and invalid inputs", () => {
    assert.equal(convertBase("-ff", 16, 10), "-255");
    assert.equal(convertBase("-", 10, 2), null);
    assert.equal(evaluateExpression("2^3^2").result, 512);
    assert.equal(evaluateExpression("-5 + 2").result, -3);
    assert.equal(evaluateExpression("2 * -3").result, -6);
    assert.equal(evaluateExpression("-(2 + 3)").result, -5);
    assert.equal(evaluateExpression("1..2").error, "invalid expression");
    const fastHuge = fastCalculate(
        "9223372036854775808",
        "9223372036854775808",
    );
    assert.equal(fastHuge.exact, true);
    assert.equal(
        fastHuge.ops.find((op) => op.label === "a × b").value,
        "85070591730234615865843651857942052864",
    );
    assert.equal(
        fastHuge.ops.find((op) => op.label === "a + b").value,
        "18446744073709551616",
    );
    assert.equal(fastHuge.ops.find((op) => op.label === "a ÷ b").value, "1");
    assert.equal(fastHuge.ops.find((op) => op.label === "a mod b").value, "0");
    const fastDifferentHuge = fastCalculate(
        "9223372036854775808",
        "9223372036854775809",
    );
    assert.equal(
        fastDifferentHuge.ops.find((op) => op.label === "a + b").value,
        "18446744073709551617",
    );
    assert.equal(
        fastDifferentHuge.ops.find((op) => op.label === "a × b").value,
        "85070591730234615875067023894796828672",
    );
    const fastDecimalHuge = fastCalculate("100000000000000000000.25", "0.75");
    assert.equal(
        fastDecimalHuge.ops.find((op) => op.label === "a + b").value,
        "100000000000000000001",
    );
    assert.equal(
        fastCalculate("1e20", "2").ops.find((op) => op.label === "a × b").value,
        "200000000000000000000",
    );
    assert.equal(
        fastCalculate("17", "5").ops.find((op) => op.label === "a ÷ b").value,
        "3.4",
    );
    assert.equal(
        binaryCalculate("1".repeat(64), "1", "A+B").result,
        `1${"0".repeat(64)}`,
    );
    assert.equal(binaryCalculate("1010", "0110", "AND").result, "0010");
    assert.equal(bigIntCalculate("-10", "3", "/").result, "-3");
    assert.equal(bigIntCalculate("-10", "3", "%").result, "-1");
    assert.deepEqual(extractFormulaVariables("((a + b) * (b + c) - d) / 2"), [
        "a",
        "b",
        "c",
        "d",
    ]);
    const formula = evaluateFormula(
        "((a + b) * (b + c) - d) / 2",
        { a: "12", b: "8", c: "5", d: "72" },
        "1000000007",
    );
    assert.equal(formula.result, "94");
    assert.equal(formula.modulo, "94");
    assert.equal(
        evaluateFormula("a / b", { a: "1", b: "2" }, "1000000007").modulo,
        "500000004",
    );
    assert.equal(
        evaluateFormula("(a + b) mod c", { a: "10", b: "8", c: "7" }).result,
        "4",
    );
    assert.equal(
        evaluateFormula("x + y", {
            x: "999999999999999999999999999999",
            y: "1",
        }).result,
        "1000000000000000000000000000000",
    );
    assert.equal(
        evaluateFormula("1 / 2", {}, "10").moduloError,
        "division has no modular inverse for this mod",
    );
    const hugeA = 123456789012345678901234567890n;
    const hugeB = 987654321098765432109876543210n;
    const hugeC = 111111111111111111111111111111n;
    const hugeD = 222222222222222222222222222222n;
    const hugeE = 333333333333333333333333333333n;
    const hugeNumerator = hugeA * hugeB + hugeC * hugeD - hugeE;
    assert.equal(
        evaluateFormula("(a * b + c * d - e) / f", {
            a: String(hugeA),
            b: String(hugeB),
            c: String(hugeC),
            d: String(hugeD),
            e: String(hugeE),
            f: "9",
        }).result,
        formatFractionForTest(hugeNumerator, 9n),
    );
    const oneThird = evaluateFormula("1 / 3", {}, "1000000007");
    assert.equal(oneThird.result, "1/3");
    assert.equal(oneThird.modulo, "333333336");
    assert.ok(oneThird.decimal.startsWith("0.33333333333333333333"));
    assert.equal(
        evaluateFormula("-(a + b) * -c", {
            a: "7",
            b: "8",
            c: "3",
        }).result,
        "45",
    );
    assert.equal(evaluateFormula("(-a)^b", { a: "2", b: "10" }).result, "1024");
    assert.equal(
        evaluateFormula("a^b^c", { a: "2", b: "3", c: "2" }).result,
        "512",
    );
    assert.equal(evaluateFormula("2^-3").result, "1/8");
    assert.equal(
        evaluateFormula("(a * b + c) % m", {
            a: "123456789123456789",
            b: "987654321987654321",
            c: "42",
            m: "1000000007",
        }).result,
        String((123456789123456789n * 987654321987654321n + 42n) % 1000000007n),
    );
    assert.equal(
        evaluateFormula("2a + 1", { a: "4" }).error,
        "missing operator",
    );
    assert.equal(
        evaluateFormula("(a + b", { a: "1", b: "2" }).error,
        "mismatched parentheses",
    );
});

test("number theory avoids precision and signed-boundary bugs", () => {
    assert.equal(modPow("2", "1000000005", "1000000007"), "500000004");
    assert.equal(modPow("-2", "5", "13"), "7");
    assert.equal(gcdTwo(12, -18), 6);
    assert.equal(lcmTwo(-4, 6), 12);
    assert.deepEqual(getDivisors(-12), [1, 2, 3, 4, 6, 12]);
    assert.equal(isPrime(97), true);
    assert.equal(isPrime(1), false);
    assert.equal(digitSum(-12345), 15);
    assert.equal(cppTypeFor(-2147483648), "int");
    assert.equal(cppTypeFor(INT_MAX_BIG + 1n), "long long");
    assert.equal(cppTypeFor("9223372036854775807"), "long long");
    assert.equal(cppTypeFor("9223372036854775808"), "overflow");
    assert.equal(
        multiplicationExceeds("3037000499", "3037000499", LLONG_MAX_BIG),
        false,
    );
    assert.equal(
        multiplicationExceeds("3037000500", "3037000500", LLONG_MAX_BIG),
        true,
    );
});

test("string algorithms handle empty, delimiter, overlap, and large hash cases", () => {
    assert.equal(isPalindrome(""), true);
    assert.equal(reverseString("abc"), "cba");
    assert.deepEqual(charFrequency("banana")[0], ["a", 3]);
    assert.deepEqual(prefixFunction("ababaca"), [0, 0, 1, 2, 3, 0, 1]);
    assert.deepEqual(zFunction("aaaaa"), [0, 4, 3, 2, 1]);
    assert.deepEqual(findOccurrences("aaaa", "aa"), [0, 1, 2]);
    assert.deepEqual(findOccurrences("a\u0001a\u0001a", "\u0001a"), [1, 3]);
    assert.equal(
        polynomialHash("copeforces", 911382323, 1000000007),
        referenceHash("copeforces", 911382323, 1000000007),
    );
});

test("DP tools handle zero targets and invalid weights/coins", () => {
    const knapsack = knapsack01(
        [
            { name: "bad", value: 99, weight: 0 },
            { name: "a", value: 4, weight: 2 },
            { name: "b", value: 7, weight: 3 },
        ],
        5,
    );
    assert.equal(knapsack.best, 11);
    assert.deepEqual(
        knapsack.taken.map((item) => item.name),
        ["a", "b"],
    );
    assert.equal(longestCommonSubsequence("ABCBDAB", "BDCABA").length, 4);
    assert.deepEqual(minCoinChange([0, -1, 1, 3, 4], 6).used, [3, 3]);
    assert.equal(minCoinChange([2], 3).success, false);
    assert.deepEqual(longestIncreasingSubsequence([2, 2, 2]).subsequence, [2]);
});

test("greedy tools ignore invalid data without hanging", () => {
    assert.deepEqual(
        activitySelection([
            { name: "bad", start: 5, end: 1 },
            { name: "a", start: 1, end: 2 },
            { name: "b", start: 2, end: 3 },
        ]).selected.map((item) => item.name),
        ["a", "b"],
    );
    assert.equal(
        fractionalKnapsack([{ name: "x", value: 10, weight: 0 }], 5).totalValue,
        0,
    );
    assert.deepEqual(greedyCoinChange([0, -1, 5, 2], 7), {
        used: [5, 2],
        remaining: 0,
        success: true,
    });
    assert.equal(optimalCoinChange([0, -1, 1, 3, 4], 6).used.length, 2);
    assert.equal(
        jobSequencing([{ name: "a", deadline: -1, profit: 99 }]).totalProfit,
        0,
    );
});

test("matrix and grid tools validate shape and preserve big integers", () => {
    assert.equal(Number.isNaN(parseMatrix("1 a")[0][1]), true);
    assert.deepEqual(
        rotateMatrix(
            [
                [1, 2],
                [3, 4],
            ],
            1,
            "cw",
        ),
        [
            [3, 1],
            [4, 2],
        ],
    );
    assert.deepEqual(
        transposeMatrix([
            [1, 2, 3],
            [4, 5, 6],
        ]),
        [
            [1, 4],
            [2, 5],
            [3, 6],
        ],
    );
    const prefix = prefixSumMatrix([
        [1, 2],
        [3, 4],
    ]);
    assert.equal(rangeSum(prefix, 0, 0, 1, 1), 10);
    const bigProduct = multiplyMatricesBig(
        [["1000000000000000000"]],
        [["2"]],
        "1000000007",
    );
    assert.deepEqual(bigProduct.matrix, [["98"]]);
    assert.deepEqual(
        matrixPowerBig(
            [
                ["1", "1"],
                ["1", "0"],
            ],
            "10",
            null,
        ).matrix,
        [
            ["89", "55"],
            ["55", "34"],
        ],
    );
    assert.equal(
        parseIntegerMatrix("1 2\n3").error,
        "Matrix rows must have equal length",
    );
    assert.equal(
        floodFill([["."], [".", "."]], 0, 0, "x").error,
        "Grid rows must have equal length",
    );
    assert.equal(
        gridBFS(
            [
                [".", "#"],
                [".", "."],
            ],
            0,
            0,
        ).reachable,
        3,
    );
    assert.deepEqual(
        spiralOrder([
            [1, 2, 3],
            [4, 5, 6],
        ]),
        [1, 2, 3, 6, 5, 4],
    );
});

test("search tools cover comma parsing, invalid ranges, and extrema", () => {
    const arr = parseSortedArray("1, 2 2,4");
    assert.deepEqual(arr, [1, 2, 2, 4]);
    assert.equal(binarySearchTrace(arr, 4).foundIndex, 3);
    assert.equal(lowerBound(arr, 2), 1);
    assert.equal(upperBound(arr, 2), 3);
    assert.deepEqual(findAllOccurrences([3, 1, 3, 2], 3), [0, 2]);
    assert.equal(
        binarySearchOnAnswer(10, 1, () => true).error,
        "Invalid search range",
    );
    assert.equal(binarySearchOnAnswer(0, 10, (x) => x * x >= 30).answer, 6);
    assert.equal(
        ternarySearch((x) => (x - 4) ** 2, 10, 0, { integer: true }).x,
        4,
    );
});

test("graph tools handle invalid weights and deep traversals", () => {
    const parsed = parseEdgeList("1 2\n2 3 nope\n3 4 -5");
    assert.deepEqual(parsed.edges, [
        { u: "1", v: "2", w: 1 },
        { u: "3", v: "4", w: -5 },
    ]);
    const edges = Array.from({ length: 2000 }, (_, i) => ({
        u: String(i),
        v: String(i + 1),
        w: 1,
    }));
    const nodes = Array.from({ length: 2001 }, (_, i) => String(i));
    const adj = buildAdjacency(nodes, edges, true);
    assert.equal(bfs(adj, "0").length, 2001);
    assert.equal(dfs(adj, "0").length, 2001);
    assert.equal(hasCycleDirected(nodes, adj), false);
    assert.equal(
        hasCycleDirected(
            ["1", "2"],
            buildAdjacency(
                ["1", "2"],
                [
                    { u: "1", v: "2", w: 1 },
                    { u: "2", v: "1", w: 1 },
                ],
                true,
            ),
        ),
        true,
    );
    assert.equal(
        dijkstra(
            parsed.nodes,
            buildAdjacency(parsed.nodes, parsed.edges, false),
            "1",
        ).error,
        "Dijkstra requires finite non-negative edge weights",
    );

    const triangleNodes = ["1", "2", "3"];
    const triangleEdges = [
        { u: "1", v: "2", w: 1 },
        { u: "2", v: "3", w: 1 },
        { u: "3", v: "1", w: 1 },
    ];
    const triangleAdj = buildAdjacency(triangleNodes, triangleEdges, false);
    assert.equal(hasCycleUndirected(triangleNodes, triangleAdj), true);
    const triangleBipartite = checkBipartite(triangleNodes, triangleAdj);
    assert.equal(triangleBipartite.isBipartite, false);
    assert.deepEqual(Object.keys(triangleBipartite.conflict).sort(), [
        "u",
        "v",
    ]);

    const bipartiteNodes = ["1", "2", "3", "4"];
    const bipartiteAdj = buildAdjacency(
        bipartiteNodes,
        [
            { u: "1", v: "2", w: 1 },
            { u: "1", v: "4", w: 1 },
            { u: "3", v: "2", w: 1 },
            { u: "3", v: "4", w: 1 },
        ],
        false,
    );
    const bipartite = checkBipartite(bipartiteNodes, bipartiteAdj);
    assert.equal(bipartite.isBipartite, true);
    assert.equal(bipartite.color["1"], bipartite.color["3"]);
    assert.notEqual(bipartite.color["1"], bipartite.color["2"]);

    const undirectedDegree = analyzeDegrees(
        ["1", "2", "3"],
        [
            { u: "1", v: "1", w: 1 },
            { u: "1", v: "2", w: 1 },
            { u: "1", v: "2", w: 1 },
            { u: "2", v: "3", w: 1 },
        ],
        false,
    );
    assert.equal(undirectedDegree.lawHolds, true);
    assert.equal(undirectedDegree.totalDegree, 8);
    assert.equal(undirectedDegree.selfLoops, 1);
    assert.deepEqual(
        undirectedDegree.rows.map((row) => [row.node, row.degree]),
        [
            ["1", 4],
            ["2", 3],
            ["3", 1],
        ],
    );

    const directedDegree = analyzeDegrees(
        ["1", "2", "3"],
        [
            { u: "1", v: "1", w: 1 },
            { u: "1", v: "2", w: 1 },
            { u: "2", v: "1", w: 1 },
            { u: "2", v: "3", w: 1 },
        ],
        true,
    );
    assert.equal(directedDegree.lawHolds, true);
    assert.equal(directedDegree.totalInDegree, 4);
    assert.equal(directedDegree.totalOutDegree, 4);
    assert.deepEqual(
        directedDegree.rows.map((row) => [
            row.node,
            row.inDegree,
            row.outDegree,
        ]),
        [
            ["1", 2, 2],
            ["2", 1, 2],
            ["3", 1, 0],
        ],
    );
});

test("tree tools avoid undefined stats on forests", () => {
    const { nodes, edges } = parseTreeInput("1 2\n3 4\n5 -1");
    const adj = buildTreeAdjacency(nodes, edges);
    const { parent, depth } = buildTreeStructure(nodes, adj, nodes[0]);
    const sizes = subtreeSizes(nodes, adj, nodes[0]);
    const heights = subtreeHeights(nodes, adj, nodes[0]);
    for (const node of nodes) {
        assert.notEqual(depth[node], undefined);
        assert.notEqual(sizes[node], undefined);
        assert.notEqual(heights[node], undefined);
    }
    assert.equal(findLCA(parent, depth, "1", "3"), null);
    const diameter = treeDiameter(nodes, adj);
    assert.equal(diameter.length, 1);
    assert.deepEqual(new Set(diameter.path), new Set(["1", "2"]));
});

test("test generators respect edge-case constraints", () => {
    assert.equal(generateRandomString(3, "").length, 0);
    assert.deepEqual(generateRandomPermutation(-5), []);
    assert.deepEqual(generateRandomTree(1), []);
    assert.equal(generateRandomGraph(0, 5).length, 0);
    assert.equal(generateRandomGraph(4, 0, { connected: true }).length, 3);
    assert.equal(generateRandomGraph(3, 99).length, 3);
    assert.equal(
        generateRandomMatrix(2, 2, 5, 1, { symmetric: true })[0].length,
        2,
    );
    assert.deepEqual(generateRandomQueries(5, 0), []);
    assert.deepEqual(parseConstraints("n 10 1"), [
        { name: "n", min: 10, max: 1 },
    ]);
    assert.equal(
        generateFromConstraints([{ name: "n", min: 10, max: 1 }])[0].name,
        "n",
    );
    assert.equal(
        generateRandomArray(5, 3, 1, { unique: true }).every(
            (x) => x >= 1 && x <= 3,
        ),
        true,
    );
});

export function knapsack01(items, capacity) {
    const cap = Math.trunc(Number(capacity));
    if (!Number.isInteger(cap) || cap < 0) {
        return { dp: [], best: 0, taken: [] };
    }

    const safeItems = items.filter(
        (item) =>
            Number.isFinite(item.value) &&
            Number.isFinite(item.weight) &&
            Number.isInteger(item.weight) &&
            item.weight > 0,
    );
    const n = safeItems.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const { value, weight } = safeItems[i - 1];
        for (let w = 0; w <= cap; w++) {
            dp[i][w] = dp[i - 1][w];
            if (weight <= w) {
                dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + value);
            }
        }
    }

    const taken = [];
    let w = cap;
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            taken.push(safeItems[i - 1]);
            w -= safeItems[i - 1].weight;
        }
    }
    taken.reverse();

    return { dp, best: dp[n]?.[cap] ?? 0, taken };
}

export function longestCommonSubsequence(a, b) {
    const n = a.length;
    const m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    let i = n;
    let j = m;
    const chars = [];
    const matches = [];
    const path = [];
    while (true) {
        path.push([i, j]);
        if (i === 0 || j === 0) break;

        if (a[i - 1] === b[j - 1]) {
            chars.push(a[i - 1]);
            matches.push([i, j]);
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    chars.reverse();

    return {
        dp,
        length: dp[n]?.[m] ?? 0,
        subsequence: chars.join(""),
        path,
        matches,
    };
}

export function minCoinChange(denominations, target) {
    const amountTarget = Math.trunc(Number(target));
    if (!Number.isInteger(amountTarget) || amountTarget < 0) {
        return { dp: [], used: [], success: false };
    }

    const coins = [...new Set(denominations)]
        .map(Number)
        .filter((coin) => Number.isInteger(coin) && coin > 0)
        .sort((a, b) => a - b);

    const dp = new Array(amountTarget + 1).fill(Infinity);
    const choice = new Array(amountTarget + 1).fill(-1);
    dp[0] = 0;

    for (let amount = 1; amount <= amountTarget; amount++) {
        for (const coin of coins) {
            if (coin <= amount && dp[amount - coin] + 1 < dp[amount]) {
                dp[amount] = dp[amount - coin] + 1;
                choice[amount] = coin;
            }
        }
    }

    if (dp[amountTarget] === Infinity) return { dp, used: [], success: false };

    const used = [];
    let amount = amountTarget;
    while (amount > 0) {
        used.push(choice[amount]);
        amount -= choice[amount];
    }

    return { dp, used, success: true };
}

export function longestIncreasingSubsequence(nums) {
    const n = nums.length;
    if (n === 0) return { dp: [], length: 0, subsequence: [], indices: [] };

    const dp = new Array(n).fill(1);
    const parent = new Array(n).fill(-1);

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                parent[i] = j;
            }
        }
    }

    let bestIdx = 0;
    for (let i = 1; i < n; i++) {
        if (dp[i] > dp[bestIdx]) bestIdx = i;
    }

    const subsequence = [];
    const indices = [];
    let cur = bestIdx;
    while (cur !== -1) {
        subsequence.push(nums[cur]);
        indices.push(cur);
        cur = parent[cur];
    }
    subsequence.reverse();
    indices.reverse();

    return { dp, length: dp[bestIdx], subsequence, indices };
}

// Activity selection: given [{start, end}], returns the selected
// (non-overlapping) activities and the rejected ones, sorted by end time.
export function activitySelection(activities) {
    const sorted = activities
        .filter(
            (activity) =>
                Number.isFinite(activity.start) &&
                Number.isFinite(activity.end) &&
                activity.start <= activity.end,
        )
        .sort((a, b) => a.end - b.end);
    const selected = [];
    const rejected = [];
    let lastEnd = -Infinity;

    for (const act of sorted) {
        if (act.start >= lastEnd) {
            selected.push(act);
            lastEnd = act.end;
        } else {
            rejected.push(act);
        }
    }

    return { selected, rejected };
}

// Fractional knapsack: items = [{name, value, weight}], capacity = number.
// Returns chosen items with the fraction taken of each, sorted by value/weight ratio.
export function fractionalKnapsack(items, capacity) {
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap <= 0) {
        return { taken: [], totalValue: 0 };
    }

    const sorted = items
        .filter(
            (item) =>
                Number.isFinite(item.value) &&
                Number.isFinite(item.weight) &&
                item.weight > 0,
        )
        .map((item) => ({ ...item, ratio: item.value / item.weight }))
        .sort((a, b) => b.ratio - a.ratio);

    let remaining = cap;
    const taken = [];
    let totalValue = 0;

    for (const item of sorted) {
        if (remaining <= 0) break;
        const fraction = Math.min(1, remaining / item.weight);
        if (fraction > 0) {
            taken.push({ ...item, fraction });
            totalValue += item.value * fraction;
            remaining -= item.weight * fraction;
        }
    }

    return { taken, totalValue };
}

// Greedy coin change: repeatedly takes the largest coin <= remaining amount.
// Returns the coins used and whether it actually reached the target exactly.
export function greedyCoinChange(denominations, target) {
    const amountTarget = Math.trunc(Number(target));
    if (!Number.isInteger(amountTarget) || amountTarget < 0) {
        return { used: [], remaining: target, success: false };
    }

    const sorted = [...new Set(denominations)]
        .map(Number)
        .filter((coin) => Number.isInteger(coin) && coin > 0)
        .sort((a, b) => b - a);
    let remaining = amountTarget;
    const used = [];

    for (const coin of sorted) {
        while (remaining >= coin) {
            used.push(coin);
            remaining -= coin;
        }
    }

    return { used, remaining, success: remaining === 0 };
}

// Optimal coin change via DP — used only as a comparison baseline to
// show when greedy fails to find the minimum number of coins.
export function optimalCoinChange(denominations, target) {
    const amountTarget = Math.trunc(Number(target));
    if (!Number.isInteger(amountTarget) || amountTarget < 0) {
        return { used: [], success: false };
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

    if (dp[amountTarget] === Infinity) return { used: [], success: false };

    const used = [];
    let amount = amountTarget;
    while (amount > 0) {
        used.push(choice[amount]);
        amount -= choice[amount];
    }

    return { used, success: true };
}

// Job sequencing with deadlines: jobs = [{name, deadline, profit}].
// Greedily schedules highest-profit jobs as late as possible before
// their deadline. Returns the schedule slot-by-slot and total profit.
export function jobSequencing(jobs) {
    const validJobs = jobs.filter(
        (job) =>
            Number.isFinite(job.deadline) &&
            Number.isInteger(job.deadline) &&
            job.deadline > 0 &&
            Number.isFinite(job.profit),
    );
    const sorted = [...validJobs].sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...validJobs.map((j) => j.deadline), 0);
    const slots = new Array(maxDeadline).fill(null);
    let totalProfit = 0;
    const rejected = [];

    for (const job of sorted) {
        let placed = false;
        for (
            let slot = Math.min(job.deadline, maxDeadline) - 1;
            slot >= 0;
            slot--
        ) {
            if (slots[slot] === null) {
                slots[slot] = job;
                totalProfit += job.profit;
                placed = true;
                break;
            }
        }
        if (!placed) rejected.push(job);
    }

    return { slots, totalProfit, rejected };
}

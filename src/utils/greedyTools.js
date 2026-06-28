// Activity selection: given [{start, end}], returns the selected
// (non-overlapping) activities and the rejected ones, sorted by end time.
export function activitySelection(activities) {
    const sorted = [...activities].sort((a, b) => a.end - b.end);
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
    const sorted = [...items]
        .map((item) => ({ ...item, ratio: item.value / item.weight }))
        .sort((a, b) => b.ratio - a.ratio);

    let remaining = capacity;
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
    const sorted = [...denominations].sort((a, b) => b - a);
    let remaining = target;
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
    const dp = new Array(target + 1).fill(Infinity);
    const choice = new Array(target + 1).fill(-1);
    dp[0] = 0;

    for (let amount = 1; amount <= target; amount++) {
        for (const coin of denominations) {
            if (coin <= amount && dp[amount - coin] + 1 < dp[amount]) {
                dp[amount] = dp[amount - coin] + 1;
                choice[amount] = coin;
            }
        }
    }

    if (dp[target] === Infinity) return { used: [], success: false };

    const used = [];
    let amount = target;
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
    const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...jobs.map((j) => j.deadline), 0);
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

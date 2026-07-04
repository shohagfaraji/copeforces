import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

function countryName(code) {
    if (!code || code === "XX") return "Unknown";
    try {
        return (
            new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code
        );
    } catch {
        return code;
    }
}

function flagEmoji(code) {
    if (!code || code === "XX" || code.length !== 2) return "🏳️";
    const base = 127397;
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => base + c.charCodeAt(0)),
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
                {label}
            </div>
            <div className="text-2xl font-semibold mt-1 text-neutral-900 dark:text-neutral-50">
                {value}
            </div>
        </div>
    );
}

export default function Stats() {
    const [from, setFrom] = useState(daysAgoISO(30));
    const [to, setTo] = useState(todayISO());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/.netlify/functions/get-stats?from=${from}&to=${to}`)
            .then((res) => {
                if (!res.ok) throw new Error("Request failed");
                return res.json();
            })
            .then(setData)
            .catch(() => setError("Could not load analytics."))
            .finally(() => setLoading(false));
    }, [from, to]);

    const chartData = useMemo(
        () =>
            (data?.range?.daily || []).map((d) => ({
                date: d.d,
                views: Number(d.views),
            })),
        [data],
    );

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-neutral-500">
                Loading analytics…
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    const ov = data?.overview || {};
    const rg = data?.range || {};

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 py-8 md:px-10">
            <div className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    Homepage Analytics
                </h1>

                {/* Overview cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total views" value={ov.total ?? "–"} />
                    <StatCard label="Today" value={ov.today ?? "–"} />
                    <StatCard label="Yesterday" value={ov.yesterday ?? "–"} />
                    <StatCard label="Last 7 days" value={ov.last7 ?? "–"} />
                    <StatCard label="Last 30 days" value={ov.last30 ?? "–"} />
                    <StatCard label="This month" value={ov.thisMonth ?? "–"} />
                    <StatCard label="This year" value={ov.thisYear ?? "–"} />
                    <StatCard
                        label="Avg views / day (all-time)"
                        value={ov.avgDaily ?? "–"}
                    />
                </div>

                {ov.peak?.date && (
                    <div className="text-sm text-neutral-500">
                        Peak traffic day:{" "}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {ov.peak.date}
                        </span>{" "}
                        ({ov.peak.views} views)
                    </div>
                )}

                {/* Date range picker */}
                <div className="flex flex-wrap items-end gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            From
                        </label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            To
                        </label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 text-xs">
                        <button
                            onClick={() => {
                                setFrom(daysAgoISO(7));
                                setTo(todayISO());
                            }}
                            className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700"
                        >
                            7d
                        </button>
                        <button
                            onClick={() => {
                                setFrom(daysAgoISO(30));
                                setTo(todayISO());
                            }}
                            className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700"
                        >
                            30d
                        </button>
                        <button
                            onClick={() => {
                                setFrom(ov.firstDate || daysAgoISO(365));
                                setTo(todayISO());
                            }}
                            className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700"
                        >
                            All time
                        </button>
                    </div>
                </div>

                {/* Range summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total in range" value={rg.total ?? "–"} />
                    <StatCard
                        label="Avg / day in range"
                        value={rg.avgPerDay ?? "–"}
                    />
                    <StatCard
                        label="Highest day"
                        value={
                            rg.highestDay
                                ? `${rg.highestDay.d} (${rg.highestDay.v})`
                                : "–"
                        }
                    />
                    <StatCard
                        label="Lowest day"
                        value={
                            rg.lowestDay
                                ? `${rg.lowestDay.d} (${rg.lowestDay.v})`
                                : "–"
                        }
                    />
                </div>

                {/* Daily line chart */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.2}
                            />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly / Yearly totals */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <h2 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                            Monthly totals
                        </h2>
                        <ul className="text-sm space-y-1 max-h-56 overflow-y-auto">
                            {(rg.monthly || []).map((m) => (
                                <li key={m.m} className="flex justify-between">
                                    <span className="text-neutral-500">
                                        {m.m}
                                    </span>
                                    <span className="font-medium">
                                        {m.views}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <h2 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                            Yearly totals
                        </h2>
                        <ul className="text-sm space-y-1">
                            {(rg.yearly || []).map((y) => (
                                <li key={y.y} className="flex justify-between">
                                    <span className="text-neutral-500">
                                        {y.y}
                                    </span>
                                    <span className="font-medium">
                                        {y.views}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Top countries */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <h2 className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
                        Top countries (in range)
                    </h2>
                    <div className="space-y-2">
                        {(rg.topCountries || []).map((c) => (
                            <div
                                key={c.country_code}
                                className="flex items-center justify-between text-sm"
                            >
                                <span>
                                    {flagEmoji(c.country_code)}{" "}
                                    {countryName(c.country_code)}
                                </span>
                                <span className="font-medium">{c.views}</span>
                            </div>
                        ))}
                        {(!rg.topCountries || rg.topCountries.length === 0) && (
                            <div className="text-sm text-neutral-500">
                                No data in this range yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    FaArrowLeft,
    FaChartLine,
    FaGlobeAsia,
    FaMoon,
    FaRegCalendarAlt,
    FaSun,
} from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";
import logoLight from "../assets/logo/logo-light.webp";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
};

const EMPTY = "-";

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

function countryFlag(code) {
    if (!code || code === "XX") return "??";

    const normalized = String(code).trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "??";

    return normalized
        .split("")
        .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
        .join("");
}

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return EMPTY;
    return new Intl.NumberFormat("en").format(number);
}

function compactDate(value) {
    if (!value || value === "undefined") return EMPTY;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function chartDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function normalizeDay(day) {
    if (!day) return null;

    const date = day.d ?? day.date ?? day.day ?? day.label;
    const views = day.v ?? day.views ?? day.count ?? day.total;

    if (
        !date ||
        date === "undefined" ||
        views === undefined ||
        views === null
    ) {
        return null;
    }

    return {
        date,
        views: Number(views),
    };
}

function StatCard({ label, value, note, accent = "blue" }) {
    const accentClass =
        accent === "violet"
            ? "from-violet-500/30 to-transparent"
            : accent === "green"
              ? "from-emerald-500/30 to-transparent"
              : "from-sky-500/30 to-transparent";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div
                className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accentClass}`}
            />
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                {value}
            </div>
            {note ? (
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {note}
                </div>
            ) : null}
        </div>
    );
}

function Panel({ title, icon: Icon, children, className = "" }) {
    return (
        <section
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-5 dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)] ${className}`}
        >
            <div className="mb-4 flex items-center gap-3">
                {Icon ? (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-sky-300">
                        <Icon size={15} />
                    </span>
                ) : null}
                <h2 className="text-base font-semibold text-slate-950 sm:text-lg dark:text-white">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-white/10 dark:bg-slate-950">
            <div className="text-xs text-slate-500 dark:text-slate-400">
                {compactDate(label)}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                {formatNumber(payload[0].value)} views
            </div>
        </div>
    );
}

export default function Stats() {
    const { theme, toggleTheme } = useTheme();
    const [from, setFrom] = useState(daysAgoISO(30));
    const [to, setTo] = useState(todayISO());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const updateRange = (nextFrom, nextTo) => {
        setLoading(true);
        setError(null);
        setFrom(nextFrom);
        setTo(nextTo);
    };

    useEffect(() => {
        const controller = new AbortController();

        fetch(`/.netlify/functions/get-stats?from=${from}&to=${to}`, {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Request failed");
                return response.json();
            })
            .then((payload) => {
                setData(payload);
                setError(null);
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError") {
                    setError("Could not load analytics.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [from, to]);

    const chartData = useMemo(
        () =>
            (data?.range?.daily || []).map((day) => ({
                date: day.d ?? day.date ?? day.day,
                views: Number(day.views ?? day.v ?? day.count ?? 0),
            })),
        [data],
    );

    const ov = data?.overview || {};
    const rg = data?.range || {};
    const highestDay = normalizeDay(rg.highestDay);
    const lowestDay = normalizeDay(rg.lowestDay);
    const topCountries = rg.topCountries || [];
    const hasChartData = chartData.length > 0;
    const isDark = theme === "dark";
    const chartGrid = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
    const chartTick = isDark ? "#94a3b8" : "#64748b";
    const activeDotStroke = isDark ? "#ffffff" : "#f8fafc";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#090b12] dark:text-slate-100">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(91,155,240,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(181,118,232,0.18),transparent_32%)]" />
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                <header className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-5 lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
                    <div className="flex min-w-0 items-center gap-4">
                        <img
                            src={logoLight}
                            alt="copeforces"
                            className="h-12 w-12 flex-shrink-0 rounded-xl"
                            draggable="false"
                        />
                        <div className="min-w-0">
                            <div className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
                                copeforces analytics
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                                Homepage performance dashboard
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
                                Track traffic rhythm, daily spikes, country
                                reach, and long-term growth for the copeforces
                                homepage.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-sky-300/50 dark:hover:text-white"
                            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        >
                            {isDark ? (
                                <FaSun size={13} />
                            ) : (
                                <FaMoon size={13} />
                            )}
                            {isDark ? "Light mode" : "Dark mode"}
                        </button>
                        <a
                            href="/"
                            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-sky-300/50 dark:hover:text-white"
                        >
                            <FaArrowLeft size={12} />
                            Back to site
                        </a>
                    </div>
                </header>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200">
                        {error}
                    </div>
                ) : null}

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total views"
                        value={formatNumber(ov.total)}
                        note="All tracked homepage visits"
                    />
                    <StatCard
                        label="Today"
                        value={formatNumber(ov.today)}
                        note={`Yesterday: ${formatNumber(ov.yesterday)}`}
                        accent="green"
                    />
                    <StatCard
                        label="Last 30 days"
                        value={formatNumber(ov.last30)}
                        note={`Last 7 days: ${formatNumber(ov.last7)}`}
                        accent="violet"
                    />
                    <StatCard
                        label="Average / day"
                        value={formatNumber(ov.avgDaily)}
                        note="All-time daily average"
                    />
                </section>

                <Panel title="Date range" icon={FaRegCalendarAlt}>
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                From
                            </span>
                            <input
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    updateRange(event.target.value, to)
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-sky-300"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                To
                            </span>
                            <input
                                type="date"
                                value={to}
                                onChange={(event) =>
                                    updateRange(from, event.target.value)
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-sky-300"
                            />
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                ["7d", daysAgoISO(7)],
                                ["30d", daysAgoISO(30)],
                                ["All", ov.firstDate || daysAgoISO(365)],
                            ].map(([label, start]) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() =>
                                        updateRange(start, todayISO())
                                    }
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-sky-300/50 dark:hover:text-white"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Panel>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total in range"
                        value={formatNumber(rg.total)}
                    />
                    <StatCard
                        label="Avg / day in range"
                        value={formatNumber(rg.avgPerDay)}
                        accent="green"
                    />
                    <StatCard
                        label="Highest day"
                        value={
                            highestDay ? formatNumber(highestDay.views) : EMPTY
                        }
                        note={
                            highestDay
                                ? compactDate(highestDay.date)
                                : "No range data"
                        }
                        accent="violet"
                    />
                    <StatCard
                        label="Lowest day"
                        value={
                            lowestDay ? formatNumber(lowestDay.views) : EMPTY
                        }
                        note={
                            lowestDay
                                ? compactDate(lowestDay.date)
                                : "No range data"
                        }
                    />
                </section>

                <Panel title="Daily traffic trend" icon={FaChartLine}>
                    <div className="h-[340px] sm:h-[390px]">
                        {loading && !data ? (
                            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                                Loading analytics...
                            </div>
                        ) : hasChartData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 12,
                                        right: 12,
                                        bottom: 14,
                                        left: -16,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke={chartGrid}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={chartDate}
                                        tick={{ fill: chartTick, fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                        minTickGap={24}
                                    />
                                    <YAxis
                                        tick={{ fill: chartTick, fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                        width={44}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#5b9bf0"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                            fill: "#b576e8",
                                            stroke: activeDotStroke,
                                            strokeWidth: 2,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
                                No daily traffic data in this range yet.
                            </div>
                        )}
                    </div>
                </Panel>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
                    <Panel title="Monthly totals">
                        <div className="space-y-2">
                            {(rg.monthly || []).map((month) => (
                                <div
                                    key={month.m}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]"
                                >
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {month.m}
                                    </span>
                                    <span className="font-semibold text-slate-950 dark:text-white">
                                        {formatNumber(month.views)}
                                    </span>
                                </div>
                            ))}
                            {!rg.monthly || rg.monthly.length === 0 ? (
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    No monthly data in this range.
                                </div>
                            ) : null}
                        </div>
                    </Panel>

                    <Panel title="Yearly totals">
                        <div className="space-y-2">
                            {(rg.yearly || []).map((year) => (
                                <div
                                    key={year.y}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]"
                                >
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {year.y}
                                    </span>
                                    <span className="font-semibold text-slate-950 dark:text-white">
                                        {formatNumber(year.views)}
                                    </span>
                                </div>
                            ))}
                            {!rg.yearly || rg.yearly.length === 0 ? (
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    No yearly data in this range.
                                </div>
                            ) : null}
                        </div>
                    </Panel>
                </section>

                <Panel title="Top countries in range" icon={FaGlobeAsia}>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {topCountries.map((country) => (
                            <div
                                key={
                                    country.country_code ||
                                    country.country ||
                                    "unknown"
                                }
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl shadow-sm dark:border-white/10 dark:bg-white/[0.06]"
                                        aria-hidden="true"
                                    >
                                        {countryFlag(country.country_code)}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-slate-950 dark:text-white">
                                            {countryName(country.country_code)}
                                        </div>
                                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
                                            {country.country_code || "XX"}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                                    {formatNumber(country.views)}
                                </div>
                            </div>
                        ))}
                        {topCountries.length === 0 ? (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                No country data in this range yet.
                            </div>
                        ) : null}
                    </div>
                </Panel>
            </div>
        </main>
    );
}

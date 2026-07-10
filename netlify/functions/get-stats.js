import { createClient } from "@supabase/supabase-js";

const COUNTRY_RPC_CANDIDATES = [
    "get_range_countries",
    "get_country_breakdown",
    "get_range_country_analytics",
];

const COUNTRY_TABLE_CANDIDATES = [
    {
        table: "daily_views",
        dateKey: "view_date",
        countryKey: "country_code",
        viewsKey: "views",
    },
    {
        table: "homepage_country_views",
        dateKey: "date",
        countryKey: "country_code",
        viewsKey: "views",
    },
    {
        table: "daily_country_views",
        dateKey: "date",
        countryKey: "country_code",
        viewsKey: "views",
    },
    {
        table: "country_views",
        dateKey: "date",
        countryKey: "country_code",
        viewsKey: "views",
    },
    {
        table: "visitor_countries",
        dateKey: "date",
        countryKey: "country_code",
        viewsKey: "visits",
    },
];

function normalizeCountryCode(value) {
    const code = String(value || "XX")
        .trim()
        .toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : "XX";
}

function normalizeCountryViews(value) {
    const views = Number(value);
    return Number.isFinite(views) ? views : 0;
}

function normalizeCountryRows(rows, keys = {}) {
    const countryKey = keys.countryKey || "country_code";
    const viewsKey = keys.viewsKey || "views";
    const totals = new Map();

    for (const row of rows || []) {
        const countryCode = normalizeCountryCode(
            row?.[countryKey] ??
                row?.country_code ??
                row?.countryCode ??
                row?.code ??
                row?.country,
        );
        const views = normalizeCountryViews(
            row?.[viewsKey] ??
                row?.views ??
                row?.visits ??
                row?.count ??
                row?.total,
        );

        if (views < 1) continue;
        totals.set(countryCode, (totals.get(countryCode) || 0) + views);
    }

    return Array.from(totals, ([country_code, views]) => ({
        country_code,
        views,
    })).sort((a, b) => {
        if (b.views !== a.views) return b.views - a.views;
        return a.country_code.localeCompare(b.country_code);
    });
}

async function loadCountryRowsFromRpc(supabase, from, to) {
    for (const rpcName of COUNTRY_RPC_CANDIDATES) {
        const { data, error } = await supabase.rpc(rpcName, {
            p_from: from,
            p_to: to,
        });

        if (!error && Array.isArray(data)) {
            return normalizeCountryRows(data);
        }
    }

    return null;
}

async function loadCountryRowsFromTables(supabase, from, to) {
    for (const source of COUNTRY_TABLE_CANDIDATES) {
        const { data, error } = await supabase
            .from(source.table)
            .select(`${source.dateKey},${source.countryKey},${source.viewsKey}`)
            .gte(source.dateKey, from)
            .lte(source.dateKey, to);

        if (!error && Array.isArray(data)) {
            return normalizeCountryRows(data, source);
        }
    }

    return null;
}

async function loadAllCountriesInRange(supabase, from, to, range) {
    const rpcRows = await loadCountryRowsFromRpc(supabase, from, to);
    if (rpcRows) return rpcRows;

    const tableRows = await loadCountryRowsFromTables(supabase, from, to);
    if (tableRows) return tableRows;

    return normalizeCountryRows(
        range?.allCountries ||
            range?.countries ||
            range?.countryBreakdown ||
            range?.topCountries ||
            [],
    );
}

export default async (request) => {
    if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
        );

        const url = new URL(request.url);
        const today = new Date().toISOString().slice(0, 10);
        const from = url.searchParams.get("from") || "2000-01-01";
        const to = url.searchParams.get("to") || today;

        const [{ data: overview, error: e1 }, { data: range, error: e2 }] =
            await Promise.all([
                supabase.rpc("get_overview"),
                supabase.rpc("get_range_analytics", { p_from: from, p_to: to }),
            ]);

        if (e1) throw e1;
        if (e2) throw e2;

        const allCountries = await loadAllCountriesInRange(
            supabase,
            from,
            to,
            range,
        );
        const normalizedRange =
            range && typeof range === "object"
                ? {
                      ...range,
                      allCountries,
                      topCountries: allCountries,
                  }
                : range;

        return new Response(
            JSON.stringify({ overview, range: normalizedRange, from, to }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=30",
                },
            },
        );
    } catch (err) {
        console.error("get-stats error:", err);
        return new Response(
            JSON.stringify({ error: "Failed to load analytics" }),
            { status: 500 },
        );
    }
};

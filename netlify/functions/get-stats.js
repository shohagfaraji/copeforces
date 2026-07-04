import { createClient } from "@supabase/supabase-js";

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

        return new Response(JSON.stringify({ overview, range, from, to }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        });
    } catch (err) {
        console.error("get-stats error:", err);
        return new Response(
            JSON.stringify({ error: "Failed to load analytics" }),
            { status: 500 },
        );
    }
};

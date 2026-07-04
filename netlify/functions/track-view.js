import { createClient } from "@supabase/supabase-js";

export default async (request, context) => {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
        );

        const country = context.geo?.country?.code || "XX";
        const today = new Date().toISOString().slice(0, 10);

        const { error } = await supabase.rpc("increment_daily_view", {
            p_date: today,
            p_country: country,
        });

        if (error) throw error;

        return new Response(null, { status: 204 });
    } catch (err) {
        console.error("track-view error:", err);
        return new Response(
            JSON.stringify({ error: "Failed to record view" }),
            { status: 500 },
        );
    }
};

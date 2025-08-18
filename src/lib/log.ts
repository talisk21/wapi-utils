import { supabase } from "./supabase";

const on = String(process.env.LOGGING_ENABLED || "").toLowerCase() === "true";

export async function logApi(entry: {
    method?: string | null;
    path?: string | null;
    status?: number | null;
    duration_ms?: number | null;
    user_agent?: string | null;
    ip?: string | null;
}) {
    if (!on) return;
    // fire-and-forget; keep tests snappy
    supabase.from("api_logs").insert([entry]);
}
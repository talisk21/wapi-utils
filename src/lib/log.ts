import { supabase } from "./supabase";

export interface ApiLogEntry {
    id?: number | string;
    created_at?: string;
    method?: string | null;
    path?: string | null;
    status?: number | null;
    duration_ms?: number | null;
    user_agent?: string | null;
    ip?: string | null;
    req?: any;
}

const on = String(process.env.LOGGING_ENABLED || "true").toLowerCase() !== "false";

export async function logApi(entry: ApiLogEntry) {
    if (!on) return;
    try {
        await supabase.from("api_logs").insert([entry]);
    } catch (e) {
        console.error("logApi error:", e);
    }
}

export async function insertApiLog(entry: ApiLogEntry) {
    try {
        const { data, error } = await supabase.from("api_logs").insert([entry]).select();
        if (error) {
            console.error("Supabase insert error in api_logs:", error.message, error.details ?? "", error.hint ?? "");
        }
        return { data, error };
    } catch (e) {
        console.error("insertApiLog error:", e);
        return { error: e };
    }
}
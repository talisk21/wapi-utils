import {NextResponse} from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    'https://vpsyjbnpwpyfdwofejhx.supabase.co',
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc3lqYm5wd3B5ZmR3b2Zlamh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUwNzgxMywiZXhwIjoyMDcxMDgzODEzfQ.luuhGzatTt93xPiyoxiHVj6Xi8YIo0trEo1R73dabGQ",
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const LOGGING_ENABLED = true;

async function writeApiLog(req: Request, startedAt: number, status: number) {
    if (!LOGGING_ENABLED) return;
    try {
        const entry = {
            method: req.method,
            path: new URL(req.url).pathname,
            status,                                   // ✅ number, not string
            duration_ms: Date.now() - startedAt,
            user_agent: req.headers.get("user-agent"),
            ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        };

        // For debugging: await and log error/result
        const { error } = await supabase.from("api_logs").insert([entry]);
        if (error) {
            console.error("Supabase insert error:", error.message, error.details ?? "", error.hint ?? "");
        } else {
            // Optional: console.log("log inserted");
        }
    } catch (e) {
        console.error("writeApiLog failed:", (e as Error).message);
    }
}

export async function POST(req: Request) {
    const started = Date.now();
    const status = 200;
    const res = NextResponse.json({ ok: true, message: "Success" }, { status });
    await writeApiLog(req, started, status);
    return res;
}

// (Optional) Add GET to test easily from browser/Postman:
export async function GET(req: Request) {
    const started = Date.now();
    const status = 200;
    const res = NextResponse.json({ ok: true, message: "Success" }, { status });
    await writeApiLog(req, started, status);
    return res;
}
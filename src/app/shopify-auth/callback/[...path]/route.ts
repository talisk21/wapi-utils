import {NextResponse} from 'next/server';
import {supabase} from "@/lib/supabase";

const LOGGING_ENABLED = true;

async function writeApiLog(req: Request, startedAt: number) {
    if (!LOGGING_ENABLED) return;

    try {
        const entry = {
            method: req.method,
            path: new URL(req.url).pathname,
            status: '200',
            duration_ms: Date.now() - startedAt,
            user_agent: req.headers.get("user-agent"),
            ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        };
        // non-blocking
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        supabase.from("api_logs").insert([entry]);
    } catch (e) {
        console.error("writeApiLog failed:", (e as Error).message);
    }
}

// Make sure Next doesn’t cache these responses
export const dynamic = "force-dynamic";
export const runtime = "edge";


export async function POST(req: Request, { params }: { params: { path: string[] } }) {
    //const path = `/callback/${params.path.join('/')}`;
    const started = Date.now();

    writeApiLog(req, started);

    // Respond to send success
    return NextResponse.json({ ok: true, message: 'Success' }, { status: 200 });
}
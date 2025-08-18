import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    'https://vpsyjbnpwpyfdwofejhx.supabase.co',
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc3lqYm5wd3B5ZmR3b2Zlamh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUwNzgxMywiZXhwIjoyMDcxMDgzODEzfQ.luuhGzatTt93xPiyoxiHVj6Xi8YIo0trEo1R73dabGQ",
    { auth: { persistSession: false, autoRefreshToken: false } }
);
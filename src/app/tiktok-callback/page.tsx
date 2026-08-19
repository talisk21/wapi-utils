export default function TiktokCallbackPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    return (
        <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>TikTok Registration Callback</h1>
            <p>These are the properties received from TikTok:</p>
            <div
                style={{
                    background: "#f4f4f4",
                    color: "black",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    overflowX: "auto",
                }}
            >
                <pre style={{ margin: 0 }}>
                    {Object.keys(searchParams).length > 0
                        ? JSON.stringify(searchParams, null, 2)
                        : "No parameters received in the URL."}
                </pre>
            </div>
        </main>
    );
}

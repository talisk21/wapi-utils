import { cookies } from 'next/headers';
import TokenDisplay from '@/components/TokenDisplay';
import ClearCookies from '@/components/ClearCookies';

export default async function TiktokCallbackPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const cookieStore = cookies();
    const appKey = cookieStore.get('tiktokAppKey')?.value;
    const appSecret = cookieStore.get('tiktokAppSecret')?.value;
    
    // Sometimes it's called 'code', sometimes 'auth_code'
    const authCode = searchParams.auth_code || searchParams.code;
    
    let resultData = null;
    let errorMsg = null;

    if (appKey && appSecret && authCode) {
        try {
            const url = `https://auth.tiktok-shops.com/api/v2/token/get?app_key=${appKey}&app_secret=${appSecret}&auth_code=${authCode}&grant_type=authorized_code`;
            const response = await fetch(url, {
                method: 'GET',
                // disable caching so we always fetch a new token
                cache: 'no-store' 
            });
            resultData = await response.json();
        } catch (error: any) {
            errorMsg = error.message;
        }
    }

    return (
        <main style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
            <h1>TikTok Registration Callback</h1>
            
            <ClearCookies cookieNames={['tiktokServiceId', 'tiktokAppKey', 'tiktokAppSecret']} />

            {!appKey || !appSecret || !authCode ? (
                <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '20px' }}>
                    <p><strong>Missing required parameters!</strong></p>
                    <ul>
                        {!appKey && <li>App Key is missing from cookies</li>}
                        {!appSecret && <li>App Secret is missing from cookies</li>}
                        {!authCode && <li>Auth Code is missing from URL parameters</li>}
                    </ul>
                </div>
            ) : null}

            {errorMsg ? (
                <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '20px' }}>
                    <strong>Error fetching token:</strong> {errorMsg}
                </div>
            ) : null}

            {resultData ? (
                <TokenDisplay data={resultData} />
            ) : (
                <div>
                    <h3>URL Parameters Received:</h3>
                    <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
                        <pre style={{ margin: 0 }}>
                            {Object.keys(searchParams).length > 0
                                ? JSON.stringify(searchParams, null, 2)
                                : "No parameters received in the URL."}
                        </pre>
                    </div>
                </div>
            )}
        </main>
    );
}

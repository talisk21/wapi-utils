import React from 'react';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TikTokSuccessPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const sellerParam = searchParams.seller;
    const sellerName = Array.isArray(sellerParam) ? sellerParam[0] : sellerParam;

    const shopsCountParam = searchParams.shops;
    const shopsCount = Array.isArray(shopsCountParam) ? shopsCountParam[0] : shopsCountParam;

    return (
        <main
            style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <div
                style={{
                    maxWidth: '540px',
                    width: '100%',
                    background: '#ffffff',
                    color: '#1a1a1a',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    padding: '40px 32px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#e6f7ec',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '32px',
                        fontWeight: 'bold',
                    }}
                >
                    ✓
                </div>

                <h1 style={{ fontSize: '26px', margin: '0 0 12px', color: '#111827' }}>
                    Thank You!
                </h1>

                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                    {sellerName ? `Welcome, ${sellerName}! ` : ''}Your TikTok Shop authorization has been completed successfully.
                </p>

                {shopsCount && (
                    <div
                        style={{
                            display: 'inline-block',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#166534',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 500,
                            marginBottom: '20px',
                        }}
                    >
                        Connected shops: {shopsCount}
                    </div>
                )}

                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' }}>
                    Your credentials and shop details have been securely synchronized with our logistics system. No further action is required — you may safely close this window.
                </p>
            </div>
        </main>
    );
}

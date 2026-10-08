import React from 'react';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TikTokErrorPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const errorParam = searchParams.error || searchParams.auth_error || searchParams.msg;
    const errorMessage = Array.isArray(errorParam) ? errorParam[0] : errorParam;

    return (
        <main
            style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <div
                style={{
                    maxWidth: '560px',
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
                        background: '#fef2f2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '32px',
                        fontWeight: 'bold',
                    }}
                >
                    ✕
                </div>

                <h1 style={{ fontSize: '24px', margin: '0 0 12px', color: '#111827' }}>
                    Authorization Incomplete
                </h1>

                <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                    We were unable to complete the authorization with your TikTok Shop.
                </p>

                {errorMessage && (
                    <div
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '14px',
                            fontSize: '13px',
                            color: '#b91c1c',
                            textAlign: 'left',
                            wordBreak: 'break-word',
                            margin: '16px 0 24px',
                            lineHeight: '1.5',
                        }}
                    >
                        <strong>Reason:</strong> {errorMessage}
                    </div>
                )}

                <div
                    style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '16px',
                        fontSize: '14px',
                        color: '#334155',
                        lineHeight: '1.6',
                        textAlign: 'left',
                        marginBottom: '24px',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>What you can do:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>Please try authorizing again in a few minutes.</li>
                        <li>
                            If the issue persists, contact <strong>WAPI IT Support</strong> for assistance.
                        </li>
                    </ul>
                </div>

                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                    Our technical support team has logged the error details for investigation.
                </p>
            </div>
        </main>
    );
}

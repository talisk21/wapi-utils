'use client';

import React, { useState } from 'react';

export default function TokenDisplay({ data }: { data: any }) {
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedRefresh, setCopiedRefresh] = useState(false);

    const handleCopy = (text: string, type: 'token' | 'refresh') => {
        navigator.clipboard.writeText(text);
        if (type === 'token') {
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        } else {
            setCopiedRefresh(true);
            setTimeout(() => setCopiedRefresh(false), 2000);
        }
    };

    const accessToken = data?.data?.access_token;
    const refreshToken = data?.data?.refresh_token;

    return (
        <div>
            {accessToken && (
                <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <strong>Access Token:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <input
                            type="text"
                            readOnly
                            value={accessToken}
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <button
                            onClick={() => handleCopy(accessToken, 'token')}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            {copiedToken ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            {refreshToken && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <strong>Refresh Token:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <input
                            type="text"
                            readOnly
                            value={refreshToken}
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <button
                            onClick={() => handleCopy(refreshToken, 'refresh')}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            {copiedRefresh ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            <h3>Full Response:</h3>
            <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
                <pre style={{ margin: 0 }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
}

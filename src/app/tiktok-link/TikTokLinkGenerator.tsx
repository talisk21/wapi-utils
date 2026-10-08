'use client';

import React, { useState } from 'react';

interface Props {
    defaultServiceId: string;
}

export default function TikTokLinkGenerator({ defaultServiceId }: Props) {
    const [serviceId, setServiceId] = useState(defaultServiceId);
    const [region, setRegion] = useState<'us' | 'row'>('row');
    const [copied, setCopied] = useState(false);

    const activeServiceId = serviceId.trim();

    // Select domain based on seller market region
    const domain = region === 'us' ? 'services.us.tiktokshop.com' : 'services.tiktokshop.com';
    const generatedUrl = activeServiceId
        ? `https://${domain}/open/authorize?service_id=${encodeURIComponent(activeServiceId)}`
        : '';

    const handleCopy = () => {
        if (!generatedUrl) return;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Target Market Region:
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="region"
                            value="row"
                            checked={region === 'row'}
                            onChange={() => setRegion('row')}
                        />
                        Rest of World / Cross-border (services.tiktokshop.com)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="region"
                            value="us"
                            checked={region === 'us'}
                            onChange={() => setRegion('us')}
                        />
                        US Market (services.us.tiktokshop.com)
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="serviceId" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Service ID (from .env or custom):
                </label>
                <input
                    type="text"
                    id="serviceId"
                    value={serviceId}
                    placeholder="e.g. 7123456789012345678"
                    onChange={(e) => setServiceId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '15px',
                        boxSizing: 'border-box',
                    }}
                />
                {!defaultServiceId && (
                    <small style={{ color: '#d97706', display: 'block', marginTop: '4px' }}>
                        Notice: TIKTOK_SERVICE_ID is not set in .env.local. You can enter it manually above or define it in your .env.
                    </small>
                )}
            </div>

            {generatedUrl ? (
                <div
                    style={{
                        padding: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    <div style={{ fontWeight: 600, color: '#334155' }}>Generated Authorization Link:</div>
                    <div
                        style={{
                            background: '#ffffff',
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#0f172a',
                        }}
                    >
                        {generatedUrl}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button
                            type="button"
                            onClick={handleCopy}
                            style={{
                                padding: '10px 18px',
                                background: copied ? '#10b981' : '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            {copied ? '✓ Copied to clipboard!' : 'Copy Link for Seller'}
                        </button>
                        <a
                            href={generatedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '10px 18px',
                                background: '#ffffff',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            Open Link ↗
                        </a>
                    </div>
                </div>
            ) : (
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                    Enter a Service ID to generate the authorization link.
                </div>
            )}
        </div>
    );
}

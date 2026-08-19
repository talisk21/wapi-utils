'use client';

import React, { useState } from 'react';
import Cookie from 'js-cookie';

export default function TiktokAuth() {
    const [serviceId, setServiceId] = useState('');
    const [appKey, setAppKey] = useState('');
    const [appSecret, setAppSecret] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Store keys in cookies so we can use them in the callback
        Cookie.set('tiktokServiceId', serviceId);
        Cookie.set('tiktokAppKey', appKey);
        Cookie.set('tiktokAppSecret', appSecret);

        // Redirect to TikTok authorization URL
        const authUrl = `https://partner.tiktokshop.com/open/authorize?service_id=${serviceId}`;
        window.location.href = authUrl;
    };

    return (
        <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>TikTok Authorization</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <div style={{ minWidth: '370px' }}>
                    <label htmlFor="serviceId" style={{ display: 'block', marginBottom: '5px' }}>Service ID</label>
                    <input
                        type="text"
                        id="serviceId"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label htmlFor="appKey" style={{ display: 'block', marginBottom: '5px' }}>App Key</label>
                    <input
                        type="text"
                        id="appKey"
                        value={appKey}
                        onChange={(e) => setAppKey(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label htmlFor="appSecret" style={{ display: 'block', marginBottom: '5px' }}>App Secret</label>
                    <input
                        type="text"
                        id="appSecret"
                        value={appSecret}
                        onChange={(e) => setAppSecret(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ marginTop: '36px', padding: '10px', cursor: 'pointer', background: '#000', color: '#fff', border: '2px solid white', borderRadius: '4px' }}>
                    Authenticate in TikTok
                </button>
            </form>
        </main>
    );
}

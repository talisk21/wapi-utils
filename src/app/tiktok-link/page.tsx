import React from 'react';
import TikTokLinkGenerator from './TikTokLinkGenerator';

export default function TikTokLinkPage() {
    const defaultServiceId = process.env.TIKTOK_SERVICE_ID || '';

    return (
        <main style={{ padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>TikTok Authorization Link Generator</h1>
            <p style={{ color: '#475569', marginBottom: '28px', lineHeight: '1.5' }}>
                Use this page to generate the authorization link to send to TikTok sellers. When the seller opens this link and approves your app, TikTok will redirect them to your callback, where the tokens are automatically retrieved and stored in Supabase.
            </p>

            <TikTokLinkGenerator defaultServiceId={defaultServiceId} />
        </main>
    );
}

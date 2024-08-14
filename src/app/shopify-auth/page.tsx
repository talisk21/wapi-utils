'use client'

import { useState } from 'react';
import Cookie from 'js-cookie';
export default function Home() {
    const [shop, setShop] = useState('shopname.myshopify.com')
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Store the API key and secret in cookies
        Cookie.set('shop', shop);
        Cookie.set('shopifyApiKey', apiKey);
        Cookie.set('shopifyApiSecret', apiSecret);

        // Redirect to the authorization URL
        const redirectUri = `${window.location.origin}/shopify-auth/callback`; // Automatically detect redirect URI
        const scopes = [
            "read_assigned_fulfillment_orders",
            "write_assigned_fulfillment_orders",
            "read_customers",
            "write_customers",
            "read_fulfillments",
            "write_fulfillments",
            "read_inventory",
            "write_inventory",
            "read_locations",
            "read_orders",
            "write_orders",
            "read_products",
            "write_products",
            "read_product_listings",
            "read_shipping",
            "write_shipping",
            "read_third_party_fulfillment_orders",
            "write_third_party_fulfillment_orders",
            "customer_read_customers",
            "customer_write_customers",
            "customer_read_orders",
            "customer_read_draft_orders",
            "customer_read_markets"
        ];

        const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(redirectUri)}`;

        console.log('link:', authUrl)

        // Redirect to Shopify authentication
        window.location.href = authUrl;
    };

    return (
        <main>
            <h1>Shopify Authorization</h1>
            <form onSubmit={handleSubmit}>
                <div className='form-control'>
                    <label htmlFor="shop">Domain in Shopify</label>
                    <input
                        type="text"
                        id="shop"
                        value={shop}
                        onChange={(e) => setShop(e.target.value)}
                        required
                    />
                </div>
                <div className='form-control'>
                    <label htmlFor="apiKey">Shopify API Key</label>
                    <input
                        type="text"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                    />
                </div>
                <div className='form-control'>
                    <label htmlFor="apiSecret">Shopify API Secret</label>
                    <input
                        type="text"
                        id="apiSecret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        required
                    />
                </div>
                <div className='centered mt-24'>
                    <button type="submit">Authenticate in Shopify</button>
                </div>
            </form>
        </main>
    );
}
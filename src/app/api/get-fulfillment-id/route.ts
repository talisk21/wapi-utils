import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { shop, accessToken } = await request.json();

    if (!shop || !accessToken) {
        return NextResponse.json({ error: 'Missing required parameters' });
    }

    try {
        const tokenUrl = `https://${shop}/admin/api/2023-01/fulfillment_services.json`;
        const response = await axios.post(tokenUrl,
            {
                "fulfillment_service": {
                    "name": "WAPI Fulfillment",
                    "callback_url": "https://wapi-shopify.azurewebsites.net/",
                    "inventory_management": true,
                    "tracking_support": true,
                    "requires_shipping_method": false,
                    "format": "json",
                    "fulfillment_orders_opt_in":true,
                    "permits_sku_sharing":true
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                }
            }
        );

        if (response.status === 200) {
            return NextResponse.json({ access_token: response.data.access_token });
        } else {
            return NextResponse.json({ error: 'Failed to retrieve access token' });
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        return NextResponse.json({ error: 'Error fetching access token'+' -- '+error });
    }
}

export async function GET(request: Request) {
    const { shop, accessToken } = await request.json();

    if (!shop || !accessToken) {
        return NextResponse.json({ error: 'Missing required parameters' });
    }

    try {
        const tokenUrl = `https://${shop}/admin/api/2023-01/fulfillment_services.json`;
        const response = await axios.get(tokenUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                }
            }
        );

        if (response.status === 200) {
            return NextResponse.json({ access_token: response.data.access_token });
        } else {
            return NextResponse.json({ error: 'Failed to retrieve access token' });
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        return NextResponse.json({ error: 'Error fetching access token'+' -- '+error });
    }
}
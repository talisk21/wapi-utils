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

        console.log('response POST: ', response)
        return NextResponse.json({dataRes: {location_id: response?.data, statusRes: response?.status}});

        // if (response.status === 200) {
        //     return NextResponse.json({ location_id: response.data?.fulfillment_service?.location_id });
        // } else {
        //     return NextResponse.json({ error: 'Failed to retrieve location_id POST' });
        // }
    } catch (error) {
        console.error('Error fetching location_id POST:', error);
        return NextResponse.json({ error: 'Error fetching location_id POST'+' -- '+error, statusRes: 422 });
    }
}


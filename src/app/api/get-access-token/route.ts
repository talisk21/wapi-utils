import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { shop, apiKey, apiSecret, code } = await request.json();

    if (!apiKey || !apiSecret || !code) {
        return NextResponse.json({ error: 'Missing required parameters' });
    }

    try {
        const tokenUrl = `https://${shop}/admin/oauth/access_token`;
        const response = await axios.post(tokenUrl, {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        });

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
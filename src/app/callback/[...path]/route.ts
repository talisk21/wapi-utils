import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
    const path = `/callback/${params.path.join('/')}`; // Build the full path from params

    const loggingApiUrl = 'https://api.wapi.com/API/hs/v1/Services/Shopify/Callback'; // Replace with your logging server URL

    // Extract request details
    const url = req.url;
    const method = req.method;
    //const headers = Object.fromEntries(req.headers.entries());

    // // Attempt to parse JSON body
    // let body = null;
    // try {
    //     body = await req.json();
    // } catch (error) {
    //     console.warn('No JSON body found:', error);
    // }

    // Log the request
    try {
        await fetch(loggingApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, method, path }),
        });
    } catch (error) {
        console.error('Error sending log to logging server:', error);
    }

    // Respond to indicate the route does not exist
    return NextResponse.json({ status: 200 });
}
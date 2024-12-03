import { NextResponse } from 'next/server';

export async function middleware() {
    // const loggingApiUrl = 'https://api.wapi.com/API/hs/v1/Services/Shopify/Callback'; // Replace with your logging server URL
    //
    // // Extract request details
    // const method = req.method;
    // const url = req.url;
    // const headers = req.headers;
    //
    // // Read request body (for POST/PUT methods)
    // let body = null;
    // if (method === 'POST' || method === 'PUT') {
    //     try {
    //         body = await req.json();
    //     } catch (error) {
    //         console.warn('Unable to parse JSON body');
    //     }
    // }
    //
    // // Log request details by forwarding them to the logging server
    // try {
    //     await fetch(loggingApiUrl, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             method,
    //             url,
    //             headers: Object.fromEntries(headers.entries()),
    //             body,
    //         }),
    //     });
    // } catch (error) {
    //     console.error('Error logging request:', error);
    // }

    // Continue to the intended route
    return NextResponse.next();
}
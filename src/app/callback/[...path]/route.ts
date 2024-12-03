import { NextResponse } from 'next/server';
import axios from "axios";

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
    const path = `/callback/${params.path.join('/')}`;

    const loggingApiUrl = 'https://api.wapi.com/API/hs/v1/Services/Shopify/Callback';

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
        await axios.post(
            loggingApiUrl,
            { url, method, path },
            {headers: { 'Content-Type': 'application/json'}},
        );
    } catch (error) {
        console.error('Error sending log to logging server:', error);
    }

    // Respond to send success
    return NextResponse.json({ message: 'Success' }, { status: 200 });
}
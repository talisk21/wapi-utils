import { NextRequest, NextResponse } from 'next/server';
import { insertApiLog } from '@/lib/log';

// FFN API credentials should be stored in .env.local
const CLIENT_ID = process.env.FFN_CLIENT_ID || 'mock_client_id';
const CLIENT_SECRET = process.env.FFN_CLIENT_SECRET || 'mock_client_secret';
const TOKEN_URL = 'https://oauth2.api.jtl-software.com/token';

async function handleCallback(request: NextRequest) {
  const startedAt = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());
  const code = searchParams.get('code');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const userAgent = request.headers.get('user-agent');

  // Safely extract headers (filter out overly large or internal noise if needed)
  const headers: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headers[key] = val;
  });

  // Attempt to parse body if request has one
  let body: any = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.clone().json();
    } catch {
      try {
        body = await request.clone().text();
      } catch {
        body = null;
      }
    }
  }

  // If no code is present in query parameters
  if (!code) {
    const errorMsg = queryParams.error 
      ? `OAuth callback error: ${queryParams.error} (${queryParams.error_description || 'No description'})`
      : 'No authorization code provided in the callback.';
    const status = 400;

    await insertApiLog({
      method: request.method,
      path: request.nextUrl.pathname,
      status,
      duration_ms: Date.now() - startedAt,
      user_agent: userAgent,
      ip,
      req: {
        timestamp: new Date().toISOString(),
        query: queryParams,
        headers,
        body,
        error: errorMsg,
      }
    });

    return NextResponse.json({ error: errorMsg, details: queryParams }, { status });
  }

  // The FFN API expects Basic Auth header for the client credentials
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  // Construct the redirect URI dynamically based on the current request host
  const redirectUri = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/ffn/callback`;

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('FFN Token Exchange Error:', data);
      const status = response.status;

      await insertApiLog({
        method: request.method,
        path: request.nextUrl.pathname,
        status,
        duration_ms: Date.now() - startedAt,
        user_agent: userAgent,
        ip,
        req: {
          timestamp: new Date().toISOString(),
          query: queryParams,
          headers,
          body,
          exchange_error: data,
        }
      });

      return NextResponse.json(
        { error: 'Failed to exchange authorization code for access token.', details: data }, 
        { status }
      );
    }

    // Success! We have the access_token and refresh_token
    const { access_token, refresh_token, expires_in } = data;

    console.log('Successfully received tokens from JTL FFN:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expires_in
    });

    // Log the successful outcome
    await insertApiLog({
      method: request.method,
      path: request.nextUrl.pathname,
      status: 200,
      duration_ms: Date.now() - startedAt,
      user_agent: userAgent,
      ip,
      req: {
        timestamp: new Date().toISOString(),
        query: queryParams,
        headers,
        body,
        result: {
          has_access_token: !!access_token,
          has_refresh_token: !!refresh_token,
          expires_in,
          token_response: data
        }
      }
    });

    // Return HTML response
    return new NextResponse(`
      <html lang="en" style="font-family: monospace; padding: 20px;">
        <body>
          <h2>Tokens successfully generated</h2>
          <p>You can copy them below:</p>
          <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error: any) {
    console.error('Error during FFN OAuth callback:', error);
    const status = 500;

    await insertApiLog({
      method: request.method,
      path: request.nextUrl.pathname,
      status,
      duration_ms: Date.now() - startedAt,
      user_agent: userAgent,
      ip,
      req: {
        timestamp: new Date().toISOString(),
        query: queryParams,
        headers,
        body,
        exception: error?.message || String(error)
      }
    });

    return NextResponse.json({ error: 'Internal server error during token exchange.', details: error?.message }, { status });
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}

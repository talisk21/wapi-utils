import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Import the Supabase client

// We will use mock credentials for now as requested.
const CLIENT_ID = 'a2537f33-16e3-4ffa-9036-89b3318d3331';
const CLIENT_SECRET = 'cjXRKjuRDbh4l4S8ESQ1xQDADF3GOyz0sWA9ulZt';
const TOKEN_URL = 'https://oauth2.api.jtl-software.com/token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided in the callback.' }, { status: 400 });
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

    const data = await response.json();

    if (!response.ok) {
      console.error('FFN Token Exchange Error:', data);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for access token.', details: data }, 
        { status: response.status }
      );
    }

    // Success! We have the access_token and refresh_token
    const { access_token, refresh_token, expires_in } = data;

    console.log('Successfully received tokens from JTL FFN:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expires_in
    });

    // Return a simple HTML response so it's very easy to read and copy on the screen
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

  } catch (error) {
    console.error('Error during FFN OAuth callback:', error);
    return NextResponse.json({ error: 'Internal server error during token exchange.' }, { status: 500 });
  }
}

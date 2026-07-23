import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Import the Supabase client

// We will use mock credentials for now as requested.
const CLIENT_ID = 'mock_client_id';
const CLIENT_SECRET = 'mock_client_secret';
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
    
    // TODO: Uncomment this when you're ready to save to Supabase
    /*
    const { error: dbError } = await supabase
      .from('ffn_tokens')
      .insert([
        {
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          // You might also want to save a merchant ID or user ID here so you know who these tokens belong to
        }
      ]);

    if (dbError) {
      console.error('Error saving tokens to Supabase:', dbError);
      return NextResponse.json({ error: 'Failed to save tokens to database.' }, { status: 500 });
    }
    */

    console.log('Successfully received tokens from JTL FFN:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expires_in
    });

    // Return a success response (returning data for debugging purposes)
    return NextResponse.json({
      message: 'Successfully authenticated with JTL FFN!',
      data
    });

  } catch (error) {
    console.error('Error during FFN OAuth callback:', error);
    return NextResponse.json({ error: 'Internal server error during token exchange.' }, { status: 500 });
  }
}

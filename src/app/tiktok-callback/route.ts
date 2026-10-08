import { NextRequest, NextResponse } from 'next/server';
import {
    saveTikTokAuthFullProcess,
    exchangeCodeForTokensWithSDK,
    getAuthorizedShopsWithSDK,
    logTikTokError,
    TikTokTokenResponse,
    TikTokShopsResponse,
} from '@/lib/tiktokAuth';

/**
 * Server-side route handler for the TikTok OAuth callback.
 * 
 * 1. Receives 'code' or 'auth_code' from TikTok redirect.
 * 2. Securely keeps app_key and app_secret strictly on the server (.env.local).
 * 3. Exchanges auth_code for tokens using official TikTok SDK (AccessTokenTool).
 * 4. Calls /authorization/202309/shops using official TikTok SDK (AuthorizationV202309Api.ShopsGet).
 * 5. Saves responses and individual enriched shop records (with tokens attached) to Supabase.
 * 6. Logs all errors (OAuth rejections, network errors, config errors) to api_logs for full debugging.
 * 7. Redirects user to clean /tiktok-success thank-you page upon success.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // 1. Extract auth_code from callback parameters
    const authCode = searchParams.get('auth_code') || searchParams.get('code');
    const urlError =
        searchParams.get('error') ||
        searchParams.get('error_message') ||
        searchParams.get('msg');

    const userAgent = request.headers.get('user-agent') || 'TikTok OAuth Server Handler';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    // 2. Load credentials strictly from server environment variables
    const appKey = process.env.TIKTOK_APP_KEY;
    const appSecret = process.env.TIKTOK_APP_SECRET;
    const serviceId = process.env.TIKTOK_SERVICE_ID;

    // Construct base URL for redirection
    const origin = request.nextUrl.origin;

    // A. Handle TikTok-level error in URL params (e.g. seller cancelled authorization)
    if (urlError) {
        console.error('TikTok returned OAuth error in callback:', urlError);
        await logTikTokError('OAUTH_REDIRECT_REJECTED', urlError, {
            searchParams: Object.fromEntries(searchParams.entries()),
            userAgent,
            ip,
        });

        await saveTikTokAuthFullProcess({
            authCode: authCode || undefined,
            serviceId,
            appKey,
            error: `TikTok rejected authorization: ${urlError}`,
            success: false,
            userAgent,
            ip,
        });

        const errUrl = new URL('/tiktok-link', origin);
        errUrl.searchParams.set('auth_error', urlError);
        return NextResponse.redirect(errUrl);
    }

    // B. Handle missing auth_code
    if (!authCode) {
        console.error('No auth_code received in TikTok callback');
        await logTikTokError('MISSING_AUTH_CODE', 'No auth_code or code query parameter received in callback', {
            searchParams: Object.fromEntries(searchParams.entries()),
            userAgent,
            ip,
        });

        return NextResponse.redirect(new URL('/tiktok-link?auth_error=no_code', origin));
    }

    // C. Handle missing server environment credentials
    if (!appKey || !appSecret) {
        const configErrorMsg = 'Missing TIKTOK_APP_KEY or TIKTOK_APP_SECRET in server environment (.env.local)';
        console.error(configErrorMsg);

        await logTikTokError('SERVER_CONFIG_MISSING', configErrorMsg, {
            hasAppKey: Boolean(appKey),
            hasAppSecret: Boolean(appSecret),
            userAgent,
            ip,
        });

        await saveTikTokAuthFullProcess({
            authCode,
            serviceId,
            error: configErrorMsg,
            success: false,
            userAgent,
            ip,
        });

        return NextResponse.redirect(new URL('/tiktok-link?auth_error=server_config_missing', origin));
    }

    let tokenResponse: TikTokTokenResponse | null = null;
    let shopsResponse: TikTokShopsResponse | null = null;
    let exchangeError: string | null = null;
    let isSuccess = false;
    let sellerName: string = '';
    let shopsCount = 0;

    // 3. Server-side token exchange using official TikTok SDK
    try {
        tokenResponse = await exchangeCodeForTokensWithSDK(authCode, appKey, appSecret);

        if (tokenResponse && (tokenResponse.code === 0 || tokenResponse.message === 'success')) {
            isSuccess = true;
            sellerName = tokenResponse.data?.seller_name || '';
            const accessToken = tokenResponse.data?.access_token;

            // 4. Fetch authorized shops using official TikTok SDK (AuthorizationV202309Api)
            if (accessToken) {
                try {
                    shopsResponse = await getAuthorizedShopsWithSDK(accessToken, appKey, appSecret);
                    if (shopsResponse && shopsResponse.data?.shops) {
                        shopsCount = shopsResponse.data.shops.length;
                    } else if (shopsResponse && shopsResponse.code !== 0) {
                        await logTikTokError('FETCH_AUTHORIZED_SHOPS_API_ERROR', shopsResponse.message || 'Non-zero code', {
                            shopsResponse,
                            sellerName,
                            openId: tokenResponse.data?.open_id,
                            userAgent,
                            ip,
                        });
                    }
                } catch (shopsErr: any) {
                    console.error('Error fetching authorized shops with SDK:', shopsErr);
                    await logTikTokError('FETCH_AUTHORIZED_SHOPS_EXCEPTION', shopsErr?.message || shopsErr, {
                        sellerName,
                        openId: tokenResponse.data?.open_id,
                        userAgent,
                        ip,
                    });
                }
            }
        } else {
            exchangeError =
                tokenResponse?.message ||
                `Token exchange returned code ${tokenResponse?.code}`;

            await logTikTokError('TOKEN_EXCHANGE_REJECTED', exchangeError, {
                rawResponse: tokenResponse,
                authCode,
                userAgent,
                ip,
            });
        }
    } catch (err: any) {
        exchangeError = err?.message || 'Failed connecting to TikTok token API';
        console.error('Token exchange exception:', err);
        await logTikTokError('TOKEN_EXCHANGE_EXCEPTION', exchangeError, {
            errorStack: err?.stack,
            authCode,
            userAgent,
            ip,
        });
    }

    // 5. Save all responses & enriched shops to Supabase
    await saveTikTokAuthFullProcess({
        authCode,
        serviceId,
        appKey,
        tokenResponse,
        shopsResponse,
        error: exchangeError,
        success: isSuccess,
        userAgent,
        ip,
    });

    // 6. Clean redirection: Hide auth_code and all credentials from the user's browser
    if (isSuccess) {
        const successUrl = new URL('/tiktok-success', origin);
        if (sellerName) {
            successUrl.searchParams.set('seller', sellerName);
        }
        if (shopsCount > 0) {
            successUrl.searchParams.set('shops', String(shopsCount));
        }
        return NextResponse.redirect(successUrl);
    } else {
        const failUrl = new URL('/tiktok-link', origin);
        failUrl.searchParams.set('auth_error', exchangeError || 'exchange_failed');
        return NextResponse.redirect(failUrl);
    }
}

import { supabase } from '@/lib/supabase';
import {
    ClientConfiguration,
    TikTokShopNodeApiClient,
    AccessTokenTool,
} from '@/lib/tiktok-sdk';

export interface TikTokTokenResponse {
    code: number;
    message: string;
    request_id?: string;
    data?: {
        access_token?: string;
        access_token_expire_in?: number;
        refresh_token?: string;
        refresh_token_expire_in?: number;
        open_id?: string;
        seller_name?: string;
        seller_base_region?: string;
        user_type?: number;
        granted_scopes?: string[];
        [key: string]: any;
    };
    [key: string]: any;
}

export interface TikTokShop {
    cipher?: string;
    id?: string;
    code?: string;
    name?: string;
    region?: string;
    seller_type?: string;
    [key: string]: any;
}

export interface TikTokShopsResponse {
    code: number;
    message: string;
    request_id?: string;
    data?: {
        shops?: TikTokShop[];
        [key: string]: any;
    };
    [key: string]: any;
}

export interface TokensReceivedInfo {
    access_token?: string;
    access_token_expire_in?: number;
    refresh_token?: string;
    refresh_token_expire_in?: number;
    open_id?: string;
    seller_name?: string;
    seller_base_region?: string;
    auth_code?: string;
    saved_at: string;
}

export interface EnrichedShopRecord extends TikTokShop {
    tokens_received: TokensReceivedInfo;
}

/**
 * Initializes and configures the official TikTokShopNodeApiClient SDK instance.
 */
export function getTikTokApiClient(appKey: string, appSecret: string): TikTokShopNodeApiClient {
    ClientConfiguration.globalConfig.app_key = appKey;
    ClientConfiguration.globalConfig.app_secret = appSecret;

    return new TikTokShopNodeApiClient({
        config: new ClientConfiguration(appKey, appSecret),
    });
}

/**
 * Exchanges the auth_code for access_token and refresh_token using the official TikTok SDK AccessTokenTool.
 */
export async function exchangeCodeForTokensWithSDK(
    authCode: string,
    appKey: string,
    appSecret: string
): Promise<TikTokTokenResponse> {
    const res = await AccessTokenTool.getAccessToken(authCode, appKey, appSecret);
    let body = res.body as any;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error('Failed to parse token response string:', e);
        }
    }
    return body as TikTokTokenResponse;
}

/**
 * Calls /authorization/202309/shops using the official TikTok Shop SDK (AuthorizationV202309Api.ShopsGet).
 * Automatically calculates HMAC-SHA256 signature and attaches required headers.
 */
export async function getAuthorizedShopsWithSDK(
    accessToken: string,
    appKey: string,
    appSecret: string
): Promise<TikTokShopsResponse> {
    const client = getTikTokApiClient(appKey, appSecret);
    const result = await client.api.AuthorizationV202309Api.ShopsGet(
        accessToken,
        'application/json'
    );
    let body = result.body as any;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error('Failed to parse shops response string:', e);
        }
    }
    return body as TikTokShopsResponse;
}

/**
 * Explicit helper to log errors with full diagnostic context into Supabase api_logs.
 */
export async function logTikTokError(stage: string, errorDetail: any, context?: Record<string, any>) {
    const nowIso = new Date().toISOString();
    try {
        const errorString =
            typeof errorDetail === 'string'
                ? errorDetail
                : errorDetail?.message || JSON.stringify(errorDetail);

        await supabase.from('api_logs').insert([
            {
                method: 'TIKTOK_CALLBACK_ERROR',
                path: '/tiktok-callback',
                status: 500,
                duration_ms: 0,
                user_agent: context?.userAgent || 'TikTok Error Logger',
                ip: context?.ip || null,
                req: {
                    type: 'tiktok_oauth_error',
                    stage: stage,
                    error: errorString,
                    error_raw: errorDetail,
                    context: context || {},
                    timestamp: nowIso,
                },
            },
        ]);
    } catch (e: any) {
        console.error(`[logTikTokError] Failed writing error at stage '${stage}' to api_logs:`, e?.message);
    }
}

/**
 * Saves initial token response and individual enriched shop records into Supabase.
 * Each shop has tokens_received attached as an extra property.
 */
export async function saveTikTokAuthFullProcess(data: {
    authCode?: string;
    serviceId?: string;
    appKey?: string;
    tokenResponse?: TikTokTokenResponse | any;
    shopsResponse?: TikTokShopsResponse | any;
    error?: string | null;
    success?: boolean;
    ip?: string | null;
    userAgent?: string | null;
}) {
    const nowIso = new Date().toISOString();
    const tokenData = data.tokenResponse?.data;
    const shopsList: TikTokShop[] = data.shopsResponse?.data?.shops || [];

    const tokensReceived: TokensReceivedInfo = {
        access_token: tokenData?.access_token,
        access_token_expire_in: tokenData?.access_token_expire_in,
        refresh_token: tokenData?.refresh_token,
        refresh_token_expire_in: tokenData?.refresh_token_expire_in,
        open_id: tokenData?.open_id,
        seller_name: tokenData?.seller_name,
        seller_base_region: tokenData?.seller_base_region,
        auth_code: data.authCode,
        saved_at: nowIso,
    };

    // Construct enriched shops array: every shop has tokens_received added as a property
    const enrichedShops: EnrichedShopRecord[] = shopsList.map((shop) => ({
        ...shop,
        tokens_received: tokensReceived,
    }));

    // 1. Try to save individual shop records into 'tiktok_shops' table if available
    if (enrichedShops.length > 0) {
        try {
            const shopRows = enrichedShops.map((item) => ({
                shop_id: item.id ?? null,
                shop_name: item.name ?? null,
                shop_code: item.code ?? null,
                shop_cipher: item.cipher ?? null,
                region: item.region ?? null,
                seller_type: item.seller_type ?? null,
                seller_name: tokensReceived.seller_name ?? null,
                open_id: tokensReceived.open_id ?? null,
                access_token: tokensReceived.access_token ?? null,
                access_token_expire_in: tokensReceived.access_token_expire_in ?? null,
                refresh_token: tokensReceived.refresh_token ?? null,
                refresh_token_expire_in: tokensReceived.refresh_token_expire_in ?? null,
                auth_code: tokensReceived.auth_code ?? null,
                tokens_received: tokensReceived,
                created_at: nowIso,
            }));

            const { error: shopUpsertErr } = await supabase.from('tiktok_shops').upsert(shopRows);
            if (shopUpsertErr) {
                console.warn('tiktok_shops upsert notice:', shopUpsertErr.message);
            }
        } catch (err: any) {
            console.warn('Optional tiktok_shops table upsert notice:', err?.message);
        }
    }

    // 2. Try dedicated tiktok_authorizations table
    try {
        const dedicatedPayload = {
            auth_code: data.authCode ?? null,
            open_id: tokenData?.open_id ?? null,
            seller_name: tokenData?.seller_name ?? null,
            seller_base_region: tokenData?.seller_base_region ?? null,
            access_token: tokenData?.access_token ?? null,
            access_token_expire_in: tokenData?.access_token_expire_in ?? null,
            refresh_token: tokenData?.refresh_token ?? null,
            refresh_token_expire_in: tokenData?.refresh_token_expire_in ?? null,
            granted_scopes: tokenData?.granted_scopes ?? null,
            raw_response: data.tokenResponse ?? null,
            shops_response: data.shopsResponse ?? null,
            enriched_shops: enrichedShops,
            tokens_received: tokensReceived,
            error: data.error ?? null,
            success: data.success ?? (data.tokenResponse?.code === 0),
            created_at: nowIso,
        };

        const { error: dedicatedErr } = await supabase
            .from('tiktok_authorizations')
            .insert([dedicatedPayload]);

        if (!dedicatedErr) {
            return { savedTo: 'tiktok_authorizations', enrichedCount: enrichedShops.length };
        }
    } catch (err: any) {
        console.warn('Dedicated table save notice (falling back):', err?.message);
    }

    // 3. Fallback to existing api_logs table (guaranteed persistence)
    try {
        const logEntry = {
            method: data.success ? 'TIKTOK_CALLBACK' : 'TIKTOK_CALLBACK_ERROR',
            path: '/tiktok-callback',
            status: data.success ? 200 : 400,
            duration_ms: 0,
            user_agent: data.userAgent ?? 'TikTok OAuth Callback (SDK)',
            ip: data.ip ?? null,
            req: {
                type: 'tiktok_seller_authorization_with_shops',
                auth_code: data.authCode,
                service_id: data.serviceId,
                open_id: tokenData?.open_id,
                seller_name: tokenData?.seller_name,
                seller_base_region: tokenData?.seller_base_region,
                access_token: tokenData?.access_token,
                refresh_token: tokenData?.refresh_token,
                access_token_expire_in: tokenData?.access_token_expire_in,
                refresh_token_expire_in: tokenData?.refresh_token_expire_in,
                tokens_received: tokensReceived,
                token_response: data.tokenResponse,
                shops_response: data.shopsResponse,
                enriched_shops: enrichedShops,
                error: data.error,
                saved_at: nowIso,
            },
        };

        const { error: logErr } = await supabase.from('api_logs').insert([logEntry]);
        if (logErr) {
            console.error('Failed to save to api_logs:', logErr.message);
            return { savedTo: null, error: logErr.message };
        }

        return { savedTo: 'api_logs', enrichedCount: enrichedShops.length };
    } catch (fallbackErr: any) {
        console.error('Fatal error saving token and shops record:', fallbackErr?.message);
        return { savedTo: null, error: fallbackErr?.message };
    }
}

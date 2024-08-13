'use client'

import { useEffect, useState } from 'react';
import {useSearchParams} from 'next/navigation';
import Cookies from 'js-cookie';
import getAccessToken from "@/lib/getAccessToken";
import axios from "axios";

export default function Callback() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const code = useSearchParams().get('code') || '';

    console.log('test: ', useSearchParams().get('code'), Object.fromEntries(useSearchParams().entries()), code)

    useEffect(() => {
        if (code) {
            console.log('codeee', code)
            const fetchAccessToken = async () => {
                const shop = Cookies.get("shop") as string;
                const apiKey = Cookies.get('shopifyApiKey') as string;
                const apiSecret = Cookies.get('shopifyApiSecret') as string;

                if (!apiKey || !apiSecret || !shop) {
                    console.error('API Key or Secret or Shop is missing');
                    return;
                }

                try {
                    //const res = await getAccessToken(shop, apiKey, apiSecret, code);
                    const response = await axios.post('/api/get-access-token', {
                        shop,
                        apiKey,
                        apiSecret,
                        code
                    });

                    if (response?.status === 200) {
                        console.log('got answer: ', response.data)
                        setAccessToken(response.data.access_token);
                        Cookies.remove('shop');
                        Cookies.remove('shopifyApiKey');
                        Cookies.remove('shopifyApiSecret')
                    } else {
                        console.error('Failed to get access token');
                    }

                    console.log('res:', response)
                } catch (error) {
                    console.error('Error fetching access token:', error);
                }
            };

            fetchAccessToken();
        } else {
            console.log('No code detected')
        }
    }, [code]);

    return (
        <div>
            <h1>Shopify Access Token</h1>
            {accessToken ? (
                <p>Access Token: {accessToken}</p>
            ) : (
                <p>Fetching access token...</p>
            )}
        </div>
    );
}
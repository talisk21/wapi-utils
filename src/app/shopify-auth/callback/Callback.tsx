'use client'

import {useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Cookies from 'js-cookie';
import axios from "axios";

export default function Callback() {
    const router = useRouter();

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

    const copyToClipboard = useCallback((text: string) => {
        // Create a textarea element to hold the text to copy
        const textarea = document.createElement('textarea');
        textarea.value = text;

        // Make the textarea invisible
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        // Append the textarea to the document
        document.body.appendChild(textarea);

        // Select the text within the textarea
        textarea.select();

        try {
            // Execute the copy command
            const successful = document.execCommand('copy');
            if (!successful) {
                console.error('Failed to copy text to clipboard');
            }
        } catch (err) {
            console.error('Failed to copy text to clipboard:', err);
        }

        // Remove the textarea from the document
        document.body.removeChild(textarea);
    }, []);

    return (
        <main>
            <h1>Shopify Access Token</h1>
            {accessToken ? (
                <div>
                    <div className='simple-wrapper'>
                        {/*<span>Access Token:</span>*/}
                        <span className='break-words'><span
                            style={{color: "silver"}}> Access Token: </span>{accessToken}</span>
                    </div>
                    <div className='centered mt-24'>
                        <button onClick={() => copyToClipboard(accessToken || '')}>Copy token</button>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <div className='centered mt-24'>
                        <button className='secondary' onClick={() => router.push('/shopify-auth')}>Authenticate another user</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Fetching access token...</p>
                    <br/>
                    <br/>
                    <br/>
                    <div className='centered mt-24'>
                        <button className='secondary' onClick={() => router.push('/shopify-auth')}>Authenticate another user</button>
                    </div>
                </div>
            )}
        </main>
    );
}
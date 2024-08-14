'use client'

import {useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Cookies from 'js-cookie';
import axios from "axios";

const getLocationId = (data: any) => {
    if (data?.fulfillment_services && data?.fulfillment_services.length) {
        const el = data?.fulfillment_services?.filter((item: any) => item.name == 'WAPI Fulfillment');
        if (el.length) {
            return el[0].location_id as string;
        }
    }
    return "not found";
}

export default function Callback() {
    const router = useRouter();

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const code = useSearchParams().get('code') || '';

    //console.log('query: ', Object.fromEntries( useSearchParams().entries() ))

    const shop = Cookies.get("shop") as string;
    const apiKey = Cookies.get('shopifyApiKey') as string;
    const apiSecret = Cookies.get('shopifyApiSecret') as string;

    useEffect(() => {
        if (code) {
            console.log('codeee', code)
            const fetchAccessToken = async () => {
                // const shop = Cookies.get("shop") as string;
                // const apiKey = Cookies.get('shopifyApiKey') as string;
                // const apiSecret = Cookies.get('shopifyApiSecret') as string;

                if (!apiKey || !apiSecret || !shop) {
                    console.error('API Key or Secret or Shop is missing');
                    return;
                }

                try {
                    const response = await axios.post('/api/get-access-token', {
                        shop,
                        apiKey,
                        apiSecret,
                        code
                    });

                    if (response?.status === 200) {
                        console.log('got answer: ', response.data)
                        setAccessToken(response.data.access_token);

                        // Cookies.remove('shop');
                        // Cookies.remove('shopifyApiKey');
                        // Cookies.remove('shopifyApiSecret')
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

    useEffect(() => {
        if (accessToken) {
            console.log('--fetching location id--');
            const fetchLocationId = async () => {
                try {
                    const res = await axios.post('/api/post-location-id', {
                        shop,
                        accessToken
                    });

                    console.log('response location: ', res);

                    if (res?.data) {
                        //setId(res?.data?.location_id);
                        console.log('we got data: ', res.data);
                        if (res.data?.dataRes?.location_id?.fulfillment_service?.location_id) {
                            setId(res.data?.dataRes?.location_id.fulfillment_service.location_id)
                        } else if (res.data?.dataRes?.statusRes === 422 || res.data?.dataRes?.error) {
                            //send get request
                            try {
                                const res3 = await axios.post('/api/get-location-id', {
                                    shop,
                                    accessToken: accessToken
                                });
                                console.log('response location 2: ', res3.data);

                                if (res3?.data?.dataRes?.location_id) {
                                    console.log('calc location id', getLocationId(res3.data?.location_id));
                                    setId(getLocationId(res3.data?.dataRes?.location_id));
                                } else {
                                    console.error('Error fetching location id 2');
                                }
                            } catch (err2) {
                                console.error('Error fetching location id 2:', err2);
                            }
                        } else {
                            //setId(res.data.location_id);
                        }

                    } else  {
                        //send get request
                        try {
                            const res3 = await axios.post('/api/get-location-id', {
                                shop,
                                accessToken: accessToken
                            });
                            console.log('response location 2: ', res3.data);

                            if (res3?.data?.dataRes?.location_id) {
                                console.log('calc location id', getLocationId(res3.data?.location_id));
                                setId(getLocationId(res3.data?.dataRes?.location_id));
                            } else {
                                console.error('Error fetching location id 2');
                            }
                        } catch (err2) {
                            console.error('Error fetching location id 2:', err2);
                        }
                    // } else {
                    //     //error
                    //     console.error('Error fetching location id');
                    }
                } catch (err) {
                    console.error('Error fetching location id:', err);
                }
            }

            fetchLocationId();
        }
    }, [accessToken]);

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
                    {id ? <div>
                        <p>Location ID: {id}</p>
                    </div> : <p>No location id...</p>}
                    <br />
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
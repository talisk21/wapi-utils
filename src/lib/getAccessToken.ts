const getAccessToken = async (shop: string, apiKey:string, apiSecret:string, code:string) => {
    try {
        const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "*/*",
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                client_id: apiKey,
                client_secret: apiSecret,
                code
            })
        });

        const data = await response.json();
        return { data, status: response.status };
    } catch (error) {
        console.log('Error fetching access token' +"--"+error);
        console.log('body: ', {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        })
        console.log('link: ', `https://${shop}.myshopify.com/admin/oauth/access_token`)
    }
}

export default getAccessToken
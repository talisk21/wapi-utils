import axios from "axios";

const getAccessToken = async (shop: string, apiKey:string, apiSecret:string, code:string) => {
    try {
        const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
        const response = await axios.post(tokenUrl, {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        });

        return response;
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
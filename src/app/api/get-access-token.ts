import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop, apiKey, apiSecret, code } = req.body;

    console.log('get token:', shop, apiKey, apiSecret, code);

    if (!apiKey || !apiSecret || !code) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
        const response = await axios.post(tokenUrl, {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        });

        if (response.status === 200) {
            return res.status(200).json({ access_token: response.data.access_token });
        } else {
            return res.status(500).json({ error: 'Failed to retrieve access token' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching access token' });
    }
}
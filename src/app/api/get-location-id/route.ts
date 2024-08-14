import {NextResponse} from "next/server";
import axios from "axios";

const getLocationId = (data: any) => {
    if (data?.fulfillment_services && data?.fulfillment_services.length) {
        const el = data?.fulfillment_services?.filter((item: any) => item.name === 'WAPI Fulfillment');
        if (el.length) {
            return el.location_id as string;
        }
    }
    return "not found";
}

export async function POST(request: Request) {
    const { shop, accessToken } = await request.json();

    if (!shop || !accessToken) {
        return NextResponse.json({ error: 'Missing required parameters' });
    }

    try {
        const tokenUrl = `https://${shop}/admin/api/2023-01/fulfillment_services.json`;
        const response = await axios.get(tokenUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                }
            }
        );

        return NextResponse.json({dataa: {dataRes: response?.data, statusData: response?.status}});

        // if (response.status === 200) {
        //     return NextResponse.json({ location_id: getLocationId(response.data) });
        // } else {
        //     return NextResponse.json({ error: 'Failed to retrieve location_id GET' });
        // }
    } catch (error) {
        console.error('Error fetching location_id GET:', error);
        return NextResponse.json({ error: 'Error fetching location_id GET'+' -- '+error });
    }
}
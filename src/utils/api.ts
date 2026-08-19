/**
 * Generic POST fetch helper.
 */
export const fetchPost = async (url: string, body: any) => {
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    return { data, status: r.status };
};

/**
 * Extracts the location ID from a Shopify fulfillment services response.
 */
export const getLocationId = (data: any): string => {
    if (data?.fulfillment_services && data?.fulfillment_services.length) {
        const el = data?.fulfillment_services?.filter(
            (item: any) => item.name === 'Fulfillment location'
        );
        if (el.length) {
            return el[0].location_id as string;
        }
    }
    return 'not found';
};

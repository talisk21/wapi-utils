'use client';

import { useEffect } from 'react';
import Cookie from 'js-cookie';

export default function ClearCookies({ cookieNames }: { cookieNames: string[] }) {
    useEffect(() => {
        cookieNames.forEach(name => Cookie.remove(name));
    }, [cookieNames]);

    return null;
}

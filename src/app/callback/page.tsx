import {Suspense} from "react";
import Callback from "@/app/callback/Callback";


export default function CallbackPage() {

    return (
        <Suspense fallback={<><div>Loading...</div></>}>
            <Callback />
        </Suspense>
    );
}
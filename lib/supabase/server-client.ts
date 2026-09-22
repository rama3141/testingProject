// import {createServerClient} from "@supabase/ssr"
// import { cookies } from "next/headers"

// function getEnvironmentVariables() {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

//     if (!supabaseUrl || !supabasePublishableKey) {
//         throw new Error (
//             "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" 
//         );
//     }

//     return {supabaseUrl, supabasePublishableKey};
// }

// export async function createSupabaseServerClient() {
//     const { supabaseUrl, supabasePublishableKey } = getEnvironmentVariables();
//     const cookieStore = await cookies();

//     return createServerClient(supabaseUrl, supabasePublishableKey, {
//         cookies: {
//             getAll() {
//                 return cookieStore.getAll();
//             },
//             setAll(cookiesToSet) {
//                 try {
//                     cookiesToSet.forEach(({name, value, options}) =>
//                         cookieStore.set(name, value, options)
//                     );
//                 } catch(error) {
//                     console.log(error)
//                 }
//             }
//         }
//     });
// }

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, type NextResponse } from "next/server";

function getEnvironmentVariables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Note: ensure this matches your .env key (either PUBLISHABLE_KEY or ANON_KEY)
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error (
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" 
        );
    }

    return { supabaseUrl, supabasePublishableKey };
}

export async function createSupabaseServerClient(
    request?: NextRequest,
    response?: NextResponse
) {
    const { supabaseUrl, supabasePublishableKey } = getEnvironmentVariables();

    // Context A: If running in Middleware (request and response are passed)
    if (request && response) {
        return createServerClient(supabaseUrl, supabasePublishableKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll().map((cookie) => ({
                        name: cookie.name,
                        value: cookie.value,
                    }));
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        });
    }

    // Context B: If running in Server Components / Actions / Route Handlers
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabasePublishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch (error) {
                    // This block catches safe warnings when mutating cookies in standard Server Components
                }
            }
        }
    });
}

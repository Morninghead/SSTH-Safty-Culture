import { createBrowserClient } from '@supabase/ssr'

// Define the Database type if you have generated types, currently using 'any' for speed
export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
}

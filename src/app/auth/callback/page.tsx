'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    useEffect(() => {
        const handleCallback = async () => {
            const { searchParams } = new URL(window.location.href)
            const code = searchParams.get('code')
            if (code) {
                await supabase.auth.exchangeCodeForSession(code)
            }
            router.push('/dashboard')
        }
        handleCallback()
    }, [router, supabase])

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Authenticating...</p>
        </div>
    )
}

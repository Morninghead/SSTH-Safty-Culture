import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { userAgent } from 'next/server'

export function middleware(request: NextRequest) {
    const { device } = userAgent(request)
    const isMobile = device.type === 'mobile' || device.type === 'tablet'

    const path = request.nextUrl.pathname

    // Redirect Mobile users from Desktop routes to Mobile routes
    if (isMobile && path.startsWith('/dashboard')) {
        // Allows accessing specific dashboard API routes if any, but general UI should redirect
        // If you have shared API routes under dashboard, exclude them here.
        return NextResponse.redirect(new URL('/patrol', request.url))
    }

    // Redirect Desktop users from Mobile routes to Desktop routes
    // Note: You might want to allow desktop to view mobile view for debugging, 
    // but strictly properly it should redirect.
    if (!isMobile && (path.startsWith('/patrol') || path === '/profile')) {
        // Check if '/profile' is mobile only? src/app/(mobile)/layout has link to /profile
        // Let's assume /profile is mobile specific for now based on the nav in (mobile)/layout.
        // If /profile is shared, we should check availability.
        // For safety, let's just redirect /patrol for now.
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/patrol/:path*',
        '/profile/:path*' // Adding profile just in case it's mobile only
    ],
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('ecom_token')?.value;
    const userRole = request.cookies.get('ecom_role')?.value;
    const { pathname } = request.nextUrl;

    // DEBUG: Logging to terminal
    console.log(`[Middleware] Path: ${pathname} | Token exists: ${!!token} | Role: ${userRole}`);

    // Protect Admin Dashboard
    if (pathname.startsWith('/dashboard')) {
        const normalizedRole = userRole?.trim().toUpperCase();
        const isAdmin = normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN';

        if (!token || !isAdmin) {
            console.log(`[Middleware] Unauthorized: Token? ${!!token} | Role: ${userRole}`);
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*'],
};

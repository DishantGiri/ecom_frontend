import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('ecom_token')?.value;
    const userRole = request.cookies.get('ecom_role')?.value;
    const { pathname } = request.nextUrl;

    // Protect Admin Dashboard
    if (pathname.startsWith('/dashboard')) {
        const normalizedRole = userRole?.trim().toUpperCase();
        const isAdmin = normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN';

        if (!token || !isAdmin) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('unauthorized', '1');
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*'],
};

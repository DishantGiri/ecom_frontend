/**
 * Cookie-based auth helpers.
 * All token/role state lives exclusively in cookies so the
 * Next.js middleware can read them server-side.
 */

const COOKIE_OPTIONS = "path=/; SameSite=Lax; max-age=86400"; // 24h

export function setAuthCookies(token: string, role: string, email?: string) {
    document.cookie = `ecom_token=${token}; ${COOKIE_OPTIONS}`;
    document.cookie = `ecom_role=${role}; ${COOKIE_OPTIONS}`;
    if (email) {
        document.cookie = `ecom_email=${email}; ${COOKIE_OPTIONS}`;
    }
}

export function clearAuthCookies() {
    document.cookie = "ecom_token=; path=/; max-age=0";
    document.cookie = "ecom_role=; path=/; max-age=0";
    document.cookie = "ecom_email=; path=/; max-age=0";
}

export function getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)ecom_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function getRoleFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)ecom_role=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function isAdminFromCookie(): boolean {
    const role = getRoleFromCookie()?.trim().toUpperCase();
    return role === "ROLE_ADMIN" || role === "ADMIN";
}

export function isLoggedInFromCookie(): boolean {
    return !!getTokenFromCookie();
}

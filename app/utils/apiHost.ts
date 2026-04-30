/**
 * Returns the API host with no trailing slash.
 * Handles cases where NEXT_PUBLIC_API_HOST is set with a trailing slash in Coolify.
 */
export const apiHost = (
    process.env.NEXT_PUBLIC_API_HOST || "https://api.healthcaredrugstore.com"
).replace(/\/+$/, "");

/**
 * apiFetch — a safe wrapper around fetch() for public-facing pages.
 *
 * - Adds a configurable timeout (default 10 s) so a dead backend doesn't
 *   hang the UI forever.
 * - Returns `null` on ANY failure (network error, timeout, non-2xx status)
 *   instead of throwing, so callers can pattern-match `if (data === null)`
 *   and show a graceful empty/fallback state.
 * - Never surfaces raw Error objects or stack traces to the browser.
 */
export async function apiFetch<T>(
    url: string,
    options: RequestInit & { timeoutMs?: number } = {}
): Promise<T | null> {
    const { timeoutMs = 10_000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
        clearTimeout(timerId);

        if (!res.ok) {
            // Non-2xx response — log quietly, return null
            console.warn(`[apiFetch] ${res.status} ${res.statusText} — ${url}`);
            return null;
        }

        return (await res.json()) as T;
    } catch (err: unknown) {
        clearTimeout(timerId);

        // AbortError = timeout; TypeError = network/DNS failure — both are silent
        const isExpected =
            err instanceof DOMException && err.name === "AbortError"
                ? "Request timed out"
                : "Network error";

        console.warn(`[apiFetch] ${isExpected} — ${url}`);
        return null;
    }
}

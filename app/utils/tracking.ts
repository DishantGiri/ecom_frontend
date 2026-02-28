export async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Could not fetch IP", error);
        return null;
    }
}

export async function getCountryByIP(ip: string) {
    try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
        const response = await fetch(`${apiHost}/api/track/country?ipAddress=${ip}`);
        const data = await response.json();
        return data.country;
    } catch (error) {
        console.error("Could not fetch country", error);
        return null;
    }
}

export async function trackProductClick(productId: number | string) {
    if (!productId) return;

    const ip = await getUserIP();
    if (!ip) return; // Don't track if IP failed

    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    try {
        await fetch(`${apiHost}/api/track/click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: Number(productId),
                ipAddress: ip
            })
        });
        console.log("Click tracked successfully for product:", productId);
    } catch (error) {
        console.error("Failed to track click", error);
    }
}

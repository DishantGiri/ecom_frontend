import type { MetadataRoute } from "next";

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://healthcaredrugstore.com"
).replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/dashboard/",
                    "/dashboard",
                    "/login",
                    "/signup",
                    "/change-password",
                    "/forgot-password",
                    "/api/"
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}

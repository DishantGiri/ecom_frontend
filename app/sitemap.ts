import type { MetadataRoute } from "next";

const apiHost = (
    process.env.NEXT_PUBLIC_API_HOST || "https://api.healthcaredrugstore.com"
).replace(/\/+$/, "");

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://healthcaredrugstore.com"
).replace(/\/+$/, "");

async function getProducts(): Promise<{ id: number; slug: string; updatedAt?: string }[]> {
    try {
        const res = await fetch(`${apiHost}/api/products`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getBlogs(): Promise<{ slug: string; updatedAt?: string; createdAt?: string }[]> {
    try {
        const res = await fetch(`${apiHost}/api/blogs`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getCategories(): Promise<{ id: number; name: string }[]> {
    try {
        const res = await fetch(`${apiHost}/api/categories`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, blogs, categories] = await Promise.all([getProducts(), getBlogs(), getCategories()]);

    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${siteUrl}/`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${siteUrl}/login`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${siteUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // Dynamic product pages
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Dynamic blog pages
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${siteUrl}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt
            ? new Date(blog.updatedAt)
            : blog.createdAt
                ? new Date(blog.createdAt)
                : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Category pages
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${siteUrl}/products?category=${encodeURIComponent(cat.name)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}

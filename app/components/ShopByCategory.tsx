"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";

interface CategoryInfo {
    category_name: string;
    product_count: number;
    imageUrl?: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
    "Immune Support": "/immune-support.jpg",
    "Heart Health": "/heart-health.jpg",
    "Energy & Focus": "/energy-focus.jpg",
    "Digestive Health": "/digestive-health.jpg",
    "Default": "/default-category.jpg" // Fallback image setup
};

export default function ShopByCategory() {
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories and products in parallel
                const [catsRes, prodsRes] = await Promise.all([
                    apiFetch<any[]>(`${apiHost}/api/categories`),
                    apiFetch<any[]>(`${apiHost}/api/products`)
                ]);

                // Calculate product counts per category name
                const counts = (prodsRes || []).reduce((acc, current) => {
                    const catProp = current.category;
                    const catName = typeof catProp === 'object' && catProp !== null ? catProp.name : (catProp || "Uncategorized");
                    acc[catName] = (acc[catName] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                if (catsRes && catsRes.length > 0) {
                    // We have categories from the API
                    const formattedCategories = catsRes.map((c) => ({
                        category_name: c.name,
                        product_count: counts[c.name] || 0,
                        imageUrl: c.imageUrl
                    }));
                    setCategories(formattedCategories.slice(0, 4));
                } else if (prodsRes) {
                    // Fallback to old behavior if categories API returns empty
                    const formattedCategories = Object.keys(counts).map(key => ({
                        category_name: key,
                        product_count: counts[key],
                        imageUrl: CATEGORY_IMAGES[key] || CATEGORY_IMAGES["Default"]
                    }));
                    setCategories(formattedCategories.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiHost]);


    return (
        <section className="bg-white pt-20 pb-10 px-6 md:px-12 font-sans overflow-hidden text-center">
            <div className="max-w-[1440px] mx-auto">
                <div className="mb-10 flex flex-col items-center justify-center">
                    <span className="text-accent-red text-[13px] font-medium uppercase tracking-[0.1em] mb-4">
                        Shop By Category
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-navy tracking-tight">
                        Find Your Perfect Match
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill({}).map((_, idx) => (
                            <div key={idx} className="relative w-full aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                        ))
                    ) : (
                        categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={`/products?category=${encodeURIComponent(cat.category_name)}`}
                                className="group block relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer"
                            >
                                {/* Background Image */}
                                <img
                                    src={cat.imageUrl || CATEGORY_IMAGES[cat.category_name] || CATEGORY_IMAGES["Default"]}
                                    alt={cat.category_name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-gray-200"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />

                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />

                                {/* Text Content */}
                                <div className="absolute bottom-6 left-6 text-left">
                                    <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                                        {cat.category_name}
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        {cat.product_count} Products
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

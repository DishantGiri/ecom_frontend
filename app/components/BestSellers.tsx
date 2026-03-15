"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "./CurrencyProvider";
import { trackProductClick } from "../utils/tracking";
import { apiFetch } from "../utils/apiFetch";
import { apiHost } from "../utils/apiHost";


const CARDS_PER_PAGE = 4;

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill={s <= Math.round(rating) ? "#FFA41C" : "none"}
                stroke="#FFA41C" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ))}
    </div>
);

export default function BestSellers() {
    const { currency, currencySymbol } = useCurrency();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await apiFetch<any[]>(`${apiHost}/api/products/popular?currency=${currency}`);
            if (data) setProducts(data.slice(0, 8));
            setLoading(false);
        };
        fetchProducts();
    }, [apiHost, currency]);

    const getImageUrl = (url: string) => {
        if (!url) return "/hero1.png";
        const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
        return full.replace(/([^:])\/\/+/g, '$1/');
    };

    const totalPages = Math.ceil(products.length / CARDS_PER_PAGE);

    // Sync page indicator when user scrolls freely via trackpad/touch
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth ?? 280;
        const gap = 24;
        const pageWidth = (cardWidth + gap) * CARDS_PER_PAGE;
        const newPage = Math.round(el.scrollLeft / pageWidth);
        setPage(Math.min(newPage, Math.max(0, totalPages - 1)));
    };

    const scrollTo = (dir: "prev" | "next") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth ?? 280;
        const gap = 24;
        const scrollAmount = (cardWidth + gap) * CARDS_PER_PAGE;

        if (dir === "next") {
            el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        } else {
            el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="bg-white pt-20 pb-10 px-6 md:px-12 font-sans overflow-hidden">
            <div className="max-w-[1440px] mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px w-8 bg-accent-red" />
                            <span className="text-accent-red text-[10px] font-black uppercase tracking-[0.3em]">Top Picks</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-navy tracking-tight">
                            Best Sellers
                        </h2>
                    </div>

                    {/* Pagination Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => scrollTo("prev")}
                            disabled={page === 0}
                            className="w-10 h-10 rounded-full border-2 border-navy/10 flex items-center justify-center text-navy hover:border-navy hover:bg-navy hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <span className="text-xs font-black text-navy/30 uppercase tracking-widest tabular-nums">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => scrollTo("next")}
                            disabled={page === totalPages - 1}
                            className="w-10 h-10 rounded-full border-2 border-navy/10 flex items-center justify-center text-navy hover:border-navy hover:bg-navy hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable product strip */}
                {/* Scrollable strip — supports both buttons AND trackpad/touch */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 scroll-smooth hide-scrollbar transition-opacity duration-500"
                    style={{
                        overflowX: "auto",
                        scrollSnapType: "x mandatory",
                        scrollbarWidth: "none",   /* Firefox */
                        msOverflowStyle: "none",  /* IE */
                        opacity: loading ? 0.3 : 1
                    }}
                >
                    {(products.length > 0 ? products : Array(4).fill({})).map((product, idx) => (
                        <Link
                            key={product.id || idx}
                            href={product.id ? `/products/${product.id}` : '#'}
                            className="flex-shrink-0 w-[calc(25%-18px)] min-w-[240px] group cursor-pointer block"
                            style={{ scrollSnapAlign: "start" }}
                            onClick={() => product.id && trackProductClick(product.id)}
                        >
                            {/* Image area — square ratio, no border, no shadow */}
                            <div className="relative w-full aspect-square rounded-2xl bg-white mb-5 overflow-hidden">

                                {/* Sale badge — top-right of image */}
                                {product.discountedPrice < product.originalPrice && (
                                    <span className="absolute top-3 right-3 z-30 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#3D5BC9] text-white">
                                        Sale
                                    </span>
                                )}

                                {/* Front image — fills area, no shadow */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={getImageUrl(product.featureImageUrl)}
                                            alt={product.title || "Loading..."}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>

                                {/* Hover CTA */}
                                <div className="absolute bottom-0 inset-x-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="bg-navy text-white text-[10px] font-black uppercase tracking-widest text-center py-3">
                                        View Product →
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 px-1">
                                <h3 className="text-[15px] font-black text-navy leading-snug group-hover:text-accent-red transition-colors duration-200 line-clamp-1">
                                    {product.title || "Loading..."}
                                </h3>
                                <p className="text-[10px] text-navy/40 font-bold uppercase tracking-[0.15em]">
                                    {typeof product.category === 'object' && product.category !== null ? product.category.name : (product.category || "Quality Supplement")}
                                </p>

                                {/* Stars */}
                                <div className="flex items-center gap-2 pt-0.5">
                                    <StarRating rating={product.starRating || 5} />
                                    <span className="text-[11px] text-navy/40 font-bold">({product.numberOfReviews || 0})</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[12px] text-navy/30 line-through">
                                        {currencySymbol}{(product.originalPrice || 0).toFixed(2)}
                                    </span>
                                    <span className="text-sm font-black text-accent-red">
                                        From {currencySymbol}{(product.discountedPrice || 0).toFixed(2)} {currency}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile pagination controls */}
                <div className="flex md:hidden items-center justify-center gap-4 mt-8">
                    <button onClick={() => scrollTo("prev")} disabled={page === 0}
                        className="w-10 h-10 rounded-full border-2 border-navy/10 flex items-center justify-center text-navy hover:border-navy hover:bg-navy hover:text-white transition-all disabled:opacity-25">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span className="text-xs font-black text-navy/30 uppercase tracking-widest">{page + 1} / {totalPages}</span>
                    <button onClick={() => scrollTo("next")} disabled={page === totalPages - 1}
                        className="w-10 h-10 rounded-full border-2 border-navy/10 flex items-center justify-center text-navy hover:border-navy hover:bg-navy hover:text-white transition-all disabled:opacity-25">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>

                {/* View All */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2.5 px-10 py-4 bg-navy hover:bg-accent-red text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all duration-300 shadow-lg shadow-navy/20 group"
                    >
                        View All Products
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

            </div>
        </section>
    );
}

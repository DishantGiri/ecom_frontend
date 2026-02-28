"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill={s <= Math.round(rating) ? "#3D5BC9" : "none"}
                stroke="#3D5BC9" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ))}
    </div>
);

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("All");
    const [sortBy, setSortBy] = useState("best-selling");
    const [priceRange, setPriceRange] = useState({ from: "", to: "" });
    const [availability, setAvailability] = useState({ inStock: false, outOfStock: false });
    const [searchTerm, setSearchTerm] = useState("");
    const [recommendations, setRecommendations] = useState<any[]>([]);

    // UI state
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    useEffect(() => {
        const cat = searchParams.get("category");
        const query = searchParams.get("q");

        if (cat) {
            setFilterCategory(cat);
        } else if (query) {
            // Reset filters on a fresh global search
            setFilterCategory("All");
            setPriceRange({ from: "", to: "" });
            setAvailability({ inStock: false, outOfStock: false });
            setSearchTerm(query);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const query = searchParams.get("q");
                let url = `${apiHost}/api/products`;

                if (query) {
                    url = `${apiHost}/api/products/search?keyword=${encodeURIComponent(query)}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [apiHost, searchParams]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch(`${apiHost}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data.slice(0, 4));
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            }
        };
        fetchRecommendations();
    }, [apiHost]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean));
        return ["All", ...Array.from(cats)];
    }, [products]);

    const maxProductPrice = useMemo(() => {
        if (products.length === 0) return 0;
        return Math.max(...products.map(p => p.discountedPrice || 0));
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Category Filter
        if (filterCategory !== "All") {
            result = result.filter(p => p.category === filterCategory);
        }

        // Availability Filter (Assuming most are in stock for now)
        if (availability.inStock && !availability.outOfStock) {
            // Simplified logic: all products in our DB are considered 'in stock' for this demo
            // result = result.filter(p => !p.isOutOfStock);
        } else if (!availability.inStock && availability.outOfStock) {
            result = []; // Show nothing since we don't have out of stock data yet
        }

        // Price Filter — only apply if range is semantically valid
        const fromVal = priceRange.from ? parseFloat(priceRange.from) : null;
        const toVal = priceRange.to ? parseFloat(priceRange.to) : null;

        const isRangeValid = (fromVal === null || toVal === null) || (fromVal <= toVal);

        if (isRangeValid) {
            if (fromVal !== null) {
                result = result.filter(p => p.discountedPrice >= fromVal);
            }
            if (toVal !== null) {
                result = result.filter(p => p.discountedPrice <= toVal);
            }
        }

        // Sorting
        if (sortBy === "price-low") {
            result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.discountedPrice - a.discountedPrice);
        } else if (sortBy === "newest") {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [products, filterCategory, sortBy, priceRange, availability]);

    const getImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${apiHost}/api/images/${url}`;
    };

    const toggleMenu = (name: string) => {
        setActiveMenu(activeMenu === name ? null : name);
    };

    const resetAvailability = () => setAvailability({ inStock: false, outOfStock: false });
    const resetPrice = () => setPriceRange({ from: "", to: "" });

    return (
        <main className="min-h-screen bg-white pb-20 pt-10">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* ── SEARCH RESULTS HEADER (When 'q' is present) ── */}
                {searchParams.get("q") && (
                    <div className="flex flex-col items-center mb-16 pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-3xl font-medium text-navy mb-8">Search results</h1>
                        <div className="w-full max-w-[600px] relative">
                            <div className="absolute top-1 left-4 text-[9px] font-bold text-navy/40 uppercase tracking-widest pointer-events-none">Search</div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') router.push(`/products?q=${encodeURIComponent(searchTerm)}`);
                                }}
                                className="w-full pl-4 pr-32 pt-4 pb-1.5 bg-white border border-gray-400 focus:border-navy focus:ring-0 text-lg font-medium text-navy transition-all"
                            />
                            <div className="absolute right-0 top-0 h-full flex items-center">
                                {searchTerm && (
                                    <button
                                        onClick={() => { setSearchTerm(""); router.push('/products'); }}
                                        className="p-4 text-navy/40 hover:text-navy transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                                    </button>
                                )}
                                <div className="w-px h-8 bg-gray-200 mx-2" />
                                <button
                                    onClick={() => router.push(`/products?q=${encodeURIComponent(searchTerm)}`)}
                                    className="p-5 text-navy hover:text-accent-red transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FILTER BAR ── */}
                <div className="flex items-center justify-between gap-6 mb-12 py-8 border-b border-gray-100" ref={menuRef}>
                    <div className="flex items-center gap-10">
                        <span className="text-[14px] font-medium text-navy">Filter:</span>

                        {!searchParams.get("q") && (
                            <div className="relative">
                                <button
                                    onClick={() => toggleMenu('category')}
                                    className={`flex items-center gap-2 text-[14px] font-medium transition-colors group ${activeMenu === 'category' ? 'text-accent-red underline underline-offset-8 decoration-2' : 'text-navy hover:text-accent-red'}`}
                                >
                                    Category
                                    <span className={`text-navy/30 group-hover:text-accent-red transition-all ${activeMenu === 'category' ? 'rotate-180' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </span>
                                </button>
                                {activeMenu === 'category' && (
                                    <div className="absolute top-full left-0 mt-8 w-56 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)] rounded-lg border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-2 border-b border-gray-50 flex justify-between items-center mb-1">
                                            <span className="text-[12px] font-medium text-navy/40">Categories</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => { setFilterCategory(cat); setActiveMenu(null); }}
                                                    className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${filterCategory === cat ? 'text-accent-red' : 'text-navy'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('availability')}
                                className={`flex items-center gap-2 text-[14px] font-medium transition-colors group ${activeMenu === 'availability' ? 'text-navy' : 'text-navy hover:text-navy opacity-80'}`}
                            >
                                Availability
                                <span className={`transition-all ${activeMenu === 'availability' ? 'rotate-180 opacity-100' : 'opacity-30'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </button>
                            {activeMenu === 'availability' && (
                                <div className="absolute top-full left-0 mt-8 w-80 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)] rounded-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                    <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
                                        <span className="text-[15px] font-medium text-navy/70">
                                            {[availability.inStock, availability.outOfStock].filter(Boolean).length} selected
                                        </span>
                                        <button onClick={resetAvailability} className="text-[15px] font-medium text-navy underline underline-offset-4 decoration-1 decoration-navy/30 hover:decoration-navy transition-all">
                                            Reset
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={availability.inStock}
                                                onChange={(e) => setAvailability({ ...availability, inStock: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-navy focus:ring-navy cursor-pointer"
                                            />
                                            <span className="text-[15px] font-medium text-navy group-hover:text-accent-red transition-colors">
                                                In stock ({products.length})
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-4 cursor-not-allowed group opacity-40">
                                            <input
                                                type="checkbox"
                                                disabled
                                                checked={availability.outOfStock}
                                                onChange={(e) => setAvailability({ ...availability, outOfStock: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-200 text-navy cursor-not-allowed"
                                            />
                                            <span className="text-[15px] font-medium text-navy">
                                                Out of stock (0)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('price')}
                                className={`flex items-center gap-2 text-[14px] font-medium transition-colors group ${activeMenu === 'price' ? 'text-navy' : 'text-navy hover:text-navy opacity-80'}`}
                            >
                                Price
                                <span className={`transition-all ${activeMenu === 'price' ? 'rotate-180 opacity-100' : 'opacity-30'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </button>
                            {activeMenu === 'price' && (
                                <div className="absolute top-full left-0 mt-8 w-96 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)] rounded-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                    <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
                                        <span className="text-[15px] font-medium text-navy/70">
                                            The highest price is ${maxProductPrice.toFixed(2)}
                                        </span>
                                        <button onClick={resetPrice} className="text-[15px] font-medium text-navy underline underline-offset-4 decoration-1 decoration-navy/30 hover:decoration-navy transition-all">
                                            Reset
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 text-[15px]">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="From"
                                                    value={priceRange.from}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (parseFloat(val) < 0) return;
                                                        setPriceRange({ ...priceRange, from: val });
                                                    }}
                                                    className={`w-full pl-8 pr-4 py-3 bg-white border rounded focus:ring-0 text-[15px] placeholder:text-navy/40 transition-colors ${priceRange.from && priceRange.to && parseFloat(priceRange.from) > parseFloat(priceRange.to) ? 'border-accent-red' : 'border-gray-300 focus:border-navy'}`}
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 text-[15px]">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="To"
                                                    value={priceRange.to}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (parseFloat(val) < 0) return;
                                                        setPriceRange({ ...priceRange, to: val });
                                                    }}
                                                    className={`w-full pl-8 pr-4 py-3 bg-white border rounded focus:ring-0 text-[15px] placeholder:text-navy/40 transition-colors ${priceRange.from && priceRange.to && parseFloat(priceRange.from) > parseFloat(priceRange.to) ? 'border-accent-red' : 'border-gray-300 focus:border-navy'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8 justify-between md:justify-end">
                        <div className="flex items-center gap-4">
                            <span className="text-[14px] font-medium text-navy/40">Sort by:</span>
                            <div className="relative">
                                <button
                                    onClick={() => toggleMenu('sort')}
                                    className="flex items-center gap-3 text-[14px] font-medium text-navy hover:text-navy transition-colors group"
                                >
                                    {sortBy === 'best-selling' ? 'Best selling' : sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low-High' : sortBy === 'price-high' ? 'Price: High-Low' : 'Relevance'}
                                    <span className={`text-navy/30 group-hover:text-navy transition-all ${activeMenu === 'sort' ? 'rotate-180' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </span>
                                </button>
                                {activeMenu === 'sort' && (
                                    <div className="absolute top-full right-0 mt-8 w-56 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)] rounded-lg border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {[
                                            ['Relevance', 'relevance'],
                                            ['Best selling', 'best-selling'],
                                            ['Newest', 'newest'],
                                            ['Price: Low to High', 'price-low'],
                                            ['Price: High to Low', 'price-high']
                                        ].map(([label, val]) => (
                                            <button
                                                key={val}
                                                onClick={() => { setSortBy(val); setActiveMenu(null); }}
                                                className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${sortBy === val ? 'text-navy font-bold' : 'text-navy opacity-70'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <span className="text-[14px] font-medium text-navy/40 tabular-nums">
                            {filteredProducts.length} results
                        </span>
                    </div>
                </div>

                {/* ── PRODUCT GRID ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-square bg-gray-100 rounded-2xl" />
                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))
                    ) : (
                        filteredProducts.map((product) => (
                            <Link
                                href={`/products/${product.id}`}
                                key={product.id}
                                className="group block"
                            >
                                <div className="relative aspect-square rounded-2xl bg-[#fcfcfc] overflow-hidden mb-5 border border-gray-50 transition-colors group-hover:border-navy/5">
                                    {/* Sale badge */}
                                    {product.discountedPrice < product.originalPrice && (
                                        <span className="absolute top-4 right-4 z-20 bg-[#3D5BC9] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-[#3D5BC9]/20">
                                            Sale
                                        </span>
                                    )}

                                    {/* Image */}
                                    <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
                                        <img
                                            src={getImageUrl(product.featureImageUrl)}
                                            alt={product.title}
                                            className="max-w-full max-h-full object-contain group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                                        />
                                    </div>

                                    {/* Hover CTA — slide up background */}
                                    <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <div className="bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 text-center">
                                            Quick View →
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="space-y-1.5 px-0.5">
                                    <h3 className="text-[15px] lg:text-[17px] font-black text-navy leading-snug group-hover:text-accent-red transition-colors duration-200 line-clamp-1">
                                        {product.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-1">
                                        <StarRating rating={product.starRating} />
                                        <span className="text-[11px] font-bold text-navy/30">({product.numberOfReviews})</span>
                                    </div>

                                    <div className="flex items-baseline gap-2.5 pt-0.5">
                                        {product.originalPrice > product.discountedPrice && (
                                            <span className="text-[13px] font-medium text-navy/20 line-through">
                                                ${product.originalPrice.toFixed(2)} USD
                                            </span>
                                        )}
                                        <span className="text-sm lg:text-base font-black text-navy">
                                            From ${product.discountedPrice.toFixed(2)} USD
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-navy mb-2">No products found</h3>
                        <p className="text-navy/50 font-medium">Try adjusting your filters to find what you're looking for.</p>
                        <button
                            onClick={() => {
                                setFilterCategory("All");
                                setPriceRange({ from: "", to: "" });
                                setAvailability({ inStock: false, outOfStock: false });
                            }}
                            className="mt-8 text-sm font-black text-accent-red uppercase tracking-widest border-b-2 border-accent-red/20 hover:border-accent-red transition-all pb-1"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}

                {/* Recommendations Section (at bottom of search) */}
                {searchParams.get("q") && recommendations.length > 0 && (
                    <div className="mt-32 pt-20 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <p className="text-[11px] font-bold text-navy/40 uppercase tracking-[0.2em] mb-2">Continue Shopping</p>
                                <h2 className="text-3xl font-black text-navy tracking-tight">You may also like</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {recommendations.map((product) => (
                                <Link
                                    href={`/products/${product.id}`}
                                    key={`rec-${product.id}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-square rounded-2xl bg-[#fcfcfc] overflow-hidden mb-5 border border-gray-50 transition-colors group-hover:border-navy/5">
                                        {product.discountedPrice < product.originalPrice && (
                                            <span className="absolute top-4 right-4 z-20 bg-[#3D5BC9] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-[#3D5BC9]/20">
                                                Sale
                                            </span>
                                        )}
                                        <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
                                            <img
                                                src={getImageUrl(product.featureImageUrl)}
                                                alt={product.title}
                                                className="max-w-full max-h-full object-contain group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                            <div className="bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 text-center">
                                                Quick View →
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 px-0.5">
                                        <h3 className="text-[17px] font-black text-navy leading-snug group-hover:text-accent-red transition-colors duration-200 line-clamp-1">
                                            {product.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StarRating rating={product.starRating} />
                                            <span className="text-[11px] font-bold text-navy/30">({product.numberOfReviews})</span>
                                        </div>
                                        <div className="flex items-baseline gap-2.5 pt-0.5">
                                            {product.originalPrice > product.discountedPrice && (
                                                <span className="text-[13px] font-medium text-navy/20 line-through">
                                                    ${product.originalPrice.toFixed(2)} USD
                                                </span>
                                            )}
                                            <span className="text-base font-black text-navy">
                                                From ${product.discountedPrice.toFixed(2)} USD
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function AllProductsPage() {
    return (
        <Suspense fallback={<div>Loading collections...</div>}>
            <ProductsContent />
        </Suspense>
    );
}

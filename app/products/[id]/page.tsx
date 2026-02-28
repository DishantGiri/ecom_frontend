"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trackProductClick } from "../../utils/tracking";
import { useCurrency } from "../../components/CurrencyProvider";

interface Offer {
    id: number;
    label: string;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
    displayOrder: number;
    featureImageUrl: string;
}

interface Product {
    id: number;
    title: string;
    numberOfReviews: number;
    starRating: number;
    originalPrice: number;
    discountedPrice: number;
    featureImageUrl: string;
    galleryImageUrls: string[];
    category: string;
    productLink: string;
    offers: Offer[];
    similarProducts: Product[] | null;
}

const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

function getImageUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiHost}/api/images/${url}`;
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24">
                    <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        fill={s <= Math.ceil(rating) ? "#3D5BC9" : "none"}
                        stroke="#3D5BC9"
                        strokeWidth="1.5"
                    />
                </svg>
            ))}
        </div>
    );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, title, savings }: { images: string[]; title: string; savings: number }) {
    const { currencySymbol } = useCurrency();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const thumbRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset to first image whenever the images list changes (e.g. offer selected)
    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    const go = useCallback((dir: "prev" | "next") => {
        setActiveIndex((prev) => {
            if (dir === "next") return prev < images.length - 1 ? prev + 1 : 0;
            return prev > 0 ? prev - 1 : images.length - 1;
        });
    }, [images.length]);

    // Auto-slide every 4 seconds, pause on hover
    useEffect(() => {
        if (images.length <= 1) return;
        if (isPaused) { if (timerRef.current) clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => go("next"), 4000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [go, images.length, isPaused]);

    // Scroll active thumb into view — manual scroll to prevent page jumping
    useEffect(() => {
        const container = thumbRef.current;
        if (!container) return;
        const thumb = container.children[activeIndex] as HTMLElement;
        if (!thumb) return;

        // Calculate the center position within the container
        const scrollLeft = thumb.offsetLeft - (container.offsetWidth / 2) + (thumb.offsetWidth / 2);
        container.scrollTo({
            left: scrollLeft,
            behavior: "smooth"
        });
    }, [activeIndex]);

    if (images.length === 0) return null;

    return (
        <div
            className="lg:sticky lg:top-24"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* ── Main Image ── */}
            <div className="relative w-full overflow-hidden rounded-2xl mb-3 group" style={{ height: "480px" }}>
                {/* Background Shadow/Blur Layer — fully covers 'background color' with image colors */}
                <div
                    className="absolute inset-0 z-0 transition-opacity duration-700"
                    style={{
                        backgroundImage: `url(${images[activeIndex]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(60px) saturate(1.1) brightness(1.1)',
                        opacity: 0.4, // Increased opacity to ensure it's not transparent to a background color
                        transform: 'scale(1.2)'
                    }}
                />

                {/* Main Foreground Image — original ratio, floating with breathing room */}
                <div className="relative z-10 w-full h-full p-8 flex items-center justify-center pointer-events-none">
                    <img
                        key={images[activeIndex]}
                        src={images[activeIndex]}
                        alt={title}
                        className="max-w-full max-h-full object-contain transition-all duration-300 transform group-hover:scale-[1.02]"
                        style={{
                            filter: "drop-shadow(0 20px 60px rgba(0,31,63,0.15))",
                        }}
                    />
                </div>

                {/* Save badge */}
                {savings > 0 && (
                    <div
                        className="absolute top-3 left-3 z-30 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "linear-gradient(135deg, #D32F2F, #FF5252)", boxShadow: "0 4px 12px rgba(211,47,47,0.35)" }}
                    >
                        Save {currencySymbol}{savings.toFixed(2)}
                    </div>
                )}

                {/* Auto-slide progress bar */}
                {images.length > 1 && !isPaused && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] z-30" style={{ background: "rgba(255,255,255,0.12)" }}>
                        <div
                            key={`prog-${activeIndex}`}
                            style={{
                                height: "100%",
                                background: "linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.4))",
                                animation: "slideProgress 4s linear forwards",
                            }}
                        />
                    </div>
                )}

                {/* Prev / Next arrows — appear on hover */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => go("prev")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-30"
                            style={{
                                background: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(8px)",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => go("next")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-30"
                            style={{
                                background: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(8px)",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className="rounded-full transition-all duration-200"
                                    style={{
                                        width: i === activeIndex ? "18px" : "6px",
                                        height: "6px",
                                        background: i === activeIndex ? "rgba(0,31,63,0.85)" : "rgba(255,255,255,0.8)",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Thumbnail Strip ── like reference image: no boxes, images side by side */}
            {images.length > 1 && (
                <div className="relative">
                    {/* Scroll left button */}
                    <button
                        onClick={() => go("prev")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <div
                        ref={thumbRef}
                        className="flex gap-1.5 overflow-x-auto hide-scrollbar"
                    >
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className="flex-shrink-0 transition-all duration-200 overflow-hidden rounded-lg"
                                style={{
                                    width: "calc(25% - 5px)",
                                    minWidth: "72px",
                                    opacity: i === activeIndex ? 1 : 0.55,
                                    transform: i === activeIndex ? "scale(1)" : "scale(0.97)",
                                    filter: i === activeIndex ? "none" : "grayscale(0.2)",
                                }}
                            >
                                <img
                                    src={img}
                                    alt={`View ${i + 1}`}
                                    className="w-full h-auto object-cover"
                                    style={{ aspectRatio: "1/1", objectFit: "cover" }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Scroll right button */}
                    <button
                        onClick={() => go("next")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { currency, currencySymbol } = useCurrency();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Product[]>([]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`${apiHost}/api/products/${id}?currency=${currency}`);
                if (!res.ok) { router.push("/"); return; }
                const data: Product = await res.json();
                setProduct(data);
                const mainImg = getImageUrl(data.featureImageUrl);
                const gallery = [mainImg, ...(data.galleryImageUrls || []).map(getImageUrl)];
                setGalleryImages(gallery);
                if (data.offers?.length > 0) setSelectedOffer(data.offers[0]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, router, apiHost, currency]);

    // Fetch fallback recommendations if similarProducts is empty
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch(`${apiHost}/api/products?currency=${currency}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out the current product and take first 4
                    setRecommendations(data.filter((p: Product) => p.id !== Number(id)).slice(0, 4));
                }
            } catch (e) {
                console.error("Error fetching recommendations:", e);
            }
        };
        fetchRecommendations();
    }, [id, apiHost, currency]);

    const handleSelectOffer = (offer: Offer) => {
        setSelectedOffer(offer);
        if (offer.featureImageUrl) {
            const offerImg = getImageUrl(offer.featureImageUrl);
            setGalleryImages((prev) => [offerImg, ...prev.filter((img) => img !== offerImg)]);
        }
    };

    const handleBuyNow = () => {
        if (product?.id) {
            trackProductClick(product.id);
        }
        if (product?.productLink) window.open(product.productLink, "_blank");
        else alert("Checkout link not configured.");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-navy/10 border-t-navy rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em]">Loading</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const savings = selectedOffer
        ? selectedOffer.originalPrice - selectedOffer.discountedPrice
        : product.originalPrice - product.discountedPrice;
    const displayPrice = selectedOffer ? selectedOffer.discountedPrice : product.discountedPrice;
    const displayOriginal = selectedOffer ? selectedOffer.originalPrice : product.originalPrice;

    return (
        <main className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 40%, #f1f5f9 100%)" }}>

            {/* Breadcrumb */}
            <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,31,63,0.06)" }}>
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-2.5 flex items-center gap-2 text-[10px] font-semibold text-navy/35 uppercase tracking-wider">
                    <Link href="/" className="hover:text-navy transition-colors">Home</Link>
                    <span className="text-navy/20">/</span>
                    <Link href="/" className="hover:text-navy transition-colors">{product.category}</Link>
                    <span className="text-navy/20">/</span>
                    <span className="text-navy/50 line-clamp-1 max-w-xs">{product.title}</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-start">

                    {/* LEFT — Image Gallery */}
                    <ImageGallery images={galleryImages} title={product.title} savings={savings} />

                    {/* RIGHT — Product Info */}
                    <div className="space-y-5">

                        {/* Category pill — Link to filtered results */}
                        <Link
                            href={`/products?category=${encodeURIComponent(product.category)}`}
                            className="inline-block text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
                            style={{ background: "linear-gradient(135deg, rgba(61,91,201,0.08), rgba(61,91,201,0.12))", color: "#3D5BC9", border: "1px solid rgba(61,91,201,0.15)" }}
                        >
                            {product.category}
                        </Link>

                        {/* Title */}
                        <h1 className="text-2xl lg:text-3xl font-black text-navy leading-tight tracking-tight line-clamp-2">
                            {product.title}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <StarRating rating={product.starRating} size={16} />
                            <span className="text-sm font-medium text-navy/50">{product.numberOfReviews.toLocaleString()} reviews</span>
                        </div>

                        {/* Price Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                {displayOriginal > displayPrice && (
                                    <span className="text-lg font-medium text-navy/30 line-through">{currencySymbol}{displayOriginal.toFixed(2)} {currency}</span>
                                )}
                                <span className="text-2xl font-black text-navy">{currencySymbol}{displayPrice.toFixed(2)} {currency}</span>
                                {displayOriginal > displayPrice && (
                                    <span className="bg-[#3D5BC9] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Sale
                                    </span>
                                )}
                            </div>

                            {/* Free Shipping Line */}
                            <div className="flex items-center gap-2 text-navy/70">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                    <path d="M15 18H9" />
                                    <path d="M19 18h2a1 1 0 0 0 1-1v-4.2c0-.8-.6-1.5-1.4-1.5h-1.3l-1.4-2.9C17.6 7.9 17 7.5 16.3 7.5H15" />
                                    <circle cx="7" cy="18" r="2" />
                                    <circle cx="17" cy="18" r="2" />
                                </svg>
                                <span className="text-xs font-black uppercase tracking-wider">Free 3-4 day shipping</span>
                            </div>
                        </div>

                        {/* Bundle Selector */}
                        {product.offers && product.offers.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[9px] font-black text-navy/35 uppercase tracking-[0.25em] flex items-center gap-2.5">
                                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                                    Bundle &amp; Save
                                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                                </p>
                                <div className="space-y-2">
                                    {product.offers.sort((a, b) => a.displayOrder - b.displayOrder).map((offer) => {
                                        const isActive = selectedOffer?.id === offer.id;
                                        const offerSavings = offer.originalPrice - offer.discountedPrice;
                                        return (
                                            <button
                                                key={offer.id}
                                                onClick={() => handleSelectOffer(offer)}
                                                className="w-full flex items-center gap-4 px-5 py-4.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden"
                                                style={isActive
                                                    ? { background: "linear-gradient(135deg, #001F3F 0%, #00325c 100%)", boxShadow: "0 8px 24px rgba(0,31,63,0.22), inset 0 1px 0 rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.07)" }
                                                    : { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,31,63,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                                                }
                                            >
                                                {/* Shine overlay */}
                                                {isActive && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, rgba(255,255,255,0.07) 0%, transparent 60%)" }} />}

                                                {/* Thumbnail — offer image, fallback to product main image */}
                                                {(() => {
                                                    const thumbSrc = offer.featureImageUrl
                                                        ? getImageUrl(offer.featureImageUrl)
                                                        : getImageUrl(product.featureImageUrl);
                                                    return (
                                                        <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                                                            style={isActive ? { background: "rgba(255,255,255,0.1)" } : { background: "rgba(0,31,63,0.04)" }}>
                                                            {thumbSrc ? (
                                                                <img
                                                                    src={thumbSrc}
                                                                    alt={offer.label}
                                                                    className="w-full h-full object-contain p-1"
                                                                    onError={(e) => {
                                                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                                                        (e.currentTarget.nextElementSibling as HTMLElement | null)?.setAttribute("style", "display:block");
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                                                style={{ color: isActive ? "rgba(255,255,255,0.3)" : "rgba(0,31,63,0.2)", display: thumbSrc ? "none" : "block" }}>
                                                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                                                            </svg>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Label — left center */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-[15px] leading-snug" style={{ color: isActive ? "#ffffff" : "#001F3F" }}>
                                                        {offer.label}
                                                    </p>
                                                    {offerSavings > 0 && (
                                                        <p className="text-[10px] font-black uppercase tracking-wider mt-1"
                                                            style={{ color: isActive ? "#86efac" : "#16a34a" }}>
                                                            You Save {currencySymbol}{offerSavings.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price block — right aligned */}
                                                <div className="text-right flex-shrink-0">
                                                    {offer.originalPrice > 0 && (
                                                        <p className="text-[11px] font-medium line-through leading-none mb-1"
                                                            style={{ color: isActive ? "rgba(255,255,255,0.35)" : "rgba(0,31,63,0.28)" }}>
                                                            {currencySymbol}{offer.originalPrice.toFixed(2)}
                                                        </p>
                                                    )}
                                                    <p className="text-base font-black leading-none"
                                                        style={{ color: isActive ? "#ffffff" : "#D32F2F" }}>
                                                        {currencySymbol}{offer.discountedPrice.toFixed(2)} {currency}
                                                    </p>
                                                </div>

                                                {/* Check indicator */}
                                                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ml-2"
                                                    style={isActive ? { background: "white" } : { border: "2px solid rgba(0,31,63,0.15)" }}>
                                                    {isActive && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Buy Now — larger + looping shine */}
                        <div className="space-y-2 pt-1">
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-5 font-black text-[14px] uppercase tracking-[0.25em] rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                                style={{ background: "linear-gradient(135deg, #001F3F 0%, #00325c 50%, #001430 100%)", boxShadow: "0 12px 36px rgba(0,31,63,0.3), inset 0 1px 0 rgba(255,255,255,0.12)", color: "white" }}
                                onMouseEnter={(e) => {
                                    const b = e.currentTarget as HTMLButtonElement;
                                    b.style.background = "linear-gradient(135deg, #D32F2F 0%, #ef4444 50%, #b91c1c 100%)";
                                    b.style.boxShadow = "0 12px 36px rgba(211,47,47,0.38), inset 0 1px 0 rgba(255,255,255,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    const b = e.currentTarget as HTMLButtonElement;
                                    b.style.background = "linear-gradient(135deg, #001F3F 0%, #00325c 50%, #001430 100%)";
                                    b.style.boxShadow = "0 12px 36px rgba(0,31,63,0.3), inset 0 1px 0 rgba(255,255,255,0.12)";
                                }}
                            >
                                {/* Looping Shine Overlay */}
                                <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                    <span className="absolute top-0 left-0 w-1/3 h-full opacity-30 animate-shine-loop"
                                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)" }} />
                                </span>

                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                <span>Buy Now</span>
                            </button>
                            <p className="text-center text-[9px] text-navy/25 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Guaranteed Safe &amp; Secure Checkout
                            </p>
                            {/* Accepted payment methods */}
                            <div className="flex justify-center pt-1">
                                <img
                                    src="/accepted_payment.png"
                                    alt="Accepted payment methods"
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-2 pt-1" style={{ borderTop: "1px solid rgba(0,31,63,0.05)" }}>
                            {[
                                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Quality Tested" },
                                { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Free Shipping" },
                                { icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", label: "Easy Returns" },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                                    style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,31,63,0.05)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30">
                                        <path d={icon} />
                                    </svg>
                                    <span className="text-[8px] font-black text-navy/30 uppercase tracking-wider text-center leading-tight">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Similar Products / Recommended Section */}
                {((product.similarProducts && product.similarProducts.length > 0) || recommendations.length > 0) && (
                    <section className="mt-24 pt-12 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-navy tracking-tight">
                                {product.similarProducts && product.similarProducts.length > 0 ? "You may also like" : "Recommended for you"}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {(product.similarProducts && product.similarProducts.length > 0 ? product.similarProducts : recommendations).map((sp) => {
                                const isSale = sp.discountedPrice < sp.originalPrice;
                                return (
                                    <Link key={sp.id} href={`/products/${sp.id}`} className="group block">
                                        <div className="relative aspect-square rounded-2xl bg-[#fcfcfc] overflow-hidden mb-5 border border-gray-50 transition-colors group-hover:border-navy/5">
                                            {/* Sale badge */}
                                            {isSale && (
                                                <span className="absolute top-4 right-4 z-20 bg-[#3D5BC9] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-[#3D5BC9]/20">
                                                    Sale
                                                </span>
                                            )}

                                            {/* Image */}
                                            <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
                                                <img
                                                    src={getImageUrl(sp.featureImageUrl)}
                                                    alt={sp.title}
                                                    className="max-w-full max-h-full object-contain group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                                                />
                                            </div>

                                            {/* Hover CTA */}
                                            <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                                <div className="bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 text-center">
                                                    Quick View →
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1.5 px-0.5">
                                            <h3 className="text-[15px] lg:text-[17px] font-black text-navy leading-snug group-hover:text-accent-red transition-colors duration-200 line-clamp-1">
                                                {sp.title}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-1">
                                                <StarRating rating={sp.starRating || 5} size={12} />
                                                <span className="text-[11px] font-bold text-navy/30">({sp.numberOfReviews || 0})</span>
                                            </div>

                                            <div className="flex items-baseline gap-2.5 pt-0.5">
                                                {sp.originalPrice > sp.discountedPrice && (
                                                    <span className="text-[13px] font-medium text-navy/20 line-through">
                                                        {currencySymbol}{sp.originalPrice.toFixed(2)} {currency}
                                                    </span>
                                                )}
                                                <span className="text-sm lg:text-base font-black text-navy">
                                                    From {currencySymbol}{sp.discountedPrice.toFixed(2)} {currency}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

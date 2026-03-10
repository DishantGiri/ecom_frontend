"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { trackProductClick } from "../../utils/tracking";
import { useCurrency } from "../../components/CurrencyProvider";
import { apiFetch } from "../../utils/apiFetch";
import { apiHost } from "../../utils/apiHost";
import ScrollReveal from "../../components/ScrollReveal";


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
    promotionalImageUrls?: string[];
    category: string | { id: number; name: string; imageUrl?: string };
    productLink: string;
    description?: string;
    highlights?: string;
    directions?: string;
    benefits?: string;
    guarantee?: string;
    shippingInfo?: string;
    sectionOrder?: string[];
    offers: Offer[];
    similarProducts: Product[] | null;
}

function getImageUrl(url: string): string {
    if (!url) return "";
    const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
    return full.replace(/([^:])\/\/+/g, '$1/');
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

// ─── Collapsible Accordion ────────────────────────────────────────────────────

function ProductAccordion({ title, children, defaultOpen = false, isSub = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean, isSub?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border-b border-gray-100 last:border-0 ${isSub ? 'py-3' : 'py-5'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left ${isSub ? 'text-[15px] font-bold text-navy/90 hover:text-[#3D5BC9]' : 'text-lg font-black text-navy hover:text-[#3D5BC9]'} transition-colors gap-4`}
            >
                <span>{title}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-[#3D5BC9]/10 text-[#3D5BC9]' : 'bg-gray-50 text-navy/40'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
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
                const data = await apiFetch<Product>(`${apiHost}/api/products/${id}?currency=${currency}`);
                if (!data) { setLoading(false); return; }
                setProduct(data);
                const mainImg = getImageUrl(data.featureImageUrl);
                const gallery = [mainImg, ...(data.galleryImageUrls || []).map(getImageUrl)];
                setGalleryImages(gallery);
                if (data.offers?.length > 0) setSelectedOffer(data.offers[0]);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, router, apiHost, currency]);

    // Fetch fallback recommendations if similarProducts is empty
    useEffect(() => {
        const fetchRecommendations = async () => {
            const data = await apiFetch<Product[]>(`${apiHost}/api/products?currency=${currency}`);
            if (data) {
                setRecommendations(data.filter((p: Product) => p.id !== Number(id)).slice(0, 4));
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
        else toast.error("Checkout link not configured.");
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
                    <Link href="/" className="hover:text-navy transition-colors">{(typeof product.category === 'object' && product.category !== null) ? product.category.name : product.category}</Link>
                    <span className="text-navy/20">/</span>
                    <span className="text-navy/50 line-clamp-1 max-w-xs">{product.title}</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-start">

                    {/* LEFT — Image Gallery */}
                    <div className="lg:sticky lg:top-24">
                        <ScrollReveal animation="fade">
                            <ImageGallery images={galleryImages} title={product.title} savings={savings} />
                        </ScrollReveal>
                    </div>

                    {/* RIGHT — Product Info */}
                    <ScrollReveal animation="right" delay={100}>
                        <div className="space-y-5">

                            {/* Category pill — Link to filtered results */}
                            <Link
                                href={`/products?category=${encodeURIComponent((typeof product.category === 'object' && product.category !== null) ? product.category.name : (product.category as string))}`}
                                className="inline-block text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
                                style={{ background: "linear-gradient(135deg, rgba(61,91,201,0.08), rgba(61,91,201,0.12))", color: "#3D5BC9", border: "1px solid rgba(61,91,201,0.15)" }}
                            >
                                {(typeof product.category === 'object' && product.category !== null) ? product.category.name : product.category}
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
                            <ScrollReveal animation="up" delay={200}>
                                <div className="grid grid-cols-3 gap-2 pt-1 mt-6" style={{ borderTop: "1px solid rgba(0,31,63,0.05)" }}>
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

                                {/* Dynamic Top Section (First Priority) */}
                                {(() => {
                                    const order = product.sectionOrder || ["description", "highlights", "directions", "benefits", "guarantee", "shippingInfo"];
                                    const firstKey = order.find(k => (product as any)[k]);
                                    if (!firstKey) return null;

                                    if (firstKey === "description") {
                                        return (
                                            <div className="text-navy/75 leading-relaxed text-[16px] space-y-4 pt-6">
                                                {product.description?.split('\n').map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        );
                                    }
                                    if (firstKey === "highlights") {
                                        return (
                                            <div className="text-navy/75 leading-snug text-[15px] space-y-1 pt-6">
                                                <ul className="space-y-1 text-[15px] text-navy/80">
                                                    {product.highlights?.split('\n').map((line, i) => (
                                                        <li key={i} className="flex items-center gap-3">
                                                            <span>{line}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    const meta: any = {
                                        directions: { label: "Directions", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
                                        benefits: { label: "Benefits", icon: "M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" },
                                        guarantee: { label: "Guarantee", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                                        shippingInfo: { label: "Shipping", icon: "M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" },
                                    };
                                    const s = meta[firstKey];
                                    return (
                                        <div className="pt-8 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                                                <h4 className="text-[13px] font-black uppercase tracking-widest text-navy/60">{s.label}</h4>
                                            </div>
                                            <div className="text-navy/70 leading-relaxed text-[15px]">
                                                {(product as any)[firstKey].split('\n').map((line: string, i: number) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </ScrollReveal>

                        </div>
                    </ScrollReveal>

                </div>{/* end grid */}
            </div>{/* end max-w-[1440px] */}

            {/* ─── Product Details ───────────────────────────────────────────────── */}
            <div className="mt-16 md:mt-24 border-t border-gray-200 pt-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {(() => {
                        const order = product.sectionOrder || ["description", "highlights", "directions", "benefits", "guarantee", "shippingInfo"];
                        const firstKey = order.find(k => (product as any)[k]);
                        const remainingKeys = order.filter(k => k !== firstKey && (product as any)[k]);
                        if (remainingKeys.length === 0) return null;

                        return remainingKeys.map((sectionKey) => {
                            let content = null;

                            /* DESCRIPTION */
                            if (sectionKey === "description" && product.description) {
                                content = (
                                    <div key="description" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-2xl font-semibold text-gray-900">Product Description</h3>
                                        </div>
                                        <div className="px-8 py-7 text-[18px] text-gray-700 leading-[1.85] space-y-4">
                                            {product.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            /* HIGHLIGHTS */
                            if (sectionKey === "highlights" && product.highlights) {
                                const lines = product.highlights.split('\n').filter(l => l.trim());
                                content = (
                                    <div key="highlights" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-2xl font-semibold text-gray-900">Key Highlights</h3>
                                        </div>
                                        <div className="px-8 py-7">
                                            <ul className="space-y-4">
                                                {lines.map((line, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-[18px] text-gray-700">
                                                        <span className="mt-[10px] w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                                                        <span className="leading-relaxed">{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            }

                            /* DIRECTIONS */
                            if (sectionKey === "directions" && product.directions) {
                                const steps = product.directions.split('\n').filter(l => l.trim());
                                content = (
                                    <div key="directions" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-2xl font-semibold text-gray-900">Directions for Use</h3>
                                        </div>
                                        <div className="px-8 py-7">
                                            <ol className="space-y-4">
                                                {steps.map((line, i) => (
                                                    <li key={i} className="flex items-start gap-4 text-[18px] text-gray-700">
                                                        <span className="w-8 h-8 rounded-full border border-gray-300 text-[14px] font-semibold text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                                        <span className="leading-relaxed pt-1">{line}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                );
                            }

                            /* BENEFITS */
                            if (sectionKey === "benefits" && product.benefits) {
                                const items = product.benefits.split('\n').filter(l => l.trim());
                                content = (
                                    <div key="benefits" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-2xl font-semibold text-gray-900">Benefits</h3>
                                        </div>
                                        <div className="px-8 py-7">
                                            <ul className="space-y-4">
                                                {items.map((line, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-[18px] text-gray-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#001f3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[5px] flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                                                        <span className="leading-relaxed">{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            }

                            /* GUARANTEE */
                            if (sectionKey === "guarantee" && product.guarantee) {
                                const lines = product.guarantee.split('\n').filter(l => l.trim());
                                content = (
                                    <div key="guarantee" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#001f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                            <h3 className="text-2xl font-semibold text-gray-900">30-Day Money-Back Guarantee</h3>
                                        </div>
                                        <div className="px-8 py-7 space-y-4">
                                            {lines.map((line, i) => (
                                                <p key={i} className="text-[18px] text-gray-700 leading-relaxed">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            /* SHIPPING */
                            if (sectionKey === "shippingInfo" && product.shippingInfo) {
                                const lines = product.shippingInfo.split('\n').filter(l => l.trim());
                                content = (
                                    <div key="shippingInfo" className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-2xl font-semibold text-gray-900">Shipping & Delivery</h3>
                                        </div>
                                        <div className="px-8 py-7 space-y-4">
                                            {lines.map((line, i) => (
                                                <p key={i} className={`text-[18px] leading-relaxed ${i === 0 ? "font-semibold text-gray-800" : "text-gray-700"}`}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (!content) return null;

                            return (
                                <ScrollReveal key={sectionKey} animation="up" threshold={0.05}>
                                    {content}
                                </ScrollReveal>
                            );
                        });
                    })()}

                    {/* Have a Question */}
                    <ScrollReveal animation="up" threshold={0.1}>
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-2xl font-semibold text-gray-900">Have a Question?</h3>
                            </div>
                            <div className="px-8 py-7">
                                <p className="text-[18px] text-gray-700 mb-6">Our customer service team is ready to help. Reach out any time:</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[18px] text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                        <span><strong className="font-semibold text-gray-800">Mon – Sat</strong>, 9am – 5pm PST</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[18px] text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                        <a href="mailto:support@supplementsfast.com" className="text-[#3D5BC9] hover:underline">support@supplementsfast.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* From the Manufacturer / Promotional Graphic Images */}
            {product.promotionalImageUrls && product.promotionalImageUrls.length > 0 && (
                <ScrollReveal animation="fade" threshold={0.01} className="mt-20 border-t border-gray-100 pt-16">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-4">
                        <h2 className="text-2xl font-black text-navy mb-8 block font-sans tracking-tight">
                            From the manufacturer
                        </h2>
                        <div className="flex flex-col gap-0 overflow-hidden w-full">
                            {product.promotionalImageUrls.map((imgUrl, idx) => (
                                <ScrollReveal key={idx} animation="up" threshold={0.05}>
                                    <div className="w-full relative flex justify-center">
                                        <img
                                            src={getImageUrl(imgUrl)}
                                            alt={`${product.title} manufacturer details ${idx + 1}`}
                                            className="w-full max-w-full object-contain"
                                        />
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Similar Products / Recommended Section */}
            {((product.similarProducts && product.similarProducts.length > 0) || recommendations.length > 0) && (
                <ScrollReveal animation="fade" threshold={0.01} className="mt-24 pt-12 border-t border-gray-100 pb-20">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-navy tracking-tight">
                                {product.similarProducts && product.similarProducts.length > 0 ? "You may also like" : "Recommended for you"}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {(product.similarProducts && product.similarProducts.length > 0 ? product.similarProducts : recommendations).map((sp, idx) => {
                                const isSale = sp.discountedPrice < sp.originalPrice;
                                return (
                                    <ScrollReveal key={sp.id} animation="up" delay={idx * 100} threshold={0.1}>
                                        <Link href={`/products/${sp.id}`} className="group block">
                                            <div className="relative aspect-square rounded-2xl bg-[#fcfcfc] overflow-hidden mb-5 border border-gray-50 transition-colors group-hover:border-navy/5">
                                                {isSale && (
                                                    <span className="absolute top-4 right-4 z-20 bg-[#3D5BC9] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-[#3D5BC9]/20">
                                                        Sale
                                                    </span>
                                                )}
                                                <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
                                                    <img
                                                        src={getImageUrl(sp.featureImageUrl)}
                                                        alt={sp.title}
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
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    </div>
                </ScrollReveal>
            )}

        </main>
    );
}

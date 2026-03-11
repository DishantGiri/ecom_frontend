"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getTokenFromCookie, isAdminFromCookie, clearAuthCookies } from "../utils/auth";
import { apiHost } from "../utils/apiHost";

interface Review {
    id: number;
    reviewerName: string;
    reviewText: string;
    starRating: number;
    imageUrl?: string;
}

interface Offer {
    id?: number;
    label: string;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
    displayOrder: number;
    featureImageUrl?: string;
}

interface Product {
    id: number;
    title: string;
    ribbon?: string;
    numberOfReviews: number;
    starRating: number;
    originalPrice: number;
    discountedPrice: number;
    category: string | { id: number; name: string; imageUrl?: string };
    productLink: string;
    description?: string;
    highlights?: string;
    directions?: string;
    benefits?: string;
    guarantee?: string;
    shippingInfo?: string;
    sectionOrder?: string[];
    featureImageUrl: string;
    galleryImageUrls: string[];
    promotionalImageUrls?: string[];
    offers: Offer[];
    reviews?: Review[];
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        ribbon: "",
        numberOfReviews: 0,
        starRating: 5.0,
        originalPrice: 0,
        discountedPrice: 0,
        categoryId: null as number | null,
        productLink: "",
        description: "",
        highlights: "",
        directions: "",
        benefits: "",
        guarantee: "",
        shippingInfo: "",
        sectionOrder: ["description", "highlights", "directions", "benefits", "guarantee", "shippingInfo"] as string[],
        offers: [] as Offer[]
    });

    const [featureImage, setFeatureImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [promotionalImages, setPromotionalImages] = useState<File[]>([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);
    const [existingPromotionalImages, setExistingPromotionalImages] = useState<string[]>([]);
    const [offerImages, setOfferImages] = useState<Record<number, File>>({});
    const [snippets, setSnippets] = useState<{ id: number; name: string; content: string }[]>([]);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({
        reviewerName: "",
        reviewText: "",
        starRating: 5.0,
        image: null as File | null
    });

    useEffect(() => {
        // Fetch categories for the dropdowns
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${apiHost}/api/categories`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);

                    // If the current categoryId isn't in the fetched list, default to the first one or a placeholder
                    setFormData(prev => {
                        if (data.length > 0 && !data.some((c: any) => c.id === prev.categoryId)) {
                            return { ...prev, categoryId: data[0].id };
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchSnippets = async () => {
            try {
                const token = getTokenFromCookie();
                const response = await fetch(`${apiHost}/api/admin/snippets`, { headers: { Authorization: `Bearer ${token}` } });
                if (response.ok) {
                    const data = await response.json();
                    setSnippets(data);
                }
            } catch (error) {
                console.error("Error fetching snippets:", error);
            }
        };

        const checkAccessAndFetch = async () => {
            const token = getTokenFromCookie();
            if (!token || !isAdminFromCookie()) {
                router.push("/login");
                return;
            }
            await Promise.all([fetchProducts(), fetchCategories(), fetchSnippets()]);
        };

        checkAccessAndFetch();
    }, [router, apiHost]);

    const getImageUrl = (url: string) => {
        if (!url) return "";
        const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
        return full.replace(/([^:])\/\/+/g, '$1/');
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiHost}/api/products`);
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

    const handleDragStart = (e: React.DragEvent, sectionKey: string) => {
        e.dataTransfer.setData("sectionKey", sectionKey);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetSectionKey: string) => {
        e.preventDefault();
        const draggedSectionKey = e.dataTransfer.getData("sectionKey");
        if (draggedSectionKey === targetSectionKey) return;

        const newOrder = [...formData.sectionOrder];
        const draggedIdx = newOrder.indexOf(draggedSectionKey);
        const targetIdx = newOrder.indexOf(targetSectionKey);

        newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedSectionKey);

        setFormData({ ...formData, sectionOrder: newOrder });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const loadingToast = toast.loading("Deleting product...");
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setProducts(products.filter(p => p.id !== id));
                toast.success("Product deleted successfully", { id: loadingToast });
            } else {
                toast.error("Failed to delete product", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product", { id: loadingToast });
        }
    };

    const handleAddOffer = () => {
        setFormData({
            ...formData,
            offers: [
                ...formData.offers,
                { label: "", quantity: 1, originalPrice: 0, discountedPrice: 0, displayOrder: formData.offers.length + 1 }
            ]
        });
    };

    const handleRemoveOffer = (index: number) => {
        const newOffers = [...formData.offers];
        newOffers.splice(index, 1);
        setFormData({ ...formData, offers: newOffers });

        const newOfferImages = { ...offerImages };
        delete newOfferImages[index];
        setOfferImages(newOfferImages);
    };

    const handleOfferChange = (index: number, field: keyof Offer, value: any) => {
        const newOffers = [...formData.offers];
        newOffers[index] = { ...newOffers[index], [field]: value };
        setFormData({ ...formData, offers: newOffers });
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGalleryImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handlePromotionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPromotionalImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveExistingImage = async (type: 'gallery' | 'promotional', filename: string) => {
        if (!editingProduct) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this image? This action cannot be undone.");
        if (!confirmDelete) return;

        const loadingToast = toast.loading("Deleting image...");
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/products/${editingProduct.id}/${type}/${filename.split('/').pop()}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                if (type === 'gallery') {
                    setExistingGalleryImages(prev => prev.filter(f => f !== filename));
                } else {
                    setExistingPromotionalImages(prev => prev.filter(f => f !== filename));
                }
                fetchProducts();
                toast.success("Image deleted", { id: loadingToast });
            } else {
                toast.error("Failed to delete image.", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error deleting image", error);
            toast.error("Failed to delete image.", { id: loadingToast });
        }
    };

    const handleOfferImageChange = (index: number, file: File) => {
        setOfferImages({ ...offerImages, [index]: file });
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const confirmUpload = window.confirm(`Are you sure you want to bulk upload products from ${file.name}?`);
        if (!confirmUpload) {
            e.target.value = ""; // Reset input
            return;
        }

        const loadingToast = toast.loading("Processing bulk upload...");
        try {
            const token = getTokenFromCookie();
            const form = new FormData();
            form.append("file", file);

            const response = await fetch(`${apiHost}/api/admin/products/bulk-upload`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            if (response.ok) {
                toast.success("Bulk upload completed successfully", { id: loadingToast });
                fetchProducts();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to process bulk upload", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error during bulk upload:", error);
            toast.error("An error occurred during bulk upload", { id: loadingToast });
        } finally {
            e.target.value = ""; // Reset input
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading(editingProduct ? "Updating product..." : "Adding product...");
        try {
            const token = getTokenFromCookie();
            const form = new FormData();

            // Append JSON data
            form.append("data", JSON.stringify(formData));

            // Append Global Feature Image
            if (featureImage) {
                form.append("featureImage", featureImage);
            }

            // Append Gallery Images
            galleryImages.forEach(img => {
                form.append("galleryImages", img);
            });

            // Append Promotional Images
            promotionalImages.forEach(img => {
                form.append("promotionalImages", img);
            });

            // Append Offer Specific Images
            Object.entries(offerImages).forEach(([index, file]) => {
                form.append(`offerImage_${index}`, file);
            });

            const url = editingProduct
                ? `${apiHost}/api/admin/products/${editingProduct.id}`
                : `${apiHost}/api/admin/products`;

            const method = editingProduct ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchProducts();
                resetForm();
                toast.success(editingProduct ? "Product updated successfully" : "Product added successfully", { id: loadingToast });
            } else {
                const error = await response.json();
                toast.error(error.message || "Something went wrong", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Error saving product", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const loadingToast = toast.loading("Adding review...");
        try {
            const token = getTokenFromCookie();
            const form = new FormData();
            form.append("reviewerName", reviewForm.reviewerName);
            form.append("reviewText", reviewForm.reviewText);
            form.append("starRating", reviewForm.starRating.toString());
            if (reviewForm.image) {
                form.append("image", reviewForm.image);
            }

            const response = await fetch(`${apiHost}/api/admin/products/${editingProduct.id}/reviews`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });

            if (response.ok) {
                toast.success("Review added successfully!", { id: loadingToast });
                setReviewForm({ reviewerName: "", reviewText: "", starRating: 5.0, image: null });
                // Re-fetch product data to update UI
                const refreshed = await fetch(`${apiHost}/api/products/${editingProduct.id}`);
                if (refreshed.ok) {
                    const data = await refreshed.json();
                    setEditingProduct(data);
                    // Also update in the main products list
                    setProducts(products.map(p => p.id === data.id ? data : p));
                }
            } else {
                toast.error("Failed to add review", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Error adding review", { id: loadingToast });
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        const loadingToast = toast.loading("Deleting review...");
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/products/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Review deleted", { id: loadingToast });
                if (editingProduct) {
                    const refreshed = await fetch(`${apiHost}/api/products/${editingProduct.id}`);
                    if (refreshed.ok) {
                        const data = await refreshed.json();
                        setEditingProduct(data);
                        setProducts(products.map(p => p.id === data.id ? data : p));
                    }
                }
            } else {
                toast.error("Failed to delete review", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Error deleting review", { id: loadingToast });
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            ribbon: "",
            numberOfReviews: 0,
            starRating: 5.0,
            originalPrice: 0,
            discountedPrice: 0,
            categoryId: categories.length > 0 ? categories[0].id : null,
            productLink: "",
            description: "",
            highlights: "",
            directions: "",
            benefits: "",
            guarantee: "",
            shippingInfo: "",
            sectionOrder: ["description", "highlights", "directions", "benefits", "guarantee", "shippingInfo"],
            offers: []
        });
        setFeatureImage(null);
        setGalleryImages([]);
        setPromotionalImages([]);
        setExistingGalleryImages([]);
        setExistingPromotionalImages([]);
        setOfferImages({});
        setEditingProduct(null);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        // Find the category ID from the categories list
        const categoryId = (typeof product.category === 'object' && product.category !== null)
            ? product.category.id
            : categories.find(c => c.name === product.category)?.id;

        setFormData({
            title: product.title,
            ribbon: product.ribbon || "",
            numberOfReviews: product.numberOfReviews,
            starRating: product.starRating,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            categoryId: categoryId || null,
            productLink: product.productLink,
            description: product.description || "",
            highlights: product.highlights || "",
            directions: product.directions || "",
            benefits: product.benefits || "",
            guarantee: product.guarantee || "",
            shippingInfo: product.shippingInfo || "",
            sectionOrder: (product.sectionOrder && product.sectionOrder.length > 0)
                ? product.sectionOrder
                : ["description", "highlights", "directions", "benefits", "guarantee", "shippingInfo"],
            offers: product.offers
        });
        setExistingGalleryImages(product.galleryImageUrls || []);
        setExistingPromotionalImages(product.promotionalImageUrls || []);
        setIsModalOpen(true);
    };

    return (
        <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
            {/* Sidebar (Simplified for now) */}
            <div className="w-64 bg-navy text-white flex flex-col p-6 space-y-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent-red p-2 rounded-lg shadow-lg shadow-accent-red/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Admin</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Products</span>
                    </Link>
                    <Link href="/dashboard/blogs" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Blogs</span>
                    </Link>
                    <Link href="/dashboard/reviews" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M9 10h6" /><path d="M9 14h3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Reviews</span>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Click Tracking</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Settings</span>
                    </Link>
                </nav>

                <button onClick={() => {
                    clearAuthCookies();
                    router.push("/login");
                }} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all">
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-navy tracking-tight">Product Management</h2>
                        <p className="text-navy/40 text-sm font-bold uppercase tracking-widest mt-1">Manage your inventory and bundles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-white text-navy border-2 border-dashed border-navy/20 hover:border-navy px-6 py-4 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-sm flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            <span>Bulk Upload CSV</span>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleBulkUpload}
                            />
                        </label>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="bg-accent-red hover:bg-navy text-white px-8 py-4.5 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-accent-red/20 flex items-center space-x-3 h-full border-2 border-transparent"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            <span>Add New Product</span>
                        </button>
                    </div>
                </div>

                {loading && !isModalOpen ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Product</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Pricing</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Bundles</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-navy uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {currentProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(product.featureImageUrl)}
                                                        alt={product.title}
                                                        className="max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-navy text-[15px] line-clamp-1">{product.title}</p>
                                                    <div className="flex items-center space-x-2 mt-0.5">
                                                        <span className="flex h-1.5 w-1.5 rounded-none bg-green-500"></span>
                                                        <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-none">
                                                {(typeof product.category === 'object' && product.category !== null) ? product.category.name : product.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-accent-red">${product.discountedPrice}</span>
                                                <span className="text-[11px] text-navy/30 line-through font-bold">${product.originalPrice}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-navy">{product.offers?.length || 0} Bundles</span>
                                                <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest italic">{product.numberOfReviews} Reviews</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-3 bg-gray-50 hover:bg-navy hover:text-white rounded-none text-navy transition-all border border-gray-100"
                                                    title="Edit Product"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-3 bg-red-50 hover:bg-accent-red hover:text-white text-accent-red transition-all border border-red-100 rounded-none"
                                                    title="Delete Product"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && !loading && (
                            <div className="px-8 py-20 text-center">
                                <p className="text-navy/30 font-black uppercase tracking-[0.2em] text-sm">No products found in inventory</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)} of {products.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Prev
                                    </button>
                                    <span className="px-4 py-2 bg-navy text-white font-bold text-[10px] uppercase tracking-widest">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-white border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[999] bg-navy/20 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col scale-in-center animate-in duration-300">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-navy tracking-tight">
                                        {editingProduct ? "Edit Product" : "Create New Product"}
                                    </h3>
                                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mt-1">Fill in the details below</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-navy/5 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-8 space-y-10">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-10">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Product Title</label>
                                            <input
                                                type="text" required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                                placeholder="e.g. Nerve Freedom Pro"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Ribbon / Badge (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.ribbon}
                                                onChange={(e) => setFormData({ ...formData, ribbon: e.target.value })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                                placeholder="e.g. #1 Best Seller"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Category</label>
                                            <select
                                                value={formData.categoryId || ""}
                                                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all appearance-none"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                                {categories.length === 0 && <option value="">No Categories Found</option>}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Global Base Price ($)</label>
                                            <input
                                                type="number" step="0.01" required
                                                value={isNaN(formData.originalPrice) ? '' : formData.originalPrice}
                                                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Global Sale Price ($)</label>
                                            <input
                                                type="number" step="0.01" required
                                                value={isNaN(formData.discountedPrice) ? '' : formData.discountedPrice}
                                                onChange={(e) => setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Star Rating (0.5 increments)</label>
                                            <input
                                                type="number" step="0.5" min="0.5" max="5.0" required
                                                value={isNaN(formData.starRating) ? '' : formData.starRating}
                                                onChange={(e) => setFormData({ ...formData, starRating: parseFloat(e.target.value) || 5.0 })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Number of Reviews</label>
                                            <input
                                                type="number" required
                                                value={isNaN(formData.numberOfReviews) ? '' : formData.numberOfReviews}
                                                onChange={(e) => setFormData({ ...formData, numberOfReviews: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-4">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                                Buy Now Link (URL)
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.productLink}
                                                onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                                placeholder="https://yourcheckout.com/product-123"
                                            />
                                            <p className="text-[9px] text-navy/30 font-bold uppercase tracking-widest ml-1">This link opens when a customer clicks "Buy Now" on the product page</p>
                                        </div>
                                    </div>

                                    {/* ── Content Sections (Draggable) ── */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-3">
                                                    <span className="w-8 h-px bg-navy/10"></span>
                                                    Product Content
                                                </h4>
                                                <p className="text-[10px] font-bold text-navy/30 uppercase tracking-widest mt-1 ml-11">Fill in content below · Drag cards to reorder sections on the product page</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy/5 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40"><path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" /></svg>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-navy/40">Drag to Reorder</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {formData.sectionOrder.map((sectionKey, idx) => {
                                                const meta: any = {
                                                    description: { label: "Description", placeholder: "Enter product description (supports multiple lines)", fullWidth: true, emoji: "📝" },
                                                    highlights: { label: "Highlights", placeholder: "Enter highlights (one per line, e.g., 🧠 Supports healthy nerve function)", fullWidth: true, emoji: "✨" },
                                                    directions: { label: "Directions", placeholder: "Enter how to use the product", fullWidth: false, emoji: "📋" },
                                                    benefits: { label: "Benefits", placeholder: "Enter product benefits", fullWidth: false, emoji: "💪" },
                                                    guarantee: { label: "Guarantee", placeholder: "Enter money back guarantee text", fullWidth: false, emoji: "🛡️" },
                                                    shippingInfo: { label: "Shipping Info", placeholder: "Enter shipping information", fullWidth: false, emoji: "🚚" },
                                                };

                                                const section = meta[sectionKey];
                                                if (!section) return null;

                                                const insertIconShortcode = (code: string) => {
                                                    const el = document.getElementById(`textarea-${sectionKey}`) as HTMLTextAreaElement | null;
                                                    const currentVal = (formData as any)[sectionKey] || "";
                                                    if (!el) {
                                                        setFormData({ ...formData, [sectionKey]: currentVal + (currentVal.endsWith('\n') || currentVal === '' ? '' : '\n') + code + ' ' });
                                                        return;
                                                    }
                                                    const start = el.selectionStart;
                                                    const end = el.selectionEnd;
                                                    const before = currentVal.substring(0, start);
                                                    const selected = currentVal.substring(start, end);
                                                    const after = currentVal.substring(end);

                                                    let textToInsert = '';
                                                    if (selected) {
                                                        textToInsert = selected.split('\n').map((line: string) => `${code} ${line}`).join('\n');
                                                    } else {
                                                        const prefix = (before.endsWith('\n') || before === '' ? '' : '\n');
                                                        textToInsert = prefix + code + ' ';
                                                    }

                                                    setFormData({ ...formData, [sectionKey]: before + textToInsert + after });
                                                    setTimeout(() => {
                                                        el.focus();
                                                        el.setSelectionRange(start, start + textToInsert.length);
                                                    }, 0);
                                                };

                                                const insertTag = (prefix: string, suffix: string) => {
                                                    const el = document.getElementById(`textarea-${sectionKey}`) as HTMLTextAreaElement | null;
                                                    if (!el) return;
                                                    const currentVal = (formData as any)[sectionKey] || "";
                                                    const start = el.selectionStart;
                                                    const end = el.selectionEnd;
                                                    const before = currentVal.substring(0, start);
                                                    const selected = currentVal.substring(start, end);
                                                    const after = currentVal.substring(end);
                                                    setFormData({ ...formData, [sectionKey]: before + prefix + selected + suffix + after });
                                                    setTimeout(() => {
                                                        el.focus();
                                                        el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
                                                    }, 0);
                                                };

                                                return (
                                                    <div
                                                        key={sectionKey}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, sectionKey)}
                                                        className={`${section.fullWidth ? 'col-span-2' : 'col-span-2 md:col-span-1'
                                                            } space-y-3 p-5 bg-gray-50/80 border-2 border-dashed border-gray-200 hover:border-navy/20 hover:bg-white active:border-accent-red/30 active:bg-accent-red/5 transition-all rounded-3xl cursor-grab active:cursor-grabbing group/section relative`}
                                                    >
                                                        {/* Drag handle + label row */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {/* Priority badge */}
                                                                <span className="w-5 h-5 rounded-full bg-navy text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                                                                <span className="text-sm">{section.emoji}</span>
                                                                <label className="text-[10px] font-black text-navy uppercase tracking-widest cursor-grab">{section.label}</label>
                                                            </div>
                                                            {/* Drag grip icon */}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30 flex-shrink-0">
                                                                <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                                                                <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                                                            </svg>
                                                        </div>

                                                        {/* SVGs & Rich Text Toolbar */}
                                                        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-gray-200 pb-2 mb-1">
                                                            {/* Text Format */}
                                                            <button type="button" onClick={() => insertTag('<b>', '</b>')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 font-serif font-bold w-7" title="Bold">B</button>
                                                            <button type="button" onClick={() => insertTag('<i>', '</i>')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 font-serif italic w-7" title="Italic">I</button>
                                                            <button type="button" onClick={() => insertTag('<u>', '</u>')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 font-serif underline w-7 mr-2" title="Underline">U</button>

                                                            <span className="text-[9px] font-bold text-navy/40 uppercase tracking-widest ml-1 hidden sm:inline-block">Format icons:</span>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:check]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Checkmark">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:star]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Star">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:arrow]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Arrow">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:zap]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Lightning">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:bullet]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Bullet Circle">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="8" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:number]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors text-[10px] font-black tracking-tighter w-6 flex items-center justify-center" title="Numbering">
                                                                1.
                                                            </button>
                                                            {/* New Icons */}
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:heart]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Heart">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:shield]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Shield">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:leaf]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Leaf">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 14 6a7 7 0 0 1 7 7v7h-7a7 7 0 0 1-3.32-9.66L11 20z" /><path d="m2 22 5.5-5.5" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => insertIconShortcode('[icon:info]')} className="p-1.5 rounded bg-white border border-gray-200 text-navy hover:bg-navy/5 transition-colors" title="Info">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                            </button>

                                                            <div className="ml-auto min-w-[140px]">
                                                                <select
                                                                    onChange={(e) => {
                                                                        if (e.target.value) {
                                                                            const snippet = snippets.find(s => s.id === Number(e.target.value));
                                                                            if (snippet) insertTag(snippet.content, "");
                                                                            e.target.value = "";
                                                                        }
                                                                    }}
                                                                    className="w-full bg-white border border-gray-200 rounded p-1.5 text-[10px] font-bold text-navy focus:ring-2 focus:ring-accent-red transition-all appearance-none outline-none pr-6 cursor-pointer"
                                                                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="%23001F3F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                                                >
                                                                    <option value="">+ Insert Snippet</option>
                                                                    {snippets.map(s => (
                                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <textarea
                                                            id={`textarea-${sectionKey}`}
                                                            value={(formData as any)[sectionKey] || ""}
                                                            onChange={(e) => setFormData({ ...formData, [sectionKey]: e.target.value })}
                                                            rows={sectionKey === 'description' || sectionKey === 'highlights' ? 10 : 6}
                                                            className="w-full bg-white border-0 rounded-2xl p-5 text-base font-medium focus:ring-2 focus:ring-navy/20 transition-all shadow-sm resize-y leading-[1.7]"
                                                            placeholder={section.placeholder}
                                                            onDragStart={(e) => e.stopPropagation()}
                                                            draggable={false}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Media */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                            <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                            Media & Assets
                                        </h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Main Hero Image (Feature)</label>
                                                <div className="relative group cursor-pointer h-40">
                                                    <input
                                                        type="file" accept="image/*"
                                                        onChange={(e) => setFeatureImage(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                                    />
                                                    <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center transition-all group-hover:bg-gray-100 group-hover:border-navy/20 relative overflow-hidden">
                                                        {(featureImage || (editingProduct && editingProduct.featureImageUrl)) ? (
                                                            <img
                                                                src={featureImage ? URL.createObjectURL(featureImage) : getImageUrl(editingProduct!.featureImageUrl)}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                                                                alt=""
                                                            />
                                                        ) : null}
                                                        <div className="relative z-1 flex flex-col items-center p-6">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20 mb-3"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest text-center">{featureImage ? featureImage.name : "Click to Upload / Change"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Gallery Images (Multiple)</label>

                                                {(existingGalleryImages.length > 0 || galleryImages.length > 0) && (
                                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                                        {existingGalleryImages.map((img, idx) => (
                                                            <div key={`ext-${idx}`} className="relative bg-gray-100 rounded-2xl aspect-square group/img">
                                                                <img src={getImageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                                                <button type="button" onClick={() => handleRemoveExistingImage('gallery', img)} className="absolute top-2 right-2 bg-accent-red text-white rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {galleryImages.map((file, idx) => (
                                                            <div key={`new-${idx}`} className="relative bg-gray-100 rounded-2xl aspect-square group/img">
                                                                <img src={URL.createObjectURL(file)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                                                <button type="button" onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-accent-red text-white rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="relative group cursor-pointer h-24">
                                                    <input
                                                        type="file" multiple accept="image/*"
                                                        onChange={handleGalleryChange}
                                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                                    />
                                                    <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center transition-all group-hover:bg-gray-100 group-hover:border-navy/20">
                                                        <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest text-center">Click to Append More Files</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-2">
                                            <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">From the Manufacturer / Promotional Graphic Images (Multiple)</label>

                                            {(existingPromotionalImages.length > 0 || promotionalImages.length > 0) && (
                                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                                                    {existingPromotionalImages.map((img, idx) => (
                                                        <div key={`ext-pro-${idx}`} className="relative bg-gray-100 rounded-2xl aspect-square group/img">
                                                            <img src={getImageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                                            <button type="button" onClick={() => handleRemoveExistingImage('promotional', img)} className="absolute top-2 right-2 bg-accent-red text-white rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {promotionalImages.map((file, idx) => (
                                                        <div key={`new-pro-${idx}`} className="relative bg-gray-100 rounded-2xl aspect-square group/img">
                                                            <img src={URL.createObjectURL(file)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                                            <button type="button" onClick={() => setPromotionalImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-accent-red text-white rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="relative group cursor-pointer h-24 w-full">
                                                <input
                                                    type="file" multiple accept="image/*"
                                                    onChange={handlePromotionalChange}
                                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full"
                                                />
                                                <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center transition-all group-hover:bg-gray-100 group-hover:border-navy/20">
                                                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest text-center">Click to Append Promotional Graphics</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bundles/Offers */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                                <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                                Bundles & Offers
                                            </h4>
                                            <button
                                                type="button" onClick={handleAddOffer}
                                                className="text-[10px] font-black text-accent-red uppercase tracking-widest flex items-center space-x-2 hover:underline"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                <span>Add Bundle</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.offers.map((offer, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-3xl p-6 relative border border-gray-100 group/offer">
                                                    <button
                                                        type="button" onClick={() => handleRemoveOffer(idx)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-accent-red shadow-lg hover:bg-accent-red hover:text-white transition-all opacity-0 group-hover/offer:opacity-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>

                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="col-span-2 space-y-2">
                                                            <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Offer Label</label>
                                                            <input
                                                                type="text" required
                                                                value={offer.label}
                                                                onChange={(e) => handleOfferChange(idx, "label", e.target.value)}
                                                                className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                                placeholder="Buy 3 Get 2 Free"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Qty</label>
                                                            <input
                                                                type="number" required
                                                                value={isNaN(offer.quantity) ? '' : offer.quantity}
                                                                onChange={(e) => handleOfferChange(idx, "quantity", parseInt(e.target.value) || 0)}
                                                                className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Original Price ($)</label>
                                                            <input
                                                                type="number" step="0.01"
                                                                value={isNaN(offer.originalPrice) ? '' : offer.originalPrice}
                                                                onChange={(e) => handleOfferChange(idx, "originalPrice", parseFloat(e.target.value) || 0)}
                                                                className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                                placeholder="59.95"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Sale Price ($)</label>
                                                            <input
                                                                type="number" step="0.01" required
                                                                value={isNaN(offer.discountedPrice) ? '' : offer.discountedPrice}
                                                                onChange={(e) => handleOfferChange(idx, "discountedPrice", parseFloat(e.target.value) || 0)}
                                                                className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-accent-red"
                                                                placeholder="24.95"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-5 grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Bundle Image</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="file" accept="image/*"
                                                                        onChange={(e) => handleOfferImageChange(idx, e.target.files?.[0]!)}
                                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                    />
                                                                    <div className="w-full bg-white rounded-xl p-3 text-[10px] font-bold text-navy/40 border-0 flex items-center justify-between">
                                                                        <span className="truncate max-w-[150px]">{offerImages[idx] ? offerImages[idx].name : (offer.featureImageUrl ? "✓ Image Uploaded" : "Upload Bundle Image")}</span>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {offer.originalPrice > 0 && offer.discountedPrice > 0 && (
                                                                <div className="flex items-end pb-0.5">
                                                                    <div className="w-full bg-green-50 rounded-xl p-3 border border-green-100">
                                                                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Customer Saves</p>
                                                                        <p className="text-sm font-black text-green-700">${(offer.originalPrice - offer.discountedPrice).toFixed(2)} USD</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </form>

                                {editingProduct && (
                                    <div className="pt-10 border-t border-gray-100 mt-10">
                                        <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-3 mb-8">
                                            <span className="w-8 h-px bg-navy/10"></span>
                                            Customer Reviews ({editingProduct.reviews?.length || 0})
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {editingProduct.reviews?.map((review) => (
                                                <div key={review.id} className="bg-gray-50 rounded-3xl p-5 flex items-center justify-between group border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        {review.imageUrl ? (
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                                                                <img src={getImageUrl(review.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center font-black text-navy text-sm flex-shrink-0">
                                                                {review.reviewerName.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-[13px] font-black text-navy uppercase">{review.reviewerName}</div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= review.starRating ? "#3D5BC9" : "none"} stroke={s <= review.starRating ? "none" : "#3D5BC920"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-3 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-all border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100"
                                                        title="Delete Review"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-navy rounded-[32px] p-8 text-white shadow-2xl shadow-navy/20 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Add Manual Review</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Reviewer Name</label>
                                                        <input
                                                            type="text" placeholder="e.g. John Doe"
                                                            value={reviewForm.reviewerName}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                                                            className="w-full bg-white/10 border-0 rounded-2xl p-4 text-sm font-bold placeholder:text-white/20 focus:ring-2 focus:ring-accent-red transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Star Rating (0.5 increments)</label>
                                                        <input
                                                            type="number" step="0.5" min="0.5" max="5.0"
                                                            value={reviewForm.starRating}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, starRating: parseFloat(e.target.value) || 5.0 })}
                                                            className="w-full bg-white/10 border-0 rounded-2xl p-4 text-sm font-bold placeholder:text-white/20 focus:ring-2 focus:ring-accent-red transition-all"
                                                        />
                                                    </div>
                                                    <div className="col-span-full space-y-3">
                                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Review Content</label>
                                                        <textarea
                                                            placeholder="What did the customer say?"
                                                            value={reviewForm.reviewText}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                                            className="w-full bg-white/10 border-0 rounded-2xl p-5 text-sm font-bold placeholder:text-white/20 focus:ring-2 focus:ring-accent-red transition-all h-32"
                                                        />
                                                    </div>
                                                    <div className="col-span-full space-y-3">
                                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Review Photo (Optional)</label>
                                                        <input
                                                            type="file" accept="image/*"
                                                            onChange={(e) => setReviewForm({ ...reviewForm, image: e.target.files?.[0] || null })}
                                                            className="w-full bg-white/10 border-0 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white file:text-navy hover:file:bg-accent-red hover:file:text-white file:transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddReview}
                                                    className="w-full bg-accent-red text-white text-[11px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-white hover:text-navy transition-all shadow-xl shadow-accent-red/20"
                                                >
                                                    Post Manual Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-white hover:bg-navy/5 text-navy font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="productForm" type="submit"
                                    disabled={loading}
                                    className="px-10 py-4 bg-navy hover:bg-accent-red text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-navy/20 flex items-center space-x-3"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

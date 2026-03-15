"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getTokenFromCookie, isAdminFromCookie, clearAuthCookies } from "../../utils/auth";
import { apiHost } from "../../utils/apiHost";

interface Product {
    id: number;
    title: string;
}

interface Review {
    id: number;
    reviewerName: string;
    reviewText: string;
    starRating: number;
    imageUrl?: string;
    createdAt?: string;
    productId?: number;
    productTitle?: string;
}

const ITEMS_PER_PAGE = 15;

export default function ReviewsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        productId: "" as string | number,
        reviewerName: "",
        reviewText: "",
        starRating: 5.0,
        image: null as File | null
    });

    const openAddModal = () => {
        setEditingReview(null);
        setFormData({ productId: "", reviewerName: "", reviewText: "", starRating: 5.0, image: null });
        setIsModalOpen(true);
    };

    const openEditModal = (review: Review) => {
        setEditingReview(review);
        setFormData({
            productId: review.productId ?? "",
            reviewerName: review.reviewerName,
            reviewText: review.reviewText,
            starRating: review.starRating,
            image: null
        });
        setIsModalOpen(true);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = getTokenFromCookie();

            // Fetch products for dropdown and fallback aggregation
            const prodRes = await fetch(`${apiHost}/api/products`);
            let productList: Product[] = [];
            if (prodRes.ok) {
                productList = await prodRes.json();
                setProducts(productList);
            }

            // Try to fetch all reviews globally first
            try {
                const revRes = await fetch(`${apiHost}/api/admin/reviews`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (revRes.ok) {
                    const data = await revRes.json();
                    setReviews(data);
                    return;
                }
            } catch (e) {
                console.log("Global review fetch bypassed or failed");
            }

            // Fallback: Aggregate reviews from each product's details
            // This is used if the backend doesn't provide a global /api/admin/reviews endpoint
            const aggregatedReviews: Review[] = [];

            // Fetch product details in parallel for efficiency
            const detailPromises = productList.map(p =>
                fetch(`${apiHost}/api/products/${p.id}`).then(res => res.ok ? res.json() : null)
            );

            const fullProducts = await Promise.all(detailPromises);

            fullProducts.forEach((fullProd, index) => {
                if (fullProd && fullProd.reviews) {
                    const prodReviews = fullProd.reviews.map((r: any) => ({
                        ...r,
                        productId: productList[index].id,
                        productTitle: productList[index].title
                    }));
                    aggregatedReviews.push(...prodReviews);
                }
            });

            setReviews(aggregatedReviews.sort((a, b) => (b.id || 0) - (a.id || 0)));

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Could not load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!getTokenFromCookie() || !isAdminFromCookie()) {
            router.push("/login");
            return;
        }
        fetchAllData();
    }, [router]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditing = !!editingReview;

        if (!isEditing && !formData.productId) {
            toast.error("Please select a product");
            return;
        }

        const loadingToast = toast.loading(isEditing ? "Updating review..." : "Adding review...");
        try {
            const token = getTokenFromCookie();
            const form = new FormData();
            form.append("reviewerName", formData.reviewerName);
            form.append("reviewText", formData.reviewText);
            form.append("starRating", formData.starRating.toString());
            if (formData.image) {
                form.append("image", formData.image);
            }

            const url = isEditing
                ? `${apiHost}/api/admin/products/reviews/${editingReview!.id}`
                : `${apiHost}/api/admin/products/${formData.productId}/reviews`;
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });

            if (response.ok) {
                toast.success(isEditing ? "Review updated!" : "Review added!", { id: loadingToast });
                setIsModalOpen(false);
                setEditingReview(null);
                setFormData({ productId: "", reviewerName: "", reviewText: "", starRating: 5.0, image: null });
                fetchAllData();
            } else {
                toast.error(isEditing ? "Failed to update review" : "Failed to add review", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Error saving review", { id: loadingToast });
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
                fetchAllData();
            } else {
                toast.error("Failed to delete review", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Error deleting review", { id: loadingToast });
        }
    };

    const getImageUrl = (url?: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
    };

    const handleLogout = () => {
        clearAuthCookies();
        router.push("/login");
    };

    return (
        <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-navy text-white flex flex-col p-6 space-y-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent-red p-2 rounded-lg shadow-lg shadow-accent-red/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Admin</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Products</span>
                    </Link>
                    <Link href="/dashboard/blogs" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Blogs</span>
                    </Link>
                    <Link href="/dashboard/reviews" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
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

                <button onClick={handleLogout} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all">
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-navy tracking-tight uppercase">Review Vault</h2>
                        <p className="text-navy/40 text-sm font-bold uppercase tracking-widest mt-1">Manage customer social proof</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-accent-red hover:bg-navy text-white px-8 py-4.5 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-accent-red/20 flex items-center space-x-3 h-full border-2 border-transparent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        <span>Add New Review</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
                    </div>
                ) : (() => {
                    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
                    const paged = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                    return (
                        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Rating</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Review</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-navy uppercase tracking-[0.2em]">Product</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-navy uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paged.map((review) => (
                                        <tr key={review.id} className="group hover:bg-gray-50/30 transition-colors">
                                            {/* Customer */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    {review.imageUrl ? (
                                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                                                            <img src={getImageUrl(review.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                                                            {review.reviewerName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-black text-navy text-[13px] truncate max-w-[120px] md:max-w-[200px]" title={review.reviewerName}>{review.reviewerName}</span>
                                                </div>
                                            </td>
                                            {/* Stars */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= review.starRating ? "#3D5BC9" : "none"} stroke="#3D5BC9" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                    ))}
                                                    <span className="ml-1.5 text-[10px] font-black text-navy/40">{review.starRating.toFixed(1)}</span>
                                                </div>
                                            </td>
                                            {/* Review text */}
                                            <td className="px-6 py-3 max-w-[200px] md:max-w-xs">
                                                <p className="text-navy/70 text-[13px] leading-snug line-clamp-2 break-words whitespace-pre-wrap">{review.reviewText}</p>
                                            </td>
                                            {/* Product */}
                                            <td className="px-6 py-3">
                                                <span className="px-2.5 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest inline-block max-w-[150px] md:max-w-[250px] truncate md:whitespace-normal">
                                                    {review.productTitle || "—"}
                                                </span>
                                            </td>
                                            {/* Edit + Delete */}
                                            <td className="px-6 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(review)}
                                                        className="p-2.5 bg-gray-50 hover:bg-navy hover:text-white text-navy transition-all border border-gray-100 opacity-0 group-hover:opacity-100"
                                                        title="Edit Review"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-2.5 bg-red-50 hover:bg-accent-red hover:text-white text-accent-red transition-all border border-red-100 opacity-0 group-hover:opacity-100"
                                                        title="Delete Review"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {reviews.length === 0 && (
                                <div className="px-8 py-20 text-center">
                                    <p className="text-navy/30 font-black uppercase tracking-[0.2em] text-sm">No reviews found</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, reviews.length)} of {reviews.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <span className="px-4 py-2 bg-navy text-white font-bold text-[10px] uppercase tracking-widest">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-white border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* Add / Edit Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy/20 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-navy text-white">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">
                                    {editingReview ? "Edit Review" : "Add Manual Review"}
                                </h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {editingReview ? `Editing review by ${editingReview.reviewerName}` : "Manual entry for social proof"}
                                </p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingReview(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product select — only shown when adding */}
                                {!editingReview ? (
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Select Product</label>
                                        <select
                                            required
                                            value={formData.productId}
                                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-accent-red appearance-none"
                                        >
                                            <option value="">Choose a product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Product</label>
                                        <div className="w-full bg-gray-50 rounded-2xl p-5 text-sm font-bold text-navy/50">
                                            {editingReview.productTitle || "—"}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Customer Name</label>
                                    <input
                                        type="text" required
                                        value={formData.reviewerName}
                                        onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-accent-red"
                                        placeholder="e.g. Sarah Jenkins"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Star Rating (0.5–5)</label>
                                    <input
                                        type="number" step="0.5" min="0.5" max="5" required
                                        value={formData.starRating}
                                        onChange={(e) => setFormData({ ...formData, starRating: parseFloat(e.target.value) || 5 })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-accent-red"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">
                                        Customer Photo {editingReview ? "(Upload to replace)" : "(Optional)"}
                                    </label>
                                    <input
                                        type="file" accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-navy file:text-white hover:file:bg-accent-red transition-all"
                                    />
                                    {editingReview?.imageUrl && !formData.image && (
                                        <div className="flex items-center gap-3 mt-2">
                                            <img src={getImageUrl(editingReview.imageUrl)} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                            <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Current photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Review Content</label>
                                <textarea
                                    required
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-accent-red h-32"
                                    placeholder="What did the customer say about the product?"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingReview(null); }}
                                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-navy font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-navy hover:bg-accent-red text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-navy/20"
                                >
                                    {editingReview ? "Save Changes" : "Post Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

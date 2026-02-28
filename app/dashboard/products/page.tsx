"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    numberOfReviews: number;
    starRating: number;
    originalPrice: number;
    discountedPrice: number;
    category: string;
    productLink: string;
    featureImageUrl: string;
    galleryImageUrls: string[];
    offers: Offer[];
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        numberOfReviews: 0,
        starRating: 5.0,
        originalPrice: 0,
        discountedPrice: 0,
        category: "Supplements",
        productLink: "",
        offers: [] as Offer[]
    });

    const [featureImage, setFeatureImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [offerImages, setOfferImages] = useState<Record<number, File>>({});

    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem("ecom_token");
            const role = localStorage.getItem("ecom_role")?.trim().toUpperCase();
            const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";

            if (!token || !isAdmin) {
                console.warn("[Products] Access Denied. Token exists:", !!token, "| Role found:", role);
                router.push("/login");
                return false;
            }
            return true;
        };

        if (checkAccess()) {
            fetchProducts();
        }
    }, [router]);

    const getImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${apiHost}/api/images/${url}`;
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

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const token = localStorage.getItem("ecom_token");
            const response = await fetch(`${apiHost}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error("Error deleting product:", error);
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
            setGalleryImages(Array.from(e.target.files));
        }
    };

    const handleOfferImageChange = (index: number, file: File) => {
        setOfferImages({ ...offerImages, [index]: file });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("ecom_token");
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
            } else {
                const error = await response.json();
                alert(error.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            numberOfReviews: 0,
            starRating: 5.0,
            originalPrice: 0,
            discountedPrice: 0,
            category: "Supplements",
            productLink: "",
            offers: []
        });
        setFeatureImage(null);
        setGalleryImages([]);
        setOfferImages({});
        setEditingProduct(null);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            numberOfReviews: product.numberOfReviews,
            starRating: product.starRating,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            category: product.category,
            productLink: product.productLink,
            offers: product.offers
        });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar (Simplified for now) */}
            <div className="w-64 bg-navy text-white flex flex-col p-6 space-y-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent-red p-2 rounded-lg shadow-lg shadow-accent-red/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Admin</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                        <span className="text-sm font-bold opacity-60">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/products" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Products</span>
                    </Link>
                </nav>

                <button onClick={() => {
                    localStorage.clear();
                    document.cookie = "ecom_token=; path=/; max-age=0";
                    document.cookie = "ecom_role=; path=/; max-age=0";
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
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-accent-red hover:bg-navy text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-accent-red/20 flex items-center space-x-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        <span>Add New Product</span>
                    </button>
                </div>

                {loading && !isModalOpen ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
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
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(product.featureImageUrl)}
                                                        alt={product.title}
                                                        className="max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-navy text-[15px] line-clamp-1">{product.title}</p>
                                                    <div className="flex items-center space-x-2 mt-0.5">
                                                        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                        <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-accent-red">${product.discountedPrice}</span>
                                                <span className="text-[11px] text-navy/30 line-through font-bold">${product.originalPrice}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-navy">{product.offers?.length || 0} Bundles</span>
                                                <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest italic">{product.numberOfReviews} Reviews</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-3 bg-gray-50 hover:bg-navy hover:text-white rounded-xl text-navy transition-all border border-gray-100"
                                                    title="Edit Product"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-3 bg-red-50 hover:bg-accent-red hover:text-white text-accent-red transition-all border border-red-100"
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
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
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
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                            placeholder="e.g. Nerve Freedom Pro"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all appearance-none"
                                        >
                                            <option>Supplements</option>
                                            <option>Injectables</option>
                                            <option>Wellness</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Global Base Price ($)</label>
                                        <input
                                            type="number" step="0.01" required
                                            value={isNaN(formData.originalPrice) ? '' : formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Global Sale Price ($)</label>
                                        <input
                                            type="number" step="0.01" required
                                            value={isNaN(formData.discountedPrice) ? '' : formData.discountedPrice}
                                            onChange={(e) => setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Star Rating (0.5 increments)</label>
                                        <input
                                            type="number" step="0.5" min="0.5" max="5.0" required
                                            value={isNaN(formData.starRating) ? '' : formData.starRating}
                                            onChange={(e) => setFormData({ ...formData, starRating: parseFloat(e.target.value) || 5.0 })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Number of Reviews</label>
                                        <input
                                            type="number" required
                                            value={isNaN(formData.numberOfReviews) ? '' : formData.numberOfReviews}
                                            onChange={(e) => setFormData({ ...formData, numberOfReviews: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent-red transition-all"
                                        />
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
                                            <div className="relative group cursor-pointer">
                                                <input
                                                    type="file" multiple accept="image/*"
                                                    onChange={handleGalleryChange}
                                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                                />
                                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center transition-all group-hover:bg-gray-100 group-hover:border-navy/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20 mb-3"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                                                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">{galleryImages.length > 0 ? `${galleryImages.length} images selected` : "Drop Multiple Files"}</p>
                                                </div>
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

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Offer Label</label>
                                                        <input
                                                            type="text" required
                                                            value={offer.label}
                                                            onChange={(e) => handleOfferChange(idx, "label", e.target.value)}
                                                            className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                            placeholder="Buy 3 Get 2"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Quantity</label>
                                                        <input
                                                            type="number" required
                                                            value={isNaN(offer.quantity) ? '' : offer.quantity}
                                                            onChange={(e) => handleOfferChange(idx, "quantity", parseInt(e.target.value) || 0)}
                                                            className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Price ($)</label>
                                                        <input
                                                            type="number" step="0.01" required
                                                            value={isNaN(offer.discountedPrice) ? '' : offer.discountedPrice}
                                                            onChange={(e) => handleOfferChange(idx, "discountedPrice", parseFloat(e.target.value) || 0)}
                                                            className="w-full bg-white rounded-xl p-3 text-xs font-bold border-0 focus:ring-1 focus:ring-navy"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest ml-1">Bundle Image</label>
                                                        <div className="relative">
                                                            <input
                                                                type="file" accept="image/*"
                                                                onChange={(e) => handleOfferImageChange(idx, e.target.files?.[0]!)}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                            <div className="w-full bg-white rounded-xl p-3 text-[10px] font-bold text-navy/40 border-0 flex items-center justify-between">
                                                                <span className="truncate max-w-[100px]">{offerImages[idx] ? offerImages[idx].name : (offer.featureImageUrl ? "Uploaded" : "Upload File")}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
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
            )}
        </div>
    );
}

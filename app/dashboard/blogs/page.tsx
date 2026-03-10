"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';
import { getTokenFromCookie, isAdminFromCookie, clearAuthCookies } from "../../utils/auth";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Blog {
    id: number;
    title: string;
    slug: string;
    intro: string;
    content: string;
    featureImageUrl: string;
    author: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    createdAt: string;
    updatedAt: string;
}

export default function BlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        intro: "",
        content: "",
        author: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: ""
    });

    const [featureImage, setFeatureImage] = useState<File | null>(null);
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    useEffect(() => {
        const checkAccess = () => {
            if (!getTokenFromCookie() || !isAdminFromCookie()) {
                router.push("/login");
                return false;
            }
            return true;
        };

        if (checkAccess()) {
            fetchBlogs();
        }
    }, [router]);

    const getImageUrl = (url: string) => {
        if (!url) return "";
        const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
        return full.replace(/([^:])\/\/+/g, '$1/');
    };

    const fetchBlogs = async () => {
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/blogs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        const loadingToast = toast.loading("Deleting blog...");
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/blogs/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setBlogs(blogs.filter(b => b.id !== id));
                toast.success("Blog deleted successfully", { id: loadingToast });
            } else {
                toast.error("Failed to delete blog", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Failed to delete blog", { id: loadingToast });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading(editingBlog ? "Updating blog..." : "Creating blog...");
        try {
            const token = getTokenFromCookie();
            const form = new FormData();

            form.append("data", JSON.stringify(formData));

            if (featureImage) {
                form.append("featureImage", featureImage);
            }

            const url = editingBlog
                ? `${apiHost}/api/admin/blogs/${editingBlog.id}`
                : `${apiHost}/api/admin/blogs`;

            const method = editingBlog ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchBlogs();
                resetForm();
                toast.success(editingBlog ? "Blog updated successfully" : "Blog created successfully", { id: loadingToast });
            } else {
                const errorText = await response.text();
                toast.error(errorText || "Something went wrong", { id: loadingToast });
            }
        } catch (error) {
            console.error("Error saving blog:", error);
            toast.error("Error saving blog", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            intro: "",
            content: "",
            author: "",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: ""
        });
        setFeatureImage(null);
        setEditingBlog(null);
    };

    const openEditModal = (blog: Blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            intro: blog.intro || "",
            content: blog.content,
            author: blog.author,
            metaTitle: blog.metaTitle || "",
            metaDescription: blog.metaDescription || "",
            metaKeywords: blog.metaKeywords || ""
        });
        setFeatureImage(null);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
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
                    <Link href="/dashboard/blogs" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Blogs</span>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Click Tracking</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
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
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-end bg-white p-8 border border-gray-100 shadow-sm rounded-none">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Blog Management</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-navy/40">Manage your SEO friendly articles</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="bg-accent-red hover:bg-navy text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-navy/20 transition-all flex items-center gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add New Blog
                        </button>
                    </div>

                    {/* Blog List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-navy/40">Image</th>
                                            <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-navy/40">Title & Author</th>
                                            <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-navy/40">Created At</th>
                                            <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-navy/40 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {blogs.map((blog) => (
                                            <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-5 py-3">
                                                    <div className="w-12 h-12 rounded-none bg-navy/5 flex items-center justify-center text-navy font-black text-[10px] group-hover:bg-accent-red group-hover:text-white transition-all overflow-hidden relative">
                                                        {blog.featureImageUrl ? (
                                                            <img src={getImageUrl(blog.featureImageUrl)} alt={blog.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            "IMG"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-bold text-sm text-navy">{blog.title}</div>
                                                    <div className="text-[10px] text-navy/40 uppercase tracking-widest font-black mt-1">By {blog.author}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black tracking-widest rounded-none">
                                                        {new Date(blog.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditModal(blog)} className="p-3 bg-gray-50 hover:bg-navy hover:text-white rounded-none font-black text-[10px] uppercase tracking-widest transition-all">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(blog.id)} className="p-3 bg-red-50 hover:bg-accent-red hover:text-white text-accent-red transition-all border border-red-100 rounded-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {blogs.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-sm font-bold text-navy/40 uppercase tracking-widest">
                                                    No blogs found. Add your first post!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
                    <div className="bg-white rounded-none shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200 hide-scrollbar">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">{editingBlog ? "Edit Blog Post" : "Create New Blog"}</h3>
                                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest mt-1">Fill in the details below</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-10">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                    <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                    Blog Information
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Blog Title</label>
                                        <input
                                            type="text" required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20"
                                            placeholder="5 Natural Ways to Improve Circulation"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Author</label>
                                        <input
                                            type="text" required
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20"
                                            placeholder="Dr. Sarah Mitchell"
                                        />
                                    </div>
                                </div>

                                {/* Intro / Tagline */}
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Intro / Tagline</label>
                                    <textarea
                                        rows={3}
                                        value={formData.intro}
                                        onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20 min-h-[80px] resize-none"
                                        placeholder="Discover how this supplement supports cardiovascular health and boosts energy levels naturally."
                                    />
                                    <p className="text-[9px] text-navy/30 font-bold uppercase tracking-widest pl-1">Shown as the highlighted quote block below the feature image</p>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                    <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                    Rich Text Content
                                </h4>
                                <div className="space-y-2">
                                    <div className="border border-gray-200">
                                        <ReactQuill theme="snow" value={formData.content} onChange={(value) => setFormData({ ...formData, content: value })} className="h-64 mb-12" />
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                    <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                    Media
                                </h4>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-widest ml-1">Hero Feature Image</label>
                                    <div className="relative group cursor-pointer h-40">
                                        <input
                                            type="file" accept="image/*"
                                            onChange={(e) => setFeatureImage(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                        />
                                        <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center transition-all group-hover:bg-gray-100 group-hover:border-navy/20 relative overflow-hidden">
                                            {(featureImage || (editingBlog && editingBlog.featureImageUrl)) ? (
                                                <img
                                                    src={featureImage ? URL.createObjectURL(featureImage) : getImageUrl(editingBlog!.featureImageUrl)}
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
                            </div>

                            {/* SEO Meta */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center">
                                    <span className="w-8 h-px bg-navy/10 mr-4"></span>
                                    SEO Attributes (Optional)
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Meta Title</label>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono placeholder:text-navy/20"
                                            placeholder="Top 5 Herbal Ways to Boost Circulation"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Meta Description</label>
                                        <textarea
                                            rows={2}
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono placeholder:text-navy/20 min-h-[80px]"
                                            placeholder="Learn how natural herbal extracts can enhance your cardiovascular system efficiently."
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Meta Keywords</label>
                                        <input
                                            type="text"
                                            value={formData.metaKeywords}
                                            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono placeholder:text-navy/20"
                                            placeholder="health, circulation, herbs, cardiovascular"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6 border-t border-gray-50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 bg-navy hover:bg-black text-white px-8 py-5 rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-navy/20 transition-all ${loading ? "opacity-50" : ""}`}
                                >
                                    {loading ? "Processing..." : editingBlog ? "Update Blog Post" : "Publish Blog Post"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-5 bg-gray-50 hover:bg-gray-100 text-navy font-black text-xs uppercase tracking-[0.2em] rounded-none transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

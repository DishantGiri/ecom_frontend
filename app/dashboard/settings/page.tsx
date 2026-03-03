"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState("");

    // Admin Account States
    const [emailData, setEmailData] = useState({ newEmail: "", password: "" });
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);

    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

    // Load initial categories
    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem("ecom_token");
            const role = localStorage.getItem("ecom_role")?.trim().toUpperCase();
            const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";

            if (!token || !isAdmin) {
                router.push("/login");
                return false;
            }
            return true;
        };

        if (checkAccess()) {
            const stored = localStorage.getItem("ecom_categories");
            if (stored) {
                setCategories(JSON.parse(stored));
            } else {
                // Defaults
                const defaults = ["Supplements", "Injectables", "Wellness", "Accessories"];
                setCategories(defaults);
                localStorage.setItem("ecom_categories", JSON.stringify(defaults));
            }
        }
    }, [router]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategory.trim();
        if (!trimmed) {
            toast.error("Category name cannot be empty");
            return;
        }

        // Case-insensitive check for duplicates
        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Category already exists");
            return;
        }

        const updated = [...categories, trimmed];
        setCategories(updated);
        localStorage.setItem("ecom_categories", JSON.stringify(updated));
        setNewCategory("");
        toast.success(`Category "${trimmed}" added!`);
    };

    const handleRemoveCategory = (catToRemove: string) => {
        if (!confirm("Remove this category? Existing products with this category will remain unaffected.")) return;

        const updated = categories.filter(c => c !== catToRemove);
        setCategories(updated);
        localStorage.setItem("ecom_categories", JSON.stringify(updated));
        toast.success("Category removed from dropdown list.");
    };

    const handleLogout = () => {
        localStorage.clear();
        document.cookie = "ecom_token=; path=/; max-age=0";
        document.cookie = "ecom_role=; path=/; max-age=0";
        router.push("/login");
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("ecom_token");

        try {
            const response = await fetch(`${apiHost}/api/admin/change-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                toast.success("Email changed successfully! Please login with your new email.");
                setTimeout(handleLogout, 2000);
            } else {
                const err = await response.text();
                toast.error(err || "Failed to change email. Is your password correct?");
            }
        } catch (error) {
            toast.error("Connection error while changing email.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("ecom_token");

        try {
            const response = await fetch(`${apiHost}/api/admin/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            if (response.ok) {
                toast.success("Password updated successfully!");
                setPasswordData({ currentPassword: "", newPassword: "" });
            } else {
                const err = await response.text();
                toast.error(err || "Failed to change password. Ensure current password is correct.");
            }
        } catch (error) {
            toast.error("Connection error while changing password.");
        } finally {
            setLoading(false);
        }
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
                    <Link href="/dashboard/blogs" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Blogs</span>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Click Tracking</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Settings</span>
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
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-end bg-white p-8 border border-gray-100 shadow-sm rounded-none">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">System Settings</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-navy/40">Manage global app configurations</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-none">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-navy uppercase tracking-tighter flex items-center border-b border-gray-100 pb-4">
                                <span className="w-6 h-px bg-accent-red mr-4"></span>
                                Product Categories
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">
                                Categories act as tags for your products. Define new categories here, and they will immediately appear in the Product Creation dropdown.
                            </p>

                            <form onSubmit={handleAddCategory} className="flex gap-4 items-end mt-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">New Category Name</label>
                                    <input
                                        type="text" required
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="e.g. Skin Care"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red cursor-text"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-navy hover:bg-black text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-md flex-shrink-0"
                                >
                                    Add Category
                                </button>
                            </form>

                            <div className="mt-8">
                                <h4 className="text-[10px] font-black text-navy uppercase tracking-widest mb-4">Current Categories</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {categories.map((cat, idx) => (
                                        <div key={idx} className="bg-gray-50 border border-gray-100 p-4 flex items-center justify-between group rounded-none">
                                            <span className="font-bold text-sm text-navy">{cat}</span>
                                            <button
                                                onClick={() => handleRemoveCategory(cat)}
                                                className="text-navy/20 hover:text-accent-red transition-colors"
                                                title="Remove Category"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <div className="col-span-full text-center p-8 bg-gray-50/50">
                                            <span className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">No categories defined</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Account Security Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                        {/* Change Email */}
                        <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-none space-y-6">
                            <h3 className="text-lg font-black text-navy uppercase tracking-tighter flex items-center border-b border-gray-100 pb-4">
                                <span className="w-6 h-px bg-accent-red mr-4"></span>
                                Change Admin Email
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                                This will change your primary login email. You will be logged out upon success.
                            </p>
                            <form onSubmit={handleChangeEmail} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">New Email</label>
                                    <input
                                        type="email" required
                                        value={emailData.newEmail}
                                        onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red cursor-text"
                                        placeholder="admin@newdomain.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Confirm Identity (Password)</label>
                                    <input
                                        type="password" required
                                        value={emailData.password}
                                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red cursor-text"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-navy hover:bg-black text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    {loading ? "Updating..." : "Update Email"}
                                </button>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-none space-y-6">
                            <h3 className="text-lg font-black text-navy uppercase tracking-tighter flex items-center border-b border-gray-100 pb-4">
                                <span className="w-6 h-px bg-accent-red mr-4"></span>
                                Security & Password
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                                Update your administrative password. We recommend periodic rotations.
                            </p>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Current Password</label>
                                    <input
                                        type="password" required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red cursor-text"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">New Secure Password</label>
                                    <input
                                        type="password" required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold text-navy focus:outline-none focus:border-accent-red cursor-text"
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-accent-red hover:bg-navy text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-md"
                                >
                                    {loading ? "Updating..." : "Change Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

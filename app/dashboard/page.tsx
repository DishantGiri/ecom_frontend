"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem("ecom_token");
            const role = localStorage.getItem("ecom_role")?.trim().toUpperCase();
            const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";

            if (!token || !isAdmin) {
                console.warn("[Dashboard] Access Denied. Token exists:", !!token, "| Role found:", role);
                router.push("/login");
                return false;
            }
            return true;
        };

        const fetchStats = async () => {
            if (!checkAccess()) return;

            try {
                const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
                const token = localStorage.getItem("ecom_token");

                const response = await fetch(`${apiHost}/api/dashboard-stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else if (response.status === 401) {
                    // Only log out on 401 (Unauthorized/Token Expired)
                    console.error("Session expired (401). Redirecting...");
                    localStorage.clear();
                    document.cookie = "ecom_token=; path=/; max-age=0";
                    document.cookie = "ecom_role=; path=/; max-age=0";
                    router.push("/login");
                } else if (response.status === 403) {
                    // Don't log out on 403 (Forbidden). Just show we can't see this data.
                    console.warn("Access to stats forbidden (403). Using fallback data.");
                    setStats({
                        totalOrders: 0,
                        totalRevenue: 0,
                        totalUsers: 0,
                        recentOrders: []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setStats({
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalUsers: 0,
                    recentOrders: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        document.cookie = "ecom_token=; path=/; max-age=0";
        document.cookie = "ecom_role=; path=/; max-age=0";
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-navy text-white flex flex-col p-6 space-y-8 sticky top-0 h-screen">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent-red p-2 rounded-lg shadow-lg shadow-accent-red/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Admin</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/products" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                        <span className="text-sm font-bold">Products</span>
                    </Link>
                </nav>

                <button onClick={handleLogout} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all">
                    Logout
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-10 overflow-auto">
                <div className="mb-10">
                    <h2 className="text-4xl font-black text-navy tracking-tight">Overview</h2>
                    <p className="text-navy/40 text-sm font-bold uppercase tracking-widest mt-1">Real-time performance metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Stat Card 1 */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                                Total Orders
                            </p>
                            <h2 className="text-4xl font-black text-navy mb-1 tracking-tighter">{stats?.totalOrders || "1,248"}</h2>
                        </div>
                        <div className="mt-4 flex items-center text-green-500 text-xs font-bold">
                            <span className="bg-green-50 px-2 py-0.5 rounded-lg mr-2">↑ 12%</span>
                            <span className="text-navy/20 font-medium">Since last week</span>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-accent-red mr-2"></span>
                                Active Users
                            </p>
                            <h2 className="text-4xl font-black text-navy mb-1 tracking-tighter">{stats?.activeUsers || "842"}</h2>
                        </div>
                        <div className="mt-4 flex items-center text-accent-red text-xs font-bold">
                            <span className="bg-red-50 px-2 py-0.5 rounded-lg mr-2">↑ 8.2%</span>
                            <span className="text-navy/20 font-medium">Daily conversions</span>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-navy mr-2"></span>
                                Total Revenue
                            </p>
                            <h2 className="text-4xl font-black text-navy mb-1 tracking-tighter">${stats?.revenue || "42.9K"}</h2>
                        </div>
                        <div className="mt-4 flex items-center text-navy/30 text-xs font-bold">
                            <span className="bg-gray-50 px-2 py-0.5 rounded-lg mr-2">→ 0%</span>
                            <span className="text-navy/20 font-medium">Stable projection</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-navy uppercase tracking-widest">Recent Activity</h3>
                            <p className="text-[10px] text-navy/40 font-bold uppercase mt-1">Last 24 hours</p>
                        </div>
                        <Link href="/dashboard" className="px-5 py-2 bg-gray-50 hover:bg-navy hover:text-white rounded-full text-[10px] font-black text-navy uppercase tracking-widest transition-all">View Analytics</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy font-black text-[10px] group-hover:bg-accent-red group-hover:text-white transition-all">
                                        #{i}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-navy">Medical Order Processed</p>
                                        <p className="text-[11px] text-navy/40 font-bold uppercase tracking-wide">ID: JK-00{i}982 • Processing status: Verified</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-navy">+$249.00</p>
                                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Paid Success</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

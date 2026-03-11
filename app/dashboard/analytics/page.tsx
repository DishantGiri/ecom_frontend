"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getTokenFromCookie, isAdminFromCookie, clearAuthCookies } from "../../utils/auth";
import { apiHost } from "../../utils/apiHost";

interface ClickStats {
    productTitle: string;
    totalClicks: number;
    clicksByCountry: Record<string, number>;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<ClickStats[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(stats.length / itemsPerPage);
    const currentStats = stats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const checkAccess = () => {
            if (!getTokenFromCookie() || !isAdminFromCookie()) {
                router.push("/login");
                return false;
            }
            return true;
        };

        if (checkAccess()) {
            fetchStats();
        }
    }, [router]);

    const fetchStats = async () => {
        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/analytics/clicks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                toast.error("Failed to fetch analytics data");
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Something went wrong while fetching analytics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-navy text-white flex flex-col p-6 space-y-8 flex-shrink-0">
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
                    <Link href="/dashboard/reviews" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M9 10h6" /><path d="M9 14h3" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Reviews</span>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center space-x-3 p-3 rounded-xl bg-accent-red text-white shadow-lg shadow-accent-red/20 transition-all">
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
                            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Click Tracking Analytics</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-navy/40">Monitor product engagement by region</p>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="bg-navy hover:bg-accent-red text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M16 8h5V3" /><path d="M8 16H3v5" /></svg>
                            Refresh Data
                        </button>
                    </div>

                    {/* Stats List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 border-4 border-navy border-t-accent-red rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {stats.length === 0 ? (
                                <div className="bg-white p-20 text-center border border-gray-100">
                                    <p className="text-navy/30 font-black uppercase tracking-[0.2em] text-sm">No click data available yet</p>
                                </div>
                            ) : (
                                currentStats.map((stat, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                        <div className="p-8 border-r border-gray-50 bg-gray-50/30 md:w-80 flex flex-col justify-center">
                                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Product Title</p>
                                            <h3 className="text-xl font-black text-navy leading-tight mb-4">{stat.productTitle}</h3>
                                            <div className="mt-auto">
                                                <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Total Clicks</p>
                                                <p className="text-4xl font-black text-accent-red tracking-tighter">{stat.totalClicks}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-8">
                                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-6">Regional Distribution</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Object.entries(stat.clicksByCountry).sort((a, b) => b[1] - a[1]).map(([country, clicks]) => (
                                                    <div key={country} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-none group hover:border-navy/20 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-none bg-accent-red group-hover:scale-150 transition-transform"></div>
                                                            <span className="text-sm font-bold text-navy truncate max-w-[120px]">{country}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-navy/40">{clicks}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Simple Visualization Bar */}
                                            <div className="mt-10 h-3 w-full bg-gray-100 flex overflow-hidden">
                                                {Object.entries(stat.clicksByCountry).sort((a, b) => b[1] - a[1]).map(([country, clicks], i) => {
                                                    const percentage = (clicks / stat.totalClicks) * 100;
                                                    const colors = ['#001F3F', '#D32F2F', '#3D5BC9', '#0ea5e9', '#8b5cf6', '#f43f5e'];
                                                    return (
                                                        <div
                                                            key={country}
                                                            title={`${country}: ${clicks} (${percentage.toFixed(1)}%)`}
                                                            style={{ width: `${percentage}%`, backgroundColor: colors[i % colors.length] }}
                                                            className="h-full border-r border-white/10 last:border-0"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-5 border border-gray-100 flex items-center justify-between bg-white mt-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, stats.length)} of {stats.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-gray-50 border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <span className="px-4 py-2 bg-navy text-white font-bold text-[10px] uppercase tracking-widest">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-gray-50 border border-gray-200 text-navy font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { setAuthCookies } from "../utils/auth";
import { apiHost } from "../utils/apiHost";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (searchParams.get('unauthorized') === '1') {
            toast.error("Access denied. Admin login required.");
            // Pre-select admin login mode since they were trying to reach /dashboard
            setIsAdmin(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        // If it's a regular user login, we might still want to simulate or use another endpoint
        // But the guide specifically mentions /api/login for Admin
        try {
            const response = await fetch(`${apiHost}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Store exclusively in cookies — readable by middleware server-side
                setAuthCookies(data.token, data.role, data.email);

                setStatus("success");
                toast.success("Login successful!");

                setTimeout(() => {
                    if (data.mustChangePassword) {
                        router.push('/change-password');
                    } else {
                        const isAdminRole = data.role === 'ROLE_ADMIN' || data.role === 'ADMIN';
                        if (isAdminRole) {
                            router.push('/dashboard');
                        } else {
                            router.push('/');
                        }
                    }
                }, 1500);
            } else {
                setStatus("error");
                toast.error("Invalid credentials. Please verify your email and password.");
            }
        } catch (err) {
            setStatus("error");
            toast.error("Server connection failed. Please ensure the API is running.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] font-sans">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,31,63,0.1)] border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-black text-navy tracking-tight">
                            {isAdmin ? "Admin Login" : "Sign In"}
                        </h1>
                        <p className="text-navy/40 text-[10px] font-black uppercase tracking-widest italic">
                            {isAdmin ? "Management Access Only" : "Access your medical profile"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Email Address</label>
                            <input
                                type="email"
                                placeholder={isAdmin ? "admin@ecom.com" : "name@email.com"}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Password</label>
                                {isAdmin && (
                                    <Link href="/forgot-password" className="text-[10px] font-bold text-accent-red hover:underline tracking-widest">
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className={`w-full ${isAdmin ? 'bg-navy hover:bg-black' : 'bg-accent-red hover:bg-navy'} text-white font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest mt-4 ${status === "loading" || status === "success" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {status === "loading" ? "Verifying..." : status === "success" ? "Access Granted" : isAdmin ? "Admin Login" : "Sign In"}
                        </button>
                    </form>

                    <div className="flex flex-col space-y-3 pt-2">
                        <button
                            onClick={() => setIsAdmin(!isAdmin)}
                            className="text-[10px] font-black text-navy/40 uppercase tracking-widest hover:text-navy transition-colors"
                        >
                            {isAdmin ? "Switch to User Login" : "Admin Login Option"}
                        </button>

                        {!isAdmin && (
                            <p className="text-center text-[10px] font-black text-navy/40 uppercase tracking-widest border-t border-gray-50 pt-4">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-accent-red hover:underline">Create One</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

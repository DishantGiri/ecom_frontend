"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "../components/Toast";

export default function LoginPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        // If it's a regular user login, we might still want to simulate or use another endpoint
        // But the guide specifically mentions /api/login for Admin
        try {
            const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
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
                console.log("Login Success Data:", data);

                localStorage.setItem('ecom_token', data.token);
                localStorage.setItem('ecom_role', data.role);
                localStorage.setItem('registered_email', data.email);

                // Set cookies for middleware access to prevent "blink" on protected routes
                const cookieOptions = "path=/; SameSite=Lax; max-age=86400"; // 24h
                document.cookie = `ecom_token=${data.token}; ${cookieOptions}`;
                document.cookie = `ecom_role=${data.role}; ${cookieOptions}`;

                setStatus("success");
                setShowToast(true);

                setTimeout(() => {
                    if (data.mustChangePassword) {
                        router.push('/change-password');
                    } else {
                        localStorage.setItem("is_auth", "true");
                        const isAdminRole = data.role === 'ROLE_ADMIN' || data.role === 'ADMIN';

                        // DEBUG: Log the final decision
                        console.log("Redirecting to:", isAdminRole ? '/dashboard' : '/', "with role:", data.role);

                        if (isAdminRole) {
                            router.push('/dashboard');
                        } else {
                            router.push('/');
                        }
                    }
                }, 1500);
            } else {
                setStatus("error");
                setMessage("Invalid credentials. Please verify your email and password.");
            }
        } catch (err) {
            // Fallback for simulation if API is down and not admin
            if (!isAdmin) {
                const storedEmail = localStorage.getItem("registered_email");
                const storedPassword = localStorage.getItem("user_vault_key");

                if (formData.email === storedEmail && formData.password === storedPassword) {
                    setStatus("success");
                    localStorage.setItem("is_auth", "true");
                    setShowToast(true);
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                    return;
                }
            }
            setStatus("error");
            setMessage("Server connection failed. Please ensure the API is running.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] font-sans">
            <Toast
                show={showToast}
                message="Login successful!"
                onClose={() => setShowToast(false)}
            />

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

                    {message && status === "error" && (
                        <div className="p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center bg-red-50 text-red-600 border border-red-100">
                            {message}
                        </div>
                    )}

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
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Password</label>
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

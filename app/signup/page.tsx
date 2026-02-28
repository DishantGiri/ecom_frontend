"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "../components/Toast";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [ip, setIp] = useState("");
    const [showToast, setShowToast] = useState(false);

    // Get user IP on load
    useEffect(() => {
        const fetchIp = async () => {
            try {
                const res = await fetch("https://api.ipify.org?format=json");
                const data = await res.json();
                setIp(data.ip);
            } catch (err) {
                console.error("Failed to fetch IP:", err);
                setIp("unknown");
            }
        };
        fetchIp();
    }, []);

    const validatePassword = (pass: string) => {
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        return pass.length >= 8 && hasLetter && hasNumber;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        if (!validatePassword(formData.password)) {
            setStatus("error");
            setMessage("Password must be at least 8 characters long and contain both letters and numbers.");
            return;
        }

        try {
            const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

            const response = await fetch(`${apiHost}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    ipAddress: ip
                }),
            });

            if (!response.ok) {
                throw new Error("Registration failed on server.");
            }

            localStorage.setItem("user_vault_key", formData.password);
            localStorage.setItem("registered_email", formData.email);

            setStatus("success");
            setShowToast(true);

            // Redirect after toast shows for a bit
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] font-sans">
            <Toast
                show={showToast}
                message="Account created! Please login."
                onClose={() => setShowToast(false)}
            />

            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,31,63,0.1)] border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-black text-navy tracking-tight">Create Account</h1>
                        <p className="text-navy/40 text-[10px] font-black uppercase tracking-widest italic">
                            Elite Fat Loss System | IP: <span className="text-accent-red">{ip || "Detecting..."}</span>
                        </p>
                    </div>

                    {message && status === "error" && (
                        <div className="p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center bg-red-50 text-red-600">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Dishant Giri"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@email.com"
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
                            <p className="text-[9px] text-navy/30 font-bold uppercase tracking-tighter pl-1">Min 8 chars, 1 letter, 1 number.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className={`w-full bg-accent-red hover:bg-navy text-white font-black py-4 rounded-xl shadow-xl hover:shadow-navy/20 transition-all uppercase tracking-widest mt-4 ${status === "loading" || status === "success" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {status === "loading" ? "Registering..." : status === "success" ? "Success!" : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-[10px] font-black text-navy/40 uppercase tracking-widest flex flex-col space-y-2">
                        <span>
                            Already have an account?{" "}
                            <Link href="/login" className="text-accent-red hover:underline">Sign In</Link>
                        </span>
                        <Link href="/login" className="text-navy hover:text-accent-red transition-colors">Admin Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

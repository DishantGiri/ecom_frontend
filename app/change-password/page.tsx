"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "../components/Toast";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
            const token = localStorage.getItem("ecom_token");

            const response = await fetch(`${apiHost}/api/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword: newPassword
                }),
            });

            if (response.ok) {
                setStatus("success");
                setShowToast(true);
                localStorage.setItem("is_auth", "true");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            } else {
                setStatus("error");
                const data = await response.json();
                setMessage(data.message || "Failed to update password.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Server connection failed.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] font-sans">
            <Toast
                show={showToast}
                message="Password updated successfully!"
                onClose={() => setShowToast(false)}
            />

            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,31,63,0.1)] border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-black text-navy tracking-tight">Security Update</h1>
                        <p className="text-navy/40 text-[10px] font-black uppercase tracking-widest italic">
                            Mandatory Password Change
                        </p>
                    </div>

                    {message && status === "error" && (
                        <div className="p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center bg-red-50 text-red-600 border border-red-100">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all font-mono"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className={`w-full bg-navy hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest mt-4 ${status === "loading" || status === "success" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {status === "loading" ? "Updating..." : "Set New Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

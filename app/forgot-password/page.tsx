"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiHost } from "../utils/apiHost";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"request" | "verify" | "reset">("request");
    const [loading, setLoading] = useState(false);

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${apiHost}/api/admin/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                toast.success("OTP sent to your email.");
                setStep("verify");
            } else {
                toast.error("Failed to send OTP. Ensure email is correct.");
            }
        } catch (error) {
            console.error("Error requesting OTP:", error);
            toast.error("Connection error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length === 6) {
            // Since there is no specific verify-only endpoint provided in the docs,
            // we transition to the reset step. The actual verification happens during reset.
            setStep("reset");
        } else {
            toast.error("Please enter a valid 6-digit OTP.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${apiHost}/api/admin/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });

            if (response.ok) {
                toast.success("Password reset successfully! Please login.");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                toast.error("Invalid OTP or expired.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error("Connection error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] font-sans">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,31,63,0.1)] border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <Link href="/" className="inline-block text-accent-red font-black text-2xl italic pr-2">L.</Link>
                        <h1 className="text-2xl font-black text-navy tracking-tight">Forgot Password</h1>
                        <p className="text-navy/40 text-[10px] font-black uppercase tracking-widest text-center">
                            {step === "request" && "Enter email to receive OTP"}
                            {step === "verify" && "Enter the 6-digit code sent to your email"}
                            {step === "reset" && "Create your new secure password"}
                        </p>
                    </div>

                    {step === "request" && (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">Admin Email</label>
                                <input
                                    type="email" required
                                    placeholder="admin@ecom.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className={`w-full bg-accent-red hover:bg-navy text-white font-black py-4 rounded-xl shadow-xl hover:shadow-navy/20 transition-all uppercase tracking-widest mt-4 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {step === "verify" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">OTP Code</label>
                                <input
                                    type="text" required
                                    placeholder="6-digit OTP"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20 font-mono tracking-[0.25em]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length !== 6}
                                className="w-full bg-accent-red hover:bg-navy text-white font-black py-4 rounded-xl shadow-xl hover:shadow-navy/20 transition-all uppercase tracking-widest mt-4"
                            >
                                Verify OTP
                            </button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">New Password</label>
                                <input
                                    type="password" required
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/20 font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword}
                                className={`w-full bg-accent-red hover:bg-navy text-white font-black py-4 rounded-xl shadow-xl hover:shadow-navy/20 transition-all uppercase tracking-widest mt-4 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    <div className="pt-4 border-t border-gray-50 text-center">
                        <Link href="/login" className="text-[10px] font-black text-navy/40 hover:text-accent-red uppercase tracking-widest transition-colors">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

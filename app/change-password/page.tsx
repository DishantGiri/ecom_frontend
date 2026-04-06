"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getTokenFromCookie } from "../utils/auth";
import { apiHost } from "../utils/apiHost";

function PasswordInput({
    id,
    label,
    value,
    onChange,
    placeholder = "••••••••",
    autoComplete,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-[10px] font-black text-navy uppercase tracking-[0.2em] pl-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    required
                    className={`w-full px-5 py-3.5 pr-12 bg-gray-50 border rounded-xl text-sm font-bold text-navy focus:outline-none transition-all font-mono ${
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-gray-100 focus:border-navy focus:ring-2 focus:ring-navy/10"
                    }`}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy transition-colors"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
        </div>
    );
}

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setStatus("loading");

        try {
            const token = getTokenFromCookie();
            const response = await fetch(`${apiHost}/api/admin/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (response.ok) {
                setStatus("success");
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setStatus("error");
                const err = await response.text();
                toast.error(err || "Failed to update password. Is your current password correct?");
                setStatus("idle");
            }
        } catch {
            setStatus("error");
            toast.error("Server connection failed.");
            setStatus("idle");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white z-[9999] font-sans">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,31,63,0.12)] border border-gray-100">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#001f3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-navy tracking-tight">Change Password</h1>
                        <p className="text-navy/40 text-[11px] font-semibold uppercase tracking-widest">
                            Enter your current password to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <PasswordInput
                            id="current-password"
                            label="Current Password"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            autoComplete="current-password"
                        />
                        <PasswordInput
                            id="new-password"
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            autoComplete="new-password"
                        />
                        <PasswordInput
                            id="confirm-password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            autoComplete="new-password"
                            error={mismatch ? "Passwords do not match" : undefined}
                        />

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success" || mismatch}
                            className="w-full bg-navy hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? "Updating..." : status === "success" ? "Updated ✓" : "Change Password"}
                        </button>
                    </form>

                    <div className="text-center">
                        <Link href="/" className="text-[11px] font-bold text-navy/40 hover:text-navy transition-colors uppercase tracking-widest">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

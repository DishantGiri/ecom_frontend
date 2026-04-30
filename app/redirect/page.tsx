"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function RedirectContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const url = searchParams.get("url");
    const productName = searchParams.get("product") || "your product";
    
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!url) {
            const timeout = setTimeout(() => router.push("/"), 3000);
            return () => clearTimeout(timeout);
        }

        if (countdown <= 0) {
            window.location.href = url;
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, url, router]);

    if (!url) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-2xl font-bold text-navy mb-4">Invalid Redirect</h1>
                    <p className="text-navy/60 mb-6">No destination URL was provided. Returning you to the home page...</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-navy text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 active:scale-95">
                        Go Home Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" 
             style={{ background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 40%, #f1f5f9 100%)" }}>
            
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#3D5BC9]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#3D5BC9]/5 blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-xl px-6">
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,31,63,0.12)] text-center relative overflow-hidden group">
                    
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy via-[#3D5BC9] to-navy opacity-80" />

                    <div className="relative mb-10">
                        <div className="w-24 h-24 mx-auto mb-8 relative">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="44"
                                    stroke="rgba(0,31,63,0.05)"
                                    strokeWidth="4"
                                    fill="transparent"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="44"
                                    stroke="#3D5BC9"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray="276"
                                    strokeDashoffset={276 - (276 * (5 - countdown)) / 5}
                                    style={{ transition: "stroke-dashoffset 1s linear" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black text-navy">{countdown}</span>
                            </div>
                        </div>

                        <p className="text-[10px] font-black text-[#3D5BC9] uppercase tracking-[0.4em] mb-4">Processing Secure Link</p>
                        <h1 className="text-3xl font-black text-navy leading-tight mb-4">
                            Redirecting to Checkout
                        </h1>
                        <p className="text-navy/50 font-medium leading-relaxed max-w-sm mx-auto">
                            We are safely redirecting you to the secure checkout page for <span className="text-navy font-bold">{productName}</span>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center scale-90">
                                        <svg className="w-3 h-3 text-navy/30" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-navy/30 uppercase tracking-widest">Secured by End-to-End Encryption</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 opacity-40">
                    <img src="/accepted_payment.png" alt="Trusted Payments" className="h-6 object-contain grayscale" />
                </div>
            </div>
        </div>
    );
}

export default function RedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
            </div>
        }>
            <RedirectContent />
        </Suspense>
    );
}

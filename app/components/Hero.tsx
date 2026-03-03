"use client";

import Image from "next/image";
import Link from "next/link";

const Hero = () => {
    return (
        <section
            className="relative w-full overflow-hidden flex items-stretch"
            style={{ height: "100vh" }}
        >
            {/* ─── LEFT HALF — Navy ─────────────────────────── */}
            <div className="relative flex-1 bg-navy flex flex-col justify-center px-12 xl:px-20 py-16 z-10">

                {/* Subtle background radial glow */}
                <div
                    className="absolute bottom-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #D32F2F 0%, transparent 70%)" }}
                />

                {/* Category label */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-10 bg-accent-red" />
                    <span className="text-accent-red text-[10px] font-black uppercase tracking-[0.3em]">
                        Clinically Proven GLP-1 Treatments
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-white font-black leading-[1.05] tracking-tight mb-6"
                    style={{ fontSize: "clamp(2.4rem, 4vw, 5rem)" }}>
                    Premium injectable<br />
                    <span className="italic text-white/80 font-serif font-normal">supplements,</span><br />
                    <span className="text-accent-red">delivered.</span>
                </h1>

                {/* Sub copy */}
                <p className="text-white/50 text-base leading-relaxed max-w-xs mb-10">
                    Ozempic, Mounjaro & Wegovy — prescribed by licensed physicians, shipped directly to your door.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent-red text-white text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-navy transition-all duration-300 shadow-lg shadow-accent-red/25 group"
                    >
                        Explore Now
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center px-7 py-3.5 border border-white/20 text-white/80 hover:border-white hover:text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                    >
                        Read Blogs
                    </Link>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap gap-6 border-t border-white/10 pt-8">
                    {[
                        ["FDA Approved", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
                        ["Free Shipping", "M5 12h14M12 5l7 7-7 7"],
                        ["Same-Day Dispatch", "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2"],
                    ].map(([label, d]) => (
                        <div key={label} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d={d as string} />
                            </svg>
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── RIGHT HALF — White/Image ────────────────────── */}
            <div className="relative hidden lg:flex flex-1 bg-[#f4f6f9] items-center justify-center overflow-hidden">

                {/* Diagonal navy wedge bleeding from left */}
                <div
                    className="absolute left-0 top-0 h-full w-28 bg-navy z-10"
                    style={{ clipPath: "polygon(0 0, 100% 0, 60% 100%, 0 100%)" }}
                />

                {/* Large background circle */}
                <div className="absolute w-[520px] h-[520px] rounded-full bg-white shadow-xl" />

                {/* Product Image */}
                <div className="relative z-20 w-full h-full flex items-center justify-center group">
                    <Image
                        src="/hero1.png"
                        alt="GLP-1 injectable supplements"
                        fill
                        priority
                        className="object-contain p-10 transform transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                    />
                </div>



                {/* ─ Floating stat pill — users ─ */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 bg-navy text-white rounded-full px-5 py-2.5 flex items-center gap-2.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-widest">14,200+ Patients Served</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;

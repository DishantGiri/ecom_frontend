"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    if (pathname?.startsWith("/dashboard") || pathname === "/redirect") return null;

    return (
        <footer className="bg-navy text-white pt-24 pb-12 border-t border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-black text-white tracking-widest uppercase italic">
                                HealthcareDrugstore<span className="text-accent-red">.com</span>
                            </span>
                        </Link>
                        <p className="text-white/40 font-medium text-sm leading-relaxed max-w-sm">
                            Premium Pharmaceutical Access System for advanced clinical outcomes. Providing the highest quality health solutions since 2024.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Shop</h4>
                        <ul className="space-y-5">
                            {["All Products", "Latest Product", "Most Popular"].map((item) => (
                                <li key={item}>
                                    <Link href="/products" className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Navigation</h4>
                        <ul className="space-y-5">
                            {[
                                { name: "Home", href: "/" },
                                { name: "Products", href: "/products" },
                                { name: "About Us", href: "/about-us" },
                                { name: "Contact Us", href: "/contact" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Legal</h4>
                        <ul className="space-y-5">
                            {["Privacy Policy", "Terms of Service", "Shipping Policy", "Return Policy"].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <p>© {currentYear} HEALTHCARE DRUGSTORE. ALL RIGHTS RESERVED.</p>
                        <div className="flex items-center gap-10">
                            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                    <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <img
                            src="/accepted_payment.png"
                            alt="Accepted Payment Methods"
                            className="h-8 md:h-10 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    if (pathname?.startsWith("/dashboard")) return null;

    return (
        <footer className="bg-navy text-white pt-24 pb-12 border-t border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="text-3xl font-black text-white tracking-widest uppercase italic">
                                LOREM
                            </span>
                        </Link>
                        <p className="text-white/40 font-medium text-sm leading-relaxed max-w-sm">
                            Premium Medical Elite System for advanced clinical outcomes. Providing the highest quality health solutions for performance and wellness since 2024.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Shop</h4>
                        <ul className="space-y-5">
                            {["Weight Management", "Injectables", "Elite Supplements", "Performance Labs"].map((item) => (
                                <li key={item}>
                                    <Link href="/products" className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Company</h4>
                        <ul className="space-y-5">
                            {["Our Story", "The Science", "Wholesale", "Contact Us"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-accent-red">Support</h4>
                        <ul className="space-y-5">
                            {["Shipping Policy", "Return Policy", "Quality Testing", "Help Center"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-tight">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <p>© {currentYear} LOREM INDUSTRIES. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-10">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

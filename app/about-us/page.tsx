import ScrollReveal from "../components/ScrollReveal";

export default function AboutUs() {
    return (
        <main className="min-h-screen bg-white">
            {/* Minimalist Hero */}
            <section className="pt-12 md:pt-16 pb-20 max-w-[1440px] mx-auto px-6 text-center">
                <ScrollReveal animation="up">
                    <p className="text-navy/40 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">Established 2024</p>
                    <h1 className="text-5xl md:text-6xl font-black text-navy tracking-tight mb-8">
                        Healthcare with <span className="text-accent-red">Precision.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-navy/50 text-base font-medium leading-relaxed">
                        At HealthcareDrugstore.com, we simplify access to elite medical solutions. 
                        Our platform is built on transparency, sterility, and uncompromising clinical standards.
                    </p>
                </ScrollReveal>
            </section>

            {/* Featured Image - Full Width Minimalist */}
            <section className="px-6 max-w-[1440px] mx-auto">
                <ScrollReveal animation="fade">
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative">
                        <img 
                            src="/about-us.png" 
                            alt="Laboratory Clinical Environment"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </ScrollReveal>
            </section>

            {/* Simple Grid Content */}
            <section className="py-24 max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <ScrollReveal animation="up">
                        <div className="space-y-6">
                            <h2 className="text-[12px] font-black text-accent-red uppercase tracking-[0.2em]">Our Philosophy</h2>
                            <p className="text-xl font-bold text-navy leading-snug">
                                We believe that pharmaceutical care should be as seamless as it is effective.
                            </p>
                            <p className="text-navy/50 text-sm leading-relaxed">
                                Our curators select only the most rigorously tested products, ensuring that every order meets the high-performance needs of our global community. We are not just a drugstore; we are your clinical partner in wellness.
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal animation="up" delay={200}>
                        <div className="space-y-8">
                            {[
                                { title: "Clinical Verification", text: "Third-party laboratory testing on every batch." },
                                { title: "Discreet Logistics", text: "Neutral packaging for complete patient privacy." },
                                { title: "Secure Data", text: "256-bit encryption for all medical records." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 pb-6 border-b border-gray-50 last:border-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-red mt-2 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-1">{item.title}</h4>
                                        <p className="text-navy/40 text-[13px]">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Subtle Call to Action */}
            <section className="py-20 border-t border-gray-50 bg-gray-50/30">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-navy/60 font-medium italic text-lg">
                        "Redefining the standard of pharmaceutical accessibility for the modern era."
                    </p>
                </div>
            </section>
        </main>
    );
}

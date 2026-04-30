import ScrollReveal from "../components/ScrollReveal";

const LegalSection = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-xs font-black text-navy uppercase tracking-widest mb-4">{title}</h2>
        <div className="text-navy/60 text-sm leading-relaxed space-y-4">
            {content}
        </div>
    </div>
);

export default function ShippingPolicy() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header Image Area without excessive top padding */}
            <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-end pb-12 border-b border-gray-100">
                <div className="absolute inset-x-0 top-0 h-full">
                    <img 
                        src="/legal.png" 
                        alt="Logistics Protocol"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 w-full">
                    <ScrollReveal animation="up">
                        <p className="text-accent-red font-black uppercase tracking-[0.4em] text-[10px] mb-2">Logistics Protocol</p>
                        <h1 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Shipping Policy</h1>
                    </ScrollReveal>
                </div>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <ScrollReveal animation="up">
                        <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-12 pb-6 border-b border-gray-50">
                            HealthcareDrugstore.com Logistics Guidelines
                        </p>

                        <LegalSection 
                            title="1. Dispatch Protocol" 
                            content={
                                <p>Most medical orders are dispatched within 24–48 hours of clinical verification. We operate through neutral distribution nodes for maximum efficiency.</p>
                            } 
                        />

                        <LegalSection 
                            title="2. Delivery Timelines" 
                            content={
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Domestic Secure:</strong> 3–5 Business Days</li>
                                    <li><strong>International Logistics:</strong> 7–14 Business Days</li>
                                </ul>
                            } 
                        />

                        <LegalSection 
                            title="3. Neutral Packaging" 
                            content={
                                <p>All exports are shipped in discreet, unbranded containers to maintain absolute patient confidentiality across all territories.</p>
                            } 
                        />

                        <LegalSection 
                            title="4. Transit Responsibility" 
                            content={
                                <p>Once dispatched, tracking identities are logged. HealthcareDrugstore.com is not responsible for local customs delays or localized import duties.</p>
                            } 
                        />

                        <div className="mt-20 pt-10 border-t border-gray-50 text-[11px] font-bold text-navy/40 uppercase tracking-widest text-center">
                            Queries: shipping@healthcaredrugstore.com
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}

import ScrollReveal from "../components/ScrollReveal";

const LegalSection = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-xs font-black text-navy uppercase tracking-widest mb-4">{title}</h2>
        <div className="text-navy/60 text-sm leading-relaxed space-y-4">
            {content}
        </div>
    </div>
);

export default function ReturnPolicy() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header Image Area without excessive top padding */}
            <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-end pb-12 border-b border-gray-100">
                <div className="absolute inset-x-0 top-0 h-full">
                    <img 
                        src="/legal.png" 
                        alt="Quality Guarantee"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 w-full">
                    <ScrollReveal animation="up">
                        <p className="text-accent-red font-black uppercase tracking-[0.4em] text-[10px] mb-2">Quality Guarantee</p>
                        <h1 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Return Policy</h1>
                    </ScrollReveal>
                </div>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <ScrollReveal animation="up">
                        <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-12 pb-6 border-b border-gray-50">
                            HealthcareDrugstore.com Medical Protocols
                        </p>

                        <LegalSection 
                            title="1. Return Eligibility" 
                            content={
                                <p>Pharmaceutical returns are permitted only if the clinical seal is intact and packaging is in original laboratory condition.</p>
                            } 
                        />

                        <LegalSection 
                            title="2. Request Window" 
                            content={
                                <p>You have 30 days from the timestamp of delivery to initiate a return protocol via our support center.</p>
                            } 
                        />

                        <LegalSection 
                            title="3. Inspection & Reimbursement" 
                            content={
                                <p>Refunds are processed following successful inspection by our quality control unit. Approved credits are issued within 3-5 business cycles.</p>
                            } 
                        />

                        <LegalSection 
                            title="4. Non-Refundable Stock" 
                            content={
                                <p>For health and safety compliance, opened medications or sterile equipment cannot be accepted for return once the barrier seal is compromised.</p>
                            } 
                        />

                        <div className="mt-20 pt-10 border-t border-gray-50 text-[11px] font-bold text-navy/40 uppercase tracking-widest text-center">
                            Initiate Return: returns@healthcaredrugstore.com
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}

import ScrollReveal from "../components/ScrollReveal";

const LegalSection = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-xs font-black text-navy uppercase tracking-widest mb-4">{title}</h2>
        <div className="text-navy/60 text-sm leading-relaxed space-y-4">
            {content}
        </div>
    </div>
);

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header Image Area without excessive top padding */}
            <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-end pb-12 border-b border-gray-100">
                <div className="absolute inset-x-0 top-0 h-full">
                    <img 
                        src="/legal.png" 
                        alt="Legal Data Protocol"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 w-full">
                    <ScrollReveal animation="up">
                        <p className="text-accent-red font-black uppercase tracking-[0.4em] text-[10px] mb-2">Legal Protection</p>
                        <h1 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Privacy Policy</h1>
                    </ScrollReveal>
                </div>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <ScrollReveal animation="up">
                        <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-12 pb-6 border-b border-gray-50">
                            HealthcareDrugstore.com Protocol Revision: April 28, 2026
                        </p>

                        <LegalSection 
                            title="1. Personal Data Management" 
                            content={
                                <p>We process your data with clinical precision. This includes contact information, shipping logistics, and payment identifiers necessary for pharmaceutical procurement.</p>
                            } 
                        />

                        <LegalSection 
                            title="2. Security Systems" 
                            content={
                                <p>End-to-end encryption is active for all transactions. We do not retain local records of sensitive financial credentials. All operations are PCI-DSS compliant.</p>
                            } 
                        />

                        <LegalSection 
                            title="3. Information Sharing" 
                            content={
                                <p>Data transmission to third parties is restricted only to essential logistics partners and medical verification services required to fulfill your order.</p>
                            } 
                        />

                        <LegalSection 
                            title="4. Analytical Cookies" 
                            content={
                                <p>Brief session identities (cookies) are used to maintain your cart and session status. These do not compromise your patient privacy.</p>
                            } 
                        />

                        <div className="mt-20 pt-10 border-t border-gray-50 text-[11px] font-bold text-navy/40 uppercase tracking-widest text-center">
                            Inquiries: privacy@healthcaredrugstore.com
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}

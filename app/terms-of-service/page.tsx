import ScrollReveal from "../components/ScrollReveal";

const LegalSection = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-xs font-black text-navy uppercase tracking-widest mb-4">{title}</h2>
        <div className="text-navy/60 text-sm leading-relaxed space-y-4">
            {content}
        </div>
    </div>
);

export default function TermsOfService() {
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
                        <p className="text-accent-red font-black uppercase tracking-[0.4em] text-[10px] mb-2">Agreement Foundation</p>
                        <h1 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Terms of Service</h1>
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
                            title="1. Agreement Foundation" 
                            content={
                                <p>By engaging with our platform, you acknowledge and accept our clinical distribution protocols and interface regulations.</p>
                            } 
                        />

                        <LegalSection 
                            title="2. Clinical Disclaimer" 
                            content={
                                <p>Information on this site is for educational synthesis. Always consult a certified medical professional before implementing healthcare changes.</p>
                            } 
                        />

                        <LegalSection 
                            title="3. User Conduct & Security" 
                            content={
                                <p>Users must verify they are of legal age (18+). You are responsible for the integrity of your session credentials and pharmaceutical orders.</p>
                            } 
                        />

                        <LegalSection 
                            title="4. Property Rights" 
                            content={
                                <p>All brand identities, interface designs, and clinical data structures are the exclusive property of HealthcareDrugstore.com.</p>
                            } 
                        />

                        <LegalSection 
                            title="5. Policy Modifications" 
                            content={
                                <p>We reserve the right to refine these terms at any interval to align with healthcare regulations and pharmaceutical market shifts.</p>
                            } 
                        />

                        <div className="mt-20 pt-10 border-t border-gray-50 text-[11px] font-bold text-navy/40 uppercase tracking-widest text-center">
                            Inquiries: legal@healthcaredrugstore.com
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}

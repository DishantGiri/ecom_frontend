import ScrollReveal from "../components/ScrollReveal";

export default function Contact() {
    return (
        <main className="min-h-screen bg-white pt-12 md:pt-16 pb-24">
            <div className="max-w-[1440px] mx-auto px-6">
                <ScrollReveal animation="up" className="text-center mb-12">
                    <p className="text-accent-red font-black uppercase tracking-[0.4em] text-[10px] mb-4">Support Protocol</p>
                    <h1 className="text-5xl font-black text-navy tracking-tight">Contact Us</h1>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Minimalist Contact Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <ScrollReveal animation="right">
                            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm mb-10">
                                <img 
                                    src="/contact.png" 
                                    alt="Medical Support Center"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-8 px-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-4">Email Reach</h4>
                                    <p className="text-lg font-bold text-navy">support@healthcaredrugstore.com</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-4">Operating Window</h4>
                                    <p className="text-sm font-bold text-navy uppercase tracking-tight">Mon - Fri <br /> 09:00 - 18:00 EST</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Minimalist Form */}
                    <div className="lg:col-span-8">
                        <ScrollReveal animation="left">
                            <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-16 shadow-sm">
                                <form className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="relative group">
                                            <input type="text" className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-navy transition-all text-sm font-medium placeholder:text-navy/20" placeholder="Identity / Name" />
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-navy w-0 group-focus-within:w-full transition-all duration-300" />
                                        </div>
                                        <div className="relative group">
                                            <input type="email" className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-navy transition-all text-sm font-medium placeholder:text-navy/20" placeholder="Contact Email" />
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-navy w-0 group-focus-within:w-full transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                    <div className="relative group">
                                        <select className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-navy transition-all text-sm font-medium appearance-none">
                                            <option>General Inquiry</option>
                                            <option>Order Status</option>
                                            <option>Clinical Consultation</option>
                                            <option>Technical Support</option>
                                        </select>
                                        <div className="absolute bottom-0 left-0 h-0.5 bg-navy w-0 group-focus-within:w-full transition-all duration-300" />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <textarea rows={4} className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-navy transition-all text-sm font-medium resize-none placeholder:text-navy/20" placeholder="Detailed Message"></textarea>
                                        <div className="absolute bottom-0 left-0 h-0.5 bg-navy w-0 group-focus-within:w-full transition-all duration-300" />
                                    </div>

                                    <button className="px-12 py-5 bg-navy text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-lg shadow-navy/10 hover:bg-navy/90 hover:scale-105 active:scale-95 transition-all">
                                        Transmit Message
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </main>
    );
}

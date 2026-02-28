"use client";

import { useState } from "react";

const faqs = [
    {
        question: "How long does shipping usually take?",
        answer: "Our standard shipping takes 3-4 business days within the United States. We process orders within 24 hours to ensure you get your products as quickly as possible.",
    },
    {
        question: "Are your products third-party tested?",
        answer: "Yes, every batch of our Elite Elite System products undergoes rigorous third-party testing for purity, potency, and safety. You can find the lab results on each product page.",
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day money-back guarantee. If you are not completely satisfied with your purchase, contact our support team and we will issue a full refund, no questions asked.",
    },
    {
        question: "Can I use these supplements with other medications?",
        answer: "While our products are natural and generally safe, we always recommend consulting with your healthcare provider before starting any new supplement regimen, especially if you are taking prescription medications.",
    },
    {
        question: "Do you offer international shipping?",
        answer: "Currently, we only ship within the United States and Canada. We are working on expanding our reach to serve our community worldwide very soon.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="bg-white pt-10 pb-20 px-6 md:px-12 font-sans border-t border-gray-50">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-accent-red" />
                        <span className="text-accent-red text-[10px] font-black uppercase tracking-[0.3em]">Common Questions</span>
                        <div className="h-px w-8 bg-accent-red" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-4">
                        Frequently Asked
                    </h2>
                    <p className="text-navy/50 font-medium max-w-xl mx-auto">
                        Everything you need to know about our products, shipping, and service.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className="group border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:border-navy/10"
                                style={{
                                    background: isOpen ? "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" : "white",
                                    boxShadow: isOpen ? "0 10px 30px -10px rgba(0, 31, 63, 0.05)" : "none"
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full flex items-center justify-between px-8 py-7 text-left group"
                                >
                                    <span className={`text-[17px] font-black tracking-tight transition-colors duration-300 ${isOpen ? "text-accent-red" : "text-navy group-hover:text-accent-red"}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`transition-all duration-300 ${isOpen ? "text-accent-red rotate-180" : "text-navy/20 group-hover:text-accent-red"}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </div>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="px-8 pb-8 text-navy/60 font-medium leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

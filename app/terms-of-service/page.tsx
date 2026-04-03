import React from "react";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-white font-sans pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <span className="text-accent-red text-sm font-black uppercase tracking-[0.2em] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-navy/50 font-medium text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-lg text-navy/70 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">1. Agreement to Terms</h2>
                        <p>
                            By viewing or navigating through our website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">2. User Accounts</h2>
                        <p>
                            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                            <li>You agree not to disclose your password to any third party.</li>
                            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">3. Acceptable Use</h2>
                        <p>
                            You agree not to use the website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website. You must not use the website in any manner that is unlawful, illegal, fraudulent, or harmful.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">4. Limitations of Liability</h2>
                        <p>
                            In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

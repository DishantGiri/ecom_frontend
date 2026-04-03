import React from "react";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white font-sans pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <span className="text-accent-red text-sm font-black uppercase tracking-[0.2em] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-navy/50 font-medium text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-lg text-navy/70 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">1. Information Collection</h2>
                        <p>
                            We collect information from you when you register on our site, place an order, subscribe to our newsletter, or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number or credit card information. You may, however, visit our site anonymously.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">2. Use of Data</h2>
                        <p>
                            Any of the information we collect from you may be used in one of the following ways: to personalize your experience, to improve our website, to improve customer service, to process transactions, or to administer a contest, promotion, survey, or other site feature.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>To deliver the products and services that you have requested.</li>
                            <li>To manage your account and provide you with customer support.</li>
                            <li>To communicate with you about products or services that may be of interest to you.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">3. Data Protection</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">4. Cookies</h2>
                        <p>
                            Yes, we use cookies. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

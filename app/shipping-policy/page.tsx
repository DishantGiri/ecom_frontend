import React from "react";

export default function ShippingPolicy() {
    return (
        <main className="min-h-screen bg-white font-sans pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <span className="text-accent-red text-sm font-black uppercase tracking-[0.2em] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-6">
                        Shipping Policy
                    </h1>
                    <p className="text-navy/50 font-medium text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-lg text-navy/70 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">1. Order Processing Time</h2>
                        <p>
                            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">2. Shipping Rates and Estimates</h2>
                        <p>
                            Shipping charges for your order will be calculated and displayed at checkout. We offer several delivery options varying by speed and carrier.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Standard Shipping: 3-5 business days</li>
                            <li>Expedited Shipping: 1-2 business days</li>
                            <li>International Shipping: 7-14 business days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">3. Local Delivery</h2>
                        <p>
                            Free local delivery is available for orders over $50 within the greater metropolitan area. For orders under $50, we charge a flat rate delivery fee of $10. Deliveries are made from 9 AM to 5 PM on weekdays.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">4. How do I check the status of my order?</h2>
                        <p>
                            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

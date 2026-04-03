import React from "react";

export default function ReturnPolicy() {
    return (
        <main className="min-h-screen bg-white font-sans pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <span className="text-accent-red text-sm font-black uppercase tracking-[0.2em] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-6">
                        Return Policy
                    </h1>
                    <p className="text-navy/50 font-medium text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-lg text-navy/70 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">1. Returns</h2>
                        <p>
                            We have a 30-day return policy, which means you have 30 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You will also need the receipt or proof of purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">2. Refunds</h2>
                        <p>
                            We will notify you once we have received and inspected your return, and let you know if the refund was approved or not. If approved, you will be automatically refunded on your original payment method within 10 business days.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Please remember it can take some time for your bank or credit card company to process and post the refund too.</li>
                            <li>If more than 15 business days have passed since we approved your return, please contact us.</li>
                            <li>Original shipping costs are non-refundable.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">3. Exchanges</h2>
                        <p>
                            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item. We do not offer direct exchanges at this moment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-4">4. Shipping Returns</h2>
                        <p>
                            To return your product, you should mail your product to our designated return address. You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

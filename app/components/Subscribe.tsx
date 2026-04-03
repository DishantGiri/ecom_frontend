"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function Subscribe() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            // Using a generic endpoint to collect emails
            const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, type: 'subscription' }),
            });

            if (response.ok) {
                toast.success("Successfully subscribed!");
                setEmail("");
            } else {
                toast.error("Failed to subscribe. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white pb-24 px-6 md:px-12 font-sans">
            <div className="max-w-[1440px] mx-auto relative overflow-hidden rounded-[2.5rem] bg-navy py-20 px-6 md:px-12 shadow-2xl">
                {/* Background elements */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-red rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                        Stay Updated
                    </h2>
                    <p className="text-gray-300 font-medium mb-10 text-lg">
                        Subscribe to our newsletter for exclusive offers, new product announcements, and expert health tips.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                        <div className="flex-grow">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-all duration-300"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-8 py-4 rounded-full bg-accent-red text-white font-black uppercase tracking-widest text-sm hover:bg-red-600 transition-colors duration-300 shadow-lg shadow-accent-red/30 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

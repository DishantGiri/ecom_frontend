import Link from "next/link";
import Image from "next/image";
import { apiHost } from "../utils/apiHost";

export const dynamic = "force-dynamic";

interface Blog {
    id: number;
    title: string;
    slug: string;
    intro: string;
    content: string;
    featureImageUrl: string;
    author: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    createdAt: string;
    updatedAt: string;
}

function getImageUrl(url: string): string {
    if (!url) return "";
    const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
    return full.replace(/([^:])\/\/+/g, '$1/');
}

async function getBlogs(): Promise<Blog[]> {
    try {
        const res = await fetch(`${apiHost}/api/blogs`, { cache: "no-store" });
        if (!res.ok) return [];
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
    } catch (e) {
        console.error("Failed to fetch blogs", e);
        return [];
    }
}

export default async function BlogsPage({ searchParams }: { searchParams: { topic?: string } }) {
    const allBlogs = await getBlogs();

    // Extract unique topics from metaKeywords
    const topicsSet = new Set<string>();
    allBlogs.forEach(blog => {
        if (blog.metaKeywords) {
            blog.metaKeywords.split(",").forEach(keyword => {
                const kw = keyword.trim().toLowerCase();
                if (kw) topicsSet.add(kw);
            });
        }
    });
    const topics = Array.from(topicsSet).sort();

    // Filter blogs based on selected topic
    const selectedTopic = searchParams.topic?.toLowerCase();
    const blogs = selectedTopic
        ? allBlogs.filter(blog => blog.metaKeywords && blog.metaKeywords.toLowerCase().includes(selectedTopic))
        : allBlogs;

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 pt-8 pb-16 px-6 md:px-12">
                <div className="max-w-[1440px] mx-auto text-center">
                    <span className="text-accent-red text-[10px] font-black uppercase tracking-[0.4em] block mb-4">Our Journal</span>
                    <h1 className="text-4xl md:text-6xl font-black text-navy uppercase tracking-tighter mb-6 leading-none">
                        Health & Wellness <span className="text-accent-red">Journal</span>
                    </h1>
                    <p className="text-lg text-navy/60 font-medium max-w-2xl mx-auto">Expert insights, wellness tips, and science-backed protocols for a better you.</p>
                </div>
            </header>

            {/* Filter Section */}
            {topics.length > 0 && (
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-12 flex flex-wrap gap-3 justify-center items-center">
                    <Link
                        href="/blogs"
                        className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${!selectedTopic ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' : 'bg-white text-navy/40 border-gray-100 hover:border-navy hover:text-navy'}`}
                    >
                        All Articles
                    </Link>
                    {topics.map(topic => (
                        <Link
                            key={topic}
                            href={`/blogs?topic=${encodeURIComponent(topic)}`}
                            className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${selectedTopic === topic ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' : 'bg-white text-navy/40 border-gray-100 hover:border-navy hover:text-navy'}`}
                        >
                            {topic}
                        </Link>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16">
                {blogs.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-navy/30 font-black uppercase tracking-[0.2em]">
                            {selectedTopic ? `No articles found for topic "${selectedTopic}".` : "The journal is currently empty."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {blogs.map((blog) => (
                            <Link
                                href={`/blogs/${blog.slug}`}
                                key={blog.id}
                                className="group flex flex-col bg-white border border-gray-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden rounded-2xl"
                            >
                                {blog.featureImageUrl && (
                                    <div className="relative aspect-[16/9] overflow-hidden w-full bg-navy/5">
                                        <div className="absolute inset-0 bg-navy/5 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img
                                            src={getImageUrl(blog.featureImageUrl)}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="bg-white/90 backdrop-blur-md text-navy text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                                                Article
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="w-6 h-px bg-accent-red/40"></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">
                                            {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-black text-navy leading-tight tracking-tight mb-3 group-hover:text-accent-red transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>

                                    {blog.metaDescription && (
                                        <p className="text-[13px] text-navy/60 leading-relaxed font-medium line-clamp-2 mb-6">
                                            {blog.metaDescription.replace(/&nbsp;/g, ' ')}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-navy uppercase tracking-widest">{blog.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-accent-red font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500">
                                            Read Guide
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


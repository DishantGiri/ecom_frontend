import Link from "next/link";
import Image from "next/image";

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    featureImageUrl: string;
    author: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    createdAt: string;
    updatedAt: string;
}

const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

function getImageUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiHost}/api/images/${url}`;
}

async function getBlogs(): Promise<Blog[]> {
    try {
        const res = await fetch(`${apiHost}/api/blogs`, {
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        if (!res.ok) return [];
        return res.json();
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
            <header className="bg-white border-b border-gray-100 pt-4 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-navy uppercase tracking-tighter mb-4">
                        Health & Wellness <span className="text-accent-red">Journal</span>
                    </h1>
                    <p className="text-base text-navy/60 font-medium">Expert insights, wellness tips, and science-backed protocols.</p>
                </div>
            </header>

            {/* Filter Section */}
            {topics.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-wrap gap-2 justify-center items-center">
                    <Link
                        href="/blogs"
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${!selectedTopic ? 'bg-navy text-white border-navy' : 'bg-white text-navy/60 border-gray-200 hover:border-navy hover:text-navy'}`}
                    >
                        All
                    </Link>
                    {topics.map(topic => (
                        <Link
                            key={topic}
                            href={`/blogs?topic=${encodeURIComponent(topic)}`}
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${selectedTopic === topic ? 'bg-navy text-white border-navy' : 'bg-white text-navy/60 border-gray-200 hover:border-navy hover:text-navy'}`}
                        >
                            {topic}
                        </Link>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                {blogs.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-navy/50 font-black uppercase tracking-widest">
                            {selectedTopic ? `No articles found for topic "${selectedTopic}".` : "No articles found just yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden rounded-xl">
                                {blog.featureImageUrl && (
                                    <div className="relative aspect-[16/10] overflow-hidden w-full bg-navy/5">
                                        <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img
                                            src={getImageUrl(blog.featureImageUrl)}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                )}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">Article</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">
                                            {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-navy leading-tight tracking-tight mb-3 group-hover:text-accent-red transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>
                                    {blog.metaDescription && (
                                        <p className="text-sm text-navy/60 leading-relaxed font-medium line-clamp-3 mb-6">
                                            {blog.metaDescription}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white font-black text-xs">
                                            {blog.author.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-navy/80">{blog.author}</span>
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

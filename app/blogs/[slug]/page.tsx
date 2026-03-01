import Link from "next/link";
import { notFound } from "next/navigation";

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

async function getBlog(slug: string): Promise<Blog | null> {
    try {
        const res = await fetch(`${apiHost}/api/blogs/${slug}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Failed to fetch blog", e);
        return null;
    }
}

async function getAllBlogs(): Promise<Blog[]> {
    try {
        const res = await fetch(`${apiHost}/api/blogs`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Failed to fetch all blogs", e);
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const blog = await getBlog(params.slug);
    if (!blog) return { title: "Blog Not Found" };

    return {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription,
        keywords: blog.metaKeywords,
    };
}

export default async function BlogDetailsPage({ params }: { params: { slug: string } }) {
    const blog = await getBlog(params.slug);

    if (!blog) {
        notFound();
    }

    const allBlogs = await getAllBlogs();
    const relatedBlogs = allBlogs
        .filter(b => b.slug !== params.slug)
        .slice(0, 3);

    return (
        <article className="min-h-screen bg-[#FDFDFD] font-sans pb-32 pt-20">
            {/* Header / Hero */}
            <header className="relative w-full bg-white pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Link href="/blogs" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/40 hover:text-accent-red transition-colors mb-8 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Back to Articles
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-black text-navy tracking-tighter leading-[1.1] mb-8">
                        {blog.title}
                    </h1>

                    <div className="flex items-center justify-center gap-6 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy font-black text-lg">
                                {blog.author.charAt(0)}
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] uppercase font-black tracking-widest text-navy/40">Written By</span>
                                <span className="block text-sm font-bold text-navy">{blog.author}</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase font-black tracking-widest text-navy/40">Published On</span>
                            <span className="block text-sm font-bold text-navy">
                                {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Feature Image Main Display */}
            {blog.featureImageUrl && (
                <div className="max-w-5xl mx-auto px-6 mb-12">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <img
                            src={getImageUrl(blog.featureImageUrl)}
                            alt={blog.title}
                            className="w-full h-auto max-h-[500px] object-cover rounded-xl"
                        />
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className={`max-w-3xl mx-auto px-6 mb-32`}>
                <div
                    className="prose prose-lg md:prose-xl prose-slate max-w-none 
                        prose-headings:font-black prose-headings:text-navy prose-headings:tracking-tight 
                        prose-p:text-navy/80 prose-p:leading-relaxed prose-p:font-medium
                        prose-a:text-accent-red prose-a:font-bold prose-a:no-underline hover:prose-a:text-navy
                        prose-strong:text-navy prose-strong:font-black
                        prose-li:text-navy/80 prose-li:font-medium
                        prose-blockquote:border-accent-red prose-blockquote:bg-gray-50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:text-navy prose-blockquote:not-italic prose-blockquote:rounded-r-xl"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags section */}
                <div className="mt-24 pt-12 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {blog.metaKeywords && blog.metaKeywords.split(',').map((tag) => (
                            <span key={tag.trim()} className="px-4 py-2 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-navy rounded-full border border-gray-100">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Articles / Keep Reading */}
            {relatedBlogs.length > 0 && (
                <section className="bg-gray-50/50 py-24 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-accent-red text-[10px] font-black uppercase tracking-[0.3em] block mb-4">Discovery</span>
                            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Keep Reading</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map(post => (
                                <Link key={post.id} href={`/blogs/${post.slug}`} className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                                    <div className="aspect-[16/10] overflow-hidden bg-navy/5">
                                        {post.featureImageUrl && (
                                            <img
                                                src={getImageUrl(post.featureImageUrl)}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-black text-navy text-lg line-clamp-2 leading-tight group-hover:text-accent-red transition-colors mb-3">
                                            {post.title}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Read More →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Simple Footer Link */}
            <div className="max-w-4xl mx-auto px-6 text-center mt-24">
                <Link href="/blogs" className="text-sm font-black text-navy uppercase tracking-widest hover:text-accent-red transition-colors">
                    Browse All Resource Guides
                </Link>
            </div>
        </article>
    );
}

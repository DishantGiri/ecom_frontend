import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "./ShareButtons";

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
            next: { revalidate: 60 },
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
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const blog = await getBlog(slug);
    if (!blog) return { title: "Blog Not Found" };
    return {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription,
        keywords: blog.metaKeywords,
    };
}

export default async function BlogDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) notFound();

    const allBlogs = await getAllBlogs();
    const relatedBlogs = allBlogs.filter((b) => b.slug !== slug).slice(0, 3);

    const publishDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const wordCount = blog.content?.replace(/<[^>]+>/g, "")?.split(/\s+/).length || 0;
    const minuteRead = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">

            {/* ── TOP BREADCRUMB ── */}
            <div className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 text-[11px] font-semibold text-navy/40 uppercase tracking-widest">
                    <Link href="/" className="hover:text-navy transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/blogs" className="hover:text-navy transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-navy/60 line-clamp-1 max-w-xs">{blog.title}</span>
                </div>
            </div>

            {/* ── HERO / HEADER ── */}
            <header className="max-w-3xl mx-auto px-6 pt-14 pb-8 text-center">
                {/* Category pill */}
                <div className="inline-flex items-center gap-2 bg-[#f0f4ff] text-[#3D5BC9] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                    Resource Guide
                </div>

                <h1 className="text-3xl md:text-[2.75rem] font-black text-navy tracking-tight leading-[1.1] mb-4">
                    {blog.title}
                </h1>

                {blog.metaDescription && (
                    <p className="text-navy/50 text-base font-medium leading-relaxed max-w-2xl mx-auto mb-8">
                        {blog.metaDescription}
                    </p>
                )}

                {/* Author row */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3D5BC9] to-[#6B7FD9] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
                        {blog.author?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="text-left">
                        <p className="text-navy font-black text-sm leading-none">{blog.author || "Editorial Team"}</p>
                        <p className="text-navy/40 text-[11px] font-semibold mt-0.5">
                            {publishDate} &middot; {minuteRead} min read
                        </p>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

                    {/* Share buttons – client component */}
                    <ShareButtons title={blog.title} />
                </div>
            </header>

            {/* ── FEATURE IMAGE ── */}
            {blog.featureImageUrl && (
                <div className="max-w-4xl mx-auto px-6 mb-12">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-navy/10 border border-gray-100">
                        <img
                            src={getImageUrl(blog.featureImageUrl)}
                            alt={blog.title}
                            className="w-full h-[280px] md:h-[440px] object-cover"
                        />
                        {/* Gradient overlay at bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                        {blog.metaKeywords && (
                            <div className="absolute bottom-5 right-5">
                                <span className="bg-white/90 backdrop-blur-sm text-navy text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/40 shadow">
                                    {blog.metaKeywords.split(",")[0]?.trim()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-6 pb-16 overflow-hidden">
                <div
                    className="
                        prose prose-base md:prose-lg max-w-none
                        prose-headings:font-black prose-headings:text-navy prose-headings:tracking-tight prose-headings:leading-tight
                        prose-h1:text-3xl
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-navy/70 prose-p:leading-[1.85] prose-p:font-medium prose-p:text-[15px]
                        prose-a:text-[#3D5BC9] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-navy prose-strong:font-black
                        prose-li:text-navy/70 prose-li:font-medium prose-li:text-[15px] prose-li:leading-relaxed
                        prose-ul:my-6 prose-ol:my-6 prose-ul:space-y-2 prose-ol:space-y-2
                        prose-blockquote:border-l-4 prose-blockquote:border-[#3D5BC9]
                        prose-blockquote:bg-[#f7f9ff] prose-blockquote:px-6 prose-blockquote:py-4
                        prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                        prose-blockquote:text-navy/80 prose-blockquote:font-semibold
                        prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-gray-100
                        prose-hr:border-gray-100 prose-hr:my-12
                        [&_ol>li]:marker:text-[#3D5BC9] [&_ol>li]:marker:font-black
                    "
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* ── INLINE CTA BANNER ── */}
                <div
                    className="mt-16 rounded-3xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #001f3f 0%, #0a2a52 100%)" }}
                >
                    <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3D5BC9] mb-2">
                                Shop our collection
                            </p>
                            <h3 className="text-white font-black text-xl md:text-2xl tracking-tight leading-snug">
                                Vetted for Excellence.
                            </h3>
                            <p className="text-white/50 text-sm font-medium mt-1">
                                Premium supplements backed by science and real results.
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="flex-shrink-0 bg-accent-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-full transition-all shadow-lg shadow-accent-red/20 whitespace-nowrap"
                        >
                            Shop Now →
                        </Link>
                    </div>
                </div>

                {/* ── TAGS ── */}
                {blog.metaKeywords && (
                    <div className="mt-12 pt-10 border-t border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-navy/30 mb-4">Topics</p>
                        <div className="flex flex-wrap gap-2">
                            {blog.metaKeywords.split(",").map((tag) => (
                                <span
                                    key={tag.trim()}
                                    className="px-4 py-2 bg-gray-50 hover:bg-[#f0f4ff] text-[11px] font-black uppercase tracking-widest text-navy/50 hover:text-[#3D5BC9] rounded-full border border-gray-100 hover:border-[#3D5BC9]/20 transition-all cursor-default"
                                >
                                    # {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── AUTHOR BIO CARD ── */}
                <div className="mt-12 p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D5BC9] to-[#6B7FD9] flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md">
                        {blog.author?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-navy/40 mb-1">Written by</p>
                        <p className="text-navy font-black text-base">{blog.author || "Editorial Team"}</p>
                        <p className="text-navy/50 text-sm font-medium mt-1 leading-relaxed">
                            Passionate about health, wellness, and helping people live their best lives through science-backed insights and practical guidance.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── RELATED ARTICLES ── */}
            {relatedBlogs.length > 0 && (
                <section className="border-t border-gray-100 bg-[#fafafa] py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3D5BC9] mb-2">
                                    Continue Reading
                                </p>
                                <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
                                    Related Articles
                                </h2>
                            </div>
                            <Link
                                href="/blogs"
                                className="text-[11px] font-black uppercase tracking-widest text-navy/40 hover:text-[#3D5BC9] transition-colors flex items-center gap-1"
                            >
                                View all
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blogs/${post.slug}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-navy/5 hover:-translate-y-1 transition-all duration-300"
                                >
                                    {post.featureImageUrl && (
                                        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                                            <img
                                                src={getImageUrl(post.featureImageUrl)}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#3D5BC9] mb-2">
                                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <h3 className="font-black text-navy text-base leading-snug line-clamp-2 group-hover:text-[#3D5BC9] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-navy/30 mt-4 flex items-center gap-1">
                                            Read Article
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FOOTER ── */}
            <footer className="bg-navy text-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-accent-red flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">Brand</span>
                        </div>
                        <p className="text-white/40 text-xs font-medium leading-relaxed">
                            Science-backed supplements and wellness products that help you live and perform at your best.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Shop</p>
                        <ul className="space-y-3 text-sm font-semibold text-white/60">
                            {["All Products", "Categories", "Bundle Deals", "New Arrivals"].map((t) => (
                                <li key={t}>
                                    <Link href="/products" className="hover:text-white transition-colors">{t}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigation */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Navigation</p>
                        <ul className="space-y-3 text-sm font-semibold text-white/60">
                            {[["Home", "/"], ["Blog", "/blogs"], ["Gift Guide", "/products"], ["FAQs", "/"], ["About us", "/"]].map(([label, href]) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Legal</p>
                        <ul className="space-y-3 text-sm font-semibold text-white/60">
                            {["Privacy Policy", "Terms of Use", "Cookie Policy", "Disclaimer"].map((t) => (
                                <li key={t}>
                                    <span className="hover:text-white transition-colors cursor-pointer">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 py-6 text-center text-[11px] font-semibold text-white/20 tracking-widest">
                    © {new Date().getFullYear()} All rights reserved.
                </div>
            </footer>
        </div>
    );
}

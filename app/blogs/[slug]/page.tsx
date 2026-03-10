"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ShareButtons from "./ShareButtons";
import { apiHost } from "../../utils/apiHost";

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

function decodeHtml(html: string): string {
    if (typeof document === "undefined") return html;
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

export default function BlogDetailsPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug || "";

    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const [blogRes, allRes] = await Promise.all([
                    fetch(`${apiHost}/api/blogs/${slug}`, { cache: "no-store" }),
                    fetch(`${apiHost}/api/blogs`, { cache: "no-store" }),
                ]);
                const blogData: Blog = blogRes.ok ? await blogRes.json() : null;
                const allData: Blog[] = allRes.ok ? await allRes.json() : [];
                setBlog(blogData);
                setRelatedBlogs(allData.filter((b) => b.slug !== slug).slice(0, 3));
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-[3px] border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Loading</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 mb-2">Article not found</p>
                    <Link href="/blogs" className="text-[#0a7abf] text-sm hover:underline">← Back to Blog</Link>
                </div>
            </div>
        );
    }

    const publishDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const wordCount = blog.content?.replace(/<[^>]+>/g, "")?.split(/\s+/).length || 0;
    const minuteRead = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* JSON-LD Blog Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": blog.metaTitle || blog.title,
                        "description": blog.metaDescription || blog.intro,
                        "image": getImageUrl(blog.featureImageUrl),
                        "author": {
                            "@type": "Person",
                            "name": blog.author || "Lively Vita"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Lively Vita",
                            "logo": {
                                "@type": "ImageObject",
                                "url": `${typeof window !== "undefined" ? window.location.origin : ""}/logo.png`
                            }
                        },
                        "datePublished": blog.createdAt,
                        "dateModified": blog.updatedAt || blog.createdAt,
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": typeof window !== "undefined" ? window.location.href : ""
                        },
                        "keywords": blog.metaKeywords || "",
                        "articleBody": blog.content?.replace(/<[^>]+>/g, "") || ""
                    })
                }}
            />

            {/* ── STICKY TOP NAV ── */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-[960px] mx-auto px-4 py-3 flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
                    <span className="text-gray-200">/</span>
                    <Link href="/blogs" className="hover:text-gray-700 transition-colors">Blog</Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-gray-500 line-clamp-1 max-w-xs">{blog.title}</span>
                </div>
            </div>

            {/* ── ARTICLE HEADER ── */}
            <article className="max-w-[960px] mx-auto px-4 pt-10 pb-0">

                {/* Title */}
                <h1
                    className="text-[2rem] md:text-[2.4rem] font-extrabold leading-[1.15] tracking-tight mb-3"
                    style={{ color: "#1a1a2e", fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                    {blog.title}
                </h1>

                {/* Intro subtitle */}
                {blog.intro && (
                    <p className="text-[15px] text-gray-500 leading-relaxed mb-5 font-normal">
                        {blog.intro}
                    </p>
                )}

                {/* Author / Date row */}
                <div className="flex items-center gap-5 text-[13px] text-gray-500 mb-5">
                    <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        {blog.author || "Editorial Team"}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        {publishDate}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {minuteRead} min read
                    </span>
                    <div className="ml-auto">
                        <ShareButtons title={blog.title} />
                    </div>
                </div>

                {/* Horizontal Rule */}
                <hr className="border-gray-200 mb-8" />

                {/* Feature Image */}
                {blog.featureImageUrl && (
                    <div className="mb-10">
                        <img
                            src={getImageUrl(blog.featureImageUrl)}
                            alt={blog.title}
                            className="w-full rounded-lg object-cover"
                            style={{ maxHeight: "480px" }}
                        />
                    </div>
                )}

                {/* Blockquote intro */}
                {blog.intro && (
                    <div
                        className="mb-8"
                        style={{
                            background: "#eef6fb",
                            borderLeft: "4px solid #2aace2",
                            borderRadius: "0 6px 6px 0",
                            padding: "18px 22px",
                        }}
                    >
                        <p className="text-[15px] text-gray-600 leading-relaxed italic font-normal m-0">
                            {blog.intro}
                        </p>
                    </div>
                )}

                {/* ── ARTICLE BODY ── */}
                <div
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags */}
                {blog.metaKeywords && (
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                        {blog.metaKeywords.split(",").map((tag) => (
                            <span
                                key={tag.trim()}
                                className="px-3 py-1 bg-gray-100 text-[11px] text-gray-500 font-medium rounded-full hover:bg-gray-200 transition-colors cursor-default"
                            >
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                )}

                {/* Author Bio */}
                <div className="mt-10 mb-16 p-5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0a7abf, #2aace2)" }}
                    >
                        {blog.author?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Written by</p>
                        <p className="text-gray-800 font-bold text-sm">{blog.author || "Editorial Team"}</p>
                        <p className="text-gray-500 text-[13px] leading-relaxed mt-1">
                            Passionate about health, wellness, and helping people live their best lives through science-backed insights.
                        </p>
                    </div>
                </div>
            </article>

            {/* ── Related Articles ── */}
            {relatedBlogs.length > 0 && (
                <section className="bg-gray-50 border-t border-gray-100 py-14 px-4">
                    <div className="max-w-[960px] mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800">Related Articles</h2>
                            <Link href="/blogs" className="text-[12px] text-[#0a7abf] font-medium hover:underline flex items-center gap-1">
                                View all
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {relatedBlogs.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blogs/${post.slug}`}
                                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200"
                                >
                                    {post.featureImageUrl && (
                                        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                                            <img
                                                src={getImageUrl(post.featureImageUrl)}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
                                            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                        <h3 className="font-bold text-gray-800 text-[14px] leading-snug line-clamp-2 group-hover:text-[#0a7abf] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-[11px] text-[#0a7abf] font-medium mt-3 flex items-center gap-1">
                                            Read more
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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


            <style>{`
                .blog-prose {
                    font-size: 15px;
                    line-height: 1.85;
                    color: #3a3a4a;
                    overflow-x: hidden;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .blog-prose p {
                    margin-bottom: 1.2em;
                    color: #3a3a4a;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .blog-prose h1,
                .blog-prose h2,
                .blog-prose h3,
                .blog-prose h4 {
                    font-family: Georgia, 'Times New Roman', serif;
                    font-weight: 800;
                    color: #1a1a2e;
                    margin-top: 2em;
                    margin-bottom: 0.6em;
                    line-height: 1.25;
                }
                .blog-prose h2 {
                    font-size: 1.35rem;
                }
                .blog-prose h3 {
                    font-size: 1.15rem;
                }
                .blog-prose a {
                    color: #c47a2b;
                    text-decoration: none;
                    font-weight: 500;
                }
                .blog-prose a:hover {
                    text-decoration: underline;
                }
                .blog-prose strong {
                    font-weight: 700;
                    color: #1a1a2e;
                }
                .blog-prose ul, .blog-prose ol {
                    padding-left: 1.5em;
                    margin-bottom: 1.2em;
                }
                .blog-prose li {
                    margin-bottom: 0.4em;
                }
                .blog-prose blockquote {
                    border-left: 4px solid #2aace2;
                    background: #eef6fb;
                    padding: 14px 20px;
                    border-radius: 0 6px 6px 0;
                    margin: 1.5em 0;
                    font-style: italic;
                    color: #5a6a7a;
                }
                .blog-prose img {
                    border-radius: 8px;
                    max-width: 100%;
                    height: auto;
                    margin: 1.5em 0;
                }
                .blog-prose hr {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 2em 0;
                }
                .blog-prose table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    font-size: 14px;
                }
                .blog-prose th, .blog-prose td {
                    border: 1px solid #e5e7eb;
                    padding: 8px 12px;
                    text-align: left;
                }
                .blog-prose th {
                    background: #f8f9fa;
                    font-weight: 700;
                    color: #1a1a2e;
                }
            `}</style>
        </div>
    );
}

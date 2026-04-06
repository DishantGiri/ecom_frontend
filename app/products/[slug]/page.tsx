import { apiHost } from "../../utils/apiHost";
import ProductClient from "./ProductClient";

interface Product {
    id: number;
    title: string;
    slug: string;
    numberOfReviews: number;
    starRating: number;
    discountedPrice: number;
    featureImageUrl: string;
    description?: string;
}

function getImageUrl(url: string): string {
    if (!url) return "";
    const full = url.startsWith("http") ? url : `${apiHost}/api/images/${url}`;
    return full.replace(/([^:])\/\/+/g, "$1/");
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    let product: Product | null = null;
    try {
        const res = await fetch(`${apiHost}/api/products/${slug}?currency=USD`, {
            next: { revalidate: 60 },
        });
        if (res.ok) product = await res.json();
    } catch {
        // schema will just be omitted if fetch fails
    }

    const schema = product
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: getImageUrl(product.featureImageUrl),
            description:
                product.description?.replace(/<[^>]+>/g, "") ||
                product.title,
            sku: String(product.id),
            brand: { "@type": "Brand", name: "LOREM" },
            ...(product.numberOfReviews > 0 && {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.starRating,
                    reviewCount: product.numberOfReviews,
                },
            }),
            offers: {
                "@type": "Offer",
                url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://209.126.86.149:3083"}/products/${slug}`,
                priceCurrency: "USD",
                price: product.discountedPrice,
                priceValidUntil: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                )
                    .toISOString()
                    .split("T")[0],
                availability: "https://schema.org/InStock",
                seller: { "@type": "Organization", name: "LOREM" },
                shippingDetails: {
                    "@type": "OfferShippingDetails",
                    shippingRate: {
                        "@type": "MonetaryAmount",
                        value: "0",
                        currency: "USD",
                    },
                    shippingDestination: {
                        "@type": "DefinedRegion",
                        addressCountry: "US",
                    },
                    deliveryTime: {
                        "@type": "ShippingDeliveryTime",
                        handlingTime: {
                            "@type": "QuantitativeValue",
                            minValue: 1,
                            maxValue: 2,
                            unitCode: "DAY",
                        },
                        transitTime: {
                            "@type": "QuantitativeValue",
                            minValue: 3,
                            maxValue: 7,
                            unitCode: "DAY",
                        },
                    },
                },
                hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    applicableCountry: "US",
                    returnPolicyCategory:
                        "https://schema.org/MerchantReturnFiniteReturnWindow",
                    merchantReturnDays: 30,
                    returnMethod: "https://schema.org/ReturnByMail",
                    returnFees: "https://schema.org/FreeReturn",
                },
            },
        }
        : null;

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            )}
            <ProductClient />
        </>
    );
}


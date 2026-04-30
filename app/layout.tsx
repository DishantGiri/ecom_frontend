import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import ToasterProvider from "./components/ToasterProvider";
import ErrorBoundary from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "HealthcareDrugstore.com | Premium Pharmaceutical Access",
  description: "Elite medical solutions and high-quality health products for optimal performance and wellness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_HOST || "https://api.healthcaredrugstore.com"} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_HOST || "https://api.healthcaredrugstore.com"} />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <CurrencyProvider>
            <ToasterProvider />
            {/* Global SEO Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "HealthcareDrugstore",
                  "url": "https://healthcaredrugstore.com",
                  "logo": "https://healthcaredrugstore.com/logo.png",
                  "description": "Premium health and wellness supplements for optimal performance.",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "US"
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "email": "support@healthcaredrugstore.com"
                  }
                })
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "HealthcareDrugstore",
                  "url": "https://healthcaredrugstore.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://healthcaredrugstore.com/products?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                })
              }}
            />
            <Navbar />
            <ErrorBoundary>
              <main>
                {children}
              </main>
            </ErrorBoundary>
            <Footer />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

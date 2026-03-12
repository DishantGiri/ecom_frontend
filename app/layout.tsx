import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import ToasterProvider from "./components/ToasterProvider";
import ErrorBoundary from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Lorem | Premium Supplements",
  description: "High quality health products for better performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="http://209.126.86.149:8083" />
        <link rel="dns-prefetch" href="http://209.126.86.149:8083" />
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
                  "name": "Lorem",
                  "url": "http://209.126.86.149:3083",
                  "logo": "http://209.126.86.149:3083/logo.png",
                  "description": "Premium health and wellness supplements for optimal performance.",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "US"
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "email": "support@lorem.com"
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
                  "name": "Lorem",
                  "url": "http://209.126.86.149:3083",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "http://209.126.86.149:3083/products?q={search_term_string}",
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

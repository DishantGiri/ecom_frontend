import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import ToasterProvider from "./components/ToasterProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Script from "next/script";

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

        {/* Google Translate Script */}
        <Script
          id="google-translate-script"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }

            // Force hide the google translate bar if it appears
            const hideGoogleTranslateBar = () => {
              const banner = document.querySelector('.goog-te-banner-frame');
              if (banner) {
                banner.style.display = 'none';
                document.body.style.top = '0px';
              }
            };
            
            setInterval(hideGoogleTranslateBar, 500);
          `}
        </Script>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
      </body>
    </html>
  );
}

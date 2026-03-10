import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import ToasterProvider from "./components/ToasterProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <CurrencyProvider>
            <ToasterProvider />
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCurrency } from "./CurrencyProvider";

const CURRENCIES = [
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "au" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "br" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "ca" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "ch" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "cn" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "cz" },
  { code: "DKK", name: "Danish Krone", symbol: "kr.", flag: "dk" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "eu" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "gb" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "hk" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "hu" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "id" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "il" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "in" },
  { code: "ISK", name: "Icelandic Króna", symbol: "kr", flag: "is" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "jp" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "mx" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "my" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "no" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "nz" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "ph" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł", flag: "pl" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "ro" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "se" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "sg" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "th" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "tr" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "us" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "za" }
];

const BANNER_HEIGHT = 40; // px — height of announcement bar

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navTop, setNavTop] = useState(BANNER_HEIGHT);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { currency, setCurrency, currencySymbol } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("ecom_token");
    setIsLoggedIn(!!auth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      // Track how much of the announcement bar is still visible
      const bannerOffset = Math.max(0, BANNER_HEIGHT - y);
      setNavTop(bannerOffset);

      // Show/hide navbar based on scroll direction
      if (y < lastScrollY) {
        // Scrolling UP — always show navbar
        setNavVisible(true);
      } else if (y > lastScrollY && y > BANNER_HEIGHT + 60) {
        // Scrolling DOWN past banner + some threshold — hide navbar
        setNavVisible(false);
        setIsAccountOpen(false);
      }

      setLastScrollY(y);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "ecom_token=; path=/; max-age=0";
    document.cookie = "ecom_role=; path=/; max-age=0";
    setIsLoggedIn(false);
    setIsAccountOpen(false);
    router.push("/");
  };

  const slides = [
    "Limited Time: Free Medical Consultation with Fat Loss Kit purchase",
    "NEW YEAR'S SALE | Buy 2 Get 1 FREE on All Kits",
    "Global Shipping Available | Track Your Order in Real-Time",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header className="font-sans w-full">
      {/* ── ANNOUNCEMENT BAR — normal document flow, scrolls away ── */}
      <div className="w-full bg-navy text-white text-[11px] md:text-sm tracking-wide font-semibold uppercase overflow-hidden"
        style={{ height: `${BANNER_HEIGHT}px` }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <button onClick={prevSlide} className="hover:text-accent-red transition-colors p-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 relative h-5 overflow-hidden mx-4">
            {slides.map((slide, index) => (
              <div key={index} className={`absolute inset-0 w-full text-center transition-all duration-700 ease-in-out ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                {slide}
              </div>
            ))}
          </div>
          <button onClick={nextSlide} className="hover:text-accent-red transition-colors p-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>


      {/* ── MAIN NAVBAR — fixed, tracks banner offset, hides/shows on scroll ── */}
      <nav
        className={`fixed left-0 right-0 z-[999] w-full bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ease-in-out ${navVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        style={{ top: `${navTop}px` }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between gap-8">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <div className="bg-navy p-1.5 rounded-md">
              <div className="w-8 h-8 flex items-center justify-center text-white font-black text-xl italic">L</div>
            </div>
            <Link href="/" className="text-2xl font-black text-navy tracking-tighter uppercase flex items-baseline">
              Lorem<span className="text-accent-red text-4xl leading-none">.</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {[["All Products", "/products"], ["Blogs", "/blogs"], ["About us", "/about-us"], ["Contact", "/contact"]].map(([label, href]) => (
              <Link key={label} href={href} className="text-sm font-bold text-navy hover:text-accent-red transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Utilities */}
          <div className="flex items-center space-x-4 xl:space-x-6">
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
                if (query.trim()) {
                  router.push(`/products?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              className="hidden md:flex items-center relative group"
            >
              <input
                name="search"
                type="text"
                placeholder="Search..."
                className="pl-4 pr-10 py-2 w-36 xl:w-56 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/30"
              />
              <button type="submit" className="absolute right-3 text-navy/40 group-focus-within:text-accent-red transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </button>
            </form>

            {/* Currency */}
            <div className="relative">
              <div
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-navy text-white rounded-xl font-bold text-[13px] cursor-pointer hover:bg-navy-dark transition-all group"
              >
                <img src={`https://flagcdn.com/w20/${CURRENCIES.find(c => c.code === currency)?.flag || 'us'}.png`} alt={currency} className="w-5 h-auto object-cover rounded-sm" />
                <span className="text-[13px] font-bold ml-1">{currency} {currencySymbol}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`opacity-50 group-hover:opacity-100 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </div>

              {isCurrencyOpen && (
                <div onMouseLeave={() => setIsCurrencyOpen(false)} className="absolute top-full right-0 mt-3 w-56 max-h-[400px] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 hide-scrollbar py-2">
                  <div className="flex flex-col">
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => { setCurrency(curr.code); setIsCurrencyOpen(false); }}
                        className={`text-left px-4 py-2.5 flex items-start space-x-3 transition-colors ${currency === curr.code ? 'bg-navy/5' : 'hover:bg-gray-50'}`}
                      >
                        <img src={`https://flagcdn.com/w20/${curr.flag}.png`} alt={curr.code} className="w-5 h-auto object-cover rounded-sm mt-0.5" />
                        <div className="flex flex-col">
                          <span className={`text-[13px] leading-tight ${currency === curr.code ? 'font-black text-navy' : 'font-medium text-navy/80'}`}>{curr.name}</span>
                          <span className="text-[11px] font-bold text-navy/40 mt-0.5 uppercase tracking-wider">{curr.code} ({curr.symbol})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => { setIsAccountOpen(true); setIsLoggedIn(!!localStorage.getItem("ecom_token")); }}
                className="flex items-center space-x-2 px-4 py-2 bg-navy text-white rounded-xl font-bold text-[13px] hover:bg-navy-dark transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span>{isLoggedIn ? "Account" : "Sign In"}</span>
              </button>

              {isAccountOpen && (
                <div onMouseLeave={() => setIsAccountOpen(false)} className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-5 pb-2 border-b border-gray-50">
                    <h3 className="text-[15px] font-black text-navy leading-none">{isLoggedIn ? "Welcome Back" : "Welcome to Ecom"}</h3>
                    <p className="text-[12px] text-navy/50 font-medium mt-1">{isLoggedIn ? "You are securely signed in" : "Sign in to manage your orders"}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {!isLoggedIn ? (
                      <>
                        <Link href="/login" className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                          <div className="w-7 h-7 rounded-full bg-navy/5 flex items-center justify-center text-navy group-hover:text-accent-red">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                          </div>
                          <span className="font-black text-navy text-[14px]">Login</span>
                        </Link>
                        <Link href="/signup" className="flex items-center space-x-3 w-full p-3 bg-navy text-white hover:bg-navy-dark rounded-xl transition-all shadow-lg group">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                          </div>
                          <span className="font-black text-[14px] tracking-tight">Create Account</span>
                        </Link>
                      </>
                    ) : (
                      <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-3 bg-red-50 text-accent-red hover:bg-red-100 rounded-xl transition-all cursor-pointer font-black text-[14px]">
                        <div className="w-7 h-7 rounded-full bg-accent-red/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </div>
                        <span>Logout</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind the fixed navbar */}
      <div style={{ height: "80px" }} />
    </header>
  );
};

export default Navbar;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCurrency } from "./CurrencyProvider";
import { useLanguage, LANGUAGES } from "./LanguageProvider";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navTop, setNavTop] = useState(BANNER_HEIGHT);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { currency, setCurrency, currencySymbol } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { language, setLanguage, currentLanguageName, currentLanguageFlag } = useLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

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

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
    setIsLanguageOpen(false);
    setIsCurrencyOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header className="font-sans w-full">
      {/* ── ANNOUNCEMENT BAR — normal document flow, scrolls away ── */}
      <div className="w-full bg-navy text-white text-[10px] md:text-sm tracking-wide font-semibold uppercase overflow-hidden"
        style={{ height: `${BANNER_HEIGHT}px` }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-full flex items-center justify-between">
          <button onClick={prevSlide} className="hover:text-accent-red transition-colors p-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 relative h-4 overflow-hidden mx-2">
            {slides.map((slide, index) => (
              <div key={index} className={`absolute inset-0 w-full text-center transition-all duration-700 ease-in-out truncate px-2 ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                {slide}
              </div>
            ))}
          </div>
          <button onClick={nextSlide} className="hover:text-accent-red transition-colors p-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>


      {/* ── MAIN NAVBAR — fixed, tracks banner offset, hides/shows on scroll ── */}
      <nav
        className={`fixed left-0 right-0 z-[999] w-full bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ease-in-out ${navVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        style={{ top: `${navTop}px` }}
        translate="no"
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4 xl:gap-8">

          {/* Mobile: Hamburger */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-navy hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            </button>
          </div>

          {/* Logo — centered on mobile, left-aligned on desktop */}
          <div className="flex-shrink-0 flex items-center space-x-2 md:space-x-3 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <div className="bg-navy p-2 rounded-xl flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white font-black text-sm md:text-base italic">L</div>
            </div>
            <Link href="/" className="text-xl md:text-2xl font-black text-navy tracking-tight uppercase flex items-baseline leading-none">
              Lorem<span className="text-accent-red text-2xl md:text-3xl font-black">.</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8 flex-1 min-w-0">
            {[["All Products", "/products"], ["Blogs", "/blogs"], ["About us", "/about-us"], ["Contact", "/contact"]].map(([label, href]) => (
              <Link key={label} href={href} className="text-sm font-bold text-navy hover:text-accent-red transition-colors whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Utilities */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-shrink-0 min-w-0">
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
              className="flex items-center relative group"
            >
              <input
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-4 pr-10 py-2 w-36 xl:w-60 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/30"
              />
              <button type="submit" className="absolute right-3 text-navy/40 group-focus-within:text-accent-red transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </button>
            </form>

            <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
              {/* Language */}
              <div className="relative flex-shrink-0">
                <div
                  onClick={() => {
                    setIsLanguageOpen(!isLanguageOpen);
                    setIsCurrencyOpen(false);
                    setIsAccountOpen(false);
                    if (!isLanguageOpen) setLangSearch("");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-navy rounded-xl font-bold text-[13px] cursor-pointer hover:bg-gray-100 transition-all group border border-gray-100 flex-shrink-0"
                >
                  <img src={`https://flagcdn.com/w20/${currentLanguageFlag}.png`} alt={currentLanguageName} className="w-5 h-auto object-cover rounded-sm flex-shrink-0" />
                  <span translate="no" className="text-[11px] font-black uppercase tracking-wide">{language.slice(0, 2)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`opacity-50 group-hover:opacity-100 transition-transform flex-shrink-0 ${isLanguageOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                </div>

                {isLanguageOpen && (
                  <div onMouseLeave={() => setIsLanguageOpen(false)} className="absolute top-full right-0 mt-3 w-64 max-h-[420px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-50 bg-white sticky top-0 z-10">
                      <div className="relative group">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search language..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-navy focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 transition-all placeholder:text-navy/30"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy/30 group-focus-within:text-accent-red transition-colors"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar py-2">
                      {filteredLanguages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setIsLanguageOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition-colors ${language === lang.code ? 'bg-navy/5' : 'hover:bg-gray-50'}`}
                        >
                          <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt={lang.name} className="w-5 h-auto object-cover rounded-sm flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className={`text-[13px] leading-tight ${language === lang.code ? 'font-black text-navy' : 'font-medium text-navy/80'}`}>{lang.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Currency */}
              <div className="relative flex-shrink-0">
                <div
                  onClick={() => { setIsCurrencyOpen(!isCurrencyOpen); setIsLanguageOpen(false); setIsAccountOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white rounded-xl font-bold text-[13px] cursor-pointer hover:bg-navy/90 transition-all group flex-shrink-0"
                >
                  <img src={`https://flagcdn.com/w20/${CURRENCIES.find(c => c.code === currency)?.flag || 'us'}.png`} alt={currency} className="w-5 h-auto object-cover rounded-sm flex-shrink-0" />
                  <span translate="no" className="text-[11px] font-black whitespace-nowrap">{currency}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`opacity-50 group-hover:opacity-100 transition-transform flex-shrink-0 ${isCurrencyOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                </div>

                {isCurrencyOpen && (
                  <div onMouseLeave={() => setIsCurrencyOpen(false)} className="absolute top-full right-0 mt-3 w-72 max-h-[420px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-50 bg-white sticky top-0 z-10">
                      <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] px-1">Select Currency</p>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        {CURRENCIES.map(curr => (
                          <button
                            key={curr.code}
                            onClick={() => { setCurrency(curr.code); setIsCurrencyOpen(false); }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${currency === curr.code ? 'bg-navy border-navy text-white shadow-lg shadow-navy/20' : 'bg-white border-gray-100 text-navy hover:border-gray-200 hover:bg-gray-50'}`}
                          >
                            <img src={`https://flagcdn.com/w20/${curr.flag}.png`} alt="" className="w-5 h-auto rounded-sm flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span translate="no" className="text-[11px] font-black uppercase tracking-tight leading-none">{curr.code}</span>
                              <span translate="no" className={`text-[10px] font-medium truncate leading-tight mt-0.5 ${currency === curr.code ? 'text-white/60' : 'text-navy/40'}`}>{curr.symbol}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => { setIsAccountOpen(!isAccountOpen); setIsCurrencyOpen(false); setIsLanguageOpen(false); }}
                  onMouseEnter={() => { setIsAccountOpen(true); setIsLoggedIn(!!localStorage.getItem("ecom_token")); setIsCurrencyOpen(false); setIsLanguageOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white rounded-xl font-bold text-[13px] hover:bg-navy/90 transition-all flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <span className="text-[11px] font-black">{isLoggedIn ? "Account" : "Sign In"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Search icon — right side to balance hamburger */}
          <div className="flex lg:hidden items-center">
            <Link href="/products" className="p-2 text-navy hover:bg-gray-50 rounded-lg transition-colors" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <div translate="no" className={`fixed inset-0 z-[1000] lg:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer */}
        <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-white shadow-[0_0_60px_rgba(0,31,63,0.15)] transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-navy w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20">
                <div className="text-white font-black text-[14px] italic">L</div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-navy text-[15px] uppercase tracking-wider leading-none">Menu</span>
                <span className="text-[10px] text-navy/30 font-bold uppercase tracking-widest mt-1.5 leading-none">Navigation & Settings</span>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 text-navy rounded-full hover:bg-gray-100 transition-all active:scale-90"
              aria-label="Close Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col hide-scrollbar">

            {/* Main Nav Links */}
            <nav className="px-4 pt-4 pb-2">
              {[["All Products", "/products"], ["Blogs", "/blogs"], ["About Us", "/about-us"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center justify-between py-3.5 px-3 rounded-xl group hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-[15px] font-extrabold text-navy group-hover:text-accent-red transition-colors uppercase tracking-wide">{label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20 group-hover:text-accent-red transition-colors"><path d="m9 18 6-6-6-6" /></svg>
                </Link>
              ))}
            </nav>

            <div className="mx-4 my-4 h-px bg-gray-100" />

            {/* Shop Settings */}
            <div className="px-4 pb-6 space-y-6">
              <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] px-1">Shop Settings</p>

              {/* Language Picker */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-navy/40 uppercase tracking-widest px-1">Global Language</label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/25 pointer-events-none"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-navy/30 focus:bg-white transition-all placeholder:text-navy/25"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                  {filteredLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-95 ${language === lang.code ? 'bg-navy border-navy text-white shadow-lg shadow-navy/20' : 'bg-white border-gray-100 text-navy hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt="" className="w-5 h-auto rounded-sm flex-shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-tight truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Picker */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-navy/40 uppercase tracking-widest px-1">Shop Currency</label>
                <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {CURRENCIES.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border transition-all active:scale-95 ${currency === curr.code ? 'bg-navy border-navy text-white shadow-lg shadow-navy/20' : 'bg-white border-gray-100 text-navy hover:bg-gray-50 hover:border-gray-200'}`}
                    >
                      <img src={`https://flagcdn.com/w20/${curr.flag}.png`} alt="" className="w-5 h-auto rounded-sm" />
                      <span className="text-[9px] font-black uppercase tracking-wider leading-none">{curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-4 h-px bg-gray-100" />

            {/* Auth section */}
            <div className="px-4 py-6">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Link href="/profile" className="flex items-center gap-3 w-full px-4 py-4 bg-navy text-white rounded-2xl shadow-lg shadow-navy/20 active:scale-[0.98] transition-transform group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="text-[13px] font-black uppercase tracking-tight">Your Account</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Manage details</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 flex-shrink-0"><path d="m9 18 6-6-6-6" /></svg>
                  </Link>
                  <button onClick={handleLogout} className="w-full py-4 border border-red-100 text-accent-red font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="py-4 text-center bg-navy text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl shadow-lg shadow-navy/20 active:scale-[0.98] transition-all">Sign In</Link>
                  <Link href="/signup" className="py-4 text-center border border-navy/20 text-navy font-black text-xs uppercase tracking-[0.15em] rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-50">Create Account</Link>
                </div>
              )}
            </div>

            <div className="px-4 pb-8 text-center">
              <p className="text-[10px] font-bold text-navy/20 uppercase tracking-[0.15em]">© 2024 Lorem Premium Supplements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer so content doesn't hide behind the fixed navbar */}
      <div className="h-16 md:h-20" />
    </header>
  );
};

export default Navbar;

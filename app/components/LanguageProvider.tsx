"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Language {
    code: string;
    name: string;
    flag: string;
}

export const LANGUAGES: Language[] = [
    { code: "en", name: "English", flag: "us" },
    { code: "es", name: "Español", flag: "es" },
    { code: "fr", name: "Français", flag: "fr" },
    { code: "de", name: "Deutsch", flag: "de" },
    { code: "it", name: "Italiano", flag: "it" },
    { code: "pt", name: "Português", flag: "pt" },
    { code: "hi", name: "हिन्दी", flag: "in" },
    { code: "ar", name: "العربية", flag: "sa" },
    { code: "zh", name: "中文 (简体)", flag: "cn" },
    { code: "ja", name: "日本語", flag: "jp" },
    { code: "ru", name: "Русский", flag: "ru" },
    { code: "ko", name: "한국어", flag: "kr" },
    { code: "tr", name: "Türkçe", flag: "tr" },
    { code: "vi", name: "Tiếng Việt", flag: "vn" },
    { code: "th", name: "ไทย", flag: "th" },
    { code: "id", name: "Bahasa Indonesia", flag: "id" },
    { code: "nl", name: "Nederlands", flag: "nl" },
    { code: "sv", name: "Svenska", flag: "se" },
    { code: "pl", name: "Polski", flag: "pl" },
    { code: "bn", name: "বাংলা", flag: "bd" },
    { code: "pa", name: "ਪੰਜਾਬੀ", flag: "in" },
    { code: "te", name: "తెలుగు", flag: "in" },
    { code: "mr", name: "मराठी", flag: "in" },
    { code: "ta", name: "தமிழ்", flag: "in" },
    { code: "ur", name: "اردو", flag: "pk" },
    { code: "el", name: "Ελληνικά", flag: "gr" },
    { code: "he", name: "עברית", flag: "il" },
    { code: "fa", name: "فارسی", flag: "ir" },
    { code: "cs", name: "Čeština", flag: "cz" },
    { code: "da", name: "Dansk", flag: "dk" },
    { code: "fi", name: "Suomi", flag: "fi" },
    { code: "no", name: "Norsk", flag: "no" },
    { code: "ro", name: "Română", flag: "ro" },
    { code: "uk", name: "Українська", flag: "ua" },
    { code: "hu", name: "Magyar", flag: "hu" },
    { code: "ms", name: "Bahasa Melayu", flag: "my" },
    { code: "sk", name: "Slovenčina", flag: "sk" },
    { code: "hr", name: "Hrvatski", flag: "hr" },
    { code: "bg", name: "Български", flag: "bg" },
];

interface LanguageContextType {
    language: string;
    setLanguage: (code: string) => void;
    currentLanguageName: string;
    currentLanguageFlag: string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    currentLanguageName: "English",
    currentLanguageFlag: "us",
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState("en");

    useEffect(() => {
        const savedLang = localStorage.getItem("preferred_language");
        if (savedLang) {
            setLanguageState(savedLang);
        } else {
            const browserLang = navigator.language.split('-')[0];
            const supportedLang = LANGUAGES.find(l => l.code === browserLang);
            if (supportedLang) {
                setLanguageState(supportedLang.code);
            }
        }

        // Initialize Google Translate
        const addScript = () => {
            const script = document.createElement("script");
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
            (window as any).googleTranslateElementInit = () => {
                new (window as any).google.translate.TranslateElement(
                    { pageLanguage: "en", autoDisplay: false },
                    "google_translate_element"
                );
            };
        };

        if (!(window as any).googleTranslateElementInit) {
            addScript();
        }
    }, []);

    useEffect(() => {
        const translatePage = () => {
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (select) {
                select.value = language;
                select.dispatchEvent(new Event("change"));
            } else {
                // Retry if the element isn't ready yet
                setTimeout(translatePage, 1000);
            }
        };

        // Update cookie as well for better persistence
        document.cookie = `googtrans=/en/${language}; path=/; domain=${window.location.host}`;
        document.cookie = `googtrans=/en/${language}; path=/`;

        translatePage();
    }, [language]);

    const setLanguage = (code: string) => {
        setLanguageState(code);
        localStorage.setItem("preferred_language", code);
    };

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            currentLanguageName: currentLang.name,
            currentLanguageFlag: currentLang.flag
        }}>
            {children}
            <div id="google_translate_element" style={{ display: 'none' }} />
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

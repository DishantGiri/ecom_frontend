"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserIP, getCountryByIP } from "../utils/tracking";

interface CurrencyContextType {
    currency: string;
    currencySymbol: string;
    setCurrency: (currency: string) => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$", AUD: "A$", BRL: "R$", CAD: "C$", CHF: "CHF", CNY: "¥", CZK: "Kč",
    DKK: "kr.", EUR: "€", GBP: "£", HKD: "HK$", HUF: "Ft", IDR: "Rp", ILS: "₪",
    INR: "₹", ISK: "kr", JPY: "¥", KRW: "₩", MXN: "Mex$", MYR: "RM", NOK: "kr",
    NZD: "NZ$", PHP: "₱", PLN: "zł", RON: "lei", SEK: "kr", SGD: "S$", THB: "฿",
    TRY: "₺", ZAR: "R"
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
    "Australia": "AUD", "Brazil": "BRL", "Canada": "CAD", "Switzerland": "CHF", "Liechtenstein": "CHF",
    "China": "CNY", "Czechia": "CZK", "Czech Republic": "CZK", "Denmark": "DKK",
    "Germany": "EUR", "France": "EUR", "Italy": "EUR", "Spain": "EUR", "Netherlands": "EUR", "Belgium": "EUR", "Austria": "EUR", "Portugal": "EUR", "Finland": "EUR", "Greece": "EUR", "Ireland": "EUR",
    "United Kingdom": "GBP", "Hong Kong": "HKD", "Hungary": "HUF", "Indonesia": "IDR", "Israel": "ILS",
    "India": "INR", "Iceland": "ISK", "Japan": "JPY", "South Korea": "KRW", "Mexico": "MXN",
    "Malaysia": "MYR", "Norway": "NOK", "New Zealand": "NZD", "Philippines": "PHP", "Poland": "PLN",
    "Romania": "RON", "Sweden": "SEK", "Singapore": "SGD", "Thailand": "THB", "Turkey": "TRY", "Türkiye": "TRY",
    "South Africa": "ZAR", "United States": "USD"
};

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "USD",
    currencySymbol: "$",
    setCurrency: () => { },
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState("USD");

    useEffect(() => {
        const stored = sessionStorage.getItem("session_currency");
        if (stored) {
            setCurrencyState(stored);
        } else {
            (async () => {
                const ip = await getUserIP();
                if (ip) {
                    const country = await getCountryByIP(ip);
                    if (country && COUNTRY_TO_CURRENCY[country]) {
                        setCurrencyState(COUNTRY_TO_CURRENCY[country]);
                        // Don't save to localStorage so it can update if they travel, 
                        // unless they manually select.
                        return;
                    }
                }
                setCurrencyState("USD");
            })();
        }
    }, []);

    const setCurrency = (curr: string) => {
        setCurrencyState(curr);
        sessionStorage.setItem("session_currency", curr);
    };

    const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

    return (
        <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);

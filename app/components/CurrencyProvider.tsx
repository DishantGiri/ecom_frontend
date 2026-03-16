"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiHost } from "../utils/apiHost";


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
        // Only respect sessionStorage if the user MANUALLY selected a currency.
        // Auto-detected values are never cached so proxy/VPN changes take effect immediately.
        const manualPick = sessionStorage.getItem("currency_manual");
        if (manualPick) {
            setCurrencyState(manualPick);
            return;
        }

        // Auto-detect from IP
        (async () => {
            try {
                // Short timeout so a slow geoip lookup doesn't block the page
                const ipRes = await Promise.race([
                    fetch("https://api.ipify.org?format=json"),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
                ]) as Response;
                const { ip } = await ipRes.json();

                const countryRes = await Promise.race([
                    fetch(`${apiHost}/api/track/country?ipAddress=${ip}`),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
                ]) as Response;
                const { country } = await countryRes.json();

                if (country && COUNTRY_TO_CURRENCY[country]) {
                    setCurrencyState(COUNTRY_TO_CURRENCY[country]);
                    return;
                }
            } catch {
                // Network/timeout — silently fall back to USD
            }
            setCurrencyState("USD");
        })();
    }, []);

    // Manual selection — stored separately so it's not confused with auto-detection
    const setCurrency = React.useCallback((curr: string) => {
        setCurrencyState(curr);
        sessionStorage.setItem("currency_manual", curr);
    }, []);

    const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

    const contextValue = React.useMemo(() => ({
        currency,
        currencySymbol,
        setCurrency
    }), [currency, currencySymbol, setCurrency]);

    return (
        <CurrencyContext.Provider value={contextValue}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);

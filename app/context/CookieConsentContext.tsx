"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Consent = null | "accepted" | "analytics" | "rejected";

type CookieConsentContextType = {
  consent: Consent;
  setConsent: (value: Exclude<Consent, null>) => void;
  showBanner: boolean;
  resetConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

function readConsentCookie(): Consent {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  const value = match?.[1];
  if (value === "accepted" || value === "analytics" || value === "rejected") return value;
  return null;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<Consent>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = readConsentCookie();
    if (stored) {
      setConsentState(stored);
    } else {
      setShowBanner(true);
    }
  }, []);

  const setConsent = (value: Exclude<Consent, null>) => {
    document.cookie = `cookie_consent=${value}; max-age=31536000; path=/; SameSite=Lax; Secure`;
    setConsentState(value);
    setShowBanner(false);
  };

  const resetConsent = () => {
    document.cookie = "cookie_consent=; max-age=0; path=/; SameSite=Lax; Secure";
    setConsentState(null);
    setShowBanner(true);
  };

  return (
    <CookieConsentContext.Provider value={{ consent, setConsent, showBanner, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return context;
}

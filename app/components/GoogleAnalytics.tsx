"use client";

import { useEffect } from "react";
import { useCookieConsent } from "../context/CookieConsentContext";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent !== "accepted" && consent !== "analytics") return;
    if (!GA_ID) return;
    if (document.getElementById("ga-script")) return;

    const script = document.createElement("script");
    script.id = "ga-script";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
      cookie_flags: "SameSite=Lax;Secure",
    });
  }, [consent]);

  return null;
}

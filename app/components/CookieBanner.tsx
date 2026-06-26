"use client";

import { useState } from "react";
import { useCookieConsent } from "../context/CookieConsentContext";
import { useLanguage } from "../context/LanguageContext";
import styles from "./CookieBanner.module.css";

const translations = {
  nl: {
    title: "Cookies",
    description:
      "We gebruiken analytische cookies om bezoekersverkeer te meten. Je kunt altijd je keuze aanpassen.",
    reject: "Allergisch",
    settings: "Instellingen",
    accept: "Accepteren",
    settingsTitle: "Cookie-instellingen",
    necessary: "Noodzakelijk",
    necessaryDesc: "Sessie en cookiekeuze",
    analytics: "Analytisch",
    analyticsDesc: "Google Analytics — verkeer en herkomst",
    save: "Opslaan",
  },
  en: {
    title: "Cookies",
    description:
      "We use analytical cookies to measure visitor traffic. You can always change your preference.",
    reject: "Allergic",
    settings: "Settings",
    accept: "Accept",
    settingsTitle: "Cookie settings",
    necessary: "Necessary",
    necessaryDesc: "Session and cookie preference",
    analytics: "Analytics",
    analyticsDesc: "Google Analytics — traffic and referrals",
    save: "Save",
  },
};

const CookieIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="#d6c48f" strokeWidth="1.5" />
    <circle cx="8" cy="9" r="1.5" fill="#d6c48f" />
    <circle cx="15" cy="8" r="1" fill="#d6c48f" />
    <circle cx="14" cy="15" r="1.5" fill="#d6c48f" />
    <circle cx="9" cy="15" r="1" fill="#d6c48f" />
    <circle cx="17" cy="13" r="1" fill="#d6c48f" />
  </svg>
);

export default function CookieBanner() {
  const { showBanner, setConsent } = useCookieConsent();
  const { language } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  if (!showBanner) return null;

  const t = translations[language];

  const handleSave = () => {
    setConsent(analyticsEnabled ? "analytics" : "rejected");
  };

  return (
    <>
      <div className={styles.overlay} />
      <div className={styles.wrapper}>
        {showSettings && (
          <div className={styles.settingsPanel}>
            <p className={styles.settingsTitle}>{t.settingsTitle}</p>

            <div className={styles.category}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>{t.necessary}</span>
                <span className={styles.categoryDesc}>{t.necessaryDesc}</span>
              </div>
              <button
                role="switch"
                aria-checked="true"
                disabled
                className={`${styles.toggle} ${styles.toggleOn} ${styles.toggleDisabled}`}
              >
                <span className={`${styles.toggleCircle} ${styles.toggleCircleOn}`} />
              </button>
            </div>

            <div className={styles.category}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>{t.analytics}</span>
                <span className={styles.categoryDesc}>{t.analyticsDesc}</span>
              </div>
              <button
                role="switch"
                aria-checked={analyticsEnabled}
                onClick={() => setAnalyticsEnabled((v) => !v)}
                className={`${styles.toggle} ${analyticsEnabled ? styles.toggleOn : styles.toggleOff}`}
              >
                <span
                  className={`${styles.toggleCircle} ${
                    analyticsEnabled ? styles.toggleCircleOn : styles.toggleCircleOff
                  }`}
                />
              </button>
            </div>

            <div className={styles.saveRow}>
              <button className={styles.btnAccept} onClick={handleSave}>
                {t.save}
              </button>
            </div>
          </div>
        )}

        <div className={styles.banner}>
          <div className={styles.content}>
            <div className={styles.titleRow}>
              <CookieIcon />
              <span className={styles.title}>{t.title}</span>
            </div>
            <p className={styles.description}>{t.description}</p>
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.btnReject}
              onClick={() => setConsent("rejected")}
            >
              {t.reject}
            </button>
            <button
              className={styles.btnSettings}
              onClick={() => setShowSettings((v) => !v)}
            >
              {t.settings}
            </button>
            <button
              className={styles.btnAccept}
              onClick={() => setConsent("accepted")}
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

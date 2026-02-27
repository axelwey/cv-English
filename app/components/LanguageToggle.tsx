"use client";

import { useLanguage } from "../context/LanguageContext";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={styles.wrapper}>
      <button
        onClick={toggleLanguage}
        className={`${styles.toggle} ${
          language === "en" ? styles.active : ""
        }`}
        aria-label="Toggle language"
      >
        <span className={styles.circle} />
      </button>
      <span className={styles.label}>
        {language === "nl" ? "NL" : "EN"}
      </span>
    </div>
  );
}

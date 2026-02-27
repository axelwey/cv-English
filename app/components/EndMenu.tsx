"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function EndMenu() {
  const { language } = useLanguage();

  const content = {
    nl: { home: "Home", over: "Over", contact: "Contact" },
    en: { home: "Home", over: "About", contact: "Contact" }
  };

  const t = content[language];

  return (
    <div className="end-menu">
      <nav className="end-menu__nav">
        <Link href="/">{t.home}</Link>
        <Link href="/over">{t.over}</Link>
        <Link href="/contact">{t.contact}</Link>
      </nav>
    </div>
  );
}

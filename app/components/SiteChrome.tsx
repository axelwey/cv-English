"use client";

import { usePathname } from "next/navigation";
import { LanguageProvider } from "../context/LanguageContext";
import EndMenu from "./EndMenu";
import LanguageToggle from "./LanguageToggle";
import CookieBanner from "./CookieBanner";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <LanguageProvider>
      <EndMenu />
      <LanguageToggle />
      {children}
      <CookieBanner />
    </LanguageProvider>
  );
}

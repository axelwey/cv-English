import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EndMenu from "./components/EndMenu";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageToggle from "./components/LanguageToggle";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axel Weyers",
  description: "IT & Cloud & Cybersecurity Student",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <EndMenu />
          <LanguageToggle />
          {children}
        </LanguageProvider>

        <Analytics />
      </body>
    </html>
  );
}

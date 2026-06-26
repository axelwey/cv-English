# Cookie banner + Google Analytics — implementatieplan

## 1. Overzicht

Dit document beschrijft de volledige implementatie van een GDPR-conforme cookiebanner met Google Analytics 4 (GA4) integratie voor het portfolio/CV project (`cv-English`). De banner volgt het bestaande visuele thema van de site.

---

## 2. Design specificaties

### 2.1 Kleurenpalet (uit `globals.css`)

| Token | Hex | Gebruik |
|---|---|---|
| Achtergrond site | `#050b18` | Achtergrond banner/overlay |
| Banner achtergrond | `rgba(8, 16, 32, 0.92)` | Semi-transparant, matcht site |
| Goud/crème primair | `#f5f0e6` | Tekst titels, accepteer-knop achtergrond |
| Goud accent | `#d6c48f` | Cookie-icoon, border accenten |
| Tekst secundair | `rgba(255, 255, 255, 0.4)` | Beschrijvingstekst |
| Border kleur | `rgba(214, 196, 143, 0.15)` | Bovenlijn banner |
| Knop border | `rgba(214, 196, 143, 0.25)` | Instellingen-knop |
| Knop afwijzen border | `rgba(255, 255, 255, 0.1)` | Allergisch-knop |
| Knop afwijzen tekst | `rgba(255, 255, 255, 0.4)` | Allergisch-knop tekst |
| Toggle aan | `rgba(214, 196, 143, 0.5)` | Noodzakelijke cookies toggle |
| Toggle uit | `rgba(255, 255, 255, 0.1)` | Analytische cookies toggle |

### 2.2 Typografie

- Font: `Inter, system-ui, sans-serif` (al geladen in het project)
- Banner titel: `13px`, `font-weight: 500`, kleur `#f5f0e6`
- Banner beschrijving: `11.5px`, kleur `rgba(255, 255, 255, 0.4)`, `line-height: 1.5`
- Knoppen: `12px`
- Instellingen labels: `12px`, `font-weight: 500`
- Instellingen beschrijving: `11px`, `rgba(255, 255, 255, 0.3)`

### 2.3 Banner layout (compacte balk)

De banner is een horizontale balk die fixed onderaan de pagina verschijnt. Layout is `display: flex` met tekst links en knoppen rechts.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🍪 Cookies                                                      │
│ We gebruiken analytische cookies     [Allergisch] [Inst.] [OK]  │
│ om bezoekersverkeer te meten.                                    │
└─────────────────────────────────────────────────────────────────┘
```

- Padding: `14px 20px`
- Gap tussen tekst en knoppen: `14px`
- Achtergrond: `rgba(8, 16, 32, 0.92)` met `backdrop-filter: blur(12px)`
- Bovenborder: `1px solid rgba(214, 196, 143, 0.15)`
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999`
- Op mobiel wrappen de knoppen naar een nieuwe regel

### 2.4 Drie knoppen

| Knop | Stijl | Actie |
|---|---|---|
| **Allergisch** 🤧 | Transparant, subtiele border `rgba(255,255,255,0.1)`, tekst `rgba(255,255,255,0.4)` | Weiger alle niet-noodzakelijke cookies, sla `cookie_consent=rejected` op, verberg banner |
| **Instellingen** | Transparant, gouden border `rgba(214,196,143,0.25)`, tekst `rgba(245,240,230,0.7)` | Open het instellingenpaneel |
| **Accepteren** | Solid `#f5f0e6`, tekst `#050b18`, `font-weight: 500` | Accepteer alle cookies, sla `cookie_consent=accepted` op, laad GA4, verberg banner |

Knoppen: `padding: 7px 14px`, `border-radius: 6px`.

### 2.5 Instellingenpaneel

Het instellingenpaneel verschijnt als overlay/modal boven de banner wanneer de gebruiker op "Instellingen" klikt. Het bevat twee categorieën (GEEN marketing cookies):

**Categorie 1 — Noodzakelijk** (altijd aan, toggle is disabled/dimmed)
- Label: "Noodzakelijk"
- Beschrijving: "Sessie en cookiekeuze"
- Toggle: aan, niet uitzetbaar, `opacity: 0.6`

**Categorie 2 — Analytisch** (standaard UIT)
- Label: "Analytisch"
- Beschrijving: "Google Analytics — verkeer en herkomst"
- Toggle: uit, klikbaar

Onderin een "Opslaan" knop (zelfde stijl als Accepteren).

### 2.6 Toggle design

- Afmetingen: `32px × 18px`, `border-radius: 9px`
- Cirkel: `14px × 14px`, `2px` offset van rand
- Aan: track `rgba(214, 196, 143, 0.5)`, cirkel `#f5f0e6`, cirkel rechts
- Uit: track `rgba(255, 255, 255, 0.1)`, cirkel `rgba(255, 255, 255, 0.3)`, cirkel links

### 2.7 Overlay

Wanneer de banner zichtbaar is, toon een overlay over de pagina-inhoud:
- `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 9998`
- Banner zelf krijgt `z-index: 9999`

---

## 3. Tweetaligheid (NL/EN)

De banner moet de bestaande `useLanguage()` hook gebruiken uit `app/context/LanguageContext.tsx`. Vertalingen:

```typescript
const translations = {
  nl: {
    title: "Cookies",
    description: "We gebruiken analytische cookies om bezoekersverkeer te meten. Je kunt altijd je keuze aanpassen.",
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
    description: "We use analytical cookies to measure visitor traffic. You can always change your preference.",
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
```

---

## 4. Technische architectuur

### 4.1 Bestanden om aan te maken

```
app/
├── components/
│   ├── CookieBanner.tsx          ← Nieuwe component
│   └── CookieBanner.module.css   ← Styling
├── context/
│   └── CookieConsentContext.tsx   ← Nieuwe context provider
└── components/
    └── GoogleAnalytics.tsx        ← Conditionele GA4 loader
```

### 4.2 Consent flow

```
Eerste bezoek
    │
    ▼
Banner verschijnt (GA is NIET geladen)
    │
    ├── [Accepteren] → cookie_consent=accepted → GA4 laden → banner weg
    ├── [Allergisch] → cookie_consent=rejected → GA4 NIET laden → banner weg
    └── [Instellingen]
            │
            ├── Analytisch AAN + [Opslaan] → cookie_consent=analytics → GA4 laden → banner weg
            └── Analytisch UIT + [Opslaan] → cookie_consent=rejected → GA4 NIET laden → banner weg

Terugkerend bezoek
    │
    ▼
Lees cookie_consent cookie
    │
    ├── "accepted" of "analytics" → GA4 direct laden, geen banner
    ├── "rejected" → geen GA4, geen banner
    └── geen cookie → banner tonen
```

### 4.3 Cookie specificaties

| Cookie | Waarde | Max-age | Pad | Overig |
|---|---|---|---|---|
| `cookie_consent` | `accepted`, `analytics`, of `rejected` | 365 dagen (`31536000`) | `/` | `SameSite=Lax; Secure` |

### 4.4 CookieConsentContext (`app/context/CookieConsentContext.tsx`)

Deze context provider:
1. Leest bij mount de `cookie_consent` cookie
2. Biedt een `consent` state (`null | 'accepted' | 'analytics' | 'rejected'`)
3. Biedt een `setConsent(value)` functie die:
   - De cookie zet via `document.cookie`
   - De state update
4. Biedt een `showBanner` boolean (true als consent `null` is)

Wrap in `layout.tsx` rond `<SiteChrome>` (maar binnen `<body>`).

### 4.5 CookieBanner component (`app/components/CookieBanner.tsx`)

- `"use client"` directive
- Gebruikt `useCookieConsent()` voor state
- Gebruikt `useLanguage()` voor vertalingen
- Heeft lokale state `showSettings` (boolean) voor het instellingenpaneel
- Heeft lokale state `analyticsEnabled` (boolean) voor de toggle
- Rendert NIETS als `showBanner === false`
- Animatie: fade-in bij verschijnen (`opacity 0→1`, `transform translateY(20px)→0`)

### 4.6 GoogleAnalytics component (`app/components/GoogleAnalytics.tsx`)

- `"use client"` directive
- Gebruikt `useCookieConsent()` 
- Als `consent === 'accepted' || consent === 'analytics'`:
  - Injecteer het GA4 gtag.js script via `next/script` met `strategy="afterInteractive"`
  - Initialiseer met de GA4 Measurement ID
- Als consent iets anders is: render niets

```tsx
// Pseudo-code
import Script from "next/script";
import { useCookieConsent } from "../context/CookieConsentContext";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent();

  if (consent !== "accepted" && consent !== "analytics") return null;
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Lax;Secure'
          });
        `}
      </Script>
    </>
  );
}
```

### 4.7 Wijzigingen in bestaande bestanden

**`app/layout.tsx`** — Voeg `CookieConsentProvider` en componenten toe:

```tsx
import { CookieConsentProvider } from "./context/CookieConsentContext";
import CookieBanner from "./components/CookieBanner";
import GoogleAnalytics from "./components/GoogleAnalytics";

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CookieConsentProvider>
          <SiteChrome>{children}</SiteChrome>
          <CookieBanner />
          <GoogleAnalytics />
        </CookieConsentProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

**`.env.local`** — Voeg toe:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

(Vervang `G-XXXXXXXXXX` met je echte GA4 Measurement ID uit Google Analytics)

**`next.config.ts`** — Voeg het Google Analytics domein toe aan de Content Security Policy als je die hebt, en sta het script-domein toe:

```typescript
// Voeg toe aan headers als je CSP gebruikt:
{ key: "Content-Security-Policy", value: "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com;" }
```

---

## 5. Google Analytics 4 instellen

### 5.1 Account aanmaken

1. Ga naar https://analytics.google.com
2. Klik "Start measuring"
3. Account name: `Axel Weyers Portfolio`
4. Property name: `CV Website`
5. Tijdzone: `Belgium` / `Brussels`
6. Valuta: `Euro (€)`
7. Bij "Data stream": kies "Web"
8. Vul je website URL in
9. Kopieer de **Measurement ID** (begint met `G-`)
10. Plak deze als `NEXT_PUBLIC_GA_ID` in `.env.local`

### 5.2 Aanbevolen custom events om te tracken

Voeg deze events toe in je code op relevante plekken:

```typescript
// Helper functie (maak aan in lib/analytics.ts)
export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

// In global.d.ts, voeg toe:
interface Window {
  gtag: (...args: unknown[]) => void;
  dataLayer: unknown[];
}
```

| Event | Waar | Code |
|---|---|---|
| Taal gewisseld | `LanguageToggle.tsx` | `trackEvent("language_switch", { to: newLang })` |
| Contact pagina bezocht | `contact/page.tsx` | `trackEvent("page_view_contact")` |
| Over pagina bezocht | `over/page.tsx` | `trackEvent("page_view_about")` |
| Scroll voltooid (einde CV) | `page.tsx` (bij GSAP scroll completion) | `trackEvent("cv_scroll_complete")` |
| Externe link geklikt | Overal waar externe links staan | `trackEvent("outbound_click", { url })` |

### 5.3 Wat je ziet in het GA4 dashboard

Na implementatie zie je in https://analytics.google.com:

- **Realtime**: live bezoekers, actieve pagina's, locatie
- **Acquisitie**: via welk kanaal (Google, direct, social, referral)
- **Engagement**: paginaweergaven, sessieduur, events, scrolldiepte
- **Demografie**: land, stad, taal van de browser
- **Technologie**: browser, OS, schermresolutie, apparaatcategorie
- **Retentie**: terugkerende vs nieuwe bezoekers
- **Custom events**: de events die je zelf hebt ingesteld (taalwissel, scroll, etc.)

---

## 6. GDPR compliance checklist

- [x] Geen cookies geplaatst vóór toestemming (GA4 laadt pas na consent)
- [x] Duidelijke uitleg wat de cookies doen
- [x] Optie om te weigeren ("Allergisch") even prominent als accepteren
- [x] Granulaire keuze mogelijk via instellingen
- [x] Consent cookie zelf is functioneel en mag zonder toestemming
- [x] `anonymize_ip: true` in GA4 config (IP-anonimisering)
- [x] Consent wordt onthouden (365 dagen)
- [x] Bezoeker kan keuze altijd aanpassen

### 6.1 Consent opnieuw aanpassen

Voeg ergens op de site (bv. footer of contact pagina) een link/knop toe waarmee de bezoeker zijn cookiekeuze opnieuw kan instellen. Dit kan simpel door de `cookie_consent` cookie te verwijderen en de banner opnieuw te tonen:

```typescript
const { resetConsent } = useCookieConsent();
// resetConsent() verwijdert de cookie en zet showBanner op true
```

---

## 7. Bestandsstructuur na implementatie

```
app/
├── components/
│   ├── CookieBanner.tsx          ← NIEUW
│   ├── CookieBanner.module.css   ← NIEUW
│   ├── GoogleAnalytics.tsx       ← NIEUW
│   ├── Atmosphere.tsx
│   ├── CvTimeline.tsx
│   ├── EndMenu.tsx
│   ├── LanguageToggle.tsx
│   ├── LanguageToggle.module.css
│   ├── ScrollHint.tsx
│   └── SiteChrome.tsx
├── context/
│   ├── CookieConsentContext.tsx   ← NIEUW
│   └── LanguageContext.tsx
├── layout.tsx                     ← GEWIJZIGD
├── globals.css
├── page.tsx
├── ...
lib/
├── analytics.ts                   ← NIEUW (trackEvent helper)
.env.local                         ← NIEUW (GA_ID)
global.d.ts                        ← GEWIJZIGD (Window interface)
```

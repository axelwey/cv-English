declare global {
  var __webauthnChallenge: string | undefined;
  var __webauthnAuthChallenge: string | undefined;

  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export {};

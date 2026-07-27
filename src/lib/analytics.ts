// Google Analytics 4 (GA4) — SPA-fähig.
// Da die Seite eine Single-Page-App ist, senden wir Seitenaufrufe bei jeder
// internen Navigation selbst (send_page_view: false + manuelles page_view).
//
// >>> Trage hier deine GA4-Mess-ID ein (Format "G-XXXXXXXXXX"). <<<
// Solange leer, ist Tracking komplett aus (kein Script, keine Cookies).
export const GA_MEASUREMENT_ID = "G-BPRG92PL99";

let initialized = false;

const CONSENT_KEY = "cookie_consent";

export function getConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function setConsent(value: "accepted" | "rejected"): void {
  try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  if (value === "accepted") initAnalytics();
}

export function initAnalytics(): void {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === "undefined") return;
  // Nur mit Einwilligung (DSGVO) – ohne Consent kein Tracking, keine Cookies.
  if (getConsent() !== "accepted") return;
  initialized = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() { w.dataLayer.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string, title?: string): void {
  const w = window as any;
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof w.gtag !== "function") return;
  w.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title || document.title,
  });
}

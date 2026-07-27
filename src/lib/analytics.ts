// Google Analytics 4 (GA4) — SPA-fähig.
// Da die Seite eine Single-Page-App ist, senden wir Seitenaufrufe bei jeder
// internen Navigation selbst (send_page_view: false + manuelles page_view).
//
// >>> Trage hier deine GA4-Mess-ID ein (Format "G-XXXXXXXXXX"). <<<
// Solange leer, ist Tracking komplett aus (kein Script, keine Cookies).
export const GA_MEASUREMENT_ID = "G-BPRG92PL99";

let initialized = false;

export function initAnalytics(): void {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === "undefined") return;
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

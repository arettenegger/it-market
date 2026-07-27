// Post-Build Prerendering (nur Meta/Head, kein Browser nötig).
// Erzeugt für jede echte URL eine eigene statische HTML-Datei mit passendem
// <title>, <meta description>, Canonical und OG-/Twitter-Titel. So sehen
// Suchmaschinen pro Seite sofort die richtigen Meta-Daten – ohne JavaScript.
// Robust: bricht den Build nie ab (immer exit 0).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SITE = "https://it-market.at";

const routes = [
  { path: "/blog", title: "Ratgeber & Technik-Magazin | IT-MARKET", description: "Praxisnahe Ratgeber zu IP-Kameras, Netzwerk, NAS, Smart-Home & IT-Sicherheit. Tipps, Vergleiche und Anleitungen von IT-MARKET." },
  { path: "/kategorie/kameras", title: "IP-Kameras kaufen & Angebot anfordern | IT-MARKET", description: "4K IP-Überwachungskameras mit KI-Erkennung für innen & außen. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kategorie/netzwerke", title: "Netzwerktechnik & PoE-Switches | IT-MARKET", description: "Professionelle PoE-Switches, Router & Access Points. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kategorie/hotspot", title: "Gäste-WLAN & Hotspot-Lösungen | IT-MARKET", description: "DSGVO-konforme WLAN-Hotspots mit Ticket-System. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kategorie/nas", title: "NAS-Systeme & Netzwerkspeicher | IT-MARKET", description: "NAS-Systeme für sichere lokale Speicherung & Backups. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kategorie/pc-hardware", title: "PC- & Server-Hardware | IT-MARKET", description: "Profi-Mainboards, Workstation-Komponenten & Server-Hardware. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kategorie/smarthome", title: "Smart-Home & Alarmanlagen | IT-MARKET", description: "Smarte Sensoren, Alarmanlagen & Türschlösser. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern." },
  { path: "/kontakt", title: "Kontakt & Beratung | IT-MARKET", description: "Kontaktieren Sie IT-MARKET für eine kostenlose, unverbindliche Beratung zu Sicherheit, Netzwerk & IT-Hardware." },
  { path: "/ueber-uns", title: "Über uns | IT-MARKET", description: "IT-MARKET: Ihr Partner für IP-Kameras, Netzwerk, NAS, Hotspot & Smart-Home aus der Region." },
  { path: "/impressum", title: "Impressum | IT-MARKET", description: "Impressum und Anbieterkennzeichnung von IT-MARKET (it-market.at)." },
  { path: "/datenschutz", title: "Datenschutz | IT-MARKET", description: "Datenschutzerklärung von IT-MARKET (it-market.at)." },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

try {
  const base = readFileSync(join(DIST, "index.html"), "utf8");
  let count = 0;
  for (const r of routes) {
    const canonical = SITE + r.path;
    const t = esc(r.title);
    const d = esc(r.description);
    let html = base;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
    html = html.replace(/<meta\s+name="description"[\s\S]*?>/i, `<meta name="description" content="${d}" />`);
    html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${canonical}" />`);
    html = html.replace(/<meta\s+property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${canonical}" />`);
    html = html.replace(/<meta\s+property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${t}" />`);
    html = html.replace(/<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${d}" />`);
    html = html.replace(/<meta\s+name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${t}" />`);
    html = html.replace(/<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${d}" />`);

    const outDir = join(DIST, r.path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html, "utf8");
    count++;
  }
  console.log(`Prerender: ${count} Seiten erzeugt.`);
} catch (e) {
  console.error("Prerender übersprungen (Build läuft trotzdem):", (e && e.message) || e);
}
process.exit(0);

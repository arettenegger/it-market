// Post-Build Prerendering (nur Meta/Head, kein Browser nötig).
// Erzeugt für jede echte URL – inkl. jeder Produkt-Detailseite – eine eigene
// statische HTML-Datei mit passendem <title>, <meta description>, Canonical,
// OG- und (bei Produkten) Product-/BreadcrumbList-JSON-LD.
// Zusätzlich wird eine vollständige sitemap.xml (inkl. aller Produkte + <lastmod>)
// erzeugt. Werte kommen aus Firestore (shop_data/main_config: products + pageSeo)
// bzw. den Standard-Vorgaben. Robust: bricht den Build nie ab (immer exit 0).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SITE = "https://it-market.at";
const PROJECT = "gen-lang-client-0171145532";
const DB = "default";
const TODAY = new Date().toISOString().slice(0, 10);

// Statische/kategorie-Routen (Admin-Werte überschreiben Titel/Description, falls vorhanden)
const routes = [
  { path: "/", title: "IT-MARKET — Sicherheit, Netzwerk & IT-Hardware | it-market.at", description: "IT-MARKET: Premium IP-Kameras, Netzwerktechnik, NAS-Systeme, Hotspot-Lösungen, PC-Hardware & Smart-Home. Angebot per E-Mail anfordern.", home: true, priority: "1.0" },
  { path: "/blog", title: "Ratgeber & Technik-Magazin | IT-MARKET", description: "Praxisnahe Ratgeber zu IP-Kameras, Netzwerk, NAS, Smart-Home & IT-Sicherheit. Tipps, Vergleiche und Anleitungen von IT-MARKET.", priority: "0.8" },
  { path: "/kategorie/kameras", title: "IP-Kameras kaufen & Angebot anfordern | IT-MARKET", description: "4K IP-Überwachungskameras mit KI-Erkennung für innen & außen. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/netzwerke", title: "Netzwerktechnik & PoE-Switches | IT-MARKET", description: "Professionelle PoE-Switches, Router & Access Points. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/hotspot", title: "Gäste-WLAN & Hotspot-Lösungen | IT-MARKET", description: "DSGVO-konforme WLAN-Hotspots mit Ticket-System. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/nas", title: "NAS-Systeme & Netzwerkspeicher | IT-MARKET", description: "NAS-Systeme für sichere lokale Speicherung & Backups. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/pc-hardware", title: "PC- & Server-Hardware | IT-MARKET", description: "Profi-Mainboards, Workstation-Komponenten & Server-Hardware. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/smarthome", title: "Smart-Home & Alarmanlagen | IT-MARKET", description: "Smarte Sensoren, Alarmanlagen & Türschlösser. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kontakt", title: "Kontakt & Beratung | IT-MARKET", description: "Kontaktieren Sie IT-MARKET für eine kostenlose, unverbindliche Beratung zu Sicherheit, Netzwerk & IT-Hardware.", priority: "0.6" },
  { path: "/ueber-uns", title: "Über uns | IT-MARKET", description: "IT-MARKET: Ihr Partner für IP-Kameras, Netzwerk, NAS, Hotspot & Smart-Home aus der Region.", priority: "0.5" },
  { path: "/impressum", title: "Impressum | IT-MARKET", description: "Impressum und Anbieterkennzeichnung von IT-MARKET (it-market.at).", priority: "0.3" },
  { path: "/datenschutz", title: "Datenschutz | IT-MARKET", description: "Datenschutzerklärung von IT-MARKET (it-market.at).", priority: "0.3" },
];

const CATEGORY_NAMES = {
  "pc-hardware": "PC-Hardware", "netzwerke": "Netzwerke", "hotspot": "Hotspotlösungen",
  "nas": "NAS-Systeme", "kameras": "IP-Kameras", "smarthome": "Smart-Home",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const xmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- Slug-Logik: MUSS identisch zu src/lib/slug.ts sein ----
const COMBINING = new RegExp("[\\u0300-\\u036f]", "g");
function slugify(input) {
  const s = (input || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(COMBINING, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || "produkt";
}
function productSlug(p) {
  if (p.slug && String(p.slug).trim()) return slugify(p.slug);
  return slugify(p.name || "");
}
function categoryIdFromName(category) {
  const n = (category || "").toLowerCase().replace(/[\s_-]+/g, "");
  if (n.includes("hardware") || n.includes("pc")) return "pc-hardware";
  if (n.includes("netzwerk")) return "netzwerke";
  if (n.includes("hotspot")) return "hotspot";
  if (n.includes("nas")) return "nas";
  if (n.includes("kamera") || n.includes("ip")) return "kameras";
  if (n.includes("smart")) return "smarthome";
  return "pc-hardware";
}

// ---- Firestore-REST-Feld-Helfer ----
const fval = (f) => {
  if (!f) return undefined;
  if (f.stringValue !== undefined) return f.stringValue;
  if (f.integerValue !== undefined) return Number(f.integerValue);
  if (f.doubleValue !== undefined) return f.doubleValue;
  if (f.booleanValue !== undefined) return f.booleanValue;
  return undefined;
};

async function fetchMainConfig() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DB}/documents/shop_data/main_config`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { pageSeo: {}, products: [] };
    const doc = await res.json();

    // pageSeo
    const seoMap = doc?.fields?.pageSeo?.mapValue?.fields || {};
    const pageSeo = {};
    for (const key of Object.keys(seoMap)) {
      const f = seoMap[key]?.mapValue?.fields || {};
      pageSeo[key] = { title: f.title?.stringValue || "", description: f.description?.stringValue || "", keywords: f.keywords?.stringValue || "" };
    }

    // products
    const arr = doc?.fields?.products?.arrayValue?.values || [];
    const products = arr.map((v) => {
      const f = v?.mapValue?.fields || {};
      return {
        id: fval(f.id),
        name: fval(f.name) || "",
        slug: fval(f.slug),
        price: fval(f.price),
        image: fval(f.image) || "",
        description: fval(f.description) || "",
        metaDescription: fval(f.metaDescription) || "",
        seoTitle: fval(f.seoTitle) || "",
        category: fval(f.category) || "",
        inStock: fval(f.inStock) !== false,
      };
    }).filter((p) => p.name);

    return { pageSeo, products };
  } catch (e) {
    console.warn("Prerender: main_config aus Firestore nicht ladbar (nutze Standardwerte):", (e && e.message) || e);
    return { pageSeo: {}, products: [] };
  }
}

function productLdJson(p, canonical) {
  const brand = (p.name || "").trim().split(/\s+/)[0] || "IT-MARKET";
  const ld = {
    "@context": "https://schema.org/", "@type": "Product",
    name: p.name,
    description: p.metaDescription || p.description,
    sku: p.id || productSlug(p),
    brand: { "@type": "Brand", name: brand },
    category: p.category,
    offers: {
      "@type": "Offer", url: canonical, priceCurrency: "EUR",
      price: Number(p.price || 0).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "IT-MARKET" },
    },
  };
  const img = p.image || "";
  if (img.startsWith("http") || img.startsWith("data:")) ld.image = [img];
  return ld;
}

function breadcrumbLdJson(p) {
  const catId = categoryIdFromName(p.category);
  const catName = CATEGORY_NAMES[catId] || p.category;
  return {
    "@context": "https://schema.org/", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: catName, item: `${SITE}/kategorie/${catId}` },
      { "@type": "ListItem", position: 3, name: p.name },
    ],
  };
}

function renderHtml(base, { title, description, canonical, keywords, jsonLd }) {
  const t = esc(title), d = esc(description);
  let html = base;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  html = html.replace(/<meta\s+name="description"[\s\S]*?>/i, `<meta name="description" content="${d}" />`);
  html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<meta\s+property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<meta\s+property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${t}" />`);
  html = html.replace(/<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${d}" />`);
  html = html.replace(/<meta\s+name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${t}" />`);
  html = html.replace(/<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${d}" />`);
  if (keywords) {
    html = html.replace(/<meta\s+name="keywords"[\s\S]*?>/i, "");
    html = html.replace(/<\/head>/i, `  <meta name="keywords" content="${esc(keywords)}" />\n</head>`);
  }
  if (jsonLd && jsonLd.length) {
    const blocks = jsonLd.map((o) => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
    html = html.replace(/<\/head>/i, `${blocks}\n</head>`);
  }
  return html;
}

try {
  const base = readFileSync(join(DIST, "index.html"), "utf8");
  const { pageSeo, products } = await fetchMainConfig();
  let count = 0;

  // 1) Statische + Kategorie-Seiten
  for (const r of routes) {
    const override = pageSeo[r.path] || {};
    const html = renderHtml(base, {
      title: override.title || r.title,
      description: override.description || r.description,
      canonical: SITE + r.path,
      keywords: override.keywords || "",
    });
    if (r.home) {
      writeFileSync(join(DIST, "index.html"), html, "utf8");
    } else {
      const outDir = join(DIST, r.path);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, "index.html"), html, "utf8");
    }
    count++;
  }

  // 2) Produkt-Detailseiten
  const productUrls = [];
  for (const p of products) {
    const slug = productSlug(p);
    const path = `/produkt/${slug}`;
    const canonical = SITE + path;
    const title = p.seoTitle || `${p.name} kaufen & Angebot anfordern | IT-MARKET`;
    const description = p.metaDescription || `${p.name} bei IT-MARKET Österreich – ${(p.description || "").slice(0, 130)}`;
    const html = renderHtml(base, {
      title, description, canonical,
      jsonLd: [productLdJson(p, canonical), breadcrumbLdJson(p)],
    });
    const outDir = join(DIST, path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html, "utf8");
    productUrls.push({ loc: canonical, priority: "0.8" });
    count++;
  }

  // 3) Sitemap (statische + Kategorie- + Produkt-URLs, mit lastmod)
  const sitemapUrls = [
    ...routes.map((r) => ({ loc: SITE + r.path, priority: r.priority || "0.7", changefreq: r.path === "/" ? "weekly" : "weekly" })),
    ...productUrls.map((u) => ({ loc: u.loc, priority: u.priority, changefreq: "weekly" })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map((u) => `  <url><loc>${xmlEsc(u.loc)}</loc><lastmod>${TODAY}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n") +
    `\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), sitemap, "utf8");

  console.log(`Prerender: ${count} Seiten erzeugt (${products.length} Produkte), sitemap.xml mit ${sitemapUrls.length} URLs.`);
} catch (e) {
  console.error("Prerender übersprungen (Build läuft trotzdem):", (e && e.message) || e);
}
process.exit(0);

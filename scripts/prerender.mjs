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
  { path: "/kategorie/nvr", title: "Netzwerkrekorder NVR kaufen & Angebot anfordern | IT-MARKET", description: "Netzwerk-Videorekorder (NVR) mit PoE & großem Speicher zur zentralen Aufzeichnung Ihrer IP-Kameras. Unverbindliches Angebot bei IT-MARKET.", priority: "0.9" },
  { path: "/kategorie/netzwerke", title: "Netzwerktechnik & PoE-Switches | IT-MARKET", description: "Professionelle PoE-Switches, Router & Access Points. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/hotspot", title: "Hotspot & Wireless-Lösungen | IT-MARKET", description: "Professionelle WLAN-Hotspots, Outdoor-Funk für Freizeitparks & Lagerhallen sowie Richtfunk zur Standortvernetzung. Kostenlose Beratung bei IT-MARKET.", priority: "0.9" },
  { path: "/kategorie/nas", title: "NAS-Systeme & Netzwerkspeicher | IT-MARKET", description: "NAS-Systeme für sichere lokale Speicherung & Backups. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/pc-hardware", title: "PC- & Server-Hardware | IT-MARKET", description: "Profi-Mainboards, Workstation-Komponenten & Server-Hardware. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kategorie/smarthome", title: "Smart-Home & Alarmanlagen | IT-MARKET", description: "Smarte Sensoren, Alarmanlagen & Türschlösser. Unverbindliches Angebot per E-Mail bei IT-MARKET anfordern.", priority: "0.9" },
  { path: "/kontakt", title: "Kontakt & Beratung | IT-MARKET", description: "Kontaktieren Sie IT-MARKET für eine kostenlose, unverbindliche Beratung zu Sicherheit, Netzwerk & IT-Hardware.", priority: "0.6" },
  { path: "/ueber-uns", title: "Über uns | IT-MARKET", description: "IT-MARKET: Ihr Partner für IP-Kameras, Netzwerk, NAS, Hotspot & Smart-Home aus der Region.", priority: "0.5" },
  { path: "/impressum", title: "Impressum | IT-MARKET", description: "Impressum und Anbieterkennzeichnung von IT-MARKET (it-market.at).", priority: "0.3" },
  { path: "/datenschutz", title: "Datenschutz | IT-MARKET", description: "Datenschutzerklärung von IT-MARKET (it-market.at).", priority: "0.3" },
];

const CATEGORY_NAMES = {
  "pc-hardware": "PC-Hardware", "netzwerke": "Netzwerke", "hotspot": "Hotspot & Wireless-Lösungen",
  "nas": "NAS-Systeme", "kameras": "IP-Kameras", "nvr": "Netzwerkrekorder NVR", "smarthome": "Smart-Home",
};

// Fallback-Produktbilder je Kategorie (Merchant-Listings verlangen ein image).
const CATEGORY_IMAGES = {
  "pc-hardware": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop",
  "netzwerke": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop",
  "hotspot": "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=800&auto=format&fit=crop",
  "nas": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
  "kameras": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
  "nvr": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop",
  "smarthome": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
};
const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop";

// Merchant-Listing-Angaben für Google (Rückgabe & Versand).
const MERCHANT_RETURN_LD = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "AT",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
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
function blogSlug(p) {
  if (p.slug && String(p.slug).trim()) return slugify(p.slug);
  return slugify(p.title || "");
}

// Deutsches Anzeigedatum ("18. Juli 2026") oder ISO -> ISO-Datum "2026-07-18" (sonst "").
const MONTHS_DE = { januar: 1, februar: 2, "märz": 3, maerz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };
function toIsoDate(post) {
  const dp = String(post.datePublished || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(dp)) return dp.slice(0, 10);
  const d = String(post.date || "").trim();
  const iso = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = d.match(/(\d{1,2})\.?\s+([A-Za-zäöüÄÖÜ]+)\s+(\d{4})/);
  if (m) {
    const mo = MONTHS_DE[m[2].toLowerCase()];
    if (mo) return `${m[3]}-${String(mo).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  }
  return "";
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
    if (!res.ok) return { pageSeo: {}, products: [], blogPosts: [] };
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

    // blogPosts
    const blogArr = doc?.fields?.blogPosts?.arrayValue?.values || [];
    const blogPosts = blogArr.map((v) => {
      const f = v?.mapValue?.fields || {};
      const tags = (f.tags?.arrayValue?.values || []).map((x) => x.stringValue).filter(Boolean);
      return {
        id: fval(f.id),
        title: fval(f.title) || "",
        slug: fval(f.slug),
        excerpt: fval(f.excerpt) || "",
        content: fval(f.content) || "",
        category: fval(f.category) || "",
        author: fval(f.author) || "",
        date: fval(f.date) || "",
        datePublished: fval(f.datePublished) || "",
        image: fval(f.image) || "",
        seoTitle: fval(f.seoTitle) || "",
        metaDescription: fval(f.metaDescription) || "",
        isPublished: fval(f.isPublished) === true,
        tags,
      };
    }).filter((p) => p.title);

    return { pageSeo, products, blogPosts };
  } catch (e) {
    console.warn("Prerender: main_config aus Firestore nicht ladbar (nutze Standardwerte):", (e && e.message) || e);
    return { pageSeo: {}, products: [], blogPosts: [] };
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
      hasMerchantReturnPolicy: MERCHANT_RETURN_LD,
    },
  };
  // image ist Pflicht für Merchant-Listings – ohne eigenes Produktbild das Kategoriebild nutzen.
  const img = p.image || "";
  const catId = categoryIdFromName(p.category);
  ld.image = [(img.startsWith("http") || img.startsWith("data:")) ? img : (CATEGORY_IMAGES[catId] || DEFAULT_PRODUCT_IMAGE)];
  return ld;
}

function breadcrumbLdJson(p) {
  const catId = categoryIdFromName(p.category);
  const catName = CATEGORY_NAMES[catId] || p.category;
  return {
    "@context": "https://schema.org/", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: catName, item: `${SITE}/kategorie/${catId}/` },
      { "@type": "ListItem", position: 3, name: p.name },
    ],
  };
}

function blogPostLdJson(post, canonical) {
  const ld = {
    "@context": "https://schema.org/", "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || "",
    author: { "@type": "Person", name: post.author || "IT-MARKET Redaktion" },
    publisher: { "@type": "Organization", name: "IT-MARKET", logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` } },
    mainEntityOfPage: canonical,
    url: canonical,
  };
  const img = post.image || "";
  if (img.startsWith("http") || img.startsWith("data:")) ld.image = [img];
  const iso = toIsoDate(post);
  if (iso) { ld.datePublished = iso; ld.dateModified = iso; }
  return ld;
}

function blogBreadcrumbLdJson(post) {
  return {
    "@context": "https://schema.org/", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Ratgeber & Magazin", item: `${SITE}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };
}

function renderHtml(base, { title, description, canonical, keywords, jsonLd, bodyHtml }) {
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
  // Body-Prerender: SEO-Inhalt in #root legen (React ersetzt ihn beim Laden via createRoot).
  if (bodyHtml) {
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${bodyHtml}</div>`);
  }
  return html;
}

// ---- Body-Prerender-Helfer (SEO-Inhalt für #root, browser-frei) ----
const WRAP_OPEN = `<div style="max-width:64rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,Arial,sans-serif;line-height:1.6">`;
const WRAP_CLOSE = `</div>`;

// Inline-Markdown: **fett** und [Text](url|/relativ)
function inlineMd(s) {
  let h = esc(s || "");
  h = h.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, '<a href="$2">$1</a>');
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return h;
}

// Minimaler Markdown->HTML-Wandler (spiegelt die Blog-Anzeige: Überschriften, Listen,
// Tabellen, Bilder, fett, Links). Nur für den vorgerenderten SEO-Body.
function mdToHtml(raw) {
  if (!raw) return "";
  const blocks = String(raw).replace(/\r\n/g, "\n").split(/\n\n+/);
  const out = [];
  for (const block of blocks) {
    const t = block.trim();
    if (!t) continue;
    const img = t.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (img) { out.push(`<figure><img src="${esc(img[2])}" alt="${esc(img[1])}" loading="lazy" /></figure>`); continue; }
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h && !t.includes("\n")) { const lvl = Math.max(2, h[1].length); out.push(`<h${lvl}>${inlineMd(h[2])}</h${lvl}>`); continue; }
    const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
    const isTable = lines.length >= 2 && lines[0].includes("|") && /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(lines[1]) && lines[1].includes("-");
    if (isTable) {
      const parseRow = (line) => { const c = line.split("|").map((x) => x.trim()); if (c.length && c[0] === "") c.shift(); if (c.length && c[c.length - 1] === "") c.pop(); return c; };
      const header = parseRow(lines[0]);
      const rows = lines.slice(2).map(parseRow);
      const thead = "<thead><tr>" + header.map((hh) => `<th>${inlineMd(hh)}</th>`).join("") + "</tr></thead>";
      const tbody = "<tbody>" + rows.map((r) => "<tr>" + r.map((c) => `<td>${inlineMd(c)}</td>`).join("") + "</tr>").join("") + "</tbody>";
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push("<ul>" + lines.map((l) => `<li>${inlineMd(l.replace(/^[-*]\s+/, ""))}</li>`).join("") + "</ul>");
      continue;
    }
    out.push(`<p>${inlineMd(t)}</p>`);
  }
  return out.join("\n");
}

function productsInCategory(products, catId) {
  return products.filter((p) => categoryIdFromName(p.category) === catId);
}

function homeBody(products, blogPosts) {
  const cats = Object.keys(CATEGORY_NAMES).map((id) => `<li><a href="/kategorie/${id}/">${esc(CATEGORY_NAMES[id])}</a></li>`).join("");
  const prods = products.slice(0, 8).map((p) => `<li><a href="/produkt/${productSlug(p)}/">${esc(p.name)}</a></li>`).join("");
  const posts = (blogPosts || []).filter((b) => b.isPublished).slice(0, 5).map((b) => `<li><a href="/blog/${blogSlug(b)}/">${esc(b.title)}</a></li>`).join("");
  return `${WRAP_OPEN}
    <h1>IT-MARKET — Sicherheit, Netzwerk &amp; IT-Hardware in Österreich</h1>
    <p>Premium IP-Kameras, Netzwerktechnik, NAS-Systeme, Hotspot- &amp; Wireless-Lösungen, PC-Hardware und Smart-Home. Stellen Sie Ihre Wunschprodukte zusammen und fordern Sie ein unverbindliches Angebot per E-Mail an.</p>
    <h2>Produktkategorien</h2>
    <ul>${cats}</ul>
    ${prods ? `<h2>Beliebte Produkte</h2><ul>${prods}</ul>` : ""}
    ${posts ? `<h2>Ratgeber &amp; Magazin</h2><ul>${posts}</ul>` : ""}
  ${WRAP_CLOSE}`;
}

function categoryBody(catId, description, products) {
  const name = CATEGORY_NAMES[catId] || catId;
  const list = productsInCategory(products, catId).map((p) => `<li><a href="/produkt/${productSlug(p)}/">${esc(p.name)}</a></li>`).join("");
  return `${WRAP_OPEN}
    <nav><a href="/">Startseite</a> / <span>${esc(name)}</span></nav>
    <h1>${esc(name)}</h1>
    <p>${esc(description || "")}</p>
    ${list ? `<h2>Produkte</h2><ul>${list}</ul>` : "<p>Produkte auf Anfrage.</p>"}
  ${WRAP_CLOSE}`;
}

function productBody(p) {
  const catId = categoryIdFromName(p.category);
  const catName = CATEGORY_NAMES[catId] || p.category;
  const price = p.price != null && Number(p.price) > 0 ? `<p><strong>${Number(p.price).toFixed(2)} €</strong> inkl. MwSt. zzgl. Versand</p>` : "";
  return `${WRAP_OPEN}
    <nav><a href="/">Startseite</a> / <a href="/kategorie/${catId}/">${esc(catName)}</a> / <span>${esc(p.name)}</span></nav>
    <h1>${esc(p.name)}</h1>
    ${price}
    <p>${esc(p.description || p.metaDescription || "")}</p>
    <p><a href="/kategorie/${catId}/">Weitere Produkte aus ${esc(catName)}</a></p>
  ${WRAP_CLOSE}`;
}

function blogIndexBody(blogPosts) {
  const list = (blogPosts || []).filter((b) => b.isPublished).map((b) => `<li><a href="/blog/${blogSlug(b)}/">${esc(b.title)}</a></li>`).join("");
  return `${WRAP_OPEN}
    <h1>Ratgeber &amp; Technik-Magazin</h1>
    <p>Praxisnahe Ratgeber zu IP-Kameras, Netzwerk, NAS, Smart-Home &amp; IT-Sicherheit.</p>
    ${list ? `<ul>${list}</ul>` : ""}
  ${WRAP_CLOSE}`;
}

function blogPostBody(post) {
  return `${WRAP_OPEN}
    <nav><a href="/">Startseite</a> / <a href="/blog/">Ratgeber &amp; Magazin</a> / <span>${esc(post.title)}</span></nav>
    <article>
      <h1>${esc(post.title)}</h1>
      ${post.excerpt ? `<p>${esc(post.excerpt)}</p>` : ""}
      ${mdToHtml(post.content)}
    </article>
  ${WRAP_CLOSE}`;
}

try {
  const base = readFileSync(join(DIST, "index.html"), "utf8");
  const { pageSeo, products, blogPosts } = await fetchMainConfig();
  let count = 0;

  // 1) Statische + Kategorie-Seiten
  for (const r of routes) {
    const override = pageSeo[r.path] || {};
    const canonical = SITE + (r.home ? "/" : r.path + "/");
    const title = override.title || r.title;
    const description = override.description || r.description;
    // Body-Prerender: Home, Blog-Übersicht und Kategorien bekommen SEO-Inhalt.
    let bodyHtml = "";
    if (r.home) bodyHtml = homeBody(products, blogPosts);
    else if (r.path === "/blog") bodyHtml = blogIndexBody(blogPosts);
    else if (r.path.startsWith("/kategorie/")) bodyHtml = categoryBody(r.path.slice("/kategorie/".length), description, products);
    const html = renderHtml(base, {
      title, description, canonical,
      keywords: override.keywords || "",
      bodyHtml,
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
    const canonical = SITE + path + "/";
    // SEO-Manager-Überschreibung (analog zum Client in App.tsx) berücksichtigen.
    const override = pageSeo[path] || {};
    const title = override.title || p.seoTitle || `${p.name} kaufen & Angebot anfordern | IT-MARKET`;
    const description = override.description || p.metaDescription || `${p.name} bei IT-MARKET Österreich – ${(p.description || "").slice(0, 130)}`;
    const html = renderHtml(base, {
      title, description, canonical,
      keywords: override.keywords || "",
      jsonLd: [productLdJson(p, canonical), breadcrumbLdJson(p)],
      bodyHtml: productBody(p),
    });
    const outDir = join(DIST, path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html, "utf8");
    productUrls.push({ loc: canonical, priority: "0.8" });
    count++;
  }

  // 2b) Blog-Artikel-Detailseiten (nur veröffentlichte)
  const blogUrls = [];
  for (const post of blogPosts) {
    if (!post.isPublished) continue;
    const slug = blogSlug(post);
    const path = `/blog/${slug}`;
    const canonical = SITE + path + "/";
    const override = pageSeo[path] || {};
    const title = override.title || post.seoTitle || `${post.title} | IT-MARKET Ratgeber`;
    const description = override.description || post.metaDescription || post.excerpt || "";
    const keywords = override.keywords || (post.tags || []).join(", ");
    const html = renderHtml(base, {
      title, description, canonical, keywords,
      jsonLd: [blogPostLdJson(post, canonical), blogBreadcrumbLdJson(post)],
      bodyHtml: blogPostBody(post),
    });
    const outDir = join(DIST, path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html, "utf8");
    blogUrls.push({ loc: canonical, priority: "0.7", lastmod: toIsoDate(post) || TODAY });
    count++;
  }

  // 3) Sitemap (statische + Kategorie- + Produkt- + Blog-URLs, mit lastmod)
  const sitemapAll = [
    ...routes.map((r) => ({ loc: SITE + (r.home ? "/" : r.path + "/"), priority: r.priority || "0.7", changefreq: "weekly", lastmod: TODAY })),
    ...productUrls.map((u) => ({ loc: u.loc, priority: u.priority, changefreq: "weekly", lastmod: TODAY })),
    ...blogUrls.map((u) => ({ loc: u.loc, priority: u.priority, changefreq: "monthly", lastmod: u.lastmod })),
  ];
  // Doppelte URLs entfernen (z. B. zwei Artikel mit identischem Slug), erste gewinnt.
  const seenLoc = new Set();
  const sitemapUrls = sitemapAll.filter((u) => (seenLoc.has(u.loc) ? false : (seenLoc.add(u.loc), true)));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map((u) => `  <url><loc>${xmlEsc(u.loc)}</loc><lastmod>${u.lastmod || TODAY}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n") +
    `\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), sitemap, "utf8");

  const blogCount = blogUrls.length;
  console.log(`Prerender: ${count} Seiten erzeugt (${products.length} Produkte, ${blogCount} Blog-Artikel), sitemap.xml mit ${sitemapUrls.length} URLs.`);
} catch (e) {
  console.error("Prerender übersprungen (Build läuft trotzdem):", (e && e.message) || e);
}
process.exit(0);

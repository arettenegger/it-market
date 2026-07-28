import React from "react";
import { Product, getSpecLabels, formatPrice } from "../types";
import { CATEGORIES } from "../data";
import { productSlug, categoryIdFromName } from "../lib/slug";
import CameraSvg from "./CameraSvg";
import { ArrowLeft, ChevronRight, ShoppingBag, PhoneCall, Star, Check, Truck, ShieldCheck } from "lucide-react";

interface ProductPageProps {
  product: Product | null;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBackToHome: () => void;
  onSelectCategory: (catName: string) => void;
  onOpenProduct: (product: Product) => void;
  onOpenCallback: (prefilledMsg?: string) => void;
}

const SITE = "https://it-market.at";

function svgType(imageName: string): "bullet" | "dome" | "ptz" | "set" | "smarthome" | "nas" | "netzwerk" {
  const n = (imageName || "").toLowerCase();
  if (n.includes("dome")) return "dome";
  if (n.includes("ptz")) return "ptz";
  if (n.includes("set")) return "set";
  if (n.includes("smarthome") || n.includes("smart")) return "smarthome";
  if (n.includes("nas")) return "nas";
  if (n.includes("netzwerk")) return "netzwerk";
  return "bullet";
}

export default function ProductPage({
  product,
  allProducts,
  onAddToCart,
  onBackToHome,
  onSelectCategory,
  onOpenProduct,
  onOpenCallback,
}: ProductPageProps) {
  // Produkt nicht gefunden (z. B. gelöscht oder alter Link)
  if (!product) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-3">Produkt nicht gefunden</h1>
        <p className="text-slate-500 text-sm mb-8">Dieses Produkt ist nicht mehr verfügbar oder der Link ist veraltet.</p>
        <button onClick={onBackToHome} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Zur Startseite
        </button>
      </div>
    );
  }

  const catId = categoryIdFromName(product.category);
  const catEntry = CATEGORIES.find((c) => c.id === catId);
  const catName = catEntry?.name || product.category;
  const canonical = `${SITE}/produkt/${productSlug(product)}`;
  const hasRealImage = !!product.image && (product.image.startsWith("http") || product.image.startsWith("data:"));
  const labels = getSpecLabels(product.category);
  const specItems = [
    { label: labels.resolution, val: product.specs?.resolution },
    { label: labels.viewAngle, val: product.specs?.viewAngle },
    { label: labels.nightVision, val: product.specs?.nightVision },
    { label: labels.storage, val: product.specs?.storage },
    { label: labels.power, val: product.specs?.power },
  ].filter((s) => s.val);

  const brand = (product.name || "").trim().split(/\s+/)[0] || "IT-MARKET";

  // Ähnliche Produkte (gleiche Kategorie, ohne das aktuelle)
  const related = allProducts
    .filter((p) => p.id !== product.id && categoryIdFromName(p.category) === catId)
    .slice(0, 4);

  // JSON-LD: Product + BreadcrumbList
  const productLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: brand },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "EUR",
      price: Number(product.price || 0).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "IT-MARKET" },
    },
  };
  if (hasRealImage) productLd.image = [product.image];

  const breadcrumbLd = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: catName, item: `${SITE}/kategorie/${catId}` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Client-seitiges Schema (Prerender liefert es zusätzlich statisch) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb (echte Links) */}
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-slate-500 mb-6">
        <a href="/" onClick={(e) => { e.preventDefault(); onBackToHome(); }} className="hover:text-blue-600 cursor-pointer">Start</a>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <a href={`/kategorie/${catId}`} onClick={(e) => { e.preventDefault(); onSelectCategory(catName); }} className="hover:text-blue-600 cursor-pointer">{catName}</a>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Bild */}
        <div className="lg:col-span-6">
          <div className="bg-slate-50 rounded-3xl p-6 h-72 sm:h-96 flex items-center justify-center border border-slate-100 overflow-hidden">
            {hasRealImage ? (
              <img
                src={product.image}
                alt={product.imageAlt || product.name}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-52 h-52">
                <CameraSvg type={svgType(product.image || "bullet")} isNightVision={false} className="w-full h-full drop-shadow-xl" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-6 flex flex-col">
          <a
            href={`/kategorie/${catId}`}
            onClick={(e) => { e.preventDefault(); onSelectCategory(catName); }}
            className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded uppercase tracking-wider self-start cursor-pointer"
          >
            {catName}
          </a>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-3 mb-2 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold text-slate-900 ml-1 text-sm">{product.rating}</span>
            </div>
            <span className="text-xs text-slate-400">({product.reviewsCount} Bewertungen)</span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-5">{product.description}</p>

          {/* Preis */}
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-3xl font-black font-mono text-red-600">{formatPrice(product.price)} €*</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-base text-slate-400 line-through font-mono">{formatPrice(product.oldPrice)} €*</span>
            )}
            <span className="text-[10px] text-slate-400">inkl. MwSt. zzgl. Versand</span>
          </div>

          {/* Aktionen */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 px-5 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <ShoppingBag className="w-4.5 h-4.5" /> In den Warenkorb ({formatPrice(product.price)}€)
            </button>
            <button
              onClick={() => onOpenCallback(`Produktanfrage: ${product.name}`)}
              className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Beratung anfordern
            </button>
          </div>

          {/* Trust-Zeile */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 mb-6">
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-500" /> {product.shippingStatus || "5-7 Werktage"}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {product.inStock ? "Auf Lager" : "Auf Anfrage"}</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Unverbindliches Angebot</span>
          </div>

          {/* Technische Daten */}
          {specItems.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-3">
                Technische Spezifikationen
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {specItems.map((spec, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-tight">
                    <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                    <span className="text-slate-800"><strong className="font-semibold text-slate-900">{spec.label}:</strong> {spec.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {Array.isArray(product.features) && product.features.length > 0 && (
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ähnliche Produkte */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-extrabold font-display text-slate-900 mb-5">Weitere Produkte aus {catName}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => {
              const img = !!p.image && (p.image.startsWith("http") || p.image.startsWith("data:"));
              return (
                <a
                  key={p.id}
                  href={`/produkt/${productSlug(p)}`}
                  onClick={(e) => { e.preventDefault(); onOpenProduct(p); }}
                  className="group bg-white border border-slate-100 rounded-2xl p-3 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden">
                    {img ? (
                      <img src={p.image} alt={p.imageAlt || p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-20 h-20"><CameraSvg type={svgType(p.image || "bullet")} isNightVision={false} className="w-full h-full" /></div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">{p.name}</span>
                  <span className="text-sm font-black font-mono text-red-600 mt-1">{formatPrice(p.price)} €*</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Zurück */}
      <div className="mt-12">
        <a
          href={`/kategorie/${catId}`}
          onClick={(e) => { e.preventDefault(); onSelectCategory(catName); }}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zu {catName}
        </a>
      </div>
    </div>
  );
}

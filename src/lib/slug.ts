// URL-Slugs für Produkt-Detailseiten (/produkt/<slug>).
// Deterministisch aus dem Produktnamen abgeleitet, damit bestehende Produkte
// ohne gespeicherten Slug automatisch eine stabile URL bekommen.
import { Product } from "../types";

const COMBINING = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(input: string): string {
  const s = (input || "")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(COMBINING, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "produkt";
}

export function productSlug(p: Product): string {
  if (p?.slug && p.slug.trim()) return slugify(p.slug);
  return slugify(p?.name || "");
}

// Findet ein Produkt anhand seines URL-Slugs (Fallback: über die ID).
export function resolveProduct(products: Product[], slug: string): Product | undefined {
  if (!slug || !Array.isArray(products)) return undefined;
  const s = slug.toLowerCase().replace(/\/+$/, "");
  return (
    products.find((p) => productSlug(p).toLowerCase() === s) ||
    products.find((p) => (p.id || "").toLowerCase() === s)
  );
}

// Produkt-Kategorie-Text (z. B. "Smart-Home", "NAS-Systeme") -> Kategorie-ID
// wie in /kategorie/<id> verwendet.
export function categoryIdFromName(category: string): string {
  const n = (category || "").toLowerCase().replace(/[\s_-]+/g, "");
  if (n.includes("hardware") || n.includes("pc")) return "pc-hardware";
  if (n.includes("netzwerk")) return "netzwerke";
  if (n.includes("hotspot")) return "hotspot";
  if (n.includes("nas")) return "nas";
  if (n.includes("kamera") || n.includes("ip")) return "kameras";
  if (n.includes("smart")) return "smarthome";
  return "pc-hardware";
}

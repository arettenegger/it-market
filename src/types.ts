export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  imageAlt?: string;
  slug?: string;
  video?: string;
  features: string[];
  isBestseller?: boolean;
  discount?: string;
  inStock: boolean;
  shippingStatus?: string;
  colors: string[];
  specs: {
    resolution: string;
    viewAngle: string;
    nightVision: string;
    storage: string;
    power: string;
  };
  // SEO (optional)
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  // Interne Artikelnummer – nur im Admin sichtbar, NICHT auf der Website.
  articleNumber?: string;
}

// SEO-Daten für Unterseiten (Startseite, Kategorien, Blog, Kontakt …)
export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
  date: string;
}

export interface SpecLabels {
  resolution: string;
  viewAngle: string;
  nightVision: string;
  storage: string;
  power: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  tagline: string;
  iconName: string;
  image: string;
  // Optional pro Kategorie frei benennbare Bezeichnungen der 5 Spezifikations-Felder.
  specLabels?: Partial<SpecLabels>;
}

export interface ApplicationArea {
  id: string;
  title: string;
  description: string;
  image: string;
  tip: string;
}

export interface Brand {
  name: string;
  logo: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  isPublished: boolean;
  featured?: boolean;
  // SEO (optional; tags dienen zugleich als Keywords)
  seoTitle?: string;
  metaDescription?: string;
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  price: number;
  spec: string;
  recommended?: boolean;
}

// Vordefinierte, garantiert kompatible Komplett-Konfiguration.
// Der Kunde wählt genau eine davon aus (statt Einzelkomponenten frei zu kombinieren).
export interface BaseConfiguration {
  id: string;
  name: string;
  price: number;
  cpu: string;
  mainboard: string;
  ram: string;
  ssd: string;
  chassis: string;
  gpu?: string;
  description?: string;
  recommended?: boolean;
  // Interne Artikelnummer – nur im Admin sichtbar, NICHT auf der Website.
  articleNumber?: string;
}

export interface ConfiguratorData {
  // Aktives Modell: vordefinierte Basiskonfigurationen
  baseConfigurations: BaseConfiguration[];
  // Optionale Zusätze (kompatibel mit jeder Basis)
  networkOptions: ConfiguratorOption[];
  serviceOptions: ConfiguratorOption[];
  // Kategorie-Banner (von CategoryPage genutzt – NICHT Teil des PC-Builds)
  netzwerkeBannerImage?: string;
  hotspotBannerImage?: string;
  nasBannerImage?: string;
  camerasBannerImage?: string;
  hardwareBannerImage?: string;
  smartHomeBannerImage?: string;
  smartHomeBannerVideo?: string;
  // Legacy – ersetzt durch baseConfigurations (nur für Abwärtskompatibilität bestehender Firestore-Daten/Backups)
  baseBoardPrice?: number;
  chassisOptions?: ConfiguratorOption[];
  cpuOptions?: ConfiguratorOption[];
  ramOptions?: ConfiguratorOption[];
  gpuOptions?: ConfiguratorOption[];
  ssdOptions?: ConfiguratorOption[];
}

const SPEC_KEYS: (keyof SpecLabels)[] = ["resolution", "viewAngle", "nightVision", "storage", "power"];
const normCatName = (s: string) => (s || "").toLowerCase().replace(/[\s_-]+/g, "");

// Vom Admin pro Kategorie frei gesetzte Spec-Label-Bezeichnungen (Laufzeit-Registry).
// App ruft registerCategorySpecLabels() bei jedem Laden/Ändern der Kategorien auf.
let specLabelOverrides: Record<string, Partial<SpecLabels>> = {};
export function registerCategorySpecLabels(categories: { name: string; specLabels?: Partial<SpecLabels> }[]): void {
  const map: Record<string, Partial<SpecLabels>> = {};
  for (const c of categories || []) {
    if (!c || !c.name || !c.specLabels) continue;
    const cleaned: Partial<SpecLabels> = {};
    for (const k of SPEC_KEYS) {
      const v = (c.specLabels as any)[k];
      if (v && String(v).trim()) cleaned[k] = String(v).trim();
    }
    if (Object.keys(cleaned).length) map[normCatName(c.name)] = cleaned;
  }
  specLabelOverrides = map;
}

function getDefaultSpecLabels(category: string): SpecLabels {
  const cat = (category || "").toLowerCase();
  // NVR zuerst prüfen (Name enthält "netzwerk"/"rekorder"), sonst würde die Netzwerk-Regel greifen.
  if (cat.includes("nvr") || cat.includes("rekorder") || cat.includes("recorder")) {
    return {
      resolution: "Kanäle / Kameras",
      viewAngle: "Max. Auflösung",
      nightVision: "Videokompression",
      storage: "Speicher / HDD-Bays",
      power: "Netzwerk / PoE"
    };
  }
  if (cat.includes("pc") || cat.includes("hardware") || cat.includes("server") || cat.includes("workstation")) {
    return {
      resolution: "Prozessor / CPU",
      viewAngle: "Arbeitsspeicher (RAM)",
      nightVision: "Grafikkarte / GPU",
      storage: "Festplatte / SSD",
      power: "Formfaktor / Netzteil"
    };
  }
  if (cat.includes("netzwerk") || cat.includes("switch")) {
    return {
      resolution: "Ports / Interfaces",
      viewAngle: "Switching-Kapazität",
      nightVision: "PoE-Budget",
      storage: "Management / VLAN",
      power: "Formfaktor / Strom"
    };
  }
  if (cat.includes("wlan") || cat.includes("hotspot")) {
    return {
      resolution: "WLAN Standard",
      viewAngle: "Max. Datenrate",
      nightVision: "Gleichzeitige Clients",
      storage: "PoE-Versorgung",
      power: "Gehäuse & Schutzart"
    };
  }
  if (cat.includes("nas") || cat.includes("speicher")) {
    return {
      resolution: "Festplatten-Bay",
      viewAngle: "Prozessor & RAM",
      nightVision: "RAID-Support",
      storage: "Vorinstallierter Speicher",
      power: "Netzwerk / LAN Ports"
    };
  }
  if (cat.includes("smart") || cat.includes("alarm") || cat.includes("sensor")) {
    return {
      resolution: "Funkfrequenz / Protokoll",
      viewAngle: "Sensortypen",
      nightVision: "Stromversorgung",
      storage: "Verschlüsselung",
      power: "App & Integration"
    };
  }
  return {
    resolution: "Auflösung",
    viewAngle: "Blickwinkel",
    nightVision: "Nachtsicht",
    storage: "Speicherung",
    power: "Stromversorgung"
  };
}

// Öffentliche Funktion: Standard-Labels je Kategorie, überlagert von Admin-Overrides.
export function getSpecLabels(category: string): SpecLabels {
  const base = getDefaultSpecLabels(category);
  const override = specLabelOverrides[normCatName(category)];
  return override ? { ...base, ...override } : base;
}

export function formatPrice(price: number): string {
  return Number(price || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

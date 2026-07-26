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

export interface Category {
  id: string;
  name: string;
  description: string;
  tagline: string;
  iconName: string;
  image: string;
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
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  price: number;
  spec: string;
  recommended?: boolean;
}

export interface ConfiguratorData {
  baseBoardPrice: number;
  netzwerkeBannerImage?: string;
  hotspotBannerImage?: string;
  nasBannerImage?: string;
  camerasBannerImage?: string;
  hardwareBannerImage?: string;
  smartHomeBannerImage?: string;
  smartHomeBannerVideo?: string;
  chassisOptions: ConfiguratorOption[];
  cpuOptions: ConfiguratorOption[];
  ramOptions: ConfiguratorOption[];
  gpuOptions: ConfiguratorOption[];
  ssdOptions: ConfiguratorOption[];
  networkOptions: ConfiguratorOption[];
  serviceOptions: ConfiguratorOption[];
}

export function getSpecLabels(category: string): { resolution: string; viewAngle: string; nightVision: string; storage: string; power: string } {
  const cat = (category || "").toLowerCase();
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

export function formatPrice(price: number): string {
  return Number(price || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

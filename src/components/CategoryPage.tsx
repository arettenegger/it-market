import React, { useState } from "react";
import { VideoBackground } from "./VideoBackground";
import { Category, Product, ConfiguratorData, getSpecLabels, formatPrice } from "../types";
import { CATEGORIES } from "../data";
import { 
  ArrowLeft, Cpu, Shield, Server, RotateCw, Eye, CheckCircle2, 
  Sparkles, Wrench, Headphones, Award, ShoppingBag, Heart, Star, 
  Info, Check, ArrowRight, PhoneCall, Layers, Zap, Wifi, ChevronRight, X
} from "lucide-react";
import PcConfigurator from "./PcConfigurator";
import NetworkSections from "./NetworkSections";
import CameraSvg from "./CameraSvg";

interface CategoryPageProps {
  categoryId: string; // e.g. "pc-hardware", "netzwerke", "hotspot", "nas", "kameras", "smarthome"
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBackToHome: () => void;
  onOpenCallback: (prefilledMsg?: string) => void;
  onSelectCategory: (catName: string) => void;
  configuratorData?: ConfiguratorData;
}

export default function CategoryPage({
  categoryId,
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onBackToHome,
  onOpenCallback,
  onSelectCategory,
  configuratorData
}: CategoryPageProps) {
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [videoError, setVideoError] = useState(false);

  // Find category meta data
  const categoryInfo = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const categoryName = categoryInfo.name;

  // Filter products for this category
  const filteredProducts = products.filter(p => {
    if (!p || !p.category) return false;
    const pCatNorm = p.category.toLowerCase().replace(/[\s_-]+/g, "");
    if (categoryId === "pc-hardware") return pCatNorm.includes("hardware") || pCatNorm.includes("pc");
    if (categoryId === "netzwerke") return pCatNorm.includes("netzwerk") || pCatNorm.includes("heimnetzwerk");
    if (categoryId === "hotspot") return pCatNorm.includes("hotspot");
    if (categoryId === "nas") return pCatNorm.includes("nas");
    if (categoryId === "kameras") return pCatNorm.includes("kamera") || pCatNorm.includes("ip");
    if (categoryId === "smarthome" || categoryId === "smart-home") return pCatNorm.includes("smarthome") || pCatNorm.includes("smart");
    return pCatNorm.includes(categoryName.toLowerCase().replace(/[\s_-]+/g, ""));
  });

  const getSvgType = (imageName: string): "bullet" | "dome" | "ptz" | "set" | "smarthome" | "nas" | "netzwerk" => {
    if (!imageName) return "bullet";
    if (imageName.includes("bullet")) return "bullet";
    if (imageName.includes("dome")) return "dome";
    if (imageName.includes("ptz")) return "ptz";
    if (imageName.includes("set")) return "set";
    if (imageName.includes("smarthome")) return "smarthome";
    if (imageName.includes("nas")) return "nas";
    if (imageName.includes("netzwerk")) return "netzwerk";
    return "bullet";
  };

  // Custom Dienstleistung & Service Highlights for each category
  const getCategoryServices = () => {
    switch (categoryId) {
      case "pc-hardware":
        return {
          title: "Profi PC-Hardware, Server & Workstations nach Maß",
          subtitle: "Vom Einzelkomponenten-Kauf bis zum fertig konfigurierten High-End Server. Wir testen jedes System vor der Auslieferung 24 Stunden unter Volllast.",
          features: [
            {
              title: "Komponenten-Prüfung & Kompatibilität",
              desc: "Wir stimmen Mainboard, CPU, RAM und Kühlung präzise ab. Keine Engpässe, 100% stabile Systemleistung.",
              icon: Cpu
            },
            {
              title: "24h Belastungstest & Burn-In",
              desc: "Jedes assemblierte PC- und Server-System durchläuft vor Auslieferung Stresstests für Speicher und Prozessor.",
              icon: Wrench
            },
            {
              title: "Vor-Ort-Garantie & Support",
              desc: "Schneller Ersatzteilservice, Express-Montage und direkte Ansprechpartner bei technischen Fragen.",
              icon: Shield
            }
          ]
        };
      case "netzwerke":
        return {
          title: "Sichere & skalierbare Netzwerkinfrastruktur",
          subtitle: "High-Performance PoE-Switches, Wi-Fi 6 Mesh Access Points und Enterprise-Router für Unternehmen und Privathaushalte.",
          features: [
            {
              title: "Ausfallsichere Switch- & Router-Logik",
              desc: "Managed PoE+ Switches mit hohem Leistungsbudget für Kameras, Access Points und IP-Telefone.",
              icon: Layers
            },
            {
              title: "Garantierte Bandbreite & Latenz",
              desc: "Optimierte Traffic-Priorisierung für Videoüberwachung und rechenintensive Serverzugriffe.",
              icon: Zap
            },
            {
              title: "Netzwerkplanung & Einrichtung",
              desc: "Auf Wunsch vorkonfiguriert: Auspacken, Anschließen, Fertig – ohne langwierige Softwareinstallation.",
              icon: CheckCircle2
            }
          ]
        };
      case "hotspot":
        return {
          title: "DSGVO-konforme Gäste-WLAN & Hotspotlösungen",
          subtitle: "Lösungen für Gastronomie, Praxisräume, Hotels und Filialen. Rechtssichere Trennung von Gast- und Unternehmensnetzwerk.",
          features: [
            {
              title: "Rechtssichere Gästeanmeldung",
              desc: "Integrierte Captive Portals mit Störerhaftungs-Schutz und konfigurierbaren Nutzungsbedingungen.",
              icon: Wifi
            },
            {
              title: "Voucher- & Ticket-Druck",
              desc: "Erstellen Sie zeitlich begrenzte Zugangscodes für Ihre Kunden per Knopfdruck.",
              icon: RotateCw
            },
            {
              title: "Bandbreiten-Drosselung pro Gast",
              desc: "Verhindern Sie Netzüberlastungen durch automatische Zuweisung von Höchstgeschwindigkeiten pro Nutzer.",
              icon: Shield
            }
          ]
        };
      case "nas":
        return {
          title: "NAS-Systeme & Zentrale Cloud-Speicher",
          subtitle: "Schützen Sie Ihre Daten und Kameraaufzeichnungen auf vorinstallierten, verschlüsselten Netzwerkspeichern.",
          features: [
            {
              title: "RAID-Spiegelung für Ausfallsicherheit",
              desc: "Automatische Spiegelung aller Dateien. Fällt eine Festplatte aus, bleiben Ihre Daten zu 100% geschützt.",
              icon: Server
            },
            {
              title: "Direkter Kamera-Speicher ohne Cloud",
              desc: "Speichern Sie Videostreams lokal ohne monatliche Folgekosten und ohne Fremdzugriff.",
              icon: Shield
            },
            {
              title: "Vorkonfigurierte Einbau-Festplatten",
              desc: "Inklusive Seagate IronWolf / WD Red Enterprise Festplatten mit erweiterter Laufzeitgarantie.",
              icon: CheckCircle2
            }
          ]
        };
      case "smarthome":
      case "smart-home":
        return {
          title: "Dein Zuhause. Smart vernetzt.",
          subtitle: "Smart Home & Videoüberwachung aus einer Hand – persönlich, aus der Region.",
          features: [
            {
              title: "Zentrale Hausautomation",
              desc: "Sichere Steuerung von Beleuchtung, Heizung und Sicherheit über ein einheitliches Dashboard.",
              icon: Zap
            },
            {
              title: "Lokale Steuerung & Datenschutz",
              desc: "Keine zwingende Cloud-Abhängigkeit – Ihre Smart-Home-Daten bleiben geschützt in Ihrem lokalen Netzwerk.",
              icon: Shield
            },
            {
              title: "Kompatible Funk- & Bussysteme",
              desc: "Integration gängiger Standards für maximale Flexibilität und Zukunftssicherheit.",
              icon: CheckCircle2
            }
          ]
        };
      default:
        return {
          title: `Speziallösungen für ${categoryName}`,
          subtitle: "Geprüfte Qualitätsprodukte und Beratung vom qualifizierten IT-Fachhändler.",
          features: [
            {
              title: "Fachberatung & Konfiguration",
              desc: "Unsere Spezialisten finden die optimale Komponente für Ihren individuellen Einsatzzweck.",
              icon: Award
            },
            {
              title: "Express-Versand & Lagerware",
              desc: "Direkt ab Lager lieferbar mit schneller Zustellung in ganz Deutschland, Österreich und der Schweiz.",
              icon: CheckCircle2
            },
            {
              title: "Qualitätsversprechen",
              desc: "Ausschließlich geprüfte Markenware mit voller Herstellergarantie.",
              icon: Shield
            }
          ]
        };
    }
  };

  const services = getCategoryServices();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Category Subpage Hero Banner */}
      <div className="bg-slate-950 text-white relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {["netzwerke", "hotspot", "nas", "kameras", "pc-hardware", "smarthome", "smart-home"].includes(categoryId) && (
          <div className="absolute inset-0 z-0">
            {(categoryId === "smarthome" || categoryId === "smart-home") && configuratorData?.smartHomeBannerVideo && !videoError ? (
              <VideoBackground
                src={configuratorData.smartHomeBannerVideo}
                onError={() => setVideoError(true)}
                poster={configuratorData?.smartHomeBannerImage || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920"}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <img 
                src={
                  categoryId === "netzwerke" ? (configuratorData?.netzwerkeBannerImage || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920") :
                  categoryId === "hotspot" ? (configuratorData?.hotspotBannerImage || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1920") :
                  categoryId === "nas" ? (configuratorData?.nasBannerImage || "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=1920") :
                  categoryId === "kameras" ? (configuratorData?.camerasBannerImage || "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920") :
                  categoryId === "smarthome" || categoryId === "smart-home" ? (configuratorData?.smartHomeBannerImage || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920") :
                  (configuratorData?.hardwareBannerImage || "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1920")
                } 
                alt={categoryName} 
                className="w-full h-full object-cover opacity-90 animate-ken-burns"
                loading="lazy" decoding="async" referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15),transparent_50%)] pointer-events-none z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-20">

          {/* Title & Subtitle */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              {categoryId === "netzwerke" ? "Schnell. Sicher. Lückenlos." : services.title}
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              {categoryId === "netzwerke" ? "Professionelle PoE-Switches, High-Speed Mesh Access Points und Enterprise-Router für ausfallsichere Netzwerk-Infrastruktur im Wohn- and Geschäftsbereich." : services.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const target = document.getElementById("kategorie-produkte");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Produkte ansehen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenCallback(`Anfrage bezüglich Kategorie: ${categoryName}`)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>Kostenfreie Expertenberatung</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: Service & Dienstleistungen Explanation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-red-600 uppercase tracking-widest">
            Dienstleistung & Service
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Warum IT-MARKET für {categoryName}?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Wir liefern nicht nur einzelne Kartons, sondern durchdachte Gesamtlösungen inklusive Vorinstallation und technischem Support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold font-display text-slate-900 text-lg mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PC-Konfigurator (Specifically embedded on PC-Hardware) */}
      {categoryId === "pc-hardware" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <PcConfigurator onAddToCart={onAddToCart} onOpenCallback={onOpenCallback} configData={configuratorData} />
        </div>
      )}

      {/* SECTION 2B: Network Infrastructure Sections (IT-Market Standard for Netzwerke) */}
      {categoryId === "netzwerke" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <NetworkSections onOpenCallback={onOpenCallback} />
        </div>
      )}

      {/* SECTION 3: Auszug aus den Produkten (Product Grid) */}
      <div id="kategorie-produkte" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-extrabold text-red-600 uppercase tracking-widest">
              Geprüfte Hardware
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
              Produkte in {categoryName} ({filteredProducts.length})
            </h2>
          </div>
          
          <p className="text-xs text-slate-500 font-medium">
            Alle Produkte auf Lager & für den 24/7 Dauerbetrieb zertifiziert.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aktuell keine Einzelprodukte in dieser Ansicht</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              Nutzen Sie unseren Konfigurator oder kontaktieren Sie uns für ein maßgeschneidertes Sonderangebot.
            </p>
            <button
              onClick={() => onOpenCallback(`Anfrage bezüglich Produkte in ${categoryName}`)}
              className="mt-4 bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              Individuelles Angebot anfragen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 hover:border-red-200 transition-all duration-300 flex flex-col justify-between overflow-hidden group p-4 sm:p-4.5 relative"
                >
                  <div>
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute top-3.5 left-3.5 z-20 bg-red-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                        {product.discount}
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => onToggleWishlist(product.id)}
                      className={`absolute top-3.5 right-3.5 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
                        isWishlisted
                          ? "bg-rose-500 text-white shadow-md scale-105"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-rose-500"
                      }`}
                      aria-label="Zur Wunschliste hinzufügen"
                      title="Merken"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                    </button>

                    {/* Product Visual Area */}
                    <div className="relative h-48 sm:h-52 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-3 overflow-hidden group-hover:scale-[1.01] transition-transform">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-slate-100/50"></div>
                      <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-[1.03] flex items-center justify-center">
                        {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                          <img 
                            src={product.image} 
                            alt={product.imageAlt || product.name}
                            className="max-h-full w-auto max-w-full object-contain rounded-lg drop-shadow-md"
                            loading="lazy" decoding="async" referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-28 h-28">
                            <CameraSvg
                              type={getSvgType(product.image || "bullet")}
                              isNightVision={false}
                              isRecording={false}
                              className="w-full h-full drop-shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-bold text-slate-900 ml-1 text-[11px]">{product.rating}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">({product.reviewsCount} Bewertungen)</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold font-display text-sm text-slate-900 mb-2 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Divider */}
                    <hr className="border-t border-slate-100 my-2" />

                    {/* Specifications on Card */}
                    {(() => {
                      const labels = getSpecLabels(product.category);
                      const specItems = [
                        { label: labels.resolution, val: product.specs.resolution },
                        { label: labels.viewAngle, val: product.specs.viewAngle },
                        { label: labels.nightVision, val: product.specs.nightVision },
                        { label: labels.storage, val: product.specs.storage },
                      ].filter(s => s.val);

                      return (
                        <div className="space-y-1 mb-3 text-[11px] sm:text-xs text-slate-700 min-h-[58px] flex flex-col justify-start">
                          {specItems.map((spec, i) => (
                            <div key={i} className="flex items-start gap-1 leading-snug">
                              <span className="text-red-600 font-bold select-none shrink-0">&gt;</span>
                              <span className="text-slate-800 line-clamp-1">
                                <strong className="font-semibold text-slate-900">{spec.label}:</strong> {spec.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Shipping Status */}
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold mb-2.5 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{product.shippingStatus || "5-7 Werktage"}</span>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Footer */}
                  <div className="pt-2.5 border-t border-slate-100 mt-auto">
                    <div className="flex items-end justify-between mb-2.5">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold font-mono text-red-600">
                            {formatPrice(product.price)} €*
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {formatPrice(product.oldPrice)} €*
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">inkl. MwSt. zzgl. Versand</div>
                      </div>
                      <button
                        onClick={() => setSelectedProductForModal(product)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Beschreibung & Details ansehen"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>In den Warenkorb</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advisory Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-extrabold font-display text-white">
              Sonderkonfiguration oder Geschäftskunden-Anfrage?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Wir erstellen maßgeschneiderte Angebote für Behörden, KMUs und B2B-Kunden mit individuellen Zahlungszielen und Rabattstaffeln.
            </p>
          </div>

          <button
            onClick={() => onOpenCallback(`B2B Sonderanfrage für ${categoryName}`)}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
          >
            Sonderangebot anfordern
          </button>
        </div>
      </div>

      {selectedProductForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-5 sm:p-6 md:p-7 shadow-2xl border border-slate-100 overflow-hidden relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedProductForModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-start">
              
              {/* Product render preview */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 h-48 sm:h-56 md:h-64 flex items-center justify-center relative">
                <div className="w-full h-full flex items-center justify-center">
                  {selectedProductForModal.image && (selectedProductForModal.image.startsWith("http") || selectedProductForModal.image.startsWith("data:")) ? (
                    <img 
                      src={selectedProductForModal.image} 
                      alt={selectedProductForModal.imageAlt || selectedProductForModal.name} 
                      className="max-h-full max-w-full object-contain rounded-xl drop-shadow-xl animate-fadeIn"
                      loading="lazy" decoding="async" referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-36 h-36">
                      <CameraSvg
                        type={getSvgType(selectedProductForModal.image || "bullet")}
                        isNightVision={false}
                        className="w-full h-full drop-shadow-xl"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details & Specs list */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {selectedProductForModal.category}
                  </span>
                  
                  <h3 className="text-lg sm:text-xl font-extrabold font-display text-slate-900 mt-2 mb-1 leading-snug">
                    {selectedProductForModal.name}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                    {selectedProductForModal.description}
                  </p>

                  {/* Technical specs table (Specs grid) */}
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
                    Technische Spezifikationen
                  </h4>
                  {(() => {
                    const labels = getSpecLabels(selectedProductForModal.category);
                    const specItems = [
                      { label: labels.resolution, val: selectedProductForModal.specs.resolution },
                      { label: labels.viewAngle, val: selectedProductForModal.specs.viewAngle },
                      { label: labels.nightVision, val: selectedProductForModal.specs.nightVision },
                      { label: labels.storage, val: selectedProductForModal.specs.storage },
                      { label: labels.power, val: selectedProductForModal.specs.power },
                    ].filter(s => s.val);

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {specItems.map((spec, i) => (
                          <div key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                            <span className="text-slate-800">
                              <strong className="font-semibold text-slate-900">{spec.label}:</strong> {spec.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Action in Modal */}
                <button
                  onClick={() => {
                    onAddToCart(selectedProductForModal);
                    setSelectedProductForModal(null);
                  }}
                  className="w-full bg-red-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm mt-4 hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  In den Warenkorb ({formatPrice(selectedProductForModal.price)}€)
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

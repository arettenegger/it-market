import React, { useState } from "react";
import { Check, Cpu, HardDrive, Shield, ShoppingCart, Info, ListTodo } from "lucide-react";
import CameraSvg from "./CameraSvg";
import { Product, formatPrice } from "../types";
import { PRODUCTS } from "../data";

interface NvrHighlightProps {
  onAddToCart: (product: Product, color: string) => void;
  scrollToBestsellers: () => void;
}

export default function NvrHighlight({ onAddToCart, scrollToBestsellers }: NvrHighlightProps) {
  const [activeSetType, setActiveSetType] = useState<"starter" | "business" | "poe">("poe");
  const [justAdded, setJustAdded] = useState(false);

  // Set Packages configuration details
  const SET_PACKAGES = {
    starter: {
      name: "V-Set Basic Starter Set",
      subtitle: "Perfekt für Einfamilienhäuser & kleine Shops",
      desc: "Das ideale Einstiegs-Komplettset mit allem Nötigen für die zuverlässige Hausüberwachung.",
      price: 399,
      components: [
        "1x 4-Kanal Netzwerkrekorder (NVR)",
        "2x 2K Dome-Kameras (Indoor)",
        "1TB Western Digital Festplatte",
        "Komplette Verkabelung & Montagesets"
      ],
      productRef: PRODUCTS[1] // fallback reference or custom generator
    },
    poe: {
      name: "V-Set PoE Professional Set",
      subtitle: "Für anspruchsvolle Privathäuser & Gewerbe",
      desc: "Unser absoluter Bestseller. Lückenlose 4K-Absicherung mit PoE Plug-and-Play Technologie.",
      price: 699,
      components: [
        "1x 8-Kanal Netzwerkrekorder (NVR)",
        "4x 4K Bullet-Kameras (Outdoor IP67)",
        "2TB Seagate SkyHawk Überwachungsfestplatte",
        "4x 20m Cat6 Netzwerk-Verlegekabel"
      ],
      productRef: PRODUCTS[3] // direct link to our bestseller set!
    },
    business: {
      name: "V-Set Enterprise Business Set",
      subtitle: "Für mittlere Unternehmen, Büros & Logistik",
      desc: "Zentralisierte Hochleistungsüberwachung für anspruchsvolle Geschäftsräume mit motorisiertem Zoom.",
      price: 1199,
      components: [
        "1x 16-Kanal NVR mit Redundanzsicherung",
        "4x 4K Dome-Kameras & 2x PTZ Auto-Tracking",
        "4TB High-End Enterprise Festplatte",
        "Zentraler PoE+ Switch & 6x Verlegekabel"
      ],
      productRef: PRODUCTS[3] // fallback
    }
  };

  const currentPackage = SET_PACKAGES[activeSetType];

  const handleQuickAddPackage = () => {
    // Generate a temporary product representant based on selected config
    const customProduct: Product = {
      id: `custom-set-${activeSetType}`,
      name: currentPackage.name,
      category: "Komplettsysteme",
      description: currentPackage.desc,
      price: currentPackage.price,
      rating: 4.9,
      reviewsCount: 220,
      image: "set-pro",
      features: currentPackage.components,
      inStock: true,
      colors: ["Polar Weiß"],
      specs: {
        resolution: activeSetType === "starter" ? "2K HD" : "4K Ultra HD",
        viewAngle: "105°",
        nightVision: "Farb-Nachtsicht",
        storage: activeSetType === "starter" ? "1TB" : activeSetType === "poe" ? "2TB" : "4TB",
        power: "PoE (802.3af)"
      }
    };

    onAddToCart(customProduct, "Polar Weiß");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <section id="komplettsysteme" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Dynamic background highlights */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Interactive Toggler & Specs List) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <span className="text-xs font-bold text-blue-400 tracking-wider uppercase font-mono bg-blue-950/80 border border-blue-900/40 px-3.5 py-1.5 rounded-full self-start mb-6">
              Komplettlösungen
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-4">
              Alles aus einer Hand
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Sparen Sie Zeit und Geld mit unseren vorkonfigurierten All-in-One Überwachungssets. Alle Komponenten sind perfekt aufeinander abgestimmt und sofort startklar.
            </p>

            {/* Set Package Switcher Buttons */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 mb-8 max-w-lg">
              <button
                onClick={() => setActiveSetType("starter")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSetType === "starter" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                Starter Set
              </button>
              <button
                onClick={() => setActiveSetType("poe")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSetType === "poe" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                PoE Komplett
              </button>
              <button
                onClick={() => setActiveSetType("business")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSetType === "business" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                Business Set
              </button>
            </div>

            {/* Active Set Specs detail panel */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 mb-8 max-w-lg animate-fadeIn">
              <h3 className="text-base sm:text-lg font-bold font-display text-white mb-1">
                {currentPackage.name}
              </h3>
              <p className="text-xs text-blue-400 font-semibold mb-4">
                {currentPackage.subtitle}
              </p>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                {currentPackage.desc}
              </p>

              {/* Items included in this package list */}
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-blue-400" />
                Lieferumfang des Sets:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {currentPackage.components.map((comp, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>

              {/* Price and Add CTA within highlight panel */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">Aktionspreis</span>
                  <span className="text-2xl font-black text-white mt-1 font-mono">{formatPrice(currentPackage.price)} €</span>
                </div>
                <button
                  onClick={handleQuickAddPackage}
                  className={`py-3 px-6 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    justAdded 
                      ? "bg-emerald-600 text-white" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      Hinzugefügt!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Set in den Warenkorb
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Right Column (Complete Set SVG) */}
          <div className="lg:col-span-6 relative flex justify-center">
            
            {/* The set visual chassis */}
            <div className="w-full max-w-[440px] bg-slate-950/80 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center relative">
              
              {/* Glowing background circles for modern Linear look */}
              <div className="absolute w-44 h-44 rounded-full bg-blue-600/20 blur-3xl pointer-events-none -z-10"></div>
              
              <div className="w-full h-80 flex items-center justify-center">
                <CameraSvg 
                  type="set" 
                  isNightVision={false} 
                  isRecording={true} 
                  className="w-full h-full drop-shadow-[0_10px_20px_rgba(37,99,235,0.15)]"
                />
              </div>

              {/* Floating tech badge details */}
              <div className="absolute top-6 right-6 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-slate-300">NVR Smart Processor</span>
              </div>

              <div className="absolute bottom-6 left-6 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-300">Continuous Overwrite</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

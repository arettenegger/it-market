import React from "react";
import { Truck, RotateCcw, HelpCircle, ShieldCheck, Flame } from "lucide-react";
import { BRANDS } from "../data";

export default function Brands() {
  const vorteile = [
    {
      icon: <Truck className="w-5 h-5 text-blue-600" />,
      title: "Kostenloser Versand",
      desc: "Ab 150€ Bestellwert per DHL Express"
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-blue-600" />,
      title: "30 Tage Rückgabe",
      desc: "Sorgenfreies Testen mit Geld-zurück-Garantie"
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
      title: "Technischer Support",
      desc: "Kostenlose Hotline & Beratung von Experten"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: "Sichere Zahlung",
      desc: "SSL-verschlüsselt mit PayPal, Klarna & Kreditkarte"
    }
  ];

  return (
    <div className="bg-slate-50 border-y border-slate-100 py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Marken Section (Endless sliding carousel or clean centered grid) */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Unsere Kameras sind kompatibel mit führenden Herstellern
          </span>
          
          {/* Scrolling Container */}
          <div className="relative mt-8 flex items-center justify-center overflow-hidden">
            {/* Left and Right Gradients to fade out borders */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex gap-12 sm:gap-16 items-center animate-pulse-subtle flex-wrap justify-center opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
              {BRANDS.map((brand, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-1.5 font-display text-slate-700 hover:text-blue-600 transition-colors text-base sm:text-lg font-bold select-none cursor-default"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600/35"></span>
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Vorteile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-t border-slate-200/60 pt-12 mt-12">
          {vorteile.map((vor, i) => (
            <div 
              key={i} 
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600 flex-shrink-0">
                {vor.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                  {vor.title}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-tight">
                  {vor.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

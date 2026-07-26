import React, { useState } from "react";
import { Sparkles, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { APPLICATION_AREAS } from "../data";

export default function Applications() {
  const [activeTipId, setActiveTipId] = useState<string | null>(null);

  const toggleTip = (id: string) => {
    setActiveTipId(activeTipId === id ? null : id);
  };

  return (
    <section id="anwendungen" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-50 px-3 py-1 rounded-full">
            Einsatzorte
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3 mb-4">
            Anwendungsbereiche & Praxis
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Jeder Ort hat individuelle Anforderungen an die Videoüberwachung. Entdecken Sie maßgeschneiderte Konzepte und erhalten Sie wertvolle Tipps von unseren Experten.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {APPLICATION_AREAS.map((area) => {
            const isTipOpen = activeTipId === area.id;
            return (
              <div
                key={area.id}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg border border-slate-100 flex flex-col justify-end p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              >
                {/* Background Full-bleed Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${area.image})` }}
                />
                
                {/* Dark Gradient Overlay to make text perfectly readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none"></div>

                {/* Overlapping Content (Stripe/Linear look) */}
                <div className="relative z-10 text-left text-white">
                  
                  {/* Top Category Indicator */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-900/40 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      NexSight Empfehlung
                    </span>
                    <div className="p-1.5 bg-white/10 rounded-full text-white backdrop-blur-sm group-hover:bg-blue-600 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold font-display text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {area.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 group-hover:text-white transition-colors">
                    {area.description}
                  </p>

                  {/* Interactive Expert Tip Drawer (within Card) */}
                  <div className="border-t border-white/10 pt-3 mt-3">
                    {isTipOpen ? (
                      <div className="bg-blue-600 rounded-xl p-3 text-white text-xs font-medium animate-fadeIn flex items-start gap-2 border border-blue-500 shadow-lg">
                        <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-white fill-white/10" />
                        <div>
                          <strong className="block font-semibold mb-0.5">Experten-Tipp:</strong>
                          {area.tip}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleTip(area.id)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Experten-Tipp einblenden
                      </button>
                    )}

                    {isTipOpen && (
                      <button
                        onClick={() => toggleTip(area.id)}
                        className="text-[10px] font-bold text-slate-300 hover:text-white mt-2 block cursor-pointer"
                      >
                        Tipp ausblenden
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

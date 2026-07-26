import React, { useState } from "react";
import { Sparkles, HelpCircle, ArrowRight, ShieldCheck, ShoppingCart, RefreshCw, Check } from "lucide-react";
import { Product, formatPrice } from "../types";
import { PRODUCTS } from "../data";

interface ConfiguratorProps {
  onAddToCart: (product: Product, color: string) => void;
}

export default function Configurator({ onAddToCart }: ConfiguratorProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    area: "",
    mounting: "",
    priority: ""
  });
  const [isAdded, setIsAdded] = useState(false);

  const resetConfigurator = () => {
    setStep(1);
    setAnswers({ area: "", mounting: "", priority: "" });
    setIsAdded(false);
  };

  const selectAnswer = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }));
    setStep(prev => prev + 1);
  };

  // Diagnostic recommendation logic
  const getRecommendation = (): Product => {
    if (answers.mounting === "innen" || answers.priority === "diskret") {
      return PRODUCTS[1]; // Dome camera
    }
    if (answers.priority === "360" || answers.mounting === "flexibel") {
      return PRODUCTS[2]; // PTZ camera
    }
    if (answers.area === "lager" || answers.area === "komplex") {
      return PRODUCTS[3]; // Complete Set
    }
    return PRODUCTS[0]; // Bullet camera (default)
  };

  const recommendedProduct = getRecommendation();

  return (
    <section id="konfigurator" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-50 px-3 py-1 rounded-full">
            Kaufberater
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3 mb-3">
            Interaktiver Kamera-Konfigurator
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            In nur 3 Klicks zur perfekten Sicherheitslösung. Beantworten Sie 3 kurze Fragen, und unsere KI ermittelt die ideale Kamera für Ihr Projekt.
          </p>
        </div>

        {/* Configurator Box (Stripe-like glassmorphism card) */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-50/40 blur-3xl pointer-events-none -z-10"></div>
          
          {/* Step 1: Was überwachen */}
          {step === 1 && (
            <div className="animate-fadeIn text-left">
              <span className="text-xs font-extrabold text-blue-600 font-mono">FRAGE 1 VON 3</span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-2 mb-6">
                Was möchten Sie primär absichern und überwachen?
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => selectAnswer("area", "haus")}
                  className="p-5 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex justify-between items-center cursor-pointer group"
                >
                  <span>Einfamilienhaus / Privatgrundstück</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
                <button
                  onClick={() => selectAnswer("area", "buero")}
                  className="p-5 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex justify-between items-center cursor-pointer group"
                >
                  <span>Büro / Geschäftsräume</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
                <button
                  onClick={() => selectAnswer("area", "lager")}
                  className="p-5 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex justify-between items-center cursor-pointer group"
                >
                  <span>Lagerhalle / Baustelle / Logistik</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
                <button
                  onClick={() => selectAnswer("area", "komplex")}
                  className="p-5 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex justify-between items-center cursor-pointer group"
                >
                  <span>Mehrere Gebäude / Komplexes Areal</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Montage */}
          {step === 2 && (
            <div className="animate-fadeIn text-left">
              <span className="text-xs font-extrabold text-blue-600 font-mono">FRAGE 2 VON 3</span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-2 mb-6">
                Wo wird die Kamera hauptsächlich montiert?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => selectAnswer("mounting", "aussen")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Außenbereich</span>
                  <span className="text-sm">Ungeschützte Hausfassade / Garten</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
                <button
                  onClick={() => selectAnswer("mounting", "innen")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Innenbereich</span>
                  <span className="text-sm">Decken- oder Wandmontage im Raum</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
                <button
                  onClick={() => selectAnswer("mounting", "flexibel")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Weitläufig</span>
                  <span className="text-sm">Flexible 360°-Rundumsicht gefordert</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Priorität */}
          {step === 3 && (
            <div className="animate-fadeIn text-left">
              <span className="text-xs font-extrabold text-blue-600 font-mono">FRAGE 3 VON 3</span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-2 mb-6">
                Was ist Ihre absolute oberste Priorität?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => selectAnswer("priority", "abschreckung")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Prävention</span>
                  <span className="text-sm">Hohe optische Abschreckung gegen Einbrecher</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
                <button
                  onClick={() => selectAnswer("priority", "diskret")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Design</span>
                  <span className="text-sm">Diskretes Design, das sich harmonisch einfügt</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
                <button
                  onClick={() => selectAnswer("priority", "360")}
                  className="p-6 border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl text-left transition-all font-semibold text-slate-800 flex flex-col justify-between h-36 cursor-pointer group"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">Details</span>
                  <span className="text-sm">Aktives Verfolgen & optischer Zoom auf Kennzeichen</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
                </button>
              </div>
            </div>
          )}

          {/* Recommendation Result Display */}
          {step === 4 && (
            <div className="animate-fadeIn text-left grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
              
              {/* Product render */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col items-center justify-center relative aspect-square max-w-sm mx-auto">
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-white fill-white/10" />
                  UNSERE EMPFEHLUNG
                </span>
                <div className="w-32 h-32 mt-4">
                  {/* Since recommendedProduct is selected, we can render the correct SVG based on ID */}
                  {/* Dynamic loader */}
                  <div className="w-full h-full font-bold font-mono text-blue-600 flex items-center justify-center">
                    {recommendedProduct.name.includes("Bullet") ? (
                      <div className="w-full h-full"><svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 stroke-current stroke-2 fill-none"><rect x="20" y="30" width="50" height="30" rx="4" /><circle cx="70" cy="45" r="10" /><line x1="15" y1="60" x2="35" y2="80" /></svg></div>
                    ) : recommendedProduct.name.includes("Dome") ? (
                      <div className="w-full h-full"><svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 stroke-current stroke-2 fill-none"><path d="M20,50 A30,30 0 0,1 80,50 Z" /><rect x="15" y="50" width="70" height="10" rx="2" /><circle cx="50" cy="50" r="8" /></svg></div>
                    ) : recommendedProduct.name.includes("PTZ") ? (
                      <div className="w-full h-full"><svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 stroke-current stroke-2 fill-none"><circle cx="50" cy="45" r="25" /><path d="M30,70 L70,70 L80,90 L20,90 Z" /><circle cx="50" cy="45" r="10" fill="currentColor" /></svg></div>
                    ) : (
                      <div className="w-full h-full"><svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 stroke-current stroke-2 fill-none"><rect x="10" y="30" width="60" height="40" rx="4" /><rect x="25" y="45" width="30" height="10" rx="2" /><circle cx="85" cy="50" r="12" /></svg></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendation details column */}
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Kaufempfehlung erhalten
                </span>
                
                <h3 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 mt-3 mb-2">
                  {recommendedProduct.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                  Basierend auf Ihren Angaben ist diese Kamera die beste Option. Sie bietet optimalen Schutz für Ihr Vorhaben, lässt sich einfach montieren und entspricht perfekt Ihren Qualitätsansprüchen.
                </p>

                {/* Specs table summary */}
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-5">
                  <div className="flex items-start gap-1.5 leading-snug">
                    <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                    <span className="text-slate-800"><strong className="font-semibold text-slate-900">Auflösung:</strong> {recommendedProduct.specs.resolution}</span>
                  </div>
                  <div className="flex items-start gap-1.5 leading-snug">
                    <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                    <span className="text-slate-800"><strong className="font-semibold text-slate-900">Nachtsicht:</strong> {recommendedProduct.specs.nightVision}</span>
                  </div>
                  <div className="flex items-start gap-1.5 leading-snug">
                    <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                    <span className="text-slate-800"><strong className="font-semibold text-slate-900">Qualität:</strong> Geprüfte Markenware</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(recommendedProduct, recommendedProduct.colors[0]);
                      setIsAdded(true);
                      setTimeout(() => setIsAdded(false), 2000);
                    }}
                    className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex justify-center items-center gap-1.5 transition-all cursor-pointer ${
                      isAdded 
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/15"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce text-white" />
                        In den Warenkorb gelegt!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        In den Warenkorb ({formatPrice(recommendedProduct.price)}€)
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetConfigurator}
                    className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Nochmal starten
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* Progress dots footer */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-6">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step 
                      ? "w-6 bg-blue-600" 
                      : s < step 
                      ? "w-2.5 bg-blue-600/30" 
                      : "w-2.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
            
            {step < 4 && (
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 select-none">
                <HelpCircle className="w-3.5 h-3.5" />
                Unverbindliche Analyse
              </span>
            )}
            {step === 4 && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                <ShieldCheck className="w-4 h-4" />
                Analyse abgeschlossen
              </span>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

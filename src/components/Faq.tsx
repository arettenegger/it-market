import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { FAQS } from "../data";

export default function Faq() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-50 px-3 py-1 rounded-full">
            Häufige Fragen
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3">
            Häufig gestellte Fragen (FAQ)
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Haben Sie Fragen zu unseren Produkten? Hier finden Sie schnelle Antworten rund um Installation, PoE-Technologie und Fernzugriff.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-slate-50 hover:bg-white border rounded-3xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? "border-blue-600 bg-white shadow-xl shadow-blue-500/5 ring-1 ring-blue-600/5" 
                    : "border-slate-100 hover:border-blue-200"
                }`}
              >
                {/* Header click bar */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-6 py-5 sm:py-6 flex justify-between items-center gap-4 focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <HelpCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-blue-50 text-blue-600" : ""
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Answer Content Container with smooth height animation */}
                {isOpen && (
                  <div className="px-6 pb-6 sm:pb-7 pl-16 pr-10 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fadeIn">
                    <p className="border-t border-slate-100 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Callback CTA Trigger bottom */}
        <div className="mt-14 bg-blue-50 rounded-3xl p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <MessageSquare className="w-5 h-5 fill-white/10" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 font-display">Ihre Frage wurde nicht beantwortet?</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Unser technischer Support berät Sie gerne unverbindlich.</p>
            </div>
          </div>
          <button
            onClick={() => {
              const header = document.getElementById("main-header");
              if (header) {
                // we trigger newsletter or scroll to footer support
                const newsletter = document.getElementById("newsletter");
                if (newsletter) newsletter.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            Kontakt aufnehmen
          </button>
        </div>

      </div>
    </section>
  );
}

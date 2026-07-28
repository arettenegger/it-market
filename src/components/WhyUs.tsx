import React from "react";
import { Clock, ShieldAlert, PhoneCall, Award, Eye, BellRing, Sparkles, CheckCircle2 } from "lucide-react";

export default function WhyUs() {
  const features = [
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      title: "24/7 Überwachung",
      desc: "Lückenlose Absicherung und Aufzeichnung bei Tag und Nacht. Zuverlässig bei jeder Witterung und Temperatur."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-blue-600" />,
      title: "KI-Bewegungserkennung",
      desc: "Smarte Algorithmen unterscheiden präzise zwischen Menschen, Fahrzeugen, Haustieren und bedeutungslosen Blättern."
    },
    {
      icon: <PhoneCall className="w-5 h-5 text-blue-600" />,
      title: "Kostenlose Beratung",
      desc: "Unsere Sicherheitsexperten planen gemeinsam mit Ihnen die optimale Positionierung und Konfiguration Ihrer Kameras."
    },
    {
      icon: <Award className="w-5 h-5 text-blue-600" />,
      title: "Geprüfte Premium-Qualität",
      desc: "Ausschließlich getestete Markenkomponenten mit voller Herstellergarantie für langlebige Sicherheit."
    }
  ];

  return (
    <section id="warum-wir" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative linear background meshes */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-blue-50/30 blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Premium image with overlapping cards) */}
          <div className="lg:col-span-5 relative flex justify-center order-last lg:order-first">
            
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl group border border-slate-100">
              {/* Camera on Wall Exterior Facade */}
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=600&auto=format&fit=crop')"
                }}
              />
              
            </div>

            {/* Overlapping small visual micro-stats */}
            <div className="absolute -top-6 -right-6 md:-right-10 bg-white rounded-2xl shadow-xl p-4 border border-slate-50 flex items-center gap-3 hidden sm:flex">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">100% DSGVO</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Konforme Speicherung</span>
              </div>
            </div>

          </div>

          {/* Right Column (Copywriting and Feature Grid) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-50 px-3 py-1 rounded-full self-start">
              Sicherheit & Vertrauen
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3 mb-6">
              Warum Kunden uns vertrauen
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-10 max-w-xl">
              Unsere Kamerasysteme verbinden modernste Videoüberwachungstechnologie mit simpler Bedienung. Wir legen höchsten Wert auf Ihre Privatsphäre, absolute Verlässlichkeit im Notfall und einen unschlagbaren, persönlichen Kundenservice.
            </p>

            {/* Feature Cards Grid (2x2 Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {features.map((feat, i) => (
                <div 
                  key={i}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100/60 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center mb-4 text-blue-600">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

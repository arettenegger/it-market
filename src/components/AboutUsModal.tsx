import React from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Camera, 
  Cpu, 
  Wifi, 
  HardDrive, 
  PhoneCall, 
  Mail, 
  MapPin, 
  User, 
  Award, 
  CheckCircle2, 
  Headphones, 
  Wrench, 
  Users
} from "lucide-react";

interface AboutUsProps {
  onBackToHome: () => void;
  onOpenCallback?: () => void;
}

export default function AboutUsModal({ onBackToHome, onOpenCallback }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF5E2E]" />
          <span>Zurück zur Startseite</span>
        </button>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5E2E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5E2E]/10 border border-[#FF5E2E]/20 text-[#FF5E2E] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              IT Service Rettenegger — Ihr Fachbetrieb aus Oberösterreich
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display leading-tight">
              Sicherheit, Netzwerktechnik & moderne IT-Lösungen
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Seit vielen Jahren steht <strong className="text-white">IT Service Rettenegger</strong> für kompetente Beratung, maßgeschneiderte Videoüberwachungssysteme, Hochleistungs-Netzwerke und verlässliche EDV-Dienstleistungen. Wir bieten Privathaushalten, Gewerbebetrieben und öffentlichen Einrichtungen individuelle Sicherheits- und IT-Konzepte.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold">
                <MapPin className="w-4 h-4 text-[#FF5E2E]" />
                Reichraming, Oberösterreich
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold">
                <Award className="w-4 h-4 text-emerald-400" />
                Geprüfte Premium-Qualität
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold">
                <Headphones className="w-4 h-4 text-cyan-400" />
                Persönlicher Ansprechpartner
              </div>
            </div>
          </div>
        </div>

        {/* Company Specs & Ownership */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF5E2E]">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inhaberin</h3>
            <p className="text-lg font-black text-white">Doris Rettenegger</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leitung & Kundenservice mit Fokus auf kundennahe Beratung und vertrauensvolle Projektabwicklung.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Standort</h3>
            <p className="text-lg font-black text-white">4462 Reichraming</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sulzbachstraße 2, Österreich. Regional verwurzelt, österreichweit für Sie im Einsatz.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direkter Kontakt</h3>
            <p className="text-sm font-bold text-slate-200">+43 (0) 7255 - 211 00</p>
            <p className="text-xs text-slate-400">doris@it-market.at</p>
            <p className="text-xs text-slate-400">www.it-market.at</p>
          </div>
        </div>

        {/* Our Competencies / Services */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Unsere Kernkompetenzen
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Alles aus einer Hand — von der Planung über die Hard- und Softwareauswahl bis zur Betriebsbereitschaft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* IP Kameras & Videoüberwachung */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">IP-Kameras & Videoüberwachung</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Moderne 4K UltraHD Netzwerkkameras mit farbiger Nachtsicht (ColorVu/DarkFighter), KI-Personen- und Fahrzeugerkennung.
              </p>
            </div>

            {/* Netzwerke & Hotspots */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF5E2E]">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">Netzwerk- & Hotspotlösungen</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sichere WLAN-Gästenetze, professionelle Switches, Router und strukturiertes Gebäudenetzwerk für Betriebe & Gastronomie.
              </p>
            </div>

            {/* NAS & Server Speicher */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">NAS & Videoaufzeichnung</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zuverlässige NVR-Rekorder & NAS-Speichersysteme für langzeitige Videosequenzen, Redundanz und dezentrale Datensicherung.
              </p>
            </div>

            {/* PC Hardware & IT Service */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">PC-Hardware & IT Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Individuelle PC-Systemkonfiguration, EDV-Betreuung, System-Aufrüstung und schnelle Hilfe bei technischen Fragen.
              </p>
            </div>

          </div>
        </div>

        {/* Why Choose Us / Guarantees */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Warum Kunden IT Service Rettenegger vertrauen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">Volle Herstellergarantie</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Wir verbauen ausschließlich zertifizierte Markenhardware mit voller Herstellergarantie.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">DSGVO-konforme Lösungen</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Wir achten bei Kamera- und Netzwerkinstallationen konsequent auf Datenschutzgesetze und Privatsphäre-Einstellungen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">Unverbindliche Erstberatung</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Wir analysieren Ihr Objekt oder Netzwerk kostenlos und erstellen maßgeschneiderte Lösungsvorschläge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">Inhaberin-geführter Betrieb</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Direkte Ansprechpartner ohne verwickelte Hotline-Schleifen — schneller, persönlicher Service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Contact Section */}
        <div className="bg-gradient-to-r from-[#FF5E2E] to-orange-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black font-display">Haben Sie Fragen zu unseren Produkten oder Projekten?</h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Rufen Sie uns direkt an oder fordern Sie einen kostenlosen Rückruf an. Wir beraten Sie gerne!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {onOpenCallback && (
              <button
                onClick={onOpenCallback}
                className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#FF5E2E]" />
                <span>Rückruf anfordern</span>
              </button>
            )}
            <a
              href="mailto:doris@it-market.at"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>E-Mail senden</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

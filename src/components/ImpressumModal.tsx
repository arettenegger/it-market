import React from "react";
import { ArrowLeft, Shield, Mail, Phone, MapPin, Building, FileText, CheckCircle } from "lucide-react";

interface ImpressumProps {
  onBackToHome: () => void;
}

export default function ImpressumModal({ onBackToHome }: ImpressumProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="mb-8 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF5E2E]" />
          <span>Zurück zur Startseite</span>
        </button>

        {/* Impressum Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E2E]/10 border border-[#FF5E2E]/20 text-[#FF5E2E] text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              Rechtliche Anbieterkennzeichnung
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Impressum
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Angaben gemäß § 5 ECG / § 14 UGB / § 25 MedienG (Österreich)
            </p>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            
            {/* Firmenangaben */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medieninhaber & Betreiber</h3>
                  <p className="text-base font-extrabold text-white">IT Service Rettenegger</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Inhaber: Doris Rettenegger</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Anschrift</h3>
                  <p className="text-slate-200">Sulzbachstraße 2</p>
                  <p className="text-slate-200">4462 Reichraming</p>
                  <p className="text-slate-400 text-xs mt-0.5">Österreich / Oberösterreich</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Firmendaten</h3>
                  <p className="text-slate-300 text-xs"><strong className="text-slate-200">Firmenbuchgericht:</strong> BH Steyr-Land</p>
                </div>
              </div>
            </div>

            {/* Kontakt & Gewerbe */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kontakt</h3>
                  <p className="text-slate-200 text-xs"><strong className="text-slate-400">Telefon:</strong> +43 (0) 7255 - 211 00</p>
                  <p className="text-slate-200 text-xs"><strong className="text-slate-400">E-Mail:</strong> doris@it-market.at</p>
                  <p className="text-slate-200 text-xs"><strong className="text-slate-400">Web:</strong> www.it-market.at</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#FF5E2E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gewerberechtliche Vorschriften</h3>
                  <p className="text-slate-300 text-xs"><strong className="text-slate-200">Gewerbewortlaut:</strong> Dienstleistungen in der automatischen Datenverarbeitung und Informationstechnik</p>
                  <p className="text-slate-300 text-xs mt-1"><strong className="text-slate-200">Aufsichtsbehörde:</strong> Bezirkshauptmannschaft Steyr</p>
                  <p className="text-slate-300 text-xs"><strong className="text-slate-200">Kammermitgliedschaft:</strong> Wirtschaftskammer OÖ (WKO)</p>
                  <p className="text-slate-300 text-xs"><strong className="text-slate-200">Anwendbare Rechtsvorschriften:</strong> Gewerbeordnung (GewO) unter <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">www.ris.bka.gv.at</a></p>
                </div>
              </div>
            </div>

          </div>

          {/* EU Streitschlichtung & Haftung */}
          <div className="border-t border-slate-800 pt-6 space-y-4 text-xs text-slate-400 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-200 mb-1">Online-Streitbeilegung (OS)</h4>
              <p>
                Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten:{" "}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                  https://ec.europa.eu/consumers/odr
                </a>. Sie können allfällige Beschwerde auch an die oben angeführte E-Mail-Adresse richten.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-1">Haftung für Inhalte dieser Website</h4>
              <p>
                Wir entwickeln die Inhalte dieser Webseite ständig weiter und bemühen uns korrekte und aktuelle Informationen bereitzustellen. Leider können wir keine Haftung für die Korrektheit aller Inhalte auf dieser Webpräsenz übernehmen, speziell für jene die seitens Dritter bereitgestellt werden.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-1">Urheberrechtshinweis</h4>
              <p>
                Alle Inhalte dieser Webseite (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Falls notwendig, werden wir die unerlaubte Nutzung von Teilen der Inhalte unserer Seite rechtlich verfolgen.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

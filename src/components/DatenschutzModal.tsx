import React from "react";
import { ArrowLeft, Shield, Mail, Phone, MapPin, Lock, FileText, CheckCircle, Database } from "lucide-react";

interface DatenschutzProps {
  onBackToHome: () => void;
}

export default function DatenschutzModal({ onBackToHome }: DatenschutzProps) {
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

        {/* Datenschutz Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E2E]/10 border border-[#FF5E2E]/20 text-[#FF5E2E] text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              Datenschutzerklärung (DSGVO & TKG 2021)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Datenschutz & Informationspflicht
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Transparente Information über die Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten gemäß der EU-Datenschutz-Grundverordnung (DSGVO).
            </p>
          </div>

          {/* 1. Verantwortlicher */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              1. Name und Kontaktdaten des Verantwortlichen
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-1 text-slate-300">
              <p className="font-extrabold text-white text-sm">IT Service Rettenegger</p>
              <p>Inhaberin: Doris Rettenegger</p>
              <p>Sulzbachstraße 2, 4462 Reichraming, Österreich</p>
              <p><strong>Telefon:</strong> +43 (0) 7255 - 211 00</p>
              <p><strong>E-Mail:</strong> doris@it-market.at</p>
              <p><strong>Website:</strong> www.it-market.at</p>
            </div>
          </div>

          {/* 2. Erhebung und Speicherung personenbezogener Daten */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Beim Aufrufen unserer Website sowie bei Interaktionen im Online-Shop (Anfragen, Produkt-Konfigurationen, Warenkorb, Rückrufwünsche) verarbeiten wir personenbezogene Daten.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FF5E2E]" />
                  Kontaktaufnahme & Rückruf
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Wenn Sie das Kontaktformular oder den Rückruf-Service nutzen, werden Name, Telefonnummer, Bereich sowie Ihre Nachricht zwecks Bearbeitung der Anfrage verarbeitet (Art. 6 Abs. 1 lit. b DSGVO).
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Bestellungen & Konfiguration
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Ihre Auswahl im Netzwerkkamera- und NVR-Konfigurator sowie Warenkorbdaten werden zur Abwicklung des vorvertraglichen Verhältnisses gespeichert.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Server-Log-Files & Hosting */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              3. Server-Log-Files & Cloud-Infrastruktur
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem und Referrer URL</li>
              <li>Hostname des zugreifenden Rechners / IP-Adresse</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Die Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der technischen Stabilität, IT-Sicherheit und fehlerfreien Bereitstellung der Dienste).
            </p>
          </div>

          {/* 4. Firebase Cloud Services & Authentifizierung */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              4. Nutzung von Firebase Cloud Services & Authentifizierung
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Für dynamische Funktionen (Echtzeit-Synchronisierung der Produkte, Mediendateien, Kundenanfragen) nutzen wir Dienste von Google Firebase (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland).
            </p>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2 text-slate-300">
              <p>
                <strong>Firestore & Firebase Storage:</strong> Speicherung von Konfigurationsdaten, Produktkatalogen und hochgeladenen Systemdateien.
              </p>
              <p>
                <strong>Firebase Authentication:</strong> Bietet ausschließlich für Administratoren eine sichere Anmeldung per E-Mail/Passwort. Für Besucher findet keine Anmeldung statt.
              </p>
            </div>
          </div>

          {/* 5. Cookies & Google Analytics */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              5. Cookies & Google Analytics
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Diese Website verwendet – ausschließlich mit Ihrer vorherigen Einwilligung über das Cookie-Banner – den Webanalysedienst Google Analytics 4 (GA4) der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-300 leading-relaxed">
              <p>
                <strong>Zweck:</strong> Anonyme Reichweitenmessung – wir werten aus, welche Seiten wie häufig besucht werden, um unser Angebot zu verbessern. Dabei werden Cookies gesetzt und Nutzungsdaten (z. B. aufgerufene Seiten, ungefähre Region, Gerätetyp, Referrer) verarbeitet.
              </p>
              <p>
                <strong>Rechtsgrundlage:</strong> Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 165 Abs. 3 TKG 2021. Google Analytics wird <strong className="text-white">erst geladen und aktiv, nachdem Sie im Cookie-Banner auf „Akzeptieren" geklickt haben</strong>. Ohne Einwilligung findet kein Tracking statt und es werden keine Analyse-Cookies gesetzt.
              </p>
              <p>
                <strong>IP-Anonymisierung:</strong> GA4 kürzt bzw. anonymisiert IP-Adressen standardmäßig; vollständige IP-Adressen werden nicht gespeichert.
              </p>
              <p>
                <strong>Datenübermittlung in die USA:</strong> Eine Übermittlung an Google LLC in den USA kann nicht ausgeschlossen werden. Diese erfolgt auf Grundlage der EU-Standardvertragsklauseln bzw. des EU-US Data Privacy Framework.
              </p>
              <p>
                <strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie die Cookies in Ihrem Browser löschen (das Banner erscheint dann erneut) oder das Deaktivierungs-Add-on von Google installieren: <span className="text-cyan-400 break-all">https://tools.google.com/dlpage/gaoptout</span>.
              </p>
              <p>
                Weitere Informationen zum Datenschutz bei Google: <span className="text-cyan-400 break-all">https://policies.google.com/privacy</span>.
              </p>
            </div>
          </div>

          {/* 6. Betroffenenrechte */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-l-2 border-[#FF5E2E] pl-3">
              6. Ihre Rechte gemäß DSGVO
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Auskunftsrecht (Art. 15 DSGVO)</span>
                <p className="text-slate-400 text-[11px]">Sie haben das Recht, jederzeit Bestätigung darüber zu verlangen, ob personenbezogene Daten verarbeitet werden.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Recht auf Löschung (Art. 17 DSGVO)</span>
                <p className="text-slate-400 text-[11px]">Sie können die unverzügliche Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei uns (<strong className="text-slate-200">doris@it-market.at</strong>) oder der zuständigen Aufsichtsbehörde beschweren:
            </p>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
              <p className="font-bold text-white">Österreichische Datenschutzbehörde (DSB)</p>
              <p className="text-slate-400 text-[11px]">Barichgasse 40-42, 1030 Wien | Telefon: +43 1 52 152-0 | E-Mail: dsb@dsb.gv.at</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

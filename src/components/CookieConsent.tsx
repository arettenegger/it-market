import React, { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { getConsent, setConsent, trackPageView } from "../lib/analytics";

interface CookieConsentProps {
  onOpenDatenschutz?: () => void;
}

export default function CookieConsent({ onOpenDatenschutz }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Banner nur zeigen, wenn noch keine Entscheidung getroffen wurde
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent("accepted");
    // aktuelle Seite gleich zählen
    trackPageView(window.location.pathname, document.title);
    setVisible(false);
  };

  const reject = () => {
    setConsent("rejected");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4 animate-slideUp">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Wir verwenden Cookies für eine anonyme Reichweitenmessung (Google Analytics), um unsere Website zu verbessern.
            Technisch notwendige Funktionen bleiben davon unberührt.{" "}
            {onOpenDatenschutz && (
              <button onClick={onOpenDatenschutz} className="text-blue-600 hover:text-blue-700 underline font-semibold cursor-pointer">
                Datenschutz
              </button>
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}

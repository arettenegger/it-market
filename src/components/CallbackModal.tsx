import React, { useState } from "react";
import { X, PhoneCall, CheckCircle, ShieldAlert, Sparkles, Send } from "lucide-react";

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export default function CallbackModal({ isOpen, onClose, initialTopic }: CallbackModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    time: "sofort",
    sector: "privat",
    note: initialTopic || ""
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialTopic when opened
  React.useEffect(() => {
    if (initialTopic) {
      setFormData(prev => ({ ...prev, note: initialTopic }));
    }
  }, [initialTopic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      setIsSubmitting(true);

      // Send to Formspree
      try {
        await fetch("https://formspree.io/f/mpqvkzkr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            _subject: `Rückruf / Kontakt-Anfrage: ${formData.name}`,
            Formular: "Rückruf- / Fachberatungs-Formular",
            Name: formData.name,
            Telefon: formData.phone,
            Bereich: formData.sector === "privat" ? "Privatgrundstück" : "Unternehmen / Gewerbe",
            Rückrufzeit: formData.time === "sofort" ? "Schnellstmöglich" : formData.time === "abend" ? "Heute Abend (17 - 20 Uhr)" : "Morgen Vormittag",
            Anmerkung: formData.note || "-"
          })
        });
      } catch (err) {
        console.error("Formspree submission error:", err);
      } finally {
        setIsSubmitting(false);
      }

      // Save callback request to localStorage so it is available in Admin Panel
      const callId = "call-" + Math.floor(100 + Math.random() * 900);
      const dateOptions: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      };
      const dateStr = new Date().toLocaleDateString('de-DE', dateOptions);
      
      const newCallback = {
        id: callId,
        date: dateStr,
        name: formData.name,
        phone: formData.phone,
        topic: `Fachberatung (${formData.sector === "privat" ? "Privat" : "Gewerbe"}, Erreichbarkeit: ${formData.time === "sofort" ? "Sofort" : "Später"})${formData.note ? ` - ${formData.note}` : ""}`,
        status: "Offen"
      };

      const savedCallbacks = localStorage.getItem("bewacht_vernetzt_callbacks");
      let currentCallbacks = [];
      if (savedCallbacks) {
        try {
          currentCallbacks = JSON.parse(savedCallbacks);
        } catch (err) {
          console.error(err);
        }
      }
      const updatedCallbacks = [newCallback, ...currentCallbacks];
      try {
        localStorage.setItem("bewacht_vernetzt_callbacks", JSON.stringify(updatedCallbacks));
      } catch (e) {}

      setIsSuccess(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn z-10 text-left">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-50/50 blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 mb-2">
              Rückruf angefordert!
            </h3>
            
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed mb-6">
              Wir haben Ihre Anfrage erhalten. Ein zertifizierter Bewacht & Vernetzt Sicherheitsberater wird Sie unter <strong className="text-slate-800 font-mono">{formData.phone}</strong> anrufen.
            </p>

            {/* Simulated Countdown tracker */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-xs mx-auto mb-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Durchschnittliche Wartezeit</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">~ 12 Minuten</span>
            </div>

            <button 
              onClick={() => {
                setIsSuccess(false);
                setFormData({ name: "", phone: "", time: "sofort", sector: "privat" });
                onClose();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-xs sm:text-sm cursor-pointer transition-all"
            >
              Schließen
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <PhoneCall className="w-5 h-5 fill-blue-600/10" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">Fachberatung anfordern</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kostenlos und unverbindlich von Experten.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ihr Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Max Mustermann"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Telefonnummer (für Rückruf)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="z.B. +49 170 1234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all font-mono"
                />
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Bereich</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="privat">Privatgrundstück</option>
                    <option value="gewerblich">Unternehmen / Gewerbe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Rückrufzeit</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="sofort">Schnellstmöglich</option>
                    <option value="abend">Heute Abend (17 - 20 Uhr)</option>
                    <option value="morgen">Morgen Vormittag</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-500 leading-normal">
                <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />
                <span>Wir erstellen für Sie ein kostenloses Montage- und Positionierungskonzept basierend auf Ihren Angaben.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Wird gesendet..." : "Kostenlosen Rückruf anfordern"}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

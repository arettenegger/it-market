import React, { useState } from "react";
import { Mail, CheckCircle, Send, Sparkles, ShieldCheck } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setIsSubmitting(true);
      try {
        const { requestDoubleOptIn } = await import("../lib/newsletterService");
        const res = await requestDoubleOptIn(email, "Footer Newsletter Formular");
        if (res.isAlreadyConfirmed) {
          setIsAlreadyConfirmed(true);
        } else {
          setIsAlreadyConfirmed(false);
        }
        setIsSubmitted(true);
        setIsError(false);
      } catch (err) {
        console.error("Double Opt-In submission error:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsError(true);
    }
  };

  return (
    <section id="newsletter" className="py-16 md:py-20 bg-white relative overflow-hidden">
      
      {/* Absolute decorative blurred rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[40px] p-8 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
          
          {/* Subtle grid accent markings inside the dark container */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

          {isSubmitted ? (
            <div className="max-w-md mx-auto text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 animate-bounce text-blue-500" />
              </div>
              
              <h3 className="text-2xl font-bold font-display text-white mb-2">
                {isAlreadyConfirmed ? "Bereits verifiziert!" : "Bitte E-Mail bestätigen (Double Opt-In)"}
              </h3>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                {isAlreadyConfirmed ? (
                  <>Ihre E-Mail-Adresse <strong className="text-white">{email}</strong> ist bereits für unseren Newsletter bestätigt.</>
                ) : (
                  <>Wir haben eine Bestätigungs-E-Mail an <strong className="text-white">{email}</strong> gesendet. Bitte klicken Sie auf den enthaltenen Bestätigungslink (Double Opt-In), um Ihre Anmeldung zu verifizieren und in Firestore zu aktivieren.</>
                )}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>DSGVO-konformes Double-Opt-In-Verfahren</span>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Mit einer anderen E-Mail anmelden
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              
              {/* Top micro badge */}
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3 h-3" />
                EXKLUSIVE ANGEBOTE & SICHERHEITS-TIPS
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight mb-4">
                Keine Angebote mehr verpassen
              </h2>

              {/* Subtitle */}
              <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-8 leading-relaxed">
                Melden Sie sich jetzt an und erhalten Sie sofort einen <strong className="text-white">10% Rabattcode (NEX10)</strong> für Ihre erste Angebotsanfrage sowie wertvolle Ratgeber zur Einbruchsprävention.
              </p>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3 relative">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsError(false);
                    }}
                    placeholder="Ihre E-Mail-Adresse"
                    className={`w-full bg-slate-900 border text-white pl-11 pr-4 py-3.5 rounded-2xl text-xs sm:text-sm outline-none focus:bg-slate-950 focus:border-blue-500 transition-all ${
                      isError ? "border-rose-500 ring-2 ring-rose-500/10" : "border-slate-800"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Wird gesendet..." : "Jetzt anmelden"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {isError && (
                <p className="text-rose-400 text-xs mt-3 animate-fadeIn">
                  Bitte geben Sie eine gültige E-Mail-Adresse ein.
                </p>
              )}

              {/* Data protection disclosure */}
              <p className="text-[10px] text-slate-500 mt-5">
                Abmeldung jederzeit kostenlos möglich. Ihre Daten sind DSGVO-konform verschlüsselt.
              </p>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}

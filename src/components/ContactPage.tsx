import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Headphones, 
  ShieldCheck, 
  MessageSquare,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  Copy,
  Check
} from "lucide-react";

interface ContactPageProps {
  onBackToHome: () => void;
  onOpenCallback?: () => void;
}

export default function ContactPage({ onBackToHome, onOpenCallback }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Allgemeine Anfrage",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("doris@it-market.at");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Bitte füllen Sie alle Pflichtfelder aus (*).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://formspree.io/f/mpqvkzkr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `Kontaktformular Anfrage: ${formData.subject} - ${formData.name}`,
          Name: formData.name,
          Email: formData.email,
          Telefon: formData.phone || "Keine Angabe",
          Betreff: formData.subject,
          Nachricht: formData.message,
          Datum: new Date().toLocaleString("de-DE")
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "Allgemeine Anfrage", message: "" });
      } else {
        setErrorMessage("Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.");
      }
    } catch (err) {
      console.error("Kontaktformular Fehler:", err);
      setErrorMessage("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Back Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2.5 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
            <span>Zurück zur Startseite</span>
          </button>
          <span className="text-xs text-slate-500 font-mono">Kontakt & Beratung</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Persönliche Fachberatung</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            Treten Sie mit uns in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">Kontakt</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Haben Sie Fragen zu unseren Überwachungssystemen, Netzwerk-Setups oder benötigen Sie ein individuelles Angebot? Unser Expertenteam ist gerne für Sie da.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* E-Mail Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">E-Mail Support</h3>
                <p className="text-xs text-slate-400 mt-1">Schreiben Sie uns jederzeit – wir antworten in der Regel innerhalb von 24 Stunden.</p>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono">
                  <span>doris@it-market.at</span>
                  <button 
                    onClick={handleCopyEmail}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="E-Mail kopieren"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <a 
              href="mailto:doris@it-market.at" 
              className="mt-6 inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl py-2.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>E-Mail senden</span>
            </a>
          </div>

          {/* Telefon / Callback Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Rückruf-Service</h3>
                <p className="text-xs text-slate-400 mt-1">Wünschen Sie eine telefonische Beratung? Wir rufen Sie gerne zum Wunschtermin zurück.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mo – Fr: 08:00 – 18:00 Uhr</span>
                </div>
                <p className="text-[11px] text-slate-500">Kostenlos & unverbindlich</p>
              </div>
            </div>
            <button 
              onClick={onOpenCallback}
              className="mt-6 inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl py-2.5 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Rückruf anfordern</span>
            </button>
          </div>

          {/* Standorte / Beratung Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Firmensitz & Zentrale</h3>
                <p className="text-xs text-slate-400 mt-1">IT-Service Rettenegger Doris</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-white">Sulzbachstraße 2</p>
                <p className="text-slate-400">4462 Reichraming, Österreich</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px]">Beratung & Verkauf für B2B & Privatkunden</span>
            </div>
          </div>

        </div>

        {/* Contact Form Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-8 relative">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white font-display">Nachricht senden</h2>
              <p className="text-xs text-slate-400">Füllen Sie das Formular aus – wir melden uns umgehend bei Ihnen.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Vielen Dank für Ihre Anfrage!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Ihre Nachricht wurde erfolgreich übermittelt. Wir bearbeiten Ihr Anliegen umgehend und melden uns per E-Mail oder Telefon bei Ihnen.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-xl px-5 py-2.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Weitere Nachricht senden</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Ihr Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Max Mustermann"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">E-Mail-Adresse *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="max@beispiel.at"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Telefonnummer (optional)</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+43 664 1234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Thema / Betreff</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                      <option value="Produktberatung & Planung">Produktberatung & Planung</option>
                      <option value="Kostenloses Angebot">Kostenloses Angebot</option>
                      <option value="Technischer Support">Technischer Support</option>
                      <option value="Rückrufwunsch">Rückrufwunsch</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Ihre Nachricht *</label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Beschreiben Sie kurz Ihr Anliegen oder geplantes Projekt..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Wird gesendet...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Anfrage absenden</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-3">
                    Ihre Daten werden vertraulich gemäß unserer Datenschutzerklärung behandelt.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

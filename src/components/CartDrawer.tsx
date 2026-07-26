import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle, 
  ShieldCheck, 
  PackageCheck,
  Mail,
  FileText,
  Phone,
  Building,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { CartItem, formatPrice } from "../types";
import CameraSvg from "./CameraSvg";
import { saveInquiry } from "../lib/leadsService";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutProgress, setCheckoutProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSvgType = (imageName: string): "bullet" | "dome" | "ptz" | "set" | "smarthome" | "nas" | "netzwerk" => {
    if (!imageName) return "bullet";
    if (imageName.includes("bullet")) return "bullet";
    if (imageName.includes("dome")) return "dome";
    if (imageName.includes("ptz")) return "ptz";
    if (imageName.includes("set")) return "set";
    if (imageName.includes("smarthome")) return "smarthome";
    if (imageName.includes("nas")) return "nas";
    if (imageName.includes("netzwerk")) return "netzwerk";
    return "bullet";
  };

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clientType: "Privatkunde",
    notes: ""
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const shippingCost = subtotal >= 150 ? 0 : 9.90;
  const finalTotal = subtotal - discountAmount + shippingCost;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NEX10") {
      setPromoApplied(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedItems = cart.map(item => `${item.quantity}x ${item.product.name} (${item.product.price}€, Farbe: ${item.selectedColor || 'Standard'})`).join("\n");

    // Send to Formspree
    try {
      await fetch("https://formspree.io/f/mpqvkzkr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `Angebotsanfrage: ${formData.name}`,
          Formular: "Warenkorb / Angebotsanfrage",
          Name: formData.name,
          Email: formData.email,
          Telefon: formData.phone || "Nicht angegeben",
          Kundenart: formData.clientType,
          Anmerkungen: formData.notes || "-",
          Gesamtsumme: `${Math.round(finalTotal)} €`,
          Rabattcode: promoApplied ? "NEX10 (-10%)" : "Keine",
          Gewählte_Produkte: formattedItems
        })
      });
    } catch (err) {
      console.error("Formspree submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
    
    // In Firestore speichern, damit die Anfrage im Admin-Bereich erscheint (cloud-only)
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    const dateStr = new Date().toLocaleDateString('de-DE', dateOptions);

    const newInquiry = {
      date: dateStr,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      clientType: formData.clientType,
      notes: formData.notes,
      items: cart.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
        color: item.selectedColor
      })),
      total: Math.round(finalTotal)
    };

    try {
      await saveInquiry(newInquiry);
    } catch (err) {
      console.error("Anfrage konnte nicht in Firestore gespeichert werden:", err);
    }

    setIsSubmitted(true);
    // Simulating offer calculations
    setCheckoutProgress(1);
    setTimeout(() => setCheckoutProgress(2), 1500);
    setTimeout(() => setCheckoutProgress(3), 3000);
  };

  const handleCloseCheckout = () => {
    setIsFormOpen(false);
    setIsSubmitted(false);
    setPromoApplied(false);
    setPromoCode("");
    onClearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 transition-opacity"
      />

      {/* Cart Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideLeft overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-900">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold font-display">
              {isSubmitted ? "Anfrage gesendet" : isFormOpen ? "Angebotsdetails" : "Ihr Warenkorb"}
            </h3>
            {!isSubmitted && !isFormOpen && (
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-white border border-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CHECKOUT SUCCESS TIMELINE */}
        {isSubmitted ? (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-lg animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-extrabold font-display text-slate-900 mb-2">Anfrage erfolgreich!</h3>
              <p className="text-sm text-slate-500 max-w-xs mb-8">
                Vielen Dank, <strong>{formData.name}</strong>. Ihre Angebotsanfrage wurde erfolgreich übermittelt.
              </p>

              {/* Simulated Live Offer Generator Timeline */}
              <div className="w-full max-w-xs bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left mb-8 space-y-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                  Bearbeitungsstatus
                </h4>
                
                {/* Step 1: Request Received */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      checkoutProgress >= 1 ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}>
                      1
                    </div>
                    <div className={`w-0.5 h-10 ${checkoutProgress >= 2 ? "bg-blue-500" : "bg-slate-200"}`}></div>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block leading-none">Anfrage eingegangen</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">SSL-verschlüsselt übertragen</span>
                  </div>
                </div>

                {/* Step 2: Quality Inspection / Quote Calculation */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      checkoutProgress >= 2 ? "bg-blue-500 text-white animate-pulse" : "bg-slate-200 text-slate-400"
                    }`}>
                      2
                    </div>
                    <div className={`w-0.5 h-10 ${checkoutProgress >= 3 ? "bg-blue-500" : "bg-slate-200"}`}></div>
                  </div>
                  <div className="text-left">
                    <span className={`text-xs font-bold block leading-none ${checkoutProgress >= 2 ? "text-slate-900" : "text-slate-400"}`}>
                      Preiskalkulation & Rabatte
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {promoApplied ? "Gutschein Nex10 berücksichtigt" : "Mengenrabatte werden berechnet"}
                    </span>
                  </div>
                </div>

                {/* Step 3: Dispatched to email */}
                <div className="flex gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    checkoutProgress >= 3 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className={`text-xs font-bold block leading-none ${checkoutProgress >= 3 ? "text-slate-900" : "text-slate-400"}`}>
                      Angebot per E-Mail
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      Gesendet an {formData.email || "Ihre Adresse"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCloseCheckout}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              Fenster schließen & weiter shoppen
            </button>
          </div>
        ) : isFormOpen ? (
          
          /* 2. REQUEST QUOTE FORM VIEW */
          <form onSubmit={handleSubmitInquiry} className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold mb-1">Sie fordern ein unverbindliches Angebot an.</p>
                  <p>Ihre ausgewählten Artikel werden im Angebot aufgeführt. Es entstehen für Sie keinerlei Kaufverpflichtungen.</p>
                </div>
              </div>

              {/* Client Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kundenart</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, clientType: "Privatkunde" })}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      formData.clientType === "Privatkunde"
                        ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Privatkunde
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, clientType: "Geschäftskunde" })}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      formData.clientType === "Geschäftskunde"
                        ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Gewerbe / Installateur
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vollständiger Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="z.B. Max Mustermann"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-Mail Adresse *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ihre@adresse.de"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telefonnummer (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="z.B. +49 170 1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Anmerkungen & Sonderwünsche (optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="z.B. Benötige zusätzliche Kabel, Montageangebote oder Expressversand-Wünsche..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-6 border-t border-gray-100 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-1">
                <span>Kalkulierter Gesamtwert:</span>
                <span className="font-mono text-base text-slate-900 font-extrabold">{formatPrice(finalTotal)} €</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? "Wird gesendet..." : "Angebot anfordern"}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (

          /* 3. STANDARD SHOPPING CART ITEMS LIST VIEW */
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 font-display">Ihr Warenkorb ist leer</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                    Fügen Sie Kameras, Smart Home-, NAS- oder Netzwerkprodukte hinzu, um eine kostenlose Angebotsanfrage zu starten.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.selectedColor}`}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 relative group hover:border-blue-200 transition-all"
                    >
                      {/* Product image or type label */}
                      <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0 p-1">
                        {item.product.image && (item.product.image.startsWith("http") || item.product.image.startsWith("data:")) ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12">
                            <CameraSvg
                              type={getSvgType(item.product.image || "bullet")}
                              isNightVision={false}
                              isRecording={false}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate font-display">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer -mr-1 -mt-1"
                            title="Entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            Farbe: {item.selectedColor}
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            {item.product.shippingStatus || "5-7 Werktage"}
                          </span>
                        </div>
                        
                        {/* Quantity counter & Price */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold font-mono text-slate-900">
                            {formatPrice(item.product.price * item.quantity)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Shopping List Footer panel */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-slate-50 text-left space-y-4">
                
                {/* Promo Code form */}
                <form onSubmit={handleApplyPromo} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Gutscheincode eingeben"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                  <button 
                    type="submit" 
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Anwenden
                  </button>
                </form>

                {promoApplied && (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-700 font-semibold animate-fadeIn">
                    <span>Gutscheincode NEX10 angewendet</span>
                    <span>-10%</span>
                  </div>
                )}

                {/* Subtotals & Taxes */}
                <div className="space-y-2 text-xs font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span className="font-mono text-slate-900 font-semibold">{formatPrice(subtotal)} €</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Rabatt (10%):</span>
                      <span className="font-mono font-semibold">-{formatPrice(discountAmount)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Versand (kalkuliert):</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {shippingCost === 0 ? "Kostenlos" : `${formatPrice(shippingCost)} €`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-[10px] text-slate-400">Fügen Sie noch Artikel ab 150€ hinzu für kostenlose Lieferung im Angebot.</p>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-extrabold text-slate-900">
                    <span>Kalkulierter Wert:</span>
                    <span className="font-mono text-blue-500">{formatPrice(finalTotal)} €</span>
                  </div>
                </div>

                {/* Trusted badges */}
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Angebot in 24 Std.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Absolut unverbindlich</span>
                  </div>
                </div>

                {/* Open inquiry details form button */}
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-semibold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  <span>Weiter zur Anfrage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

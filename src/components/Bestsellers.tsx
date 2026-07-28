import React, { useState } from "react";
import { Heart, ShoppingCart, Check, Info, ShieldAlert, Sparkles, X } from "lucide-react";
import { Product, getSpecLabels, formatPrice } from "../types";
import { PRODUCTS } from "../data";
import { productSlug } from "../lib/slug";
import CameraSvg from "./CameraSvg";

interface BestsellersProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, color: string) => void;
  onOpenProduct: (product: Product) => void;
  selectedCategory: string | null;
}

export default function Bestsellers({
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOpenProduct,
  selectedCategory
}: BestsellersProps) {
  const [activeQuickDetail, setActiveQuickDetail] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter products: Only show items marked as Bestseller (isBestseller === true)
  const filteredProducts = products.filter(p => {
    // 1. Must have isBestseller flag set to true
    if (!p.isBestseller) return false;

    // 2. Filter by selectedCategory if active
    if (selectedCategory) {
      return p.category === selectedCategory;
    }

    return true;
  });

  const getSvgType = (imageName: string): "bullet" | "dome" | "ptz" | "set" | "smarthome" | "nas" | "netzwerk" => {
    if (imageName.includes("bullet")) return "bullet";
    if (imageName.includes("dome")) return "dome";
    if (imageName.includes("ptz")) return "ptz";
    if (imageName.includes("set")) return "set";
    if (imageName.includes("smarthome")) return "smarthome";
    if (imageName.includes("nas")) return "nas";
    if (imageName.includes("netzwerk")) return "netzwerk";
    return "bullet";
  };

  const triggerAddAnimation = (id: string) => {
    setJustAddedId(id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  return (
    <section id="bestseller" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-100 px-3 py-1 rounded-full">
              Kunden-Favoriten
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3">
              Unsere Bestseller
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl">
              Von Experten empfohlen, von über 250 Kunden erstklassig bewertet. Intelligente Systeme aus allen Bereichen auf allerhöchstem Niveau.
            </p>
          </div>
          {selectedCategory && (
            <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold border border-blue-100">
              Gefiltert nach: <strong className="text-blue-800">{selectedCategory}</strong>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Keine Bestseller in dieser Kategorie</h3>
            <p className="text-slate-500 text-sm mt-2">Wir haben für Sie jedoch weitere Sicherheitslösungen im Angebot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isAdded = justAddedId === product.id;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 hover:border-red-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col justify-between relative"
                  id={`product-${product.id}`}
                >
                  
                  {/* Top Badges */}
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide">
                      {product.discount}
                    </span>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleWishlist(product.id)}
                      className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-full text-slate-400 transition-all cursor-pointer"
                      title={isWishlisted ? "Von Wunschliste entfernen" : "Auf Wunschliste setzen"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                    </button>
                  </div>

                  {/* Product Visual Area - Gradient Glass look */}
                  <div className="relative h-48 sm:h-52 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-3 overflow-hidden group-hover:scale-[1.01] transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-slate-100/50"></div>
                    
                    {/* Micro Sparkles icon representing Premium quality */}
                    <div className="absolute top-2.5 right-2.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse-subtle" />
                    </div>

                    <a
                      href={`/produkt/${productSlug(product)}`}
                      onClick={(e) => { e.preventDefault(); onOpenProduct(product); }}
                      aria-label={product.name}
                      className="w-full h-full relative transition-transform duration-500 group-hover:scale-[1.03] flex items-center justify-center cursor-pointer"
                    >
                      {product.image.startsWith("http") || product.image.startsWith("data:") ? (
                        <img 
                          src={product.image} 
                          alt={product.imageAlt || product.name}
                          className="max-h-full w-auto max-w-full object-contain rounded-lg drop-shadow-md"
                          loading="lazy" decoding="async" referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-28 h-28">
                          <CameraSvg
                            type={getSvgType(product.image)}
                            isNightVision={false}
                            isRecording={false}
                            className="w-full h-full drop-shadow-lg"
                          />
                        </div>
                      )}
                    </a>

                    {/* Stock Alert Status */}
                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md text-[9px] text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                      Lieferbereit
                    </span>

                    {/* Quick Info Trigger (floating on image) */}
                    <button
                      onClick={() => setActiveQuickDetail(product)}
                      className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-red-600 hover:text-white rounded-full text-slate-400 border border-slate-100 shadow-sm transition-all cursor-pointer"
                      title="Beschreibung & Details ansehen"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                        <span>★</span>
                        <span>{product.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <a href={`/produkt/${productSlug(product)}`} onClick={(e) => { e.preventDefault(); onOpenProduct(product); }}>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors font-display line-clamp-1 mb-1.5 cursor-pointer">
                        {product.name}
                      </h3>
                    </a>

                    {/* Specifications on Card */}
                    {(() => {
                      const labels = getSpecLabels(product.category);
                      const specItems = [
                        { label: labels.resolution, val: product.specs.resolution },
                        { label: labels.viewAngle, val: product.specs.viewAngle },
                        { label: labels.nightVision, val: product.specs.nightVision },
                        { label: labels.storage, val: product.specs.storage },
                      ].filter(s => s.val);

                      return (
                        <div className="space-y-1 mb-3 text-[11px] sm:text-xs text-slate-700 min-h-[58px] flex flex-col justify-start">
                          {specItems.map((spec, i) => (
                            <div key={i} className="flex items-start gap-1 leading-snug">
                              <span className="text-red-600 font-bold select-none shrink-0">&gt;</span>
                              <span className="text-slate-800 line-clamp-1">
                                <strong className="font-semibold text-slate-900">{spec.label}:</strong> {spec.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Shipping Status */}
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold mb-2.5 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{product.shippingStatus || "5-7 Werktage"}</span>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Footer */}
                  <div className="pt-2.5 border-t border-slate-100 mt-auto">
                    <div className="flex items-end justify-between mb-2.5">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold font-mono text-red-600">
                            {formatPrice(product.price)} €*
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {formatPrice(product.oldPrice)} €*
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">inkl. MwSt. zzgl. Versand</div>
                      </div>
                      <button
                        onClick={() => setActiveQuickDetail(product)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
                        title="Kurzbeschreibung & Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(product, product.colors[0] || "Standard");
                        triggerAddAnimation(product.id);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isAdded 
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                          Hinzugefügt!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          In den Warenkorb
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Quick Specs Modal Box Overlay */}
      {activeQuickDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-5 sm:p-6 md:p-7 shadow-2xl border border-slate-100 overflow-hidden relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            
            {/* Close */}
            <button 
              onClick={() => setActiveQuickDetail(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-start">
              
              {/* Product render preview */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 h-48 sm:h-56 md:h-64 flex items-center justify-center relative">
                <div className="w-full h-full flex items-center justify-center">
                  {activeQuickDetail.image.startsWith("http") || activeQuickDetail.image.startsWith("data:") ? (
                    <img 
                      src={activeQuickDetail.image} 
                      alt={activeQuickDetail.imageAlt || activeQuickDetail.name}
                      className="max-h-full max-w-full object-contain rounded-xl drop-shadow-xl animate-fadeIn"
                      loading="lazy" decoding="async" referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-36 h-36">
                      <CameraSvg
                        type={getSvgType(activeQuickDetail.image)}
                        isNightVision={false}
                        className="w-full h-full drop-shadow-xl"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details & Specs list */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {activeQuickDetail.category}
                  </span>
                  
                  <h3 className="text-lg sm:text-xl font-extrabold font-display text-slate-900 mt-2 mb-1 leading-snug">
                    {activeQuickDetail.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">
                    {activeQuickDetail.description}
                  </p>

                  {/* Technical specs table (Specs grid) */}
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
                    Technische Spezifikationen
                  </h4>
                  {(() => {
                    const labels = getSpecLabels(activeQuickDetail.category);
                    const specItems = [
                      { label: labels.resolution, val: activeQuickDetail.specs.resolution },
                      { label: labels.viewAngle, val: activeQuickDetail.specs.viewAngle },
                      { label: labels.nightVision, val: activeQuickDetail.specs.nightVision },
                      { label: labels.storage, val: activeQuickDetail.specs.storage },
                      { label: labels.power, val: activeQuickDetail.specs.power },
                    ].filter(s => s.val);

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {specItems.map((spec, i) => (
                          <div key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-red-600 font-bold select-none shrink-0 mt-0.5">&gt;</span>
                            <span className="text-slate-800">
                              <strong className="font-semibold text-slate-900">{spec.label}:</strong> {spec.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Action in Modal */}
                <button
                  onClick={() => {
                    onAddToCart(activeQuickDetail, activeQuickDetail.colors[0] || "Standard");
                    setActiveQuickDetail(null);
                    triggerAddAnimation(activeQuickDetail.id);
                  }}
                  className="w-full bg-red-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm mt-4 hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  In den Warenkorb ({formatPrice(activeQuickDetail.price)}€)
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}

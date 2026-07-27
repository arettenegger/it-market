import React from "react";
import { ArrowRight, Shield, Eye, RotateCw, Cpu } from "lucide-react";
import { CATEGORIES } from "../data";
import { Category } from "../types";

interface CategoriesProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategory: string | null;
  categories?: Category[];
}

export default function Categories({ onSelectCategory, selectedCategory, categories = CATEGORIES }: CategoriesProps) {
  const displayCategories = categories && categories.length > 0 ? categories : CATEGORIES;

  // Icon finder helper
  const renderCategoryIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-blue-600";
    switch (iconName) {
      case "Shield":
        return <Shield className={iconClass} />;
      case "Eye":
        return <Eye className={iconClass} />;
      case "RotateCw":
        return <RotateCw className={iconClass} />;
      case "Cpu":
        return <Cpu className={iconClass} />;
      default:
        return <Shield className={iconClass} />;
    }
  };

  return (
    <section id="kategorien" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-50 px-3 py-1 rounded-full">
            Kategorien
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-3 mb-4">
            Finden Sie die passende Hardware & Sicherheitslösung
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Unsere Netzwerkhardware, Hotspot-Systeme und Sicherheitskomponenten sind perfekt aufeinander abgestimmt.
          </p>
        </div>

        {/* Categories Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`group relative bg-slate-50 hover:bg-white rounded-3xl p-6 border transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected 
                    ? "border-blue-600 ring-2 ring-blue-600/10 bg-white shadow-xl" 
                    : "border-slate-100 hover:border-blue-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01]"
                }`}
                id={`cat-card-${cat.id}`}
              >
                {/* Background soft glow on hover */}
                <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-blue-50/40 blur-2xl group-hover:bg-blue-100/30 transition-all pointer-events-none -z-10"></div>

                <div>
                  {/* Icon & Sub-Tagline */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/60 flex items-center justify-center">
                      {renderCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {cat.tagline}
                    </span>
                  </div>

                  {/* Category Image */}
                  <div className="w-full h-44 mb-6 rounded-2xl overflow-hidden relative shadow-inner bg-slate-100">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy" decoding="async" referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none"></div>
                  </div>

                  {/* Header Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                {/* Card CTA Link */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 mt-auto group-hover:translate-x-1.5 transition-transform duration-300">
                  <span>Jetzt entdecken</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset Filters Trigger */}
        {selectedCategory && (
          <div className="text-center mt-10">
            <button
              onClick={() => onSelectCategory("")}
              className="text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full transition-all cursor-pointer"
            >
              Filter zurücksetzen (Alle Produkte anzeigen)
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

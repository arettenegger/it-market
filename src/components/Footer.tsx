import React from "react";
import { Shield, Facebook, Instagram, Linkedin, Youtube, ArrowUp, Settings } from "lucide-react";
import { categoryIdFromName } from "../lib/slug";

interface FooterProps {
  scrollToSection: (id: string) => void;
  onNavigatePage?: (page: "home" | "blog" | "category" | "impressum" | "datenschutz" | "about" | "kontakt", sectionId?: string) => void;
  onSelectCategory?: (categoryName: string) => void;
  onOpenAdmin?: () => void;
  onOpenImpressum?: () => void;
  onOpenDatenschutz?: () => void;
  onOpenAbout?: () => void;
  onOpenKontakt?: () => void;
  logoImage?: string;
}

export default function Footer({ 
  scrollToSection, 
  onNavigatePage, 
  onSelectCategory,
  onOpenAdmin, 
  onOpenImpressum, 
  onOpenDatenschutz, 
  onOpenAbout, 
  onOpenKontakt,
  logoImage 
}: FooterProps) {
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (targetId: string) => {
    if (targetId === "ratgeber") {
      if (onNavigatePage) {
        onNavigatePage("blog");
      } else {
        scrollToSection("ratgeber");
      }
    } else {
      if (onNavigatePage) {
        onNavigatePage("home", targetId);
      } else {
        scrollToSection(targetId);
      }
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    } else if (onNavigatePage) {
      onNavigatePage("category");
    } else {
      scrollToSection("kategorien");
    }
  };

  const footerLinks = {
    shop: [
      { name: "PC-Hardware", categoryName: "PC-Hardware" },
      { name: "Netzwerke", categoryName: "Netzwerke" },
      { name: "Hotspotlösungen", categoryName: "Hotspotlösungen" },
      { name: "NAS-Systeme", categoryName: "NAS-Systeme" },
      { name: "IP-Kameras", categoryName: "IP-Kameras" },
      { name: "Smart-Home", categoryName: "Smart-Home" }
    ],
    unternehmen: [
      { name: "Über uns", targetId: "warum-wir" },
      { name: "Kontakt", targetId: "newsletter" },
      { name: "Blog & Ratgeber", targetId: "ratgeber" }
    ]
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 relative">
      
      {/* Scroll-to-top button */}
      <button 
        onClick={handleScrollToTop}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        aria-label="Zum Seitenanfang scrollen"
      >
        <ArrowUp className="w-5 h-5 animate-pulse-subtle" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-left">
          
          {/* Logo & Info column */}
          <div className="col-span-2 flex flex-col items-start justify-start">


            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-6">
              IT-MARKET ist Ihr kompetenter Premium-Shop für PC-Hardware, Netzwerke, Hotspotlösungen, NAS-Systeme, IP-Kameras und Smart-Home-Lösungen mit individuellem Angebotsservice.
            </p>

            {/* Social Icons row */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/bewachtundvernetzt" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-blue-600 hover:text-white rounded-xl transition-all" aria-label="Facebook Link">
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a href="https://www.instagram.com/support1085/" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-blue-600 hover:text-white rounded-xl transition-all" aria-label="Instagram Link">
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a href="https://www.linkedin.com/in/andreas-rettenegger-b026193aa/" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-blue-600 hover:text-white rounded-xl transition-all" aria-label="LinkedIn Link">
                <Linkedin className="w-4.5 h-4.5" />
              </a>
              <a href="https://www.youtube.com/@BewachtVernetzt" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-blue-600 hover:text-white rounded-xl transition-all" aria-label="YouTube Link">
                <Youtube className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="flex flex-col col-span-2 sm:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4">Shop & Kategorien</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {footerLinks.shop.map((link, i) => (
                <a
                  key={i}
                  href={`/kategorie/${categoryIdFromName(link.categoryName)}`}
                  onClick={(e) => { e.preventDefault(); handleCategoryClick(link.categoryName); }}
                  className="hover:text-white transition-colors text-left cursor-pointer no-underline text-slate-400"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Unternehmen Column */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-4">Unternehmen</h4>
            <div className="flex flex-col gap-2 text-xs">
              {footerLinks.unternehmen.map((link, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (link.name === "Über uns") {
                      if (onOpenAbout) {
                        onOpenAbout();
                      } else if (onNavigatePage) {
                        onNavigatePage("about");
                      }
                    } else if (link.name === "Kontakt") {
                      if (onOpenKontakt) {
                        onOpenKontakt();
                      } else if (onNavigatePage) {
                        onNavigatePage("kontakt");
                      } else {
                        handleLinkClick(link.targetId);
                      }
                    } else {
                      handleLinkClick(link.targetId);
                    }
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-900 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 IT Service Rettenegger. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => {
                if (onOpenImpressum) onOpenImpressum();
                else if (onNavigatePage) onNavigatePage("impressum");
              }} 
              className="hover:text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Impressum
            </button>
            <span>•</span>
            <button 
              onClick={() => {
                if (onOpenDatenschutz) onOpenDatenschutz();
                else if (onNavigatePage) onNavigatePage("datenschutz");
              }} 
              className="hover:text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Datenschutz
            </button>
            <span>•</span>
            {onOpenAdmin && (
              <>
                <button 
                  onClick={onOpenAdmin} 
                  className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Admin-Bereich</span>
                </button>
                <span>•</span>
              </>
            )}
            <button onClick={() => scrollToSection("newsletter")} className="hover:text-slate-400 cursor-pointer">DSGVO-Einstellungen</button>
            <span>•</span>
            <button onClick={() => scrollToSection("newsletter")} className="hover:text-slate-400 cursor-pointer">Cookies</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

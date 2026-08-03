import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import { 
  Shield, 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Flame, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  Plus,
  Settings,
  Phone,
  Mail
} from "lucide-react";
import { Product, CartItem, formatPrice } from "../types";
import { categoryIdFromName } from "../lib/slug";

interface HeaderProps {
  cart: CartItem[];
  wishlist: string[];
  onOpenCart: () => void;
  onAddToCart: (product: Product, color: string) => void;
  scrollToSection: (id: string) => void;
  onOpenCallback: () => void;
  products: Product[];
  onOpenAdmin: () => void;
  currentPage?: "home" | "blog" | "category" | "impressum" | "datenschutz" | "about" | "kontakt";
  onNavigatePage?: (page: "home" | "blog" | "category" | "impressum" | "datenschutz" | "about" | "kontakt", sectionId?: string) => void;
  onSelectCategory?: (categoryName: string) => void;
  selectedCategory?: string | null;
  logoImage?: string;
}

export default function Header({
  cart,
  wishlist,
  onOpenCart,
  onAddToCart,
  scrollToSection,
  onOpenCallback,
  products,
  onOpenAdmin,
  currentPage = "home",
  onNavigatePage,
  onSelectCategory,
  selectedCategory,
  logoImage
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);

  // Total items in cart
  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountTab === "login") {
      if (loginForm.email) {
        setIsLoggedIn(true);
        setUserName(loginForm.email.split("@")[0]);
        setIsAccountOpen(false);
        triggerToast("Erfolgreich eingeloggt!");
      }
    } else {
      if (loginForm.email && loginForm.name) {
        setIsLoggedIn(true);
        setUserName(loginForm.name);
        setIsAccountOpen(false);
        triggerToast("Registrierung erfolgreich!");
      }
    }
  };

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    triggerToast("Erfolgreich abgemeldet.");
  };

  const handleNavClick = (id: string) => {
    if (id === "ratgeber") {
      if (onNavigatePage) {
        onNavigatePage("blog");
      } else {
        scrollToSection("ratgeber");
      }
    } else {
      if (onNavigatePage) {
        onNavigatePage("home", id);
      } else {
        scrollToSection(id);
      }
    }
  };

  // Explicitly requested 8 menu bar elements
  const menuBarItems = [
    { name: "PC-Hardware", type: "category", categoryName: "PC-Hardware" },
    { name: "Netzwerke", type: "category", categoryName: "Netzwerke" },
    { name: "Hotspot", type: "category", categoryName: "Hotspot & Wireless-Lösungen" },
    { name: "NAS-Systeme", type: "category", categoryName: "NAS-Systeme" },
    { name: "IP-Kameras", type: "category", categoryName: "IP-Kameras" },
    { name: "Smart-Home", type: "category", categoryName: "Smart-Home" },
    { name: "Blog", type: "blog", categoryName: "" },
    { name: "Warenkorb", type: "cart", categoryName: "" },
  ];

  const menuItemHref = (item: typeof menuBarItems[0]): string => {
    if (item.type === "blog") return "/blog";
    if (item.type === "category") return "/kategorie/" + categoryIdFromName(item.categoryName);
    return "#";
  };

  const handleMenuItemClick = (item: typeof menuBarItems[0], e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    if (item.type === "category") {
      if (onSelectCategory) {
        onSelectCategory(item.categoryName);
      }
    } else if (item.type === "blog") {
      if (onNavigatePage) {
        onNavigatePage("blog");
      } else {
        scrollToSection("ratgeber");
      }
    } else if (item.type === "cart") {
      onOpenCart();
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white py-3 px-5 rounded-xl shadow-xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Sticky Premium Header */}
      <header id="main-header" className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        {/* Top Info Banner */}
        <div className="w-full bg-slate-900 text-slate-300 py-2 px-4 text-xs font-medium tracking-wide flex justify-between items-center hidden md:flex">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Kostenloser Expressversand ab 150€
            </span>
            <span>•</span>
            <span>Sicher bezahlen mit SSL & Käuferschutz</span>
            <span>•</span>
            <span>Fachberatung & Support</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+43725521100" className="flex items-center gap-1.5 font-bold text-white hover:text-emerald-400 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +43 7255 211 00
            </a>
            <span>•</span>
            <a href="mailto:support@it-market.at" className="flex items-center gap-1.5 font-bold text-white hover:text-emerald-400 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              support@it-market.at
            </a>
            <span>•</span>
            <button onClick={onOpenCallback} className="hover:text-white transition-colors cursor-pointer">
              Kostenlose Fachberatung anfordern
            </button>
            <span>•</span>
            <button 
              onClick={onOpenAdmin} 
              className="text-orange-400 hover:text-orange-300 font-bold transition-colors cursor-pointer flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700"
            >
              <Settings className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div
              onClick={() => handleNavClick("hero")}
              className="flex items-center cursor-pointer group py-1 shrink-0"
            >
              <Logo variant="dark" size="lg" showSubtitle={false} showText={false} logoImage={logoImage} />
            </div>

            {/* Desktop Navigation with requested 8 menu items */}
            <nav className="hidden xl:flex items-center gap-1.5 xl:gap-2.5">
              {menuBarItems.map((item, idx) => {
                const isBlogActive = currentPage === "blog" && item.type === "blog";
                const isCategoryActive = currentPage === "category" && item.type === "category" && !!selectedCategory && (
                  selectedCategory.toLowerCase().includes(item.categoryName.toLowerCase()) || 
                  item.categoryName.toLowerCase().includes(selectedCategory.toLowerCase())
                );
                const isActive = isBlogActive || isCategoryActive;
                const isCart = item.type === "cart";

                if (isCart) {
                  return (
                    <button
                      key={idx}
                      onClick={() => handleMenuItemClick(item)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/10 transition-all cursor-pointer ml-1"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Warenkorb</span>
                      {cartTotalItems > 0 && (
                        <span className="ml-0.5 bg-white text-blue-600 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                          {cartTotalItems}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <a
                    key={idx}
                    href={menuItemHref(item)}
                    onClick={(e) => handleMenuItemClick(item, e)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap no-underline ${
                      isActive
                        ? "text-red-600 bg-red-50 border border-red-100 shadow-xs font-bold"
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}
            </nav>

            {/* Actions Panel (Right) */}
            <div className="flex items-center gap-2 md:gap-4">

              {/* Telefon – kleines Icon nur auf Handys (Nummer steht oben im Info-Band) */}
              <a
                href="tel:+43725521100"
                className="md:hidden flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Anrufen: +43 7255 211 00"
                title="Jetzt anrufen"
              >
                <Phone className="w-5 h-5" />
              </a>

              {/* Active Search Button & Container */}
              <div ref={searchRef} className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-60 md:w-80 transition-all duration-300">
                    <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Kameras, Sets, Features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-gray-800 w-full placeholder:text-gray-400"
                      autoFocus
                    />
                    <button 
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all duration-200 cursor-pointer"
                    aria-label="Suche öffnen"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}

                {/* Instant Search Results Dropdown */}
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Suchergebnisse ({searchResults.length})
                      </span>
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {searchResults.map((product) => (
                          <div key={product.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center font-mono text-xs text-blue-600 font-bold p-1">
                                {product.category.substring(0, 3).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</span>
                                <span className="text-xs text-gray-500 font-mono">{formatPrice(product.price)} €</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                onAddToCart(product, product.colors[0]);
                                triggerToast(`${product.name} hinzugefügt!`);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-bounce" />
                        <p className="text-sm">Keine Produkte gefunden.</p>
                        <p className="text-xs text-gray-400 mt-1">Suchen Sie nach 'Bullet', 'PTZ' oder 'Dome'</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Netzwerk Admin Button */}
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer border border-slate-800 active:scale-95"
                title="Admin Panel öffnen"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin</span>
              </button>

              {/* Account / User Button */}
              <button
                onClick={() => setIsAccountOpen(true)}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                  isLoggedIn ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
                aria-label="Konto öffnen"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all cursor-pointer"
                aria-label="Menü umschalten"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-100 shadow-2xl z-40 max-h-[calc(100vh-4rem)] overflow-y-auto animate-fadeIn">
            <div className="px-4 pt-3 pb-8 space-y-2">
              {menuBarItems.map((item, idx) => {
                if (item.type === "cart") {
                  return (
                    <button
                      key={idx}
                      onClick={() => handleMenuItemClick(item)}
                      className="w-full text-left py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex justify-between items-center active:scale-[0.99] bg-blue-600 text-white shadow-md my-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4" />
                        {item.name}
                      </span>
                      {cartTotalItems > 0 ? (
                        <span className="bg-white text-blue-600 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                          {cartTotalItems}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/80" />
                      )}
                    </button>
                  );
                }
                return (
                  <a
                    key={idx}
                    href={menuItemHref(item)}
                    onClick={(e) => handleMenuItemClick(item, e)}
                    className="w-full text-left py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex justify-between items-center active:scale-[0.99] no-underline text-slate-800 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                  >
                    <span className="flex items-center gap-2.5">
                      {item.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                );
              })}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 px-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full bg-slate-900 text-white text-center py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-800 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#FF5E2E]" />
                  <span>Admin-Bereich öffnen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Account Modal Dialog Simulation */}
      {isAccountOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900 font-display">Ihr Kundenkonto</h3>
              </div>
              <button onClick={() => setIsAccountOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Willkommen zurück, {userName}!</h4>
                <p className="text-xs text-gray-500 mt-1">Ihr Kundenkonto ist aktiv und verifiziert.</p>
                <div className="mt-6 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
                    Bestellungen ansehen
                  </button>
                  <button onClick={handleLogout} className="w-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Abmelden
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setAccountTab("login")}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                      accountTab === "login" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Einloggen
                  </button>
                  <button
                    onClick={() => setAccountTab("register")}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                      accountTab === "register" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Konto erstellen
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {accountTab === "register" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Vollständiger Name</label>
                      <input
                        type="text"
                        required
                        value={loginForm.name}
                        onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                        placeholder="z.B. Max Mustermann"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">E-Mail Adresse</label>
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="name@firma.de"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Passwort</label>
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 mt-6">
                    {accountTab === "login" ? "Jetzt anmelden" : "Registrieren & Abschicken"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

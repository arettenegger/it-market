import React, { useState, useEffect } from "react";
import { requestDoubleOptIn } from "../lib/newsletterService";
import { 
  BookOpen, 
  Search, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  ChevronRight, 
  X, 
  Share2, 
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Folder,
  FolderOpen,
  Hash,
  Newspaper,
  PhoneCall,
  Send,
  Filter,
  RotateCcw,
  ArrowLeft,
  FileText,
  Download
} from "lucide-react";
import { BlogPost } from "../types";

interface BlogSectionProps {
  blogPosts: BlogPost[];
  onOpenCallback?: () => void;
  onBackToHome?: () => void;
}

interface QuickStartGuide {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  pages: string;
  description: string;
  version: string;
  steps: string[];
}

const QUICK_START_GUIDES: QuickStartGuide[] = [
  {
    id: "qs-poe",
    title: "PoE-Kamera & NVR Plug & Play Direktanschluss",
    category: "IP-Kameras",
    fileSize: "2.4 MB",
    pages: "4 Seiten",
    version: "Rev. 2026/2",
    description: "Schritt-für-Schritt Anleitung für die Verkabelung, PoE-Switch Kopplung und Erstinbetriebnahme von 4K Bullet- und Dome-Kameras.",
    steps: [
      "1. Netzwerkkabel (Cat.6 oder höher) vom PoE-Port des NVR oder PoE-Switches zur Kamera verlegen.",
      "2. Kamera einschalten und auf automatische IP-Zuweisung durch DHCP (Standard) warten.",
      "3. Am NVR oder über die CMS-Software das Gerät per Seriennummer hinzufügen.",
      "4. Administrator-Passwort festlegen und Aufzeichnungsmodus (24/7 oder Bewegungserkennung) aktivieren."
    ]
  },
  {
    id: "qs-wifi",
    title: "WLAN IP-Kamera Erstinbetriebnahme & App-Kopplung",
    category: "Smart Home",
    fileSize: "1.8 MB",
    pages: "3 Seiten",
    version: "Rev. 2026/1",
    description: "Leitfaden für die drahtlose Einbindung von WLAN-Überwachungskameras ins 2.4/5 GHz Heimnetzwerk.",
    steps: [
      "1. Kamera mit dem mitgelieferten Netzteil an den Strom anschließen und auf den Start-Signalton warten.",
      "2. Security App öffnen und 'Gerät hinzufügen' (+ Symbol) wählen.",
      "3. Den QR-Code auf der Kamerarückseite scannen und das WLAN-Passwort eingeben.",
      "4. Den angezeigten QR-Code der App im Abstand von 20cm vor das Kameraobjektiv halten, bis der Verbindungston ertönt."
    ]
  },
  {
    id: "qs-ptz",
    title: "PTZ-Kamera Deckenmontage & 360° Tracking Kalibrierung",
    category: "IP-Kameras",
    fileSize: "3.5 MB",
    pages: "6 Seiten",
    version: "Rev. 2026/3",
    description: "Professionelle Montageanleitung für schwenk- und neigbare PTZ-Kameras mit optischem Zoom und KI-Autotracking.",
    steps: [
      "1. Montageplatte mit der mitgelieferten Bohrschablone an einer stabilen Decke oder Wand befestigen.",
      "2. PTZ-Kamera einrasten und mit Sicherheitskabel gegen Herabfallen sichern.",
      "3. Stromversorgung (PoE+ 802.3at) und Netzwerk anschließen.",
      "4. Über das Web-Interface den PTZ-Nullpunkt kalibrieren und die KI-Tracking-Zonen festlegen."
    ]
  },
  {
    id: "qs-dsgvo",
    title: "DSGVO-konforme Ausrichtung & Privatzonen-Maskierung",
    category: "Rechtliches",
    fileSize: "1.1 MB",
    pages: "2 Seiten",
    version: "Rev. 2026/2",
    description: "Checkliste und technische Anleitung zur korrekten Ausrichtung von Kameras und zum Einrichten von Privatzonenmasken.",
    steps: [
      "1. Prüfen Sie, dass ausschließlich privates Eigentum (Haus, Hof, Einfahrt) erfasst wird.",
      "2. Öffnen Sie die Kamera-Konfiguration im Browser unter 'Bild-Einstellungen' -> 'Privatzone'.",
      "3. Markieren Sie öffentliche Gehwege, Straßen oder Nachbargrundstücke mit schwarzen Sperrzonen.",
      "4. Bringen Sie das offizielle Videoüberwachungs-Hinweisschild gut sichtbar im Eingangsbereich an."
    ]
  },
  {
    id: "qs-nas",
    title: "NAS Langzeit-Aufzeichnung & VPN Fernzugriff",
    category: "NAS-Systeme",
    fileSize: "4.2 MB",
    pages: "5 Seiten",
    version: "Rev. 2026/4",
    description: "Anleitung zur Einrichtung von Netzwerkspeichern (NAS) als Aufzeichnungsserver und sicherer WireGuard VPN-Verbindung.",
    steps: [
      "1. NAS-System im gleichen lokalen Netzwerk anschließen und Surveillance Station / NVR Software öffnen.",
      "2. IP-Kameras im lokalen Subnetz automatisch erkennen lassen und ONVIF-Zugangsdaten hinterlegen.",
      "3. Speicher-Raid (z.B. RAID 1 Spiegelung) für höchste Ausfallsicherheit einrichten.",
      "4. WireGuard VPN auf dem Router aktivieren, um von unterwegs sicher und verschlüsselt auf den Live-Stream zuzugreifen."
    ]
  }
];

// Helper to render inline formatting like **bold** and [link](url)
const parseInlineFormatting = (text: string) => {
  if (!text) return text;
  
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(https?:\/\/[^\s\)]+\))/g);
  
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    
    const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (linkMatch) {
      return (
        <a 
          key={i} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-semibold underline hover:text-blue-800 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    
    return part;
  });
};

// Main function to parse article content and render formatted text, headings, and embedded images
const renderFormattedContent = (rawContent: string) => {
  if (!rawContent) return null;

  const normalized = rawContent.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // 1. Markdown Image: ![alt text](https://url...)
    const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/i) || trimmed.match(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/i);
    if (mdImgMatch && (trimmed.startsWith("!") || mdImgMatch[0] === trimmed)) {
      const altText = mdImgMatch[1] || "";
      const imgUrl = mdImgMatch[2].trim();
      return (
        <figure key={blockIdx} className="my-6 space-y-2">
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950 group">
            <img 
              src={imgUrl} 
              alt={altText || "Artikel Bild"} 
              className="w-full max-h-[550px] object-cover hover:scale-[1.01] transition-transform duration-500"
              loading="lazy" decoding="async" referrerPolicy="no-referrer"
              onError={(e) => {
                console.warn("Image load error:", imgUrl);
              }}
            />
          </div>
          {altText && altText !== "Cover" && altText !== "Titelbild" && (
            <figcaption className="text-center text-xs text-slate-500 font-medium italic">
              {altText}
            </figcaption>
          )}
        </figure>
      );
    }

    // 2. HTML <img> tag
    const htmlImgMatch = trimmed.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/i);
    if (htmlImgMatch && (trimmed.startsWith("<img") || htmlImgMatch[0] === trimmed)) {
      const imgUrl = htmlImgMatch[1].trim();
      const altMatch = trimmed.match(/alt=["']([^"']*)["']/i);
      const altText = altMatch ? altMatch[1] : "";
      return (
        <figure key={blockIdx} className="my-6 space-y-2">
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
            <img 
              src={imgUrl} 
              alt={altText || "Artikel Bild"} 
              className="w-full max-h-[550px] object-cover"
              loading="lazy" decoding="async" referrerPolicy="no-referrer"
            />
          </div>
          {altText && (
            <figcaption className="text-center text-xs text-slate-500 font-medium italic">
              {altText}
            </figcaption>
          )}
        </figure>
      );
    }

    // 3. Standalone Image URL on its own line/block
    const isStandaloneUrl = /^https?:\/\/[^\s]+$/i.test(trimmed);
    const isImageFile = /\.(jpg|jpeg|png|webp|gif|svg)(\?[^\s]*)?$/i.test(trimmed);
    const isKnownImageHost = trimmed.includes("firebasestorage.googleapis.com") || 
                            trimmed.includes("images.unsplash.com") || 
                            trimmed.includes("supabase.co") || 
                            trimmed.includes("cloudinary.com");

    if (isStandaloneUrl && (isImageFile || isKnownImageHost)) {
      return (
        <figure key={blockIdx} className="my-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
            <img 
              src={trimmed} 
              alt="Artikel Bild" 
              className="w-full max-h-[550px] object-cover"
              loading="lazy" decoding="async" referrerPolicy="no-referrer"
            />
          </div>
        </figure>
      );
    }

    // 4. Headings
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={blockIdx} className="text-2xl font-extrabold font-display text-slate-900 pt-4 pb-1 border-b border-slate-100">
          {trimmed.replace(/^#\s+/, "")}
        </h1>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={blockIdx} className="text-xl font-bold font-display text-slate-900 pt-4 pb-1">
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={blockIdx} className="text-lg font-bold font-display text-slate-900 pt-3">
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    }

    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={blockIdx} className="text-base font-bold text-slate-900 pt-2">
          {trimmed.replace(/^####\s+/, "")}
        </h4>
      );
    }

    // 5. Lists (- item or * item)
    const lines = trimmed.split("\n");
    if (lines.length > 1 && lines.every(line => line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().length === 0)) {
      const items = lines.filter(l => l.trim().length > 0);
      return (
        <ul key={blockIdx} className="list-disc list-inside space-y-1.5 text-slate-700 my-3 pl-2">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {parseInlineFormatting(it.replace(/^[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    // 6. Block containing mixed text and Markdown images (e.g. ![alt](url) inside block)
    if (trimmed.includes("![") && trimmed.includes("](")) {
      const parts = trimmed.split(/(!\[.*?\]\(https?:\/\/[^\s\)]+\))/g);
      return (
        <div key={blockIdx} className="space-y-4">
          {parts.map((part, pIdx) => {
            const subImgMatch = part.match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
            if (subImgMatch) {
              const altText = subImgMatch[1];
              const imgUrl = subImgMatch[2];
              return (
                <figure key={pIdx} className="my-6 space-y-2">
                  <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
                    <img 
                      src={imgUrl} 
                      alt={altText || "Artikel Bild"} 
                      className="w-full max-h-[550px] object-cover"
                      loading="lazy" decoding="async" referrerPolicy="no-referrer"
                    />
                  </div>
                  {altText && altText !== "Cover" && (
                    <figcaption className="text-center text-xs text-slate-500 font-medium italic">
                      {altText}
                    </figcaption>
                  )}
                </figure>
              );
            }
            if (!part.trim()) return null;
            return (
              <p key={pIdx} className="whitespace-pre-line leading-relaxed text-slate-700">
                {parseInlineFormatting(part)}
              </p>
            );
          })}
        </div>
      );
    }

    // 7. Regular paragraph
    return (
      <p key={blockIdx} className="whitespace-pre-line leading-relaxed text-slate-700">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });
};

export default function BlogSection({ blogPosts, onOpenCallback, onBackToHome }: BlogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Alle");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // Beim Öffnen eines Artikels sanft an den Anfang des Blog-Bereichs scrollen
  useEffect(() => {
    if (activeArticle) {
      document.getElementById("ratgeber")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeArticle]);
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [selectedQuickStart, setSelectedQuickStart] = useState<QuickStartGuide | null>(null);

  const handleDownloadPdf = (guide: QuickStartGuide) => {
    setDownloadNotice(`PDF wird heruntergeladen: "${guide.title}" (${guide.fileSize})`);
    setTimeout(() => setDownloadNotice(null), 4500);
  };

  // Filter only published articles for public view
  const publishedPosts = blogPosts.filter(post => post.isPublished);

  // Dynamic Categories list based on published posts and standard categories
  const existingCategories = Array.from(new Set(publishedPosts.map(post => post.category).filter(Boolean)));
  const defaultCategories = ["Technik-Guides", "Sicherheitstipps", "Rechtliches", "Smart Home"];
  const allUniqueCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));
  const categories = ["Alle", ...allUniqueCategories, "Quick-Start PDFs"];

  // Dynamic Tags list
  const allUniqueTags = Array.from(
    new Set(publishedPosts.flatMap(post => post.tags || []))
  ).filter(Boolean);

  // Filtered posts
  const filteredPosts = publishedPosts.filter(post => {
    const matchesCategory = selectedCategory === "Alle" || post.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const featuredPost = publishedPosts.find(p => p.featured) || publishedPosts[0];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      try {
        await requestDoubleOptIn(newsletterEmail, "Blog Ratgeber Sidebar");
      } catch (err) {
        console.error("Double Opt-In submission error:", err);
      }
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 8000);
    }
  };

  // Reusable WordPress Sidebar Component
  const renderSidebar = (inArticleView = false) => (
    <aside className="space-y-6 lg:sticky lg:top-6">
      {/* Widget 1: Suche (Search Widget) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Blog durchsuchen</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Suchbegriff eingeben..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inArticleView) {
                setActiveArticle(null);
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Widget 2: Kategorien (Categories Widget) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <span>Kategorien</span>
          </div>
          <span className="text-[10px] text-slate-400 lowercase font-medium">({categories.length - 1} Themen)</span>
        </div>

        <div className="space-y-1 pt-1">
          {categories.map((cat) => {
            const count = cat === "Alle" 
              ? publishedPosts.length 
              : publishedPosts.filter(p => p.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  if (inArticleView) setActiveArticle(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                    : "bg-slate-50/70 text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {isActive ? (
                    <FolderOpen className="w-4 h-4 text-white shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{cat}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Widget: Quick-Start PDF Guides */}
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3 border border-blue-800">
        <div className="flex items-center gap-2 pb-2 border-b border-blue-800 text-blue-200 font-bold text-xs uppercase tracking-wider">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Quick-Start PDF Guides</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Kostenlose, bebilderte Schritt-für-Schritt Installations-PDFs für IP-Kameras & Netzwerke.
        </p>
        <button
          onClick={() => {
            setSelectedCategory("Quick-Start PDFs");
            if (inArticleView) setActiveArticle(null);
          }}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Alle Guides anzeigen ({QUICK_START_GUIDES.length})</span>
        </button>
      </div>

      {/* Widget 3: Neueste Beiträge */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider">
          <Newspaper className="w-4 h-4 text-blue-600" />
          <span>Neueste Beiträge</span>
        </div>

        <div className="space-y-3 pt-1">
          {publishedPosts.slice(0, 4).map((post) => {
            const isCurrent = activeArticle?.id === post.id;
            return (
              <div 
                key={post.id}
                onClick={() => setActiveArticle(post)}
                className={`flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl transition-colors ${
                  isCurrent ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200/80">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    loading="lazy" decoding="async" referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {post.date}
                  </span>
                  <h4 className={`text-xs font-bold transition-colors line-clamp-2 leading-snug ${
                    isCurrent ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                  }`}>
                    {post.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widget 4: Schlagwörter / Tags */}
      {allUniqueTags.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>Schlagwörter</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {allUniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  if (inArticleView) setActiveArticle(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget 5: Kundenberatung Service Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-slate-800 shadow-lg relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5E2E]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 text-[#FF5E2E] font-extrabold text-[10px] uppercase tracking-wider">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Experten-Service</span>
        </div>

        <h4 className="text-sm font-bold text-white leading-snug">
          Fragen zu Kameras, Netzwerken oder Datenschutz?
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          Andreas Rettenegger & unser Technik-Team unterstützen Sie persönlich bei der Planung Ihrer Infrastruktur.
        </p>

        <button
          onClick={() => {
            if (inArticleView) setActiveArticle(null);
            if (onOpenCallback) onOpenCallback();
          }}
          className="w-full py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF5E2E]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Kostenlose Beratung anfordern</span>
        </button>
      </div>

      {/* Widget 6: Newsletter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
          <Send className="w-4 h-4 text-blue-600" />
          <span>Ratgeber Newsletter</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Neue Praxis-Guides, rechtliche Updates & Technik-Tipps direkt ins Postfach erhalten.
        </p>

        {newsletterSubscribed ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bitte E-Mail-Postfach prüfen (Double-Opt-In-Bestätigungslink gesendet)!</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              required
              placeholder="Ihre E-Mail-Adresse..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Kostenfrei Abonnieren
            </button>
          </form>
        )}
      </div>
    </aside>
  );

  return (
    <section id="ratgeber" className="py-16 bg-slate-50/80 border-t border-slate-100 relative overflow-hidden">
      
      {/* Background Subtle Highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {!activeArticle && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 text-xs text-slate-500 mb-6 font-medium">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBackToHome} 
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-600" />
              <span>Zurück zur Startseite</span>
            </button>
            <span>/</span>
            <span className="text-slate-900 font-bold">Blog & Magazin</span>
            {selectedCategory !== "Alle" && (
              <>
                <span>/</span>
                <span className="text-blue-600 font-semibold">{selectedCategory}</span>
              </>
            )}
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all font-semibold shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
            >
              <span>Shop-Übersicht</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hero Header Banner (IT-Market Style) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>IT & Security Know-How</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
              Ratgeber & Technik-Magazin
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Praxisnahes Fachwissen zu Überwachungssystemen, Netzwerkinfrastruktur, Kamera-Tests und rechtlichen Vorgaben (DSGVO).
            </p>

            {/* Quick Hero Search Input */}
            <div className="mt-6 max-w-xl relative">
              <input 
                type="text"
                placeholder="Ratgeber durchsuchen (z.B. IP-Kamera, PoE, DSGVO)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main WordPress Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (Column 8/12) */}
          <main className="lg:col-span-8 space-y-8">

            {/* Active Filter Bar / Category Tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {(selectedCategory !== "Alle" || searchQuery) && (
                <button
                  onClick={() => { setSelectedCategory("Alle"); setSearchQuery(""); }}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Filter zurücksetzen</span>
                </button>
              )}
            </div>

            {/* Active Search/Filter Status Message */}
            {(selectedCategory !== "Alle" || searchQuery) && (
              <div className="bg-blue-50/80 border border-blue-200/70 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-blue-900">
                <span>
                  Zeige Beiträge in <strong>{selectedCategory}</strong>
                  {searchQuery && <> für Suchbegriff "<strong>{searchQuery}</strong>"</>} ({filteredPosts.length} {filteredPosts.length === 1 ? "Beitrag" : "Beiträge"})
                </span>
                <button 
                  onClick={() => { setSelectedCategory("Alle"); setSearchQuery(""); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Alle anzeigen
                </button>
              </div>
            )}

            {/* Download Notification Toast */}
            {downloadNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{downloadNotice}</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">PDF bereit</span>
              </div>
            )}

            {/* Quick-Start PDFs View */}
            {selectedCategory === "Quick-Start PDFs" ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-800">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30 mb-3">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download-Center & Anleitungen</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                      IP-Kamera Quick-Start Installations-Guides (PDF)
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Laden Sie unsere offiziellen, bebilderten Schritt-für-Schritt Installations-Handbücher herunter. Ideal für Techniker, Installateure und ambitionierte Heimwerker.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {QUICK_START_GUIDES.map((guide) => (
                    <div 
                      key={guide.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wider">
                            {guide.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {guide.version} • {guide.pages} ({guide.fileSize})
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {guide.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {guide.description}
                        </p>

                        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Auszug aus den Schritten:
                          </span>
                          {guide.steps.slice(0, 2).map((step, idx) => (
                            <p key={idx} className="text-xs text-slate-700 truncate">
                              • {step}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedQuickStart(guide)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Online lesen</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(guide)}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF herunterladen</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Featured Post Hero Banner (Only shown if no specific search query & "Alle" category) */}
                {featuredPost && selectedCategory === "Alle" && !searchQuery && (
              <div 
                onClick={() => setActiveArticle(featuredPost)}
                className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 group cursor-pointer hover:border-slate-700 transition-all duration-300"
              >
                <div className="md:col-span-6 lg:col-span-6 relative h-60 md:h-auto overflow-hidden">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90"
                    loading="lazy" decoding="async" referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-900"></div>
                  <div className="absolute top-3 left-3 bg-[#FF5E2E] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Hervorgehoben</span>
                  </div>
                </div>

                <div className="md:col-span-6 lg:col-span-6 p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <span className="bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30 text-[10px]">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-white group-hover:text-blue-400 transition-colors leading-snug mb-2">
                      {featuredPost.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-200 block">{featuredPost.author}</span>
                        <span className="text-[10px] text-slate-500 block">{featuredPost.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>Lesen</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Stream Grid (2 Columns on main content) */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <article 
                    key={post.id}
                    onClick={() => setActiveArticle(post)}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" decoding="async" referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200">
                        {post.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {post.readTime}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{post.author}</span>
                        </div>

                        <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors leading-snug pt-0.5 mb-2 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Tags & Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Lesen
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Keine Artikel gefunden</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Für Ihre Suchanfrage "{searchQuery}" in der Kategorie "{selectedCategory}" wurden keine Veröffentlichungen gefunden.
                </p>
                <button
                  onClick={() => { setSelectedCategory("Alle"); setSearchQuery(""); }}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
              </>
            )}

          </main>

          {/* WordPress Style Sidebar on Main Page (Column 4/12) */}
          <div className="lg:col-span-4">
            {renderSidebar(false)}
          </div>

        </div>

      </div>
      )}

      {/* Article Detail Reader – Vollseiten-Ansicht (kein Modal) */}
      {activeArticle && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
          <div className="w-full">

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <button
                onClick={() => setActiveArticle(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zurück zur Übersicht</span>
              </button>
            </div>

            {/* Modal Grid: Main Article Content (Col 8/12) + Sidebar (Col 4/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Article Content */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Header Image */}
                <div className="relative min-h-[280px] sm:min-h-[340px] w-full bg-slate-950 flex flex-col justify-end p-6 sm:p-8 overflow-hidden rounded-2xl">
                  <img 
                    src={activeArticle.image} 
                    alt={activeArticle.title} 
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-75"
                    loading="lazy" decoding="async" referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
                  
                  <div className="relative z-10 text-white pt-10">
                    <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
                      <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
                        {activeArticle.category}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {activeArticle.readTime}
                      </span>
                      <span className="text-slate-400">• {activeArticle.date}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-snug pt-1 text-white">
                      {activeArticle.title}
                    </h1>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{activeArticle.author}</span>
                      <span className="text-xs text-slate-500 block">Autor & Redaktion</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: activeArticle.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link in Zwischenablage kopiert!");
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Artikel teilen"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Teilen</span>
                  </button>
                </div>

                {/* Excerpt Lead */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-800 font-medium text-sm sm:text-base leading-relaxed">
                  {activeArticle.excerpt}
                </div>

                {/* Article Content Render */}
                <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                  {renderFormattedContent(activeArticle.content)}
                </div>

                {/* Tags list */}
                <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {activeArticle.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        setActiveArticle(null);
                      }}
                      className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Related Articles Section inside Reader Mode */}
                {publishedPosts.filter(p => p.id !== activeArticle.id).length > 0 && (
                  <div className="pt-6 border-t border-slate-200/80 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-xs">
                      <Newspaper className="w-4 h-4 text-blue-600" />
                      <span>Weitere passende Beiträge</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {publishedPosts
                        .filter(p => p.id !== activeArticle.id)
                        .slice(0, 2)
                        .map(relPost => (
                          <div 
                            key={relPost.id}
                            onClick={() => setActiveArticle(relPost)}
                            className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex gap-3 items-center group"
                          >
                            <img 
                              src={relPost.image} 
                              alt={relPost.title} 
                              className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                              loading="lazy" decoding="async" referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-blue-600 font-bold block mb-0.5">{relPost.category}</span>
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {relPost.title}
                              </h4>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* CTA Banner */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#FF5E2E] uppercase tracking-wider block mb-1">
                      Individuelle Fachberatung
                    </span>
                    <h4 className="text-base font-bold text-white">Fragen zu diesem Thema oder Komponenten?</h4>
                    <p className="text-xs text-slate-400 mt-1">Sprechen Sie direkt mit unseren Sicherheitsexperten.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveArticle(null);
                      if (onOpenCallback) onOpenCallback();
                    }}
                    className="px-5 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#FF5E2E]/20 whitespace-nowrap cursor-pointer"
                  >
                    Rückruf anfordern
                  </button>
                </div>

              </div>

              {/* Sidebar Column inside Article View */}
              <div className="lg:col-span-4">
                {renderSidebar(true)}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Quick-Start Guide Reader Modal */}
      {selectedQuickStart && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {selectedQuickStart.category} • {selectedQuickStart.version}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedQuickStart.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuickStart(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedQuickStart.description}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vollständige Schritt-für-Schritt Installationsanleitung:
              </h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {selectedQuickStart.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Format: PDF • {selectedQuickStart.pages} • {selectedQuickStart.fileSize}
              </span>
              <button
                onClick={() => {
                  handleDownloadPdf(selectedQuickStart);
                  setSelectedQuickStart(null);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>PDF Jetzt Herunterladen</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

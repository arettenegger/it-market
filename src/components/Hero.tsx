import React, { useState, useEffect, useRef } from "react";
import { VideoBackground, getYouTubeId } from "./VideoBackground";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  Shield, 
  Eye, 
  Database, 
  Cpu,
  Play,
  Pause,
  ArrowUpRight,
  Camera,
  Video,
  Upload,
  X,
  RotateCcw,
  Sparkles,
  Trash2
} from "lucide-react";
import { CATEGORIES } from "../data";

interface HeroProps {
  cloudLoaded?: boolean;
  heroImages?: Record<string, string>;
  heroVideos?: Record<string, string>;
  onUpdateHeroImages?: (updated: Record<string, string>) => void;
  onUpdateHeroVideos?: (updated: Record<string, string>) => void;
  onDiscoverClick: () => void;
  onOpenCallback: () => void;
  onSelectCategory?: (categoryName: string) => void;
  scrollToSection?: (id: string) => void;
}

const SLIDE_DURATION = 7000; // 7 seconds per slide

const DEFAULT_SLIDES = [
  {
    id: "kameras",
    category: "IP-Kameras",
    title: "Smarte IP-Kameras mit künstlicher Intelligenz",
    subtitle: "Sicherheits- & Überwachungskameras",
    description: "Hochauflösende 4K IP-Kameras mit intelligenter KI-Erkennung für den Innen- und Außenbereich. Schützen Sie Ihr Eigentum mit modernster, vollfarbiger Nachtsicht.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920",
    highlights: [
      "Gestochen scharfe 4K Ultra-HD Auflösung",
      "Smarte KI-Objekterkennung (Menschen, Fahrzeuge, Tiere)",
      "Vollfarb-Nachtsicht mit integrierten LED-Scheinwerfern",
      "Lokale Speicherung ohne monatliche Abo-Gebühren"
    ],
    actionText: "In IP-Kameras stöbern",
    icon: Shield
  },
  {
    id: "smarthome",
    category: "Smart Home",
    title: "Dein Zuhause. Smart vernetzt.",
    subtitle: "Smart Home & Videoüberwachung",
    description: "Smart Home & Videoüberwachung aus einer Hand – persönlich, aus der Region.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
    highlights: [
      "Schlüsselloser Zugang mit V-Lock Pro Smart Doorlocks",
      "Echtzeit-Meldung bei Erschütterung oder Öffnungsversuch",
      "Smart-Zentrale mit integriertem Akku-Backup",
      "Alarmsirenen mit extrem lautstarken 110 dB Schutz"
    ],
    actionText: "Jetzt kostenlos beraten lassen",
    icon: Eye
  },
  {
    id: "nas",
    category: "NAS-Systeme",
    title: "Zentrale Datensicherheit & volle Datenhoheit",
    subtitle: "Zentrale Datenspeicherung",
    description: "Netzwerkspeicher für die sichere, lokale Langzeitaufzeichnung Ihrer Überwachungsdaten und private Backups. 100% datenschutzkonform und vollkommen cloudfrei.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920",
    highlights: [
      "Zentrale, vollkommen private Aufzeichnungsspeicherung",
      "Redundante Festplattenspiegelung vor Datenverlust (RAID)",
      "Automatisierte Backups für PCs, Mac und Smartphones",
      "Keine monatlichen Cloud-Kosten oder Datenlecks"
    ],
    actionText: "In NAS-Systemen stöbern",
    icon: Database
  },
  {
    id: "netzwerk",
    category: "Heimnetzwerke",
    title: "Stabile & professionelle PoE-Heimnetzwerke",
    subtitle: "Sichere & stabile Verbindungen",
    description: "Professionelle PoE-Switches, Router und Access Points für eine ausfallsichere Netzwerk-Infrastruktur. Maximale Bandbreite für Ihre IP-Sicherheitskameras.",
    image: "/netzwerk-hero-section.jpg",
    highlights: [
      "Stromversorgung direkt über das LAN-Kabel (PoE+)",
      "Gigabit-Geschwindigkeit für flüssiges 4K-Video-Streaming",
      "Separate VLAN-Netzwerkbereiche für maximale Sicherheit",
      "Robustes Metallgehäuse & ausfallsicheres Design"
    ],
    actionText: "In Netzwerken stöbern",
    icon: Cpu
  }
];

const PRESETS: Record<string, { name: string; url: string }[]> = {
  kameras: [
    { name: "Premium 4K Cam", url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920" },
    { name: "CCTV Outdoor", url: "https://images.unsplash.com/photo-1521992257252-cbf1c7a87e59?auto=format&fit=crop&q=80&w=1920" },
    { name: "Smart Dome Kamera", url: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?auto=format&fit=crop&q=80&w=1920" },
    { name: "Home Entrance Safety", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1920" }
  ],
  smarthome: [
    { name: "Keypad Entry", url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920" },
    { name: "Warm Cozy Smart Home", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1920" },
    { name: "Living Hub Control", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" },
    { name: "Automated Control", url: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=1920" }
  ],
  nas: [
    { name: "Server Storage Room", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920" },
    { name: "Local Disk RAID", url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1920" },
    { name: "Premium Data Center", url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1920" },
    { name: "Network Drives", url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=1920" }
  ],
  netzwerk: [
    { name: "Netzwerk Hero Section", url: "/netzwerk-hero-section.jpg" },
    { name: "Blue PoE Fiber", url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1920" },
    { name: "Switch Ethernet", url: "https://images.unsplash.com/photo-1501526029524-a8ea952b15be?auto=format&fit=crop&q=80&w=1920" },
    { name: "Fiber Optic Nodes", url: "https://images.unsplash.com/photo-1551703599-6b3e8379aa81?auto=format&fit=crop&q=80&w=1920" },
    { name: "Tech Network Servers", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1920" }
  ]
};

const VIDEO_PRESETS: Record<string, { name: string; url: string }[]> = {
  kameras: [
    { name: "Sicherheitskamera Überwachung (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4" },
    { name: "CCTV Store Analytics (YouTube)", url: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
    { name: "Gebäude & Objektüberwachung (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4" }
  ],
  smarthome: [
    { name: "Smart Home Living Room (YouTube)", url: "https://www.youtube.com/watch?v=23_14xX2_K0" },
    { name: "Smart Home Erkennung & Sensorik (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4" },
    { name: "KI-Analyse Personenstrom (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking.mp4" }
  ],
  nas: [
    { name: "Rechenzentrum Server Racks (YouTube)", url: "https://www.youtube.com/watch?v=zOJe-HAx14o" },
    { name: "NAS & Flaschen-Erkennung Tech (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4" },
    { name: "Rechenzentrum Objekt-Scan (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4" }
  ],
  netzwerk: [
    { name: "Fiber Optic Network (YouTube)", url: "https://www.youtube.com/watch?v=M7FIvfx5J10" },
    { name: "Netzwerk KI Personen-Tracking (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking.mp4" },
    { name: "Verkehr & Überwachung (MP4)", url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4" }
  ]
};

export default function Hero({
  cloudLoaded = true,
  heroImages,
  heroVideos,
  onUpdateHeroImages,
  onUpdateHeroVideos,
  onDiscoverClick, 
  onOpenCallback,
  onSelectCategory,
  scrollToSection
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Custom Slider Images state (loaded from props or local storage)
  const [slideImages, setSlideImages] = useState<Record<string, string>>(() => {
    const defaults = {
      kameras: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920",
      smarthome: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
      nas: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920",
      netzwerk: "/netzwerk-hero-section.jpg"
    };
    if (heroImages) return { ...defaults, ...heroImages };
    return defaults;
  });

  useEffect(() => {
    if (heroImages) {
      const defaults = {
        kameras: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920",
        smarthome: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
        nas: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920",
        netzwerk: "/netzwerk-hero-section.jpg"
      };
      setSlideImages({ ...defaults, ...heroImages });
    }
  }, [heroImages]);

  const [failedVideos, setFailedVideos] = useState<Record<string, boolean>>({});

  const [slideVideos, setSlideVideos] = useState<Record<string, string>>(() => {
    const defaults = {
      smarthome: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4"
    };
    if (heroVideos) return { ...defaults, ...heroVideos };
    return defaults;
  });

  useEffect(() => {
    if (heroVideos) {
      const defaults = {
        smarthome: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4"
      };
      setSlideVideos({ ...defaults, ...heroVideos });
    }
  }, [heroVideos]);

  // Modal State for custom background customization
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [customVideoInput, setCustomVideoInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Manage Autoplay timer & animated progress line
  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const computedProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      
      setProgress(computedProgress);

      if (computedProgress < 100) {
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Move to next slide
        setCurrentSlide(prev => (prev + 1) % DEFAULT_SLIDES.length);
        setProgress(0);
        startTimeRef.current = Date.now();
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying]);

  // Sync edit modal state when slide changes
  useEffect(() => {
    const activeId = DEFAULT_SLIDES[currentSlide].id;
    setCustomUrlInput(slideImages[activeId] || "");
    setCustomVideoInput(slideVideos[activeId] || "");
  }, [currentSlide, slideImages, slideVideos]);

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);
  };

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev + 1) % DEFAULT_SLIDES.length);
  };

  const handleSelectSlide = (idx: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(idx);
  };

  const handleDiscoverCategory = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    } else {
      onDiscoverClick();
    }
  };

  // Convert and compress local file to JPEG DataURL to stay under localStorage limit
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Hero-Bild als echte Datei nach Firebase Storage; gespeichert wird nur die URL.
      const { uploadImageToStorage } = await import("../lib/storageService");
      const url = await uploadImageToStorage(file, "hero", 1920, 0.82);
      setCustomUrlInput(url);
    } catch (err) {
      console.error("Hero-Bild-Upload fehlgeschlagen:", err);
      alert("Bild-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload local video file
  const handleLocalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Lokale Videodatei ist zu groß (max. 50 MB). Für größere Videos bitte eine direkte MP4-Video-URL angeben.");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadFileToStorage } = await import("../lib/storageService");
      const url = await uploadFileToStorage(file, "hero-videos");
      setCustomVideoInput(url);
    } catch (err) {
      console.error("Hero-Video-Upload fehlgeschlagen:", err);
      alert("Video-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
    }
  };

  // Apply customized image and video
  const handleApplyCustomMedia = () => {
    const activeId = DEFAULT_SLIDES[currentSlide].id;
    
    // Update Images
    const updatedImages = {
      ...slideImages,
      [activeId]: customUrlInput
    };
    setSlideImages(updatedImages);
    if (onUpdateHeroImages) {
      onUpdateHeroImages(updatedImages);
    }

    // Update Videos
    const updatedVideos = {
      ...slideVideos,
      [activeId]: customVideoInput
    };
    setSlideVideos(updatedVideos);
    if (onUpdateHeroVideos) {
      onUpdateHeroVideos(updatedVideos);
    }

    setIsEditModalOpen(false);
  };

  // Reset current slide media to factory default
  const handleResetSlideMedia = () => {
    const activeId = DEFAULT_SLIDES[currentSlide].id;
    const defaultImage = DEFAULT_SLIDES[currentSlide].image;
    
    const updatedImages = {
      ...slideImages,
      [activeId]: defaultImage
    };
    setSlideImages(updatedImages);
    setCustomUrlInput(defaultImage);
    if (onUpdateHeroImages) {
      onUpdateHeroImages(updatedImages);
    }

    const updatedVideos = { ...slideVideos };
    delete updatedVideos[activeId];
    setSlideVideos(updatedVideos);
    setCustomVideoInput("");
    if (onUpdateHeroVideos) {
      onUpdateHeroVideos(updatedVideos);
    }

    setIsEditModalOpen(false);
  };

  const activeSlide = DEFAULT_SLIDES[currentSlide];
  const activeImage = slideImages[activeSlide.id] || activeSlide.image;
  const activeVideo = slideVideos[activeSlide.id] || "";
  const presetsForCategory = PRESETS[activeSlide.id] || [];
  const videoPresetsForCategory = VIDEO_PRESETS[activeSlide.id] || [];

  return (
    <section 
      id="hero" 
      className="relative w-full h-[640px] sm:h-[680px] md:h-[720px] lg:h-[760px] bg-slate-950 overflow-hidden flex items-center"
      aria-label="Produkt-Highlights Diashow"
    >
      
      {/* Background Slides with premium scale animations */}
      <div className="absolute inset-0 z-0">
        {DEFAULT_SLIDES.map((slide, idx) => {
          const isCurrent = currentSlide === idx;
          const currentSlideImage = slideImages[slide.id] || slide.image;
          const currentSlideVideo = slideVideos[slide.id];
          const mediaSrc = currentSlideVideo || currentSlideImage;
          const isYouTube = !!getYouTubeId(mediaSrc);
          const isCandidateVideo = isYouTube || !!currentSlideVideo || (currentSlideImage && (currentSlideImage.endsWith(".mp4") || currentSlideImage.endsWith(".webm") || currentSlideImage.startsWith("data:video/")));
          const isVideo = isCandidateVideo && !failedVideos[mediaSrc];

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-slate-950 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Dark glassmorphic filter overlay & high contrast visual shielding */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-slate-950/25 z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />

              {/* Bild/Video erst zeigen, wenn die echten Bilder aus der Cloud geladen sind
                  (verhindert kurzes Aufblitzen der Standard-/Unsplash-Bilder beim Start) */}
              {cloudLoaded && (isVideo ? (
                <VideoBackground
                  src={mediaSrc}
                  onError={() => {
                    console.warn("Video load error for:", mediaSrc);
                    setFailedVideos(prev => ({ ...prev, [mediaSrc]: true }));
                  }}
                  className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                    isCurrent ? "scale-105" : "scale-100"
                  }`}
                />
              ) : (
                <img
                  src={currentSlideImage}
                  alt={slide.category}
                  fetchPriority={isCurrent ? "high" : "low"}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                    isCurrent ? "scale-105" : "scale-100"
                  }`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Premium Admin Floating Button to change background images or videos on the fly */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex gap-2">
        <button 
          onClick={() => {
            setIsAutoPlaying(false);
            setIsEditModalOpen(true);
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/85 hover:bg-[#FF5E2E] border border-white/20 hover:border-[#FF5E2E] text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
          title="Hintergrundbild oder Video für dieses Highlight anpassen"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5E2E] group-hover:text-white shrink-0" />
          <span className="hidden sm:inline">Bild / Video für '{activeSlide.category}' anpassen</span>
          <span className="sm:hidden text-[11px]">Medien anpassen</span>
        </button>
      </div>

      {/* Main Slide Content Overlays */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="max-w-2xl lg:max-w-3xl">
          
          {/* Tagline category selector indicator */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/10 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5E2E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5E2E]"></span>
            </span>
            {activeSlide.subtitle}
          </div>

          {/* Majestic Animated Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight leading-[1.1] mb-6">
            {activeSlide.title.split(" ").map((word, i) => {
              // Highlight central key product words with premium brand color orange
              const isHighlight = word.toLowerCase().includes("ip-kameras") || 
                                  word.toLowerCase().includes("smart") || 
                                  word.toLowerCase().includes("nas-systemen") || 
                                  word.toLowerCase().includes("datensicherheit") ||
                                  word.toLowerCase().includes("heimnetzwerke");
              return (
                <span key={i} className="inline-block mr-2.5">
                  <span className={isHighlight ? "text-[#FF5E2E]" : "text-white"}>
                    {word}
                  </span>
                </span>
              );
            })}
          </h1>

          {/* Slide Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
            {activeSlide.description}
          </p>

          {/* Bullet checklist on subtle transparent cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
            {activeSlide.highlights.map((highlight, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl backdrop-blur-sm"
              >
                <div className="w-5 h-5 rounded-full bg-[#FF5E2E]/25 border border-[#FF5E2E]/30 flex items-center justify-center text-[#FF5E2E] shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
                  {highlight}
                </span>
              </div>
            ))}
          </div>

          {/* Action Call to Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => handleDiscoverCategory(activeSlide.category)}
              className="bg-[#FF5E2E] hover:bg-[#ff4d15] text-white font-extrabold px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl shadow-lg hover:shadow-[#FF5E2E]/20 transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              {activeSlide.actionText}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenCallback}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              Kostenlose Beratung
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Slide Navigation Left/Right Arrow Paddles */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-[#FF5E2E]/80 text-white/80 hover:text-white border border-white/10 hover:border-[#FF5E2E]/30 transition-all cursor-pointer backdrop-blur-sm active:scale-95"
        aria-label="Vorherige Kategorie"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-[#FF5E2E]/80 text-white/80 hover:text-white border border-white/10 hover:border-[#FF5E2E]/30 transition-all cursor-pointer backdrop-blur-sm active:scale-95"
        aria-label="Nächste Kategorie"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Simple Slide Dots Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-2">
        {DEFAULT_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-8 bg-[#FF5E2E]" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Gehe zu Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ==================== CUSTOMIZE MEDIA MODAL ==================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-left flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <h3 className="text-sm font-black font-display text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#FF5E2E]" />
                  Hintergrundmedien anpassen
                </h3>
                <span className="text-[10px] text-slate-400">Kategorie: {activeSlide.category}</span>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs for Image vs Video */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
              <button
                onClick={() => setActiveTab("image")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "image"
                    ? "bg-[#FF5E2E] text-white shadow-md shadow-[#FF5E2E]/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Hintergrundbild</span>
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "video"
                    ? "bg-[#FF5E2E] text-white shadow-md shadow-[#FF5E2E]/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Hintergrundvideo (MP4)</span>
                {customVideoInput && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {activeTab === "image" ? (
                <>
                  {/* Option A: File Upload */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option A: Eigenes Bild hochladen</span>
                    
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-[#FF5E2E]/60 bg-slate-950/30 hover:bg-slate-950/50 p-5 rounded-xl cursor-pointer transition-all group">
                      <Upload className="w-7 h-7 text-slate-500 group-hover:text-[#FF5E2E] mb-2 transition-colors" />
                      <span className="text-xs font-bold text-slate-300">Lokales Bild auswählen</span>
                      <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (automatisch komprimiert)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLocalImageUpload} 
                        className="hidden" 
                      />
                    </label>

                    {isUploading && (
                      <div className="text-center text-[10px] font-semibold text-[#FF5E2E] animate-pulse">
                        Datei wird hochgeladen & vorbereitet...
                      </div>
                    )}
                  </div>

                  {/* Option B: Image URL Input */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option B: Bild-URL einfügen</span>
                    <input
                      type="text"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/... oder Bild-URL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#FF5E2E] transition-all font-mono"
                    />
                  </div>

                  {/* Option C: Presets Selection */}
                  {presetsForCategory.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option C: HD Studio-Fotovorlagen</span>
                      <div className="grid grid-cols-4 gap-2">
                        {presetsForCategory.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCustomUrlInput(preset.url)}
                            className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all relative cursor-pointer hover:scale-105 ${
                              customUrlInput === preset.url 
                                ? "border-[#FF5E2E] shadow-lg shadow-[#FF5E2E]/10" 
                                : "border-slate-800 hover:border-slate-700"
                            }`}
                            title={preset.name}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.name} 
                              className="w-full h-full object-cover" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Option A: Video Upload */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option A: Eigenes MP4 / WebM Video hochladen</span>
                    
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-[#FF5E2E]/60 bg-slate-950/30 hover:bg-slate-950/50 p-5 rounded-xl cursor-pointer transition-all group">
                      <Video className="w-7 h-7 text-slate-500 group-hover:text-[#FF5E2E] mb-2 transition-colors" />
                      <span className="text-xs font-bold text-slate-300">Videodatei auswählen (MP4/WebM)</span>
                      <span className="text-[10px] text-slate-500 mt-1">Max. 25MB flüssiges Loop-Video</span>
                      <input 
                        type="file" 
                        accept="video/mp4,video/webm" 
                        onChange={handleLocalVideoUpload} 
                        className="hidden" 
                      />
                    </label>

                    {isUploading && (
                      <div className="text-center text-[10px] font-semibold text-[#FF5E2E] animate-pulse">
                        Video wird hochgeladen & geladen...
                      </div>
                    )}
                  </div>

                  {/* Option B: Video URL Input */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option B: YouTube-Link oder Direct MP4 Video-URL</span>
                    <input
                      type="text"
                      value={customVideoInput}
                      onChange={(e) => setCustomVideoInput(e.target.value)}
                      placeholder="z.B. https://www.youtube.com/watch?v=... oder https://youtu.be/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#FF5E2E] transition-all font-mono"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Unterstützt YouTube-Videos (watch, shorts, embed, youtu.be) & direkte MP4/WebM-Dateien.
                    </span>
                  </div>

                  {/* Option C: HD Video Presets Selection */}
                  {videoPresetsForCategory.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option C: Kuratierte HD-Hintergrundvideos</span>
                      <div className="grid grid-cols-2 gap-2">
                        {videoPresetsForCategory.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCustomVideoInput(preset.url)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              customVideoInput === preset.url
                                ? "bg-[#FF5E2E]/10 border-[#FF5E2E] text-white"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Video className="w-3.5 h-3.5 text-[#FF5E2E] shrink-0" />
                              <span className="text-xs font-bold truncate">{preset.name}</span>
                            </div>
                            {customVideoInput === preset.url && (
                              <Check className="w-3.5 h-3.5 text-[#FF5E2E] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Video Button */}
                  {customVideoInput && (
                    <div className="pt-2">
                      <button
                        onClick={() => setCustomVideoInput("")}
                        className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Video entfernen (Nur Hintergrundbild nutzen)</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Live Preview section */}
              <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live-Vorschau</span>
                  <span className="text-[10px] text-[#FF5E2E] font-bold">
                    {customVideoInput ? (getYouTubeId(customVideoInput) ? "YouTube Video Aktiv" : "Video-Hintergrund Aktiv") : "Bild-Hintergrund Aktiv"}
                  </span>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative">
                  {customVideoInput ? (
                    <VideoBackground 
                      src={customVideoInput} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src={customUrlInput || activeImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=600&txt=Bild%20nicht%20gefunden";
                      }}
                    />
                  )}
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-[9px] font-bold px-2 py-0.5 rounded text-slate-200 border border-white/10 z-20">
                    {customVideoInput ? (getYouTubeId(customVideoInput) ? "YouTube Video" : "MP4 Video Loop") : "Foto"}
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-between gap-2.5">
              <button
                onClick={handleResetSlideMedia}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-800 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold text-slate-400 transition-all cursor-pointer"
                title="Auf Werkseinstellungen zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#FF5E2E]" />
                Standard
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleApplyCustomMedia}
                  className="px-4 py-2 bg-[#FF5E2E] hover:bg-[#ff7347] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FF5E2E]/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Übernehmen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

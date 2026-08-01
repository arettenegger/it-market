import { Product, Category, FAQItem, Review, ApplicationArea, BlogPost, ConfiguratorData } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "pc-hardware",
    name: "PC-Hardware",
    tagline: "Performance & Server-Hardware",
    description: "Profi-Mainboards, Netzwerkkarten, Workstation-Komponenten und Hochleistungsprozessoren.",
    iconName: "Cpu",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "netzwerke",
    name: "Netzwerke",
    tagline: "Sichere & stabile Verbindungen",
    description: "Professionelle PoE-Switches, Enterprise-Router und Access Points für Ihr Netzwerk.",
    iconName: "Cpu",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "hotspot",
    name: "Hotspot & Wireless-Lösungen",
    tagline: "Gäste-WLAN · Outdoor-Wireless · Richtfunk",
    description: "WLAN-Hotspots, Outdoor-Funkausleuchtung für Freizeitparks, Lagerhallen und öffentliche Plätze sowie Richtfunkverbindungen zur Standortvernetzung.",
    iconName: "Wifi",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "nas",
    name: "NAS-Systeme",
    tagline: "Zentrale Datenspeicherung",
    description: "Netzwerkspeicher für die sichere, lokale Langzeitaufzeichnung und Cloud-Backups.",
    iconName: "RotateCw",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "kameras",
    name: "IP-Kameras",
    tagline: "Sicherheits- & Überwachungskameras",
    description: "Hochauflösende 4K IP-Kameras mit intelligenter KI-Erkennung für den Innen- und Außenbereich.",
    iconName: "Shield",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "smarthome",
    name: "Smart-Home",
    tagline: "Intelligente Haussteuerung",
    description: "Smarte Sensoren, Alarmanlagen und automatisierte Steuerungen für ein sicheres Zuhause.",
    iconName: "Eye",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop"
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "shield-bullet-4k",
    name: "Pro Bullet 4K IP-Kamera",
    category: "IP-Kameras",
    description: "Professionelle Outdoor-Sicherheitskamera mit gestochen scharfer 4K Ultra-HD Auflösung, intelligenter KI-Objekterkennung und lückenloser Farb-Nachtsicht.",
    price: 189,
    oldPrice: 249,
    rating: 4.9,
    reviewsCount: 1420,
    image: "bullet",
    features: ["4K Ultra HD Auflösung", "KI-Personen- & Autoerkennung", "Farb-Nachtsicht bis 30m", "IP67 Wetterfest", "PoE / LAN-Betrieb"],
    isBestseller: true,
    discount: "-24%",
    inStock: true,
    colors: ["Space Grau", "Polar Weiß"],
    specs: {
      resolution: "3840 x 2160 (8 Megapixel)",
      viewAngle: "105° Horizontal",
      nightVision: "Farb-Nachtsicht bis 30m (LED)",
      storage: "MicroSD (bis 256GB) / NVR",
      power: "Power over Ethernet (PoE 802.3af)"
    }
  },
  {
    id: "dome-360-gen2",
    name: "Dome 360 Gen2 Kamera",
    category: "IP-Kameras",
    description: "Vandalensichere, diskrete Halbkugel-Kamera für den Innen- und geschützten Außenbereich. Mit integriertem Mikrofon und Zwei-Wege-Audio.",
    price: 149,
    oldPrice: 179,
    rating: 4.8,
    reviewsCount: 840,
    image: "dome",
    features: ["2K Quad HD Auflösung", "Zwei-Wege-Audio & Mikro", "IK10 Vandalenschutz", "WLAN & PoE fähig", "KI-Haustiererkennung"],
    isBestseller: true,
    discount: "-17%",
    inStock: true,
    colors: ["Polar Weiß", "Carbon Schwarz"],
    specs: {
      resolution: "2560 x 1440 (4 Megapixel)",
      viewAngle: "115° Horizontal",
      nightVision: "Infrarot-Nachtsicht bis 20m",
      storage: "MicroSD (bis 512GB) / Cloud",
      power: "PoE (802.3af) oder 12V Netzteil"
    }
  },
  {
    id: "ptz-orbit-ultra",
    name: "PTZ Orbit Ultra 360°",
    category: "IP-Kameras",
    description: "Schwenk-, Neig- und zoombare High-End Überwachungskamera mit 20-fachem optischen Zoom und automatischem Smart-AI-Tracking von Personen und Fahrzeugen.",
    price: 299,
    oldPrice: 349,
    rating: 4.92,
    reviewsCount: 512,
    image: "ptz",
    features: ["20x Optischer Zoom", "360° Schwenkbar", "KI-Auto-Tracking", "100m Laser-Nachtsicht", "Laser-Autofokus"],
    isBestseller: true,
    discount: "-14%",
    inStock: true,
    colors: ["Space Grau"],
    specs: {
      resolution: "3840 x 2160 (8 Megapixel)",
      viewAngle: "360° Schwenkbar, 90° Neigbar",
      nightVision: "Smart-IR & Laser bis 100m",
      storage: "NVR Recorder / MicroSD",
      power: "PoE+ (802.3at) / 24V"
    }
  },
  {
    id: "set-poe-pro-4x",
    name: "PoE Komplettsystem Pro",
    category: "IP-Kameras",
    description: "All-Inclusive-Sicherheitsset für maximale Unabhängigkeit. Enthält einen 8-Kanal Netzwerkrekorder mit 2TB Speicher und 4x 4K Bullet Kameras.",
    price: 699,
    oldPrice: 849,
    rating: 4.95,
    reviewsCount: 388,
    image: "set",
    features: ["8-Kanal NVR Recorder", "2TB Seagate HDD vorinstalliert", "4x 4K Bullet Kameras", "Echte Plug & Play PoE", "Keine versteckten Gebühren"],
    isBestseller: true,
    discount: "-18%",
    inStock: true,
    colors: ["Polar Weiß"],
    specs: {
      resolution: "4x 4K Ultra-HD (8MP)",
      viewAngle: "Je Kamera 105°",
      nightVision: "Farb-Nachtsicht bis 30m",
      storage: "2TB HDD vorinstalliert (erweiterbar)",
      power: "Zentral über NVR (PoE)"
    }
  },
  {
    id: "smart-lock-pro",
    name: "V-Lock Pro Smart Doorlock",
    category: "Smart-Home",
    description: "Intelligentes, batteriebetriebenes Türschloss mit präzisem Fingerabdruck-Sensor, Tastencode-Eingabe und verschlüsselter App-Steuerung.",
    price: 249,
    oldPrice: 299,
    rating: 4.88,
    reviewsCount: 310,
    image: "smarthome",
    features: ["Biometrischer Fingerabdruck", "PIN & App-Steuerung", "Automatische Verriegelung", "Temporäre Gäste-Freigaben", "Keine Verkabelung nötig"],
    isBestseller: true,
    discount: "-17%",
    inStock: true,
    colors: ["Carbon Schwarz", "Space Grau"],
    specs: {
      resolution: "Zertifiziert nach DIN EN 15684",
      viewAngle: "AES-256 Militärstandard",
      nightVision: "Fingerabdruck / PIN / App",
      storage: "Laufzeit bis zu 10 Monate (Li-Ion)",
      power: "Batteriebetrieb (USB-C Ladeanschluss)"
    }
  },
  {
    id: "smart-alarm-kit",
    name: "V-Alert Smart Alarm Starter Kit",
    category: "Smart-Home",
    description: "Komplettes, smartes Alarmanlagen-Set inklusive Zentrale, 3x Tür- & Fenstersensoren, Bewegungsmelder und Fernbedienung.",
    price: 349,
    oldPrice: 399,
    rating: 4.85,
    reviewsCount: 224,
    image: "smarthome",
    features: ["Lautstarke Alarmsirene", "3x Tür/Fenstersensoren", "Echtzeit-Push-Meldungen", "Komplett manipulationssicher", "Akku-Notstromversorgung"],
    isBestseller: false,
    discount: "-12%",
    inStock: true,
    colors: ["Polar Weiß"],
    specs: {
      resolution: "868 MHz Funkfrequenz",
      viewAngle: "Bis zu 100m Reichweite",
      nightVision: "Integrierte Backup-Zelle (24h)",
      storage: "GSM- & LAN-Verbindung",
      power: "230V Netzteil + Notfall-Akku"
    }
  },
  {
    id: "pc-server-board",
    name: "Pro-Server Mainboard Dual-10GbE",
    category: "PC-Hardware",
    description: "High-End Workstation & Server Mainboard mit Dual 10GbE Netzwerkports, PCIe 5.0 und ECC-Speicher-Unterstützung.",
    price: 489,
    oldPrice: 549,
    rating: 4.93,
    reviewsCount: 128,
    image: "netzwerk",
    features: ["Dual 10GBase-T LAN", "ECC DDR5 Support", "PCIe 5.0 x16 Slots", "24/7 Dauerbetrieb zertifiziert", "IPMI Remote Management"],
    isBestseller: true,
    discount: "-11%",
    inStock: true,
    colors: ["Carbon Schwarz"],
    specs: {
      resolution: "Intel / AMD Workstation Chipset",
      viewAngle: "Dual 10G LAN Controller",
      nightVision: "4x M.2 NVMe PCIe 4.0/5.0",
      storage: "Bis zu 256GB ECC DDR5",
      power: "ATX 24-Pin + 8-Pin EPS"
    }
  },
  {
    id: "pc-workstation-threadripper",
    name: "IT-MARKET Custom Workstation Pro",
    category: "PC-Hardware",
    description: "Vorassemblierte High-End Workstation für Rendering, CAD, KI-Berechnungen und Datenverarbeitung mit 32-Core Performance.",
    price: 2499,
    oldPrice: 2799,
    rating: 4.98,
    reviewsCount: 84,
    image: "netzwerk",
    features: ["AMD Threadripper 7000 / Intel Xeon W", "64GB ECC DDR5 RAM", "2TB NVMe PCIe 5.0 SSD", "NVIDIA RTX Professional GPU", "Wassergekühltes Silent Chassis"],
    isBestseller: true,
    discount: "-11%",
    inStock: true,
    colors: ["Mattschwarz"],
    specs: {
      resolution: "32 Cores / 64 Threads",
      viewAngle: "NVIDIA RTX 4080 / Ada Lovelace",
      nightVision: "Silent Liquid Cooling 360mm",
      storage: "2TB M.2 PCIe 5.0 SSD (7500 MB/s)",
      power: "1000W 80+ Titanium Netzteil"
    }
  },
  {
    id: "pc-server-ram-64gb",
    name: "Enterprise ECC DDR5 64GB Server Kit",
    category: "PC-Hardware",
    description: "Server-zertifiziertes Registriertes ECC RAM-Kit (2x 32GB) für höchste Stabilität in Servern und Workstations.",
    price: 329,
    oldPrice: 379,
    rating: 4.91,
    reviewsCount: 95,
    image: "netzwerk",
    features: ["64GB (2x32GB) DDR5-5600", "Reg. ECC Fehlerkorrektur", "JEDEC Standard konform", "Ultra-niedrige Ausfallrate", "Lebenslange Herstellergarantie"],
    isBestseller: false,
    discount: "-13%",
    inStock: true,
    colors: ["Silber Heatspreader"],
    specs: {
      resolution: "DDR5-5600MHz Registered ECC",
      viewAngle: "CL46 / 1.1V Betriebsspannung",
      nightVision: "Aluminium Kühlkörper",
      storage: "Optimiert für Intel Xeon / AMD EPYC",
      power: "Geringer Stromverbrauch"
    }
  },
  {
    id: "nas-vault-2bay",
    name: "V-Vault Home NAS 2-Bay (4TB)",
    category: "NAS-Systeme",
    description: "Zentraler Netzwerkspeicher mit vorinstallierter 4TB Seagate IronWolf Festplatte für automatische Kamera-Backups und private Cloud.",
    price: 399,
    oldPrice: 479,
    rating: 4.91,
    reviewsCount: 412,
    image: "nas",
    features: ["4TB Speicherplatz enthalten", "Ausfallsichere Spiegelung (RAID 1)", "Echtzeit-Backup der Kameras", "Sicherer Fernzugriff ohne Cloud", "Ultra-leiser Lüfterbetrieb"],
    isBestseller: true,
    discount: "-16%",
    inStock: true,
    colors: ["Carbon Schwarz"],
    specs: {
      resolution: "4TB Seagate IronWolf (SATA 6Gb/s)",
      viewAngle: "RAID 0 / 1 / Single JBOD",
      nightVision: "Gigabit Ethernet RJ45",
      storage: "Dual-Core 2.0 GHz, 2GB RAM",
      power: "Zentrales Netzteil (36W)"
    }
  },
  {
    id: "nas-vault-pro-4bay",
    name: "V-Vault Pro Enterprise NAS (12TB)",
    category: "NAS-Systeme",
    description: "Hochleistungs-Netzwerkspeicher (4-Bay) mit 12TB Speicherplatz. Optimiert für kontinuierliche 24/7-Aufzeichnungen von Großobjekten.",
    price: 799,
    oldPrice: 949,
    rating: 4.97,
    reviewsCount: 164,
    image: "nas",
    features: ["12TB Enterprise Speicher", "Prozessor mit Hardware-Verschlüsselung", "Duale 2.5GbE LAN-Anschlüsse", "Unterstützt bis zu 32 Kameras", "Erweiterbar auf bis zu 40TB"],
    isBestseller: false,
    discount: "-15%",
    inStock: true,
    colors: ["Carbon Schwarz"],
    specs: {
      resolution: "12TB Enterprise Festplatten",
      viewAngle: "RAID 0/1/5/10 Unterstützung",
      nightVision: "2x 2.5 Gigabit Ethernet",
      storage: "Quad-Core 2.4 GHz, 8GB DDR4 RAM",
      power: "Zentrales Netzteil (90W)"
    }
  },
  {
    id: "switch-poe-8p",
    name: "V-Switch PoE+ 8-Port Gigabit",
    category: "Netzwerke",
    description: "Professioneller, lüfterloser Gigabit PoE-Switch mit 8 Ports für die stabile Strom- und Hochgeschwindigkeitsdatenversorgung von IP-Kameras.",
    price: 119,
    oldPrice: 139,
    rating: 4.9,
    reviewsCount: 618,
    image: "netzwerk",
    features: ["8x Gigabit RJ45 PoE+ Ports", "120W Gesamt-PoE-Budget", "Robustes Metallgehäuse", "Geräuschloses, lüfterloses Design", "Einfache Plug & Play Montage"],
    isBestseller: true,
    discount: "-14%",
    inStock: true,
    colors: ["Carbon Schwarz", "Space Grau"],
    specs: {
      resolution: "8x 10/100/1000 Mbps Ports",
      viewAngle: "120 Watt max. Belastung",
      nightVision: "Lüfterloses Metall-Chassis",
      storage: "16 Gbps Switching Kapazität",
      power: "Internes Netzteil (100-240V AC)"
    }
  },
  {
    id: "router-mesh-pro",
    name: "V-Route Mesh Pro Access Point",
    category: "Netzwerke",
    description: "High-Performance Wi-Fi 6 Mesh Access Point für lückenlosen und sicheren Empfang im gesamten Haus und im Außenbereich.",
    price: 159,
    oldPrice: 199,
    rating: 4.87,
    reviewsCount: 345,
    image: "netzwerk",
    features: ["Moderne Wi-Fi 6 Technologie", "Ausfallsicheres Mesh-Netzwerk", "Strenger WPA3 Sicherheitsstandard", "Direkt PoE-fähig (802.3af)", "Wetterfestes Gehäuse (IP65)"],
    isBestseller: false,
    discount: "-20%",
    inStock: true,
    colors: ["Polar Weiß"],
    specs: {
      resolution: "Wi-Fi 6 (802.11ax) Dual-Band",
      viewAngle: "Bis zu 3000 Mbps Bandbreite",
      nightVision: "WPA2 / WPA3-Personal",
      storage: "Unterstützt 150+ Endgeräte",
      power: "PoE (802.3af) oder Netzteil"
    }
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Dr. Thomas Weber",
    role: "Gewerbekunde (Zahnarztpraxis)",
    rating: 5,
    comment: "Wir haben unsere Praxis mit Kameras, Switches und NAS-Systemen von Bewacht & Vernetzt ausgestattet. Die Beratung war hervorragend, die Installation lief reibungslos. Unsere Aufzeichnungen liegen absolut DSGVO-konform verschlüsselt auf unserem eigenen Server.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    date: "14. Mai 2026"
  },
  {
    id: "rev-2",
    name: "Marc & Julia S.",
    role: "Privatanwender (Smart Home)",
    rating: 5,
    comment: "Haben uns das Smart Home Alarmanlagen-Kit und zwei Außenkameras bestellt. Die Integration der Alarmsensoren mit den Kameras klappt super. Keine monatlichen Abogebühren und hervorragender deutscher Kundenservice!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    date: "2. Juni 2026"
  },
  {
    id: "rev-3",
    name: "Alexander Fischer",
    role: "Zertifizierter Elektroinstallateur",
    rating: 5,
    comment: "Als Netzwerk- und Elektroinstallateur verbaue ich die Komponenten von Bewacht & Vernetzt extrem gerne. Die PoE-Switches sind extrem robust, die NAS-Systeme harmonieren perfekt mit den Kameras, und die Kunden lieben das schlichte Design und die einfache Anfragefunktion.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
    date: "18. April 2026"
  }
];

export const APPLICATION_AREAS: ApplicationArea[] = [
  {
    id: "haus",
    title: "Einfamilienhaus",
    description: "Sichern Sie Eingänge, Garten und Einfahrten. Verbinden Sie Kameras, Alarmsensoren und Türschlösser zu einem lückenlosen Schutzsystem.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
    tip: "Empfehlung: Pro Bullet 4K Außenkameras, V-Lock Türschloss und V-Alert Alarmanlage."
  },
  {
    id: "mfh",
    title: "Mehrfamilienhaus",
    description: "Überwachung von Gemeinschaftsbereichen wie Fluren, Kellern und Tiefgaragen. Lokale Datenspeicherung auf ausfallsicheren NAS-Systemen.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop",
    tip: "Empfehlung: Vandalensichere Dome Kameras im Flur und ein 2-Bay NAS im Technikraum."
  },
  {
    id: "buero",
    title: "Gewerbe & Büro",
    description: "Zuverlässige Überwachung sensibler Bereiche, stabiles Firmennetzwerk durch PoE-Switches und sichere Datenspeicherung für Ihr Business.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
    tip: "Empfehlung: PTZ-Kameras mit KI-Tracking, ein 4-Bay Enterprise NAS und PoE-Gigabit Switches."
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Wie erhalte ich mein Angebot?",
    answer: "Ganz unkompliziert: Fügen Sie Ihre Wunschkomponenten einfach dem Warenkorb hinzu und klicken Sie auf 'Unverbindliche Anfrage senden'. Unser Experten-Team kalkuliert Ihr persönliches Angebot (inklusive Rabatten bei größeren Mengen) und sendet Ihnen dieses innerhalb von 24 Stunden per E-Mail zu."
  },
  {
    id: "faq-2",
    question: "Sind die Kameras und Smart-Home-Produkte miteinander kompatibel?",
    answer: "Ja. Alle unsere angebotenen Komponenten sind perfekt aufeinander abgestimmt. Sie können Kameras, Alarmsensoren und NAS-Rekorder in einer einzigen App steuern und automatisieren."
  },
  {
    id: "faq-3",
    question: "Was genau bedeutet PoE (Power over Ethernet)?",
    answer: "PoE ist eine Technologie, bei der Netzwerkgeräte direkt über das LAN-Kabel mit Strom versorgt werden. Sie benötigen an der Kamera keine separate Steckdose mehr. Die Stromversorgung erfolgt zentral über einen PoE-Switch oder direkt über den Netzwerk-Videorekorder (NVR)."
  },
  {
    id: "faq-4",
    question: "Wie funktioniert die Aufzeichnung meiner Daten?",
    answer: "Wir setzen auf maximale Datensouveränität: Alle Aufzeichnungen werden lokal und abogebührenfrei auf Ihrem eigenen NAS-System gespeichert. Keine Zwangs-Cloud im Ausland, kein unbefugter Zugriff von außen."
  },
  {
    id: "faq-5",
    question: "Kommen zusätzliche Lizenz- oder Abogebühren auf mich zu?",
    answer: "Nein, bei uns gibt es keine Abonnements oder monatliche Lizenzgebühren. Sie kaufen die Hardware einmalig und besitzen die volle Kontrolle über Ihre gesamte Sicherheits- und Netzwerkinfrastruktur."
  }
];

export const BRANDS: string[] = [
  "Ubiquiti",
  "Synology",
  "Reolink",
  "TP-Link",
  "Hikvision",
  "Dahua",
  "Axis",
  "QNAP"
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "4K IP-Kamera vs. HD: Welches Überwachungssystem passt zu Ihrem Objekt?",
    slug: "4k-ip-kamera-vs-hd-vergleich",
    excerpt: "Sollten Sie noch auf 1080p Full HD setzen oder direkt auf 4K Ultra-HD aufrüsten? Wir vergleichen Auflösung, Bandbreitenbedarf und Speicherplatz.",
    content: `Die Wahl der richtigen Kameraauflösung ist entscheidend für den Schutz Ihres Anwesens. Während Full HD (1080p) lange Zeit der Standard war, setzen moderne Sicherheitssysteme zunehmend auf 4K Ultra-HD (8 Megapixel).

### Warum Auflösung bei der Aufklärung den Unterschied macht
Bei Vorfällen reicht es oft nicht aus, lediglich schemenhafte Silhouetten zu sehen. Mit einer 4K IP-Kamera lassen sich Gesichter und Autokennzeichen auch aus mehreren Metern Entfernung gestochen scharf vergrößern.

### Bandbreite und Speicherbedarf im Blick behalten
Dank moderner Komprimierungsstandards wie H.265+ steigt der Speicherbedarf von 4K-Streamings heute nicht mehr drastisch an. Ein lokales NAS-System mit 4TB Speicher reicht in der Regel problemlos für 4x 4K-Kameras bei kontinuierlicher 24/7-Aufzeichnung über mehrere Wochen.

### Fazit
Für gewerbliche Objekte und Haupteingänge empfehlen wir konsequent 4K. Für untergeordnete Nebenbereiche wie Kellerflure kann eine 2K oder Full HD Kamera weiterhin ausreichend sein.`,
    category: "Technik-Guides",
    author: "Andreas Rettenegger (Technik & Sales)",
    date: "18. Juli 2026",
    readTime: "5 min Lesezeit",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
    tags: ["4K Überwachung", "IP-Kameras", "Speicherplatz", "Guide"],
    isPublished: true,
    featured: true
  },
  {
    id: "blog-2",
    title: "Rechtliche Grundlagen der Videoüberwachung auf Privatgrundstücken 2026",
    slug: "rechtliche-grundlagen-videoueberwachung-privat",
    excerpt: "Darf Ihre Kamera den Gehweg filmen? Welche Hinweisschilder sind gesetzlich vorgeschrieben? Die wichtigsten Regeln kompakt erklärt.",
    content: `Bei der Installation von Sicherheitskameras müssen streng rechtliche Vorgaben und DSGVO-Regeln beachtet werden, um Bußgelder und Nachbarschaftskonflikte zu vermeiden.

### Das Prinzip der Grundstücksgrenze
Als Grundregel gilt: Sie dürfen ausschließlich Ihr eigenes privates Grundstück erfassen. Öffentliche Gehwege, Nachbargrundstücke oder öffentliche Parkplätze dürfen nicht von den Linsen erfasst werden.

### Ausblendung mit Privatzonen-Maskierung
Moderne IP-Kameras verfügen über eine Software-Funktion zur Privatzonen-Maskierung. Schwärzen Sie sensible Ausblicke auf Nachbargrundstücke direkt im Kamerabild ab.

### Kennzeichnungspflicht
Ein gut sichtbares Hinweisschild am Eingangsbereich mit Angaben zum Verantwortlichen und zum Zweck der Überwachung ist rechtlich verpflichtend.`,
    category: "Rechtliches",
    author: "RA Dr. Stefan Meyer",
    date: "10. Juli 2026",
    readTime: "4 min Lesezeit",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
    tags: ["DSGVO", "Recht", "Datenschutz", "Hinweisschild"],
    isPublished: true,
    featured: true
  },
  {
    id: "blog-3",
    title: "Cybersecurity für Smart-Home-Kameras: So sichern Sie Ihr Netz ab",
    slug: "cybersecurity-smart-home-kameras-schutz",
    excerpt: "So verhindern Sie unbefugte Zugriffe aus dem Internet. Warum VPN und VLANs besser sind als einfache Portweiterleitungen.",
    content: `Sicherheitskameras sollen Ihr Haus schützen – dürfen aber selbst keine Schwachstelle im Heimnetzwerk darstellen.

### 1. Separieren Sie Kameras in einem eigenen VLAN
Richten Sie für Ihre Sicherheitskomponenten ein separates virtuelles Netzwerk (VLAN) ein. Sollte ein smartes Gerät gehackt werden, bleibt Ihr Hauptnetzwerk mit Laptops und Finanzdaten isoliert.

### 2. Vermeiden Sie Portweiterleitungen
Nutzen Sie statt klassischer Portweiterleitung lieber WireGuard oder OpenVPN für den Fernzugriff. So gelangen nur authentifizierte Geräte sicher auf Ihren NVR.

### 3. Starke Passwörter & 2FA
Ändern Sie Standardpasswörter sofort nach der Erstinbetriebnahme und aktivieren Sie überall Zwei-Faktor-Authentifizierung.`,
    category: "Sicherheitstipps",
    author: "Alexander Koch (Netzwerk-Architekt)",
    date: "02. Juli 2026",
    readTime: "6 min Lesezeit",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
    tags: ["Netzwerk", "VLAN", "Cybersecurity", "VPN"],
    isPublished: true,
    featured: false
  }
];

export const DEFAULT_CONFIGURATOR_DATA: ConfiguratorData = {
  baseBoardPrice: 349,
  netzwerkeBannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920",
  hotspotBannerImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1920",
  nasBannerImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=1920",
  camerasBannerImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920",
  hardwareBannerImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1920",
  smartHomeBannerImage: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
  smartHomeBannerVideo: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4",
  chassisOptions: [
    { id: "chassis-tower", name: "Silent Tower Workstation", price: 129, spec: "Gedämmtes Chassis, 3x BeQuiet Lüfter" },
    { id: "chassis-compact", name: "Compact Micro-Workstation", price: 99, spec: "Kompaktgehäuse für begrenzte Stellfläche" },
    { id: "chassis-rack", name: "Enterprise 2U Server Rackmount", price: 249, spec: "19-Zoll Servergehäuse, Hot-Swap Drive Bays", recommended: true },
  ],
  cpuOptions: [
    { id: "cpu-i9", name: "Intel Core i9-14900K (24 Cores)", price: 589, spec: "3.2 - 6.0 GHz, 36MB Cache" },
    { id: "cpu-ryzen", name: "AMD Ryzen 9 7950X (16 Cores)", price: 549, spec: "4.5 - 5.7 GHz, 80MB Cache" },
    { id: "cpu-xeon", name: "Intel Xeon W7-2475X (20 Cores)", price: 1199, spec: "ECC Support, 45MB Cache", recommended: true },
    { id: "cpu-threadripper", name: "AMD Threadripper 7960X (24 Cores)", price: 1499, spec: "ECC Support, 128MB Cache" },
  ],
  ramOptions: [
    { id: "ram-32gb", name: "32GB DDR5-5600 Dual-Kit", price: 139, spec: "2x 16GB High-Speed Non-ECC" },
    { id: "ram-64gb", name: "64GB DDR5-5600 Dual-Kit", price: 269, spec: "2x 32GB High-Speed Non-ECC", recommended: true },
    { id: "ram-128gb-ecc", name: "128GB Registered ECC DDR5", price: 599, spec: "4x 32GB Server ECC Fehlerkorrektur" },
  ],
  gpuOptions: [
    { id: "gpu-none", name: "Onboard iGPU / Keine dedizierte GPU", price: 0, spec: "Für reine Server- & NAS-Aufgaben" },
    { id: "gpu-4070", name: "NVIDIA RTX 4070 Super 12GB", price: 649, spec: "DLSS 3, CAD & KI-Beschleunigung", recommended: true },
    { id: "gpu-4080", name: "NVIDIA RTX 4080 Super 16GB", price: 1049, spec: "High-End Rendering & Deep Learning" },
    { id: "gpu-ada", name: "NVIDIA RTX 6000 Ada 48GB", price: 4299, spec: "Enterprise Professional AI Workstation" },
  ],
  ssdOptions: [
    { id: "ssd-1tb", name: "1TB M.2 NVMe PCIe 4.0 SSD", price: 89, spec: "Lesen: 5.000 MB/s" },
    { id: "ssd-2tb", name: "2TB M.2 NVMe PCIe 5.0 SSD Pro", price: 189, spec: "Lesen: 7.500 MB/s", recommended: true },
    { id: "ssd-raid", name: "4TB Dual M.2 Enterprise RAID 1", price: 449, spec: "Spiegelung für höchste Datensicherheit" },
  ],
  networkOptions: [
    { id: "net-standard", name: "Dual 2.5GbE LAN Onboard", price: 0, spec: "2x 2.5G RJ45 Anschlüsse" },
    { id: "net-10g", name: "Dual 10GBase-T 10GbE Netzwerkarte", price: 179, spec: "2x 10G RJ45 High-Speed Port", recommended: true },
    { id: "net-sfp", name: "Dual 10G SFP+ Fiber Optical Controller", price: 199, spec: "2x SFP+ Glasfaser Modul Slots" },
  ],
  serviceOptions: [
    { id: "srv-std", name: "Standard Assemblierung & 24h Stresstest", price: 0, spec: "Komplettmontage & Funktionstest" },
    { id: "srv-express", name: "Pro Assemblierung & OS-Vorinstallation", price: 69, spec: "Inkl. Windows Pro / Linux & Treibern", recommended: true },
    { id: "srv-vip", name: "VIP Paket: 3 Jahre Vor-Ort-Service & 24/7 Hotline", price: 149, spec: "Priorisierter Austausch im Schadensfall" },
  ]
};


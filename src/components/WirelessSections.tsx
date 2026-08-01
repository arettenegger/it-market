import React, { useState } from "react";
import {
  Wifi, Shield, Radio, Antenna, Users, MapPin, CheckCircle2,
  ArrowRight, PhoneCall, Warehouse, FileText, Ticket,
  Signal, Activity, Check, HelpCircle, ChevronDown, ChevronUp, Sliders, Wrench
} from "lucide-react";

interface WirelessSectionsProps {
  onOpenCallback: (msg?: string) => void;
}

export default function WirelessSections({ onOpenCallback }: WirelessSectionsProps) {
  // Interactive wireless advisor state
  const [useCase, setUseCase] = useState<"hospitality" | "outdoor" | "warehouse" | "ptp">("hospitality");
  const [scale, setScale] = useState<number>(50);
  const [isOutdoor, setIsOutdoor] = useState<boolean>(false);
  const [needsGuestPortal, setNeedsGuestPortal] = useState<boolean>(true);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const getRecommendation = () => {
    switch (useCase) {
      case "hospitality":
        return {
          title: "Gäste-WLAN für Hotel, Gastronomie & Praxis",
          apRec: `${Math.max(1, Math.ceil(scale / 25))}x Wi-Fi 6 Indoor Access Points (Decken-/Wandmontage)`,
          gatewayRec: "Hotspot-Gateway mit Captive Portal & Voucher-System",
          coverageRec: needsGuestPortal ? "DSGVO-konforme Gästeanmeldung mit Nutzungsbedingungen" : "Offenes WLAN mit Bandbreiten-Drosselung",
          scopeRec: "Getrennte VLANs für Gast- und Firmennetz",
          estimatedSetupTime: "1-2 Werktage"
        };
      case "outdoor":
        return {
          title: "Outdoor-WLAN für Freizeitpark, Event & öffentliche Plätze",
          apRec: `${Math.max(2, Math.ceil(scale / 20))}x wetterfeste IP67 Outdoor Access Points`,
          gatewayRec: "Zentraler Controller für hohe Nutzerdichte (High-Density)",
          coverageRec: "Großflächige Funkausleuchtung mit Überlappungsplanung",
          scopeRec: "PoE-Versorgung & UV-beständige Außenverkabelung",
          estimatedSetupTime: "2-4 Werktage"
        };
      case "warehouse":
        return {
          title: "Industrie-WLAN für Lagerhalle & Produktion",
          apRec: `${Math.max(2, Math.ceil(scale / 18))}x Industrie Access Points (Hochregal-tauglich)`,
          gatewayRec: "Robuster Controller mit Fast-Roaming für Scanner & MDE-Geräte",
          coverageRec: "Lückenlose Abdeckung zwischen Hochregalen & Metallflächen",
          scopeRec: "Staub-/feuchtigkeitsgeschützte Geräte (IP-Schutzklasse)",
          estimatedSetupTime: "2-4 Werktage"
        };
      case "ptp":
        return {
          title: "Richtfunk & Standortvernetzung (Point-to-Point)",
          apRec: "2x 5 GHz Richtfunk-Antennen (Point-to-Point-Brücke)",
          gatewayRec: "Gigabit-Funkbrücke ohne Grabungs- oder Mietleitungskosten",
          coverageRec: `Überbrückt Distanzen bis ca. ${scale >= 50 ? "15" : "5"} km bei Sichtverbindung`,
          scopeRec: "Lizenzfreies 5-GHz-Band, verschlüsselte Verbindung",
          estimatedSetupTime: "1-2 Werktage"
        };
    }
  };

  const currentRec = getRecommendation();

  const wirelessServices = [
    {
      id: "hotspot",
      title: "Gäste-WLAN & Captive Portals",
      icon: Ticket,
      color: "from-blue-500 to-indigo-600",
      image: "/wireless/hotspot.webp",
      description: "DSGVO-konforme Hotspot-Lösungen für Hotels, Gastronomie und Praxen – mit rechtssicherer Gästeanmeldung und eigenem Voucher-System.",
      points: [
        "Integriertes Captive Portal mit Störerhaftungs-Schutz",
        "Voucher- & Ticket-Druck für zeitlich begrenzte Zugänge",
        "Strikte Trennung von Gast- und Firmennetz (VLAN)",
        "Bandbreiten-Drosselung pro Gast gegen Netzüberlastung"
      ]
    },
    {
      id: "outdoor",
      title: "Outdoor-WLAN für Freizeitparks & öffentliche Plätze",
      icon: MapPin,
      color: "from-cyan-500 to-blue-600",
      image: "/wireless/outdoor.webp",
      description: "Großflächige, wetterfeste Funkausleuchtung für Freizeitparks, Campingplätze, Events und öffentliche Bereiche mit hoher Nutzerdichte.",
      points: [
        "Wetterfeste IP67 Access Points für den Dauereinsatz",
        "High-Density-Planung für tausende gleichzeitige Nutzer",
        "Nahtlose Abdeckung großer Flächen ohne Funklöcher",
        "Temporäres Event-WLAN auf Anfrage"
      ]
    },
    {
      id: "warehouse",
      title: "Industrie-WLAN für Lagerhallen & Produktion",
      icon: Warehouse,
      color: "from-amber-500 to-orange-600",
      image: "/wireless/warehouse.webp",
      description: "Robuste WLAN-Infrastruktur für Lager-, Logistik- und Produktionshallen – ausgelegt für Barcode-Scanner, MDE-Geräte und raue Umgebungen.",
      points: [
        "Lückenlose Abdeckung zwischen Hochregalen & Metallflächen",
        "Fast-Roaming für unterbrechungsfreie Scanner-Anbindung",
        "Staub- & feuchtigkeitsgeschützte Industriegeräte",
        "Ausleuchtung nach professioneller Funkvermessung"
      ]
    },
    {
      id: "ptp",
      title: "Richtfunk & Standortvernetzung",
      icon: Antenna,
      color: "from-emerald-500 to-teal-600",
      image: "/wireless/richtfunk.webp",
      description: "Verbinden Sie mehrere Standorte oder Gebäude per Richtfunk – ohne teure Mietleitungen oder Grabungsarbeiten, mit Gigabit-Geschwindigkeit.",
      points: [
        "Point-to-Point-Brücken über 1 bis 15 km Distanz",
        "Lizenzfreies 5-GHz-Band, keine Behördengenehmigung nötig",
        "Gigabit-Durchsatz für Standort-Kopplung & Kamera-Uplinks",
        "Verschlüsselte, störungssichere Funkverbindung"
      ]
    }
  ];

  const projectPhases = [
    {
      step: "01",
      title: "Standort-Analyse & Funkvermessung",
      desc: "Wir begehen Ihr Objekt, prüfen Gebäude, Distanzen und Störquellen und ermitteln per Site Survey den tatsächlichen Bedarf.",
      icon: FileText
    },
    {
      step: "02",
      title: "Planung & Heatmap-Design",
      desc: "Erstellung einer Ausleuchtungs-Heatmap mit exakten Positionen, Sendeleistungen und Kanalplanung für lückenlose Abdeckung.",
      icon: Sliders
    },
    {
      step: "03",
      title: "Installation & Konfiguration",
      desc: "Fachgerechte Montage der Access Points bzw. Richtfunk-Antennen, PoE-Verkabelung und Einrichtung von Portal, VLANs und Controller.",
      icon: Wrench
    },
    {
      step: "04",
      title: "Übergabe, Einweisung & Support",
      desc: "Abschließende Messung, Funktionstest, Einweisung Ihres Teams sowie optionale Fernwartung und laufender Support.",
      icon: CheckCircle2
    }
  ];

  const faqs = [
    {
      q: "Was kostet eine professionelle WLAN-Ausleuchtung?",
      a: "Das hängt von Fläche, Umgebung und Nutzerzahl ab. Nach einer kostenlosen Erstberatung und Funkvermessung (Site Survey) erhalten Sie ein transparentes Festpreis-Angebot inklusive Hardware, Montage und Konfiguration – ohne versteckte Kosten."
    },
    {
      q: "Brauche ich für Richtfunk eine behördliche Genehmigung?",
      a: "Nein. Unsere Richtfunk-Brücken arbeiten im lizenzfreien 5-GHz-Band und benötigen in Österreich keine gesonderte Genehmigung. Voraussetzung ist eine freie Sichtverbindung zwischen den beiden Standorten."
    },
    {
      q: "Wie viele Access Points brauche ich für meine Lagerhalle?",
      a: "Das lässt sich nicht pauschal sagen – Hochregale, Metallflächen und Feuchtigkeit beeinflussen die Funkausbreitung stark. Wir ermitteln die exakte Anzahl durch eine Vor-Ort-Funkvermessung, damit Scanner und MDE-Geräte überall zuverlässig funktionieren."
    },
    {
      q: "Ist ein rechtssicheres Gäste-WLAN in Österreich Pflicht?",
      a: "Wer öffentliches WLAN anbietet, sollte Gäste-Zugriffe rechtssicher trennen und protokollieren. Unsere Hotspot-Gateways bringen ein DSGVO-konformes Captive Portal, konfigurierbare Nutzungsbedingungen und Störerhaftungs-Schutz von Haus aus mit."
    },
    {
      q: "Wie weit reicht eine Richtfunkverbindung?",
      a: "Bei freier Sichtverbindung überbrücken unsere Systeme problemlos 1 bis 15 km mit Gigabit-Durchsatz. Für längere Strecken oder Umgebungen ohne direkte Sicht planen wir Relais-Stationen ein."
    }
  ];

  return (
    <div className="space-y-16 py-6">

      {/* SECTION 2: DIE 4 KERNBEREICHE */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Umfassendes Leistungsspektrum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Unsere Wireless-Lösungen im Überblick
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Von der rechtssicheren Gästeanmeldung bis zur kilometerweiten Standortvernetzung – abgestimmte Hardware führender Markenhersteller.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wirelessServices.map((srv) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Bild-Header */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy" decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/90 text-slate-700 shadow-sm">
                    Profi-Standard
                  </span>
                  <div className={`absolute -bottom-5 left-5 w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color} flex items-center justify-center text-white shadow-lg ring-4 ring-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-6 pt-8 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                      {srv.title}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                      {srv.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {srv.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onOpenCallback(`Anfrage bezüglich Wireless-Bereich: ${srv.title}`)}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Beratung anfragen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HERSTELLER / MARKEN-PARTNER (herstellerunabhängig je nach Szenario) */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Hersteller & Marken
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Bewährte Hardware – passend zu Ihrem Anwendungsfall
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Wir sind herstellerunabhängig und wählen je nach Szenario, Anforderung und Budget die passende Marke – von der Arztpraxis bis zum Freizeitpark.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "UniFi", logo: "/wireless/logos/ubiquiti.svg", color: "#0559C9", accent: "text-blue-700", desc: "Zentral verwaltbare WLAN- & Netzwerk-Ökosysteme mit moderner Oberfläche – ideal für Hotels, Gastronomie und Mehrstandort-Betrieb." },
            { name: "MikroTik", logo: "/wireless/logos/mikrotik.svg", color: "#B91C1C", accent: "text-red-700", desc: "Leistungsstarke Router- und Funktechnik mit granularer Konfiguration – besonders stark bei Richtfunk und individuellen Szenarien." },
            { name: "TP-Link", logo: "/wireless/logos/tplink.svg", color: "#0E7490", accent: "text-cyan-700", desc: "Zuverlässige Access Points & Switches (Omada) mit starkem Preis-Leistungs-Verhältnis – ideal für KMU und Standardinstallationen." },
          ].map((b) => (
            <div
              key={b.name}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <div className="h-14 flex items-center justify-center mb-3">
                <img
                  src={b.logo}
                  alt={`${b.name} Logo`}
                  className="h-12 w-auto max-w-[3.5rem] object-contain"
                  loading="lazy" decoding="async"
                />
              </div>
              <div className={`text-lg font-black font-display tracking-tight ${b.accent}`}>
                {b.name}
              </div>
              <div className="h-1 w-10 rounded-full my-3" style={{ backgroundColor: b.color }}></div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WARUM IT-MARKET (Service-Werte, direkt unter den Lösungen) */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-red-600 uppercase tracking-widest">
            Dienstleistung & Service
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Warum IT-MARKET für Hotspot & Wireless-Lösungen?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Wir liefern nicht nur einzelne Kartons, sondern durchdachte Gesamtlösungen inklusive Vorinstallation und technischem Support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Kostenlose Funkvermessung", desc: "Wir leuchten Ihr Objekt vor Ort aus (Site Survey) und planen die exakten Positionen der Access Points für lückenlose Abdeckung – ganz ohne Funklöcher.", icon: Signal },
            { title: "Vorkonfiguration & Montage", desc: "Alle Geräte kommen fertig eingerichtet und werden fachgerecht montiert – schlüsselfertig aus einer Hand, ohne Aufwand für Sie.", icon: Wrench },
            { title: "Support & Wartung", desc: "Wir bleiben Ihr Ansprechpartner: Fernwartung, Sicherheitsupdates und schnelle Hilfe bei Störungen – auch nach der Installation.", icon: Shield },
          ].map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold font-display text-slate-900 text-lg mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 1 (verschoben): HEADER & KEY METRICS BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-4">
            <Signal className="w-3.5 h-3.5 text-blue-400" />
            <span>Professionelle WLAN- & Funklösungen nach IT-MARKET Standard</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
            WLAN-Ausleuchtung, Outdoor-Funk & Richtfunk für jede Umgebung
          </h2>

          <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Ob Gäste-WLAN im Hotel, großflächige Funkabdeckung im Freizeitpark, robustes Industrie-WLAN in der Lagerhalle oder Standortvernetzung per Richtfunk – wir planen, installieren und betreuen Ihre drahtlose Infrastruktur aus einer Hand.
          </p>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-cyan-400 font-mono">Wi-Fi 6/7</span>
              <span className="text-[11px] text-slate-400 font-medium">High-Density Access Points</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-blue-400 font-mono">IP67</span>
              <span className="text-[11px] text-slate-400 font-medium">Wetterfeste Outdoor-Technik</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-emerald-400 font-mono">bis 15 km</span>
              <span className="text-[11px] text-slate-400 font-medium">Richtfunk-Reichweite</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-amber-400 font-mono">DSGVO</span>
              <span className="text-[11px] text-slate-400 font-medium">Rechtssicheres Gäste-WLAN</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: INTERAKTIVER WIRELESS-BERATER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Interaktiver Wireless-Berater
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            Finden Sie die passende Funklösung
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Wählen Sie Ihren Anwendungsbereich und erhalten Sie eine Sofort-Empfehlung für Ihre drahtlose Infrastruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">1. Einsatzbereich auswählen:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "hospitality", label: "Hotel & Gastronomie" },
                  { id: "outdoor", label: "Freizeitpark & Event" },
                  { id: "warehouse", label: "Lagerhalle & Industrie" },
                  { id: "ptp", label: "Richtfunk / Standorte" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setUseCase(item.id as any)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                      useCase === item.id
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{useCase === "ptp" ? "2. Distanz zwischen den Standorten:" : "2. Gleichzeitige Nutzer / Größe:"}</span>
                <span className="text-cyan-400 font-mono font-extrabold">
                  {useCase === "ptp" ? `${scale >= 50 ? "bis 15" : "bis 5"} km` : `${scale} Nutzer`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOutdoor}
                  onChange={(e) => setIsOutdoor(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Außenbereich / wetterfeste Montage nötig</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsGuestPortal}
                  onChange={(e) => setNeedsGuestPortal(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Rechtssicheres Gäste-Portal (DSGVO)</span>
              </label>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                Empfohlene Lösung
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-extrabold">
                Ca. {currentRec.estimatedSetupTime} Installation
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white">
              {currentRec.title}{isOutdoor && useCase !== "outdoor" && useCase !== "ptp" ? " (Outdoor-Variante)" : ""}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Access Points / Antennen:</span>
                <span className="text-white font-bold">{currentRec.apRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Gateway / Controller:</span>
                <span className="text-white font-bold">{currentRec.gatewayRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Abdeckung & Portal:</span>
                <span className="text-white font-bold">{currentRec.coverageRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Umfang & Technik:</span>
                <span className="text-white font-bold">{currentRec.scopeRec}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenCallback(`Kostenfreie Erstberatung für Wireless-Lösung: ${currentRec.title}`)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Angebot für diese Lösung anfordern</span>
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 4: DAS 4-PHASEN PROJEKT-MODELL */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Ablauf & Qualitätssicherung
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Der IT-MARKET Weg zur perfekten Funkabdeckung
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            In 4 strukturierten Schritten von der ersten Vermessung bis zur schlüsselfertigen Übergabe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {projectPhases.map((phase) => {
            const IconComp = phase.icon;
            return (
              <div
                key={phase.step}
                className="bg-white border border-slate-200 rounded-2xl p-5 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-blue-600">
                      {phase.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm mb-2">
                    {phase.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: HÄUFIGE FRAGEN & FAQS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Wissen & Fachfragen
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Häufige Fragen zu WLAN & Richtfunk
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: BOTTOM CALL TO ACTION BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
            Planen Sie eine WLAN-Lösung oder Standortvernetzung?
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Sprechen Sie direkt mit unseren Funk-Spezialisten. Wir erstellen Ihnen ein maßgeschneidertes Angebot inklusive kostenloser Funkvermessung und Ausleuchtungsplanung.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenCallback("Kostenfreie Wireless-Erstberatung & Funkvermessung")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Kostenfreie Erstberatung anfordern</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

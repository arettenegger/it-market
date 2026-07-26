import React, { useState } from "react";
import { 
  Server, Wifi, Shield, Layers, Zap, CheckCircle2, 
  ArrowRight, PhoneCall, Cpu, Wrench, RefreshCw, FileText, 
  Lock, Globe, Activity, Check, HelpCircle, ChevronDown, ChevronUp, Sliders
} from "lucide-react";

interface NetworkSectionsProps {
  onOpenCallback: (msg?: string) => void;
}

export default function NetworkSections({ onOpenCallback }: NetworkSectionsProps) {
  // Calculator state for interactive network estimation
  const [useCase, setUseCase] = useState<"office_small" | "office_large" | "industrial" | "hospitality">("office_small");
  const [deviceCount, setDeviceCount] = useState<number>(20);
  const [needsPoE, setNeedsPoE] = useState<boolean>(true);
  const [needsFiber, setNeedsFiber] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  // Recommendations calculated dynamically
  const getRecommendation = () => {
    switch (useCase) {
      case "office_small":
        return {
          title: "KMU & Praxis-Netzwerk (bis 25 Arbeitsplätze)",
          switchRec: "1x 24-Port Gigabit Managed PoE+ Switch (370W)",
          apRec: `${Math.ceil(deviceCount / 10)}x Wi-Fi 6 Enterprise Access Points`,
          firewallRec: "Next-Gen Hardware Firewall mit 1 Gbit/s Deep-Packet-Inspection",
          cablingRec: "Cat.6A S/FTP Duplex Verkabelung",
          estimatedSetupTime: "1-2 Werktage"
        };
      case "office_large":
        return {
          title: "Enterprise Multi-Floor Netzwerkinfrastruktur",
          switchRec: "Core-Switch (10G/25G SFP+) + 2x 48-Port PoE++ Managed Access Switches",
          apRec: `${Math.ceil(deviceCount / 12)}x Wi-Fi 6E/7 Tri-Band Access Points mit Seamless Roaming`,
          firewallRec: "Redundante Cluster-Firewall (Active/Passive Failover)",
          cablingRec: "10G LWL-Glasfaser Backbone + Cat.7 Etagenverkabelung",
          estimatedSetupTime: "3-5 Werktage"
        };
      case "industrial":
        return {
          title: "Industrie, Lagerhalle & Sicherheitstechnik (PoE+ High Load)",
          switchRec: "2x 24-Port Industrial Ruggedized PoE++ Switches (720W Budget für Kameras)",
          apRec: `${Math.ceil(deviceCount / 15)}x Outdoor & High-Ceiling IP67 Access Points`,
          firewallRec: "Industrie-Firewall mit ZTNA & OT-Segmentierung",
          cablingRec: "Armierte LWL-Kabel & UV-beständige Außenverkabelung",
          estimatedSetupTime: "2-4 Werktage"
        };
      case "hospitality":
        return {
          title: "Hotel & Gastronomie mit DSGVO Gäste-WLAN (Hotspot)",
          switchRec: "1x 48-Port Managed PoE Switch + Dedicated Hotspot Gateway",
          apRec: `${Math.ceil(deviceCount / 8)}x Flush-Mount In-Wall & Ceiling Access Points`,
          firewallRec: "Hotspot-Gateway mit Captive Portal & Störerhaftungs-Schutz",
          cablingRec: "Strukturierte Cat.6A Verkabelung pro Zimmer",
          estimatedSetupTime: "2-3 Werktage"
        };
    }
  };

  const currentRec = getRecommendation();

  const networkServices = [
    {
      id: "switches",
      title: "Managed Switches & L2/L3 Routing",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      description: "Hohe Bandbreite, VLAN-Segmentierung & intelligentes PoE-Management für IP-Kameras, VoIP-Telefonie und Datenverkehr.",
      points: [
        "1G, 10G, 25G & 100G Port-Geschwindigkeiten",
        "PoE, PoE+ & PoE++ (bis zu 90W pro Port)",
        "Isolierte VLANs für Gast-, Kamera- & Firmennetz",
        "L2+ / L3 Hardware-Routing & Link Aggregation"
      ]
    },
    {
      id: "wlan",
      title: "WLAN-Ausmessung & Access Points",
      icon: Wifi,
      color: "from-cyan-500 to-blue-600",
      description: "Nahtlose Funkabdeckung ohne Funklöcher durch professionelle Heatmap-Ausmessung (Site Survey) und Wi-Fi 6E / Wi-Fi 7.",
      points: [
        "Pre- & Post-Deployment Ausleuchtungsmessung",
        "802.11r/k/v Fast Roaming für unterbrechungsfreie Telefonate",
        "DSGVO-konformes isoliertes Gäste-WLAN",
        "Central Cloud- or On-Premise Controller Management"
      ]
    },
    {
      id: "security",
      title: "Next-Gen Firewalls & VPN-Tunnel",
      icon: Lock,
      color: "from-emerald-500 to-teal-600",
      description: "Maximaler Schutz vor Cyberangriffen, Malware und unbefugtem Zugriff durch hochmoderne Hardware-Firewalls.",
      points: [
        "Deep Packet Inspection & IPS/IDS Bedrohungsschutz",
        "Verschlüsselte Site-to-Site VPN-Kopplung von Filialen",
        "Sicherer Home-Office ZTNA / IPsec & WireGuard Access",
        "Content-Filter & Web-Application Security"
      ]
    },
    {
      id: "cabling",
      title: "Strukturierte Verkabelung & LWL (Glasfaser)",
      icon: Server,
      color: "from-amber-500 to-orange-600",
      description: "Zukunftssichere Kupfer- (Cat.6A / Cat.7) und Glasfaserverkabelung inklusive OTDR-Spleißarbeiten und Messprotokoll.",
      points: [
        "LWL Fusion-Spleißen (Singlemode & Multimode)",
        "Messung nach ISO/IEC 11801 inkl. Prüfprotokoll",
        "Sauberes Kabelmanagement & Server-Rack Aufbauten",
        "Erweiterbare Patchpanel-Infrastrukturen"
      ]
    },
    {
      id: "routing",
      title: "Enterprise Router & Redundantes Internet",
      icon: Globe,
      color: "from-violet-500 to-purple-600",
      description: "Ausfallsicherer Internetzugang durch automatische Umschaltung (Failover) zwischen Glasfaser, VDSL und 5G-Mobilfunk.",
      points: [
        "Dual-WAN & Multi-WAN Load Balancing",
        "Automatischer 5G/LTE Failover in unter 1 Sekunde",
        "BGP Routing & Statische IP-Adressierung",
        "Quality of Service (QoS) für verzögerungsfreie Kommunikation"
      ]
    },
    {
      id: "ups",
      title: "USV-Systeme & Serverraum-Monitoring",
      icon: Zap,
      color: "from-rose-500 to-red-600",
      description: "Schutz vor Stromausfällen, Überspannungen und Überhitzung im Server- oder Netzwerkschrank.",
      points: [
        "Online-Doppelwandler USV-Systeme (1kVA - 20kVA)",
        "Gesteuertes Herunterfahren von Servern bei Stromausfall",
        "SNMP-Netzwerkkarten für Fernüberwachung",
        "Temperatur-, Feuchtigkeits- & Rauchsensoren"
      ]
    }
  ];

  const projectPhases = [
    {
      step: "01",
      title: "Analyse & Bedarfsaufnahme",
      desc: "Wir analysieren Ihre bestehende Infrastruktur, prüfen Gebäudepläne und ermitteln Bandbreite, Port-Anzahl sowie Sicherheitsanforderungen.",
      icon: FileText
    },
    {
      step: "02",
      title: "Topologie-Design & Sicherheitskonzept",
      desc: "Erstellung eines strukturierten Netzwerkplans mit VLAN-Segmentierung, IP-Subnetzen und Redundanz-Konzepten.",
      icon: Sliders
    },
    {
      step: "03",
      title: "Vorkonfiguration im Labor",
      desc: "Alle Switches, Firewalls und Access Points werden in unserem Testlabor vorkonfiguriert, mit neuester Firmware versorgt und gehärtet.",
      icon: Cpu
    },
    {
      step: "04",
      title: "Vor-Ort Montage & Verkabelung",
      desc: "Fachgerechte Installation der Komponenten im Server-Rack, Verlegung von Kupfer/LWL-Kabeln und Beschriftung aller Patchfelder.",
      icon: Wrench
    },
    {
      step: "05",
      title: "Messung, Protokollierung & SLA Support",
      desc: "Abschließende Durchsatzmessung, Aushändigung des Prüfprotokolls sowie Einweisung und optionales 24/7 Monitoring.",
      icon: CheckCircle2
    }
  ];

  const faqs = [
    {
      q: "Warum sind Managed Switches für moderne Netzwerke unumgänglich?",
      a: "Managed Switches ermöglichen die logische Trennung (VLANs) von sensiblen Firmendaten, Gäste-WLAN und IP-Überwachungskameras. Zudem bieten sie Quality of Service (QoS), um Sprach- und Videodaten bevorzugt zu behandeln, sowie Fernüberwachung und PoE-Leistungssteuerung."
    },
    {
      q: "Wie läuft eine professionelle WLAN-Ausmessung (Site Survey) ab?",
      a: "Vor der Installation begehen unsere Techniker Ihre Räumlichkeiten mit Spezialmessgeräten. Wir analysieren Wanddämpfungen, Fremdsignale und Reflexionen, um die exakten Positionen und Sendeleistungen der Access Points für eine lückenlose Abdeckung zu bestimmen."
    },
    {
      q: "Was versteht man unter redundanter Internetanbindung (Dual-WAN Failover)?",
      a: "Sollte Ihr primärer Glasfaser- oder Kabel-Internetzugang ausfallen, schaltet ein Enterprise-Router innerhalb von Millisekunden automatisch auf eine zweite Leitung (z.B. 5G/LTE oder DSL) um. Ihr Betrieb läuft ohne Unterbrechung weiter."
    },
    {
      q: "Erhalt man nach der Verkabelung ein offizielles Messprotokoll?",
      a: "Ja, jede von uns durchgeführte Kupfer- und Glasfaser-Verkabelung wird mit kalibrierten Fluke-Netzwerktestern geprüft. Sie erhalten ein detailliertes Messprotokoll für Ihre Unterlagen und als Garantiebeleg."
    },
    {
      q: "Bietet IT-MARKET auch laufende Wartung und Fernüberwachung (SLA) an?",
      a: "Ja. Mit unseren Managed-Network-Service-Paketen überwachen wir Ihre Netzwerkelemente rund um die Uhr proaktiv. Wir spielen Sicherheitsupdates ein, erkennen Störungen vor dem Ausfall und greifen bei Bedarf umgehend ein."
    }
  ];

  return (
    <div className="space-y-16 py-6">

      {/* SECTION 1: HEADER & KEY METRICS BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-4">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>High-Performance Netzwerkinfrastruktur nach IT-MARKET Standard</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
            Ausfallsichere Netzwerke für Unternehmen & anspruchsvolle Anwender
          </h2>

          <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Ob strukturierte Gebäudeverkabelung, Managed Switches, Next-Gen Firewalls oder großflächige WLAN-Ausleuchtung – wir konzipieren, installieren und betreuen Ihre gesamte IT-Infrastruktur aus einer Hand.
          </p>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-cyan-400 font-mono">10G - 100G</span>
              <span className="text-[11px] text-slate-400 font-medium">Glasfaser & Kupfer Backbones</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-blue-400 font-mono">99.99%</span>
              <span className="text-[11px] text-slate-400 font-medium">Uptime mit Redundanz</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-emerald-400 font-mono">Zero-Trust</span>
              <span className="text-[11px] text-slate-400 font-medium">DSGVO & DPI Sicherheit</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="block text-xl font-extrabold text-amber-400 font-mono">Wi-Fi 7</span>
              <span className="text-[11px] text-slate-400 font-medium">High-Density Access Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DIE 6 KERNBEREICHE DER NETZWERKTECHNIK */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Umfassendes Leistungsspektrum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Unsere Kernbereiche für Ihre Netzwerkinfrastruktur
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Höchste Zuverlässigkeit durch abgestimmte Hardware-Komponenten führender Markenhersteller.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networkServices.map((srv) => {
            const IconComponent = srv.icon;
            return (
              <div 
                key={srv.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Profi-Standard
                    </span>
                  </div>

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
                  onClick={() => onOpenCallback(`Anfrage bezüglich Netzwerk-Bereich: ${srv.title}`)}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Anforderung anfragen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: INTERAKTIVER NETZWERK-KALKULATOR / ANFORDERUNGS-FINDER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Interaktiver Netzwerk-Berater
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            Ermitteln Sie die ideale Netzwerkkonfiguration
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Wählen Sie Ihren Anwendungsbereich aus und erhalten Sie eine Sofort-Empfehlung für Ihre Netzwerkhardware.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">1. Einsatzumgebung auswählen:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "office_small", label: "Kleine Praxis / KMU" },
                  { id: "office_large", label: "Großes Unternehmen" },
                  { id: "industrial", label: "Industrie & Kameras" },
                  { id: "hospitality", label: "Hotel & Gastronomie" },
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
                <span>2. Anzahl Endgeräte / Netzwerk-Ports:</span>
                <span className="text-cyan-400 font-mono font-extrabold">{deviceCount} Devices</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={deviceCount}
                onChange={(e) => setDeviceCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsPoE}
                  onChange={(e) => setNeedsPoE(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>PoE Stromversorgung für IP-Kameras / Telefone</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsFiber}
                  onChange={(e) => setNeedsFiber(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Glasfaser (LWL) Etagenanbindung (10G+)</span>
              </label>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                Empfohlenes Netzwerkequipment
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-extrabold">
                Ca. {currentRec.estimatedSetupTime} Installation
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white">
              {currentRec.title}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Switch-Hardware:</span>
                <span className="text-white font-bold">{currentRec.switchRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">WLAN & Access Points:</span>
                <span className="text-white font-bold">{currentRec.apRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Firewall & Security:</span>
                <span className="text-white font-bold">{currentRec.firewallRec}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Verkabelungsstandard:</span>
                <span className="text-white font-bold">{currentRec.cablingRec}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenCallback(`Kostenfreie Erstberatung für Netzwerk: ${currentRec.title} (${deviceCount} Geräte)`)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Angebot für dieses Netzwerk anfordern</span>
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 4: DAS 5-PHASEN PROJEKT-MODELL */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Ablauf & Qualitätssicherung
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
            Der IT-MARKET Weg zum perfekten Netzwerk
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            In 5 strukturierten Schritten von der ersten Idee bis zur schlüsselfertigen Übergabe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            Häufige Fragen zur Netzwerkplanung
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
            Planen Sie ein neues Netzwerk oder eine Modernisierung?
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Sprechen Sie direkt mit unseren zertifizierten Netzwerkspezialisten. Wir erstellen Ihnen ein maßgeschneidertes Angebot inklusive Ausleuchtungs- & Verkabelungsanalyse.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenCallback("Kostenfreier Netzwerk-Check & Vor-Ort-Analyse")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Kostenfreien Netzwerk-Check anfordern</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

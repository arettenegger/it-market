import React, { useState } from "react";
import { Cpu, HardDrive, Check, ShoppingBag, PhoneCall, Sparkles, Server, Activity, Sliders, Layers, MemoryStick, CircuitBoard, MonitorCog, Info } from "lucide-react";
import { Product, ConfiguratorData, ConfiguratorOption, BaseConfiguration, formatPrice } from "../types";
import { DEFAULT_CONFIGURATOR_DATA } from "../data";

interface PcConfiguratorProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenCallback?: (prefilledMsg?: string) => void;
  configData?: ConfiguratorData;
}

export default function PcConfigurator({ onAddToCart, onOpenCallback, configData }: PcConfiguratorProps) {
  const data = configData || DEFAULT_CONFIGURATOR_DATA;

  const baseConfigs = data.baseConfigurations || [];
  const networkOptions = data.networkOptions || [];
  const serviceOptions = data.serviceOptions || [];

  // Standardauswahl: empfohlene Basiskonfiguration, sonst die erste
  const defaultConfigId = (baseConfigs.find(c => c.recommended) || baseConfigs[0])?.id || "";
  const [selectedConfigId, setSelectedConfigId] = useState(defaultConfigId);
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]?.id || "");
  const [selectedService, setSelectedService] = useState(serviceOptions[0]?.id || "");

  const currentConfig = baseConfigs.find(c => c.id === selectedConfigId) || baseConfigs[0];
  const currentNetwork = networkOptions.find(o => o.id === selectedNetwork) || networkOptions[0];
  const currentService = serviceOptions.find(o => o.id === selectedService) || serviceOptions[0];

  const hasNetwork = networkOptions.length > 0 && !!currentNetwork;
  const hasService = serviceOptions.length > 0 && !!currentService;

  const totalPrice =
    (currentConfig?.price || 0) +
    (hasNetwork ? currentNetwork.price : 0) +
    (hasService ? currentService.price : 0);

  // Komponentenliste einer Basiskonfiguration (für Karte & Übersicht)
  const componentRows = (cfg: BaseConfiguration) => ([
    { label: "Prozessor (CPU)", value: cfg.cpu, icon: Cpu },
    { label: "Mainboard", value: cfg.mainboard, icon: CircuitBoard },
    { label: "Arbeitsspeicher", value: cfg.ram, icon: MemoryStick },
    { label: "Speicher (SSD)", value: cfg.ssd, icon: HardDrive },
    { label: "Gehäuse", value: cfg.chassis, icon: Server },
    ...(cfg.gpu ? [{ label: "Grafikkarte", value: cfg.gpu, icon: MonitorCog }] : []),
  ]);

  const handleAddConfigurationToCart = () => {
    if (!currentConfig) return;
    const addonFeatures = [
      ...(hasNetwork ? [`Netzwerk: ${currentNetwork.name}`] : []),
      ...(hasService ? [`Service: ${currentService.name}`] : []),
    ];
    const configProduct: Product = {
      id: `custom-pc-${Date.now()}`,
      name: `PC-System "${currentConfig.name}"`,
      category: "PC-Hardware",
      description: `${currentConfig.name}: ${currentConfig.cpu}, ${currentConfig.mainboard}, ${currentConfig.ram}, ${currentConfig.ssd}, ${currentConfig.chassis}${currentConfig.gpu ? `, ${currentConfig.gpu}` : ""}.`,
      price: totalPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: "netzwerk",
      features: [
        `Prozessor: ${currentConfig.cpu}`,
        `Mainboard: ${currentConfig.mainboard}`,
        `Arbeitsspeicher: ${currentConfig.ram}`,
        `Speicher: ${currentConfig.ssd}`,
        `Gehäuse: ${currentConfig.chassis}`,
        ...(currentConfig.gpu ? [`Grafikkarte: ${currentConfig.gpu}`] : []),
        ...addonFeatures,
      ],
      isBestseller: !!currentConfig.recommended,
      inStock: true,
      colors: ["Schneidend Schwarz"],
      specs: {
        resolution: currentConfig.cpu,
        viewAngle: currentConfig.ram,
        nightVision: currentConfig.gpu || "—",
        storage: currentConfig.ssd,
        power: currentConfig.chassis,
      }
    };

    onAddToCart(configProduct);
  };

  const handleRequestQuote = () => {
    if (!currentConfig) {
      if (onOpenCallback) onOpenCallback("Guten Tag IT-MARKET Team, ich interessiere mich für eine individuelle PC-/Server-Konfiguration und bitte um Beratung.");
      return;
    }
    const lines = [
      `- Basiskonfiguration: ${currentConfig.name}`,
      `- Prozessor: ${currentConfig.cpu}`,
      `- Mainboard: ${currentConfig.mainboard}`,
      `- Arbeitsspeicher: ${currentConfig.ram}`,
      `- Speicher: ${currentConfig.ssd}`,
      `- Gehäuse: ${currentConfig.chassis}`,
      ...(currentConfig.gpu ? [`- Grafikkarte: ${currentConfig.gpu}`] : []),
      ...(hasNetwork ? [`- Netzwerk: ${currentNetwork.name}`] : []),
      ...(hasService ? [`- Service: ${currentService.name}`] : []),
    ].join("\n");
    const quoteMsg = `Guten Tag IT-MARKET Team, ich bitte um ein unverbindliches Angebot für folgende PC/Server Konfiguration (Gesamtwert ca. ${totalPrice}€):\n${lines}`;
    if (onOpenCallback) onOpenCallback(quoteMsg);
  };

  return (
    <section id="pc-konfigurator" className="py-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 my-8 shadow-2xl border border-slate-800">
      <div className="max-w-7xl mx-auto">

        {/* Header Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fertig abgestimmte Komplettsysteme</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              IT-MARKET PC & Server-Konfigurator
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Wählen Sie eine unserer geprüften Basiskonfigurationen – alle Komponenten sind von unseren Technikern aufeinander abgestimmt und garantiert kompatibel. Optional erweiterbar um Netzwerk & Service.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60 shrink-0">
            <Check className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">100% Kompatibel</div>
              <div className="text-[10px] text-slate-400">Aufeinander abgestimmte Systeme</div>
            </div>
          </div>
        </div>

        {baseConfigs.length === 0 ? (
          /* Leerer Zustand */
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-10 text-center">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Aktuell keine Basiskonfigurationen hinterlegt</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              Kontaktieren Sie uns – wir stellen Ihnen ein individuell abgestimmtes, kompatibles System zusammen.
            </p>
            <button
              onClick={handleRequestQuote}
              className="mt-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Individuelles Angebot anfordern
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Auswahl-Spalte (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Basiskonfigurationen */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-red-400" />
                  1. Basiskonfiguration wählen
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {baseConfigs.map(cfg => {
                    const isSelected = currentConfig?.id === cfg.id;
                    return (
                      <button
                        key={cfg.id}
                        onClick={() => setSelectedConfigId(cfg.id)}
                        className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col ${
                          isSelected
                            ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {cfg.recommended && (
                          <span className="absolute -top-2 right-3 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Empfohlen
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-extrabold font-display text-sm text-white leading-tight">{cfg.name}</div>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${isSelected ? "border-red-500 bg-red-500" : "border-slate-600"}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>
                        {cfg.description && (
                          <div className="text-[11px] text-slate-400 mb-3 leading-snug">{cfg.description}</div>
                        )}
                        <ul className="space-y-1 mb-3 mt-auto">
                          {componentRows(cfg).map((row, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                              <span className="text-red-400 font-bold select-none shrink-0">&gt;</span>
                              <span className="text-slate-300"><strong className="font-semibold text-slate-200">{row.label}:</strong> {row.value}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm font-mono font-extrabold text-red-400 pt-2 border-t border-slate-800/80">
                          {formatPrice(cfg.price)} €
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optionale Zusätze: Netzwerk & Service */}
              {(hasNetwork || hasService) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasNetwork && (
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-red-400" />
                        Netzwerk-Karte (optional)
                      </label>
                      <div className="space-y-2">
                        {networkOptions.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedNetwork(opt.id)}
                            className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                              selectedNetwork === opt.id
                                ? "bg-red-950/40 border-red-500 text-white"
                                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <div className="font-bold text-xs">{opt.name}</div>
                            <div className="text-[10px] text-slate-400">{opt.spec}{opt.price > 0 ? ` (+${opt.price}€)` : " (inklusive)"}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasService && (
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Sliders className="w-4 h-4 text-red-400" />
                        Montage & Service (optional)
                      </label>
                      <div className="space-y-2">
                        {serviceOptions.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedService(opt.id)}
                            className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                              selectedService === opt.id
                                ? "bg-red-950/40 border-red-500 text-white"
                                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <div className="font-bold text-xs">{opt.name}</div>
                            <div className="text-[10px] text-slate-400">{opt.spec}{opt.price > 0 ? ` (+${opt.price}€)` : " (inklusive)"}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sticky Übersicht & Bestell-Box (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 sticky top-24 shadow-2xl space-y-6">

                <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                  <h3 className="font-extrabold font-display text-lg text-white">System Übersicht</h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Kompatibel
                  </span>
                </div>

                {currentConfig && (
                  <>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Gewähltes System</div>
                      <div className="font-extrabold font-display text-white text-sm">{currentConfig.name}</div>
                    </div>

                    {/* Komponenten-Liste */}
                    <div className="space-y-2.5 text-xs text-slate-300">
                      {componentRows(currentConfig).map((row, i) => (
                        <div key={i} className="flex justify-between items-start gap-3 py-1 border-b border-slate-800">
                          <span className="text-slate-400 shrink-0">{row.label}:</span>
                          <span className="font-semibold text-right">{row.value}</span>
                        </div>
                      ))}
                      {hasNetwork && (
                        <div className="flex justify-between items-start gap-3 py-1 border-b border-slate-800">
                          <span className="text-slate-400 shrink-0">Netzwerk:</span>
                          <span className="font-semibold text-right">{currentNetwork.name}</span>
                        </div>
                      )}
                      {hasService && (
                        <div className="flex justify-between items-start gap-3 py-1 border-b border-slate-800">
                          <span className="text-slate-400 shrink-0">Service:</span>
                          <span className="font-semibold text-right">{currentService.name}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Gesamtpreis */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gesamtpreis inkl. MwSt.</div>
                  <div className="text-3xl font-extrabold font-mono text-red-400 mt-1">
                    {totalPrice.toLocaleString("de-DE")} €
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Inkl. Montage, 24h Belastungstest & kostenlosem Express-Versand in DE/AT/CH.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleAddConfigurationToCart}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Konfiguration in den Warenkorb</span>
                  </button>

                  <button
                    onClick={handleRequestQuote}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                    <span>Als individuelles Angebot anfordern</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>24/7 Stresstest</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Geprüfte Qualität</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

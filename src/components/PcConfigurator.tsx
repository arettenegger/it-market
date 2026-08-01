import React, { useState } from "react";
import { Cpu, HardDrive, Zap, ShieldCheck, Check, ShoppingBag, PhoneCall, Sparkles, Sliders, Layers, Server, Activity } from "lucide-react";
import { Product, ConfiguratorData, ConfiguratorOption, formatPrice } from "../types";
import { DEFAULT_CONFIGURATOR_DATA } from "../data";

interface PcConfiguratorProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenCallback?: (prefilledMsg?: string) => void;
  configData?: ConfiguratorData;
}

export default function PcConfigurator({ onAddToCart, onOpenCallback, configData }: PcConfiguratorProps) {
  const data = configData || DEFAULT_CONFIGURATOR_DATA;

  const chassisOptions = data.chassisOptions;
  const cpuOptions = data.cpuOptions;
  const ramOptions = data.ramOptions;
  const gpuOptions = data.gpuOptions;
  const ssdOptions = data.ssdOptions;
  const networkOptions = data.networkOptions;
  const serviceOptions = data.serviceOptions;

  // Configurator selection state
  const [selectedChassis, setSelectedChassis] = useState(chassisOptions[0]?.id || "chassis-tower");
  const [selectedCpu, setSelectedCpu] = useState(cpuOptions[0]?.id || "cpu-i9");
  const [selectedRam, setSelectedRam] = useState(ramOptions[0]?.id || "ram-64gb");
  const [selectedGpu, setSelectedGpu] = useState(gpuOptions[0]?.id || "gpu-4070");
  const [selectedSsd, setSelectedSsd] = useState(ssdOptions[0]?.id || "ssd-2tb");
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]?.id || "net-10g");
  const [selectedService, setSelectedService] = useState(serviceOptions[0]?.id || "srv-express");

  // Helper to find selected object
  const currentChassis = chassisOptions.find(o => o.id === selectedChassis) || chassisOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentCpu = cpuOptions.find(o => o.id === selectedCpu) || cpuOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentRam = ramOptions.find(o => o.id === selectedRam) || ramOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentGpu = gpuOptions.find(o => o.id === selectedGpu) || gpuOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentSsd = ssdOptions.find(o => o.id === selectedSsd) || ssdOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentNetwork = networkOptions.find(o => o.id === selectedNetwork) || networkOptions[0] || { id: "none", name: "-", price: 0, spec: "" };
  const currentService = serviceOptions.find(o => o.id === selectedService) || serviceOptions[0] || { id: "none", name: "-", price: 0, spec: "" };

  const baseBoardPrice = data.baseBoardPrice ?? 349;

  // Nur Kategorien mit mindestens einer Option zählen — entfernte (leere) Kategorien
  // fließen weder in Preis, Übersicht, Warenkorb noch ins Angebot ein.
  const activeParts = [
    { label: "Gehäuse", sumLabel: "Gehäuse", opt: currentChassis, active: chassisOptions.length > 0 },
    { label: "CPU", sumLabel: "Prozessor", opt: currentCpu, active: cpuOptions.length > 0 },
    { label: "RAM", sumLabel: "RAM", opt: currentRam, active: ramOptions.length > 0 },
    { label: "GPU", sumLabel: "Grafikkarte", opt: currentGpu, active: gpuOptions.length > 0 },
    { label: "SSD", sumLabel: "Speicher", opt: currentSsd, active: ssdOptions.length > 0 },
    { label: "Netzwerk", sumLabel: "Netzwerk", opt: currentNetwork, active: networkOptions.length > 0 },
    { label: "Service", sumLabel: "Service", opt: currentService, active: serviceOptions.length > 0 },
  ].filter(p => p.active);

  const totalPrice = baseBoardPrice + activeParts.reduce((sum, p) => sum + p.opt.price, 0);

  const handleAddConfigurationToCart = () => {
    const configProduct: Product = {
      id: `custom-pc-${Date.now()}`,
      name: `Custom PC-Workstation "${currentCpu.name.split(' ')[0]} / ${currentGpu.name.split(' ')[0]}"`,
      category: "PC-Hardware",
      description: `Individualkonfiguration: ${activeParts.map(p => p.opt.name).join(", ")}.`,
      price: totalPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: "netzwerk",
      features: activeParts.map(p => `${p.label}: ${p.opt.name}`),
      isBestseller: true,
      inStock: true,
      colors: ["Schneidend Schwarz"],
      specs: {
        resolution: currentCpu.spec,
        viewAngle: currentGpu.spec,
        nightVision: currentRam.spec,
        storage: currentSsd.spec,
        power: [
          networkOptions.length > 0 ? currentNetwork.name : null,
          serviceOptions.length > 0 ? currentService.name : null,
        ].filter(Boolean).join(" | ")
      }
    };

    onAddToCart(configProduct);
  };

  const handleRequestQuote = () => {
    const lines = activeParts.map(p => `- ${p.label}: ${p.opt.name}`).join("\n");
    const quoteMsg = `Guten Tag IT-MARKET Team, ich bitte um ein unverbindliches Angebot für folgende PC/Server Konfiguration (Gesamtwert ca. ${totalPrice}€):\n${lines}`;
    if (onOpenCallback) {
      onOpenCallback(quoteMsg);
    }
  };

  return (
    <section id="pc-konfigurator" className="py-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 my-8 shadow-2xl border border-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interaktiver 3D-Konfigurator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              IT-MARKET PC & Server-Konfigurator
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Stellen Sie sich Ihre Hochleistungs-Workstation oder Ihren Server in Echtzeit zusammen. Alle Komponenten werden von unseren Technikern stundengenau auf Kompatibilität & Stabilität geprüft.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">100% Kompatibel</div>
              <div className="text-[10px] text-slate-400">Automatische Hardware-Prüfung</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Options Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Chassis */}
            {chassisOptions.length > 0 && (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-red-400" />
                Gehäuse & System-Typ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {chassisOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedChassis(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      selectedChassis === opt.id
                        ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 right-2 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                        Server Tipp
                      </span>
                    )}
                    <div className="font-bold text-sm leading-tight mb-1">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{opt.spec}</div>
                    <div className="text-xs font-mono font-bold text-red-400">+{opt.price} €</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 2. CPU */}
            {cpuOptions.length > 0 && (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-red-400" />
                Prozessor (CPU)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cpuOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCpu(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      selectedCpu === opt.id
                        ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 right-2 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                        Bestseller
                      </span>
                    )}
                    <div className="font-bold text-sm leading-tight mb-1">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{opt.spec}</div>
                    <div className="text-xs font-mono font-bold text-red-400">+{opt.price} €</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 3. RAM */}
            {ramOptions.length > 0 && (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-red-400" />
                Arbeitsspeicher (RAM)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ramOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRam(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      selectedRam === opt.id
                        ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 right-2 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                        Empfohlen
                      </span>
                    )}
                    <div className="font-bold text-sm leading-tight mb-1">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{opt.spec}</div>
                    <div className="text-xs font-mono font-bold text-red-400">+{opt.price} €</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 4. GPU */}
            {gpuOptions.length > 0 && (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-red-400" />
                Grafikkarte / Beschleuniger (GPU)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gpuOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedGpu(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      selectedGpu === opt.id
                        ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 right-2 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                        Pro Wahl
                      </span>
                    )}
                    <div className="font-bold text-sm leading-tight mb-1">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{opt.spec}</div>
                    <div className="text-xs font-mono font-bold text-red-400">+{opt.price} €</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 5. SSD & Storage */}
            {ssdOptions.length > 0 && (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-red-400" />
                System-Speicher (NVMe M.2 SSD)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ssdOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSsd(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      selectedSsd === opt.id
                        ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 right-2 bg-red-600 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                        Top Speed
                      </span>
                    )}
                    <div className="font-bold text-sm leading-tight mb-1">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{opt.spec}</div>
                    <div className="text-xs font-mono font-bold text-red-400">+{opt.price} €</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 6. Network & Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {networkOptions.length > 0 && (
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-red-400" />
                  Netzwerk-Karte
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
                      <div className="text-[10px] text-slate-400">{opt.spec} (+{opt.price}€)</div>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {serviceOptions.length > 0 && (
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-red-400" />
                  Montage & Service
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
                      <div className="text-[10px] text-slate-400">{opt.spec} (+{opt.price}€)</div>
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>

          </div>

          {/* Sticky Summary & Order Box (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 sticky top-24 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                <h3 className="font-extrabold font-display text-lg text-white">System Übersicht</h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Bereit
                </span>
              </div>

              {/* Selected List — nur aktive (nicht entfernte) Kategorien */}
              <div className="space-y-2.5 text-xs text-slate-300">
                {activeParts.map(p => (
                  <div key={p.sumLabel} className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">{p.sumLabel}:</span>
                    <span className="font-semibold text-right max-w-[180px] truncate">{p.opt.name}</span>
                  </div>
                ))}
              </div>

              {/* Total Price */}
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

      </div>
    </section>
  );
}

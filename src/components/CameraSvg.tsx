import React from "react";

interface CameraSvgProps {
  type: "bullet" | "dome" | "ptz" | "set" | "interactive" | "smarthome" | "nas" | "netzwerk";
  isNightVision?: boolean;
  panAngle?: number; // -45 to 45 degrees
  isRecording?: boolean;
  className?: string;
}

export default function CameraSvg({
  type,
  isNightVision = false,
  panAngle = 0,
  isRecording = false,
  className = "w-full h-full",
}: CameraSvgProps) {
  // Common colors
  const polarWhite = "#FFFFFF";
  const spaceGray = "#374151";
  const carbonDark = "#111827";
  const accentBlue = "#FF5E2E";
  const glowRed = "#EF4444";
  const glowBlue = "#FF9F85";

  const renderBullet = (isInteractive: boolean) => {
    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Soft background glow */}
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.3" />
        
        {/* Shadow */}
        <ellipse cx="200" cy="330" rx="100" ry="12" fill="black" opacity="0.1" />

        <g transform="translate(40, 20)">
          {/* Wall Mount Bracket / Stand */}
          <path
            d="M80,260 L80,310 C80,320 90,330 100,330 L160,330 C160,310 150,290 140,280 L110,260 Z"
            fill="url(#metalGradient)"
            stroke={spaceGray}
            strokeWidth="3"
          />
          <line x1="80" y1="280" x2="135" y2="280" stroke="#9CA3AF" strokeWidth="2" />
          
          {/* Swivel Joint */}
          <circle cx="120" cy="250" r="18" fill="#4B5563" stroke={carbonDark} strokeWidth="3" />
          <path d="M120,232 L150,200" stroke={carbonDark} strokeWidth="12" strokeLinecap="round" />

          {/* Camera Main Body barrel */}
          <g transform="rotate(-15, 200, 160)">
            {/* Sun Shield Cap */}
            <path
              d="M110,130 L270,110 L285,150 L110,165 Z"
              fill="url(#whiteGloss)"
              stroke={carbonDark}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Main housing cylinder */}
            <rect
              x="120"
              y="150"
              width="140"
              height="80"
              rx="8"
              fill="url(#whiteGloss)"
              stroke={carbonDark}
              strokeWidth="4"
            />
            
            {/* Back Cooling Fins */}
            <path d="M120,160 L105,160 L105,220 L120,220" fill="#9CA3AF" stroke={carbonDark} strokeWidth="3" />
            <line x1="112" y1="170" x2="112" y2="210" stroke={carbonDark} strokeWidth="3" />

            {/* Front Bezel Rings */}
            <rect
              x="260"
              y="145"
              width="25"
              height="90"
              rx="4"
              fill={spaceGray}
              stroke={carbonDark}
              strokeWidth="4"
            />
            {/* Shiny Ring */}
            <line x1="265" y1="147" x2="265" y2="233" stroke="#9CA3AF" strokeWidth="2" />

            {/* Glass Face Plate */}
            <path
              d="M285,145 C285,145 295,160 295,190 C295,220 285,235 285,235 Z"
              fill="url(#glassGradient)"
              stroke={carbonDark}
              strokeWidth="4"
            />

            {/* Lens structure in center */}
            <circle cx="282" cy="190" r="18" fill={carbonDark} />
            <circle cx="282" cy="190" r="10" fill="#1F2937" stroke={accentBlue} strokeWidth="2" />
            {/* Lens Reflection */}
            <circle cx="279" cy="186" r="4" fill={polarWhite} opacity="0.7" />

            {/* Infrared IR LEDs ring */}
            <g opacity={isNightVision ? 1 : 0.2}>
              <circle cx="270" cy="160" r="4" fill={isNightVision ? glowRed : "#4B5563"} />
              <circle cx="280" cy="168" r="4" fill={isNightVision ? glowRed : "#4B5563"} />
              <circle cx="280" cy="212" r="4" fill={isNightVision ? glowRed : "#4B5563"} />
              <circle cx="270" cy="220" r="4" fill={isNightVision ? glowRed : "#4B5563"} />
            </g>

            {/* Status LED */}
            <circle
              cx="260"
              y="155"
              r="4"
              fill={isRecording ? glowRed : glowBlue}
              className={isRecording ? "animate-pulse" : "animate-pulse-subtle"}
              style={{ cx: "260px", cy: "155px" }}
            />
          </g>
        </g>

        {/* Dynamic labels if interactive */}
        {isInteractive && (
          <g transform="translate(20, 350)">
            <rect x="0" y="0" width="360" height="40" rx="8" fill={carbonDark} opacity="0.8" />
            <circle cx="20" cy="20" r="5" fill={isNightVision ? glowRed : glowBlue} className="animate-ping" />
            <circle cx="20" cy="20" r="5" fill={isNightVision ? glowRed : glowBlue} />
            <text x="35" y="25" fill={polarWhite} fontSize="12" fontFamily="monospace">
              STATUS: {isRecording ? "AUFNAHME AKTIV" : "STANDBY"} | IR-CUT: {isNightVision ? "NIGHT (ON)" : "DAY (OFF)"}
            </text>
          </g>
        )}

        {/* Definitions for gradients */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentBlue} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentBlue} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="whiteGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="50%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const renderDome = () => {
    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.2" />
        <ellipse cx="200" cy="310" rx="90" ry="10" fill="black" opacity="0.1" />

        {/* Mounting Base Ring */}
        <path
          d="M100,200 C100,160 140,140 200,140 C260,140 300,160 300,200 L310,215 C310,225 290,230 200,230 C110,230 90,225 90,215 Z"
          fill="url(#whiteGloss)"
          stroke={carbonDark}
          strokeWidth="4"
        />

        {/* Secondary Base shadow */}
        <ellipse cx="200" cy="210" rx="100" ry="18" fill="none" stroke="#D1D5DB" strokeWidth="2" />

        {/* Dark Gimbal Shield (Sphere under glass) */}
        <path
          d="M120,210 C120,250 150,295 200,295 C250,295 280,250 280,210 Z"
          fill="#1F2937"
          stroke={carbonDark}
          strokeWidth="3"
        />

        {/* Moving Lens Ball */}
        <g transform={`translate(${panAngle * 0.4}, 0)`}>
          <circle cx="200" cy="245" r="35" fill={carbonDark} stroke="#374151" strokeWidth="2" />
          {/* Golden/Blue Lens Ring */}
          <circle cx="200" cy="245" r="20" fill="#030712" stroke={accentBlue} strokeWidth="2.5" />
          <circle cx="196" cy="241" r="5" fill={polarWhite} opacity="0.8" />

          {/* IR Indicators around lens */}
          <g opacity={isNightVision ? 1 : 0.3}>
            <circle cx="180" cy="245" r="3" fill={isNightVision ? glowRed : "#6B7280"} />
            <circle cx="220" cy="245" r="3" fill={isNightVision ? glowRed : "#6B7280"} />
            <circle cx="200" cy="225" r="3" fill={isNightVision ? glowRed : "#6B7280"} />
          </g>
        </g>

        {/* Transparent Outer Glass Dome */}
        <path
          d="M110,210 C110,270 140,310 200,310 C260,310 290,270 290,210 Z"
          fill="url(#glassDomeGlow)"
          stroke={carbonDark}
          strokeWidth="4"
          opacity="0.6"
        />

        {/* Glass Dome Reflections */}
        <path
          d="M130,220 C130,250 145,280 170,290 C155,280 140,250 140,220 Z"
          fill={polarWhite}
          opacity="0.35"
        />
        <path
          d="M270,220 C270,240 260,265 240,275"
          stroke={polarWhite}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* Power LED Indicator */}
        <circle cx="200" cy="180" r="4.5" fill={isRecording ? glowRed : glowBlue} className="animate-pulse" />

        <defs>
          <linearGradient id="glassDomeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#1E3A8A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const renderPtz = () => {
    // Dynamic lens rotation
    const rotateTransform = `rotate(${panAngle}, 200, 210)`;

    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.2" />
        <ellipse cx="200" cy="340" rx="90" ry="12" fill="black" opacity="0.1" />

        {/* Wall Support Heavy Arm */}
        <path
          d="M100,100 L160,100 C175,100 185,110 185,125 L185,170"
          stroke="url(#whiteGloss)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wall plate */}
        <rect x="75" y="70" width="30" height="80" rx="4" fill={spaceGray} stroke={carbonDark} strokeWidth="3" />
        <line x1="170" y1="140" x2="200" y2="140" stroke={carbonDark} strokeWidth="3" />

        {/* Cap Cover */}
        <path
          d="M140,165 L260,165 C275,165 285,175 285,190 L285,195 L115,195 L115,190 C115,175 125,165 140,165 Z"
          fill="url(#whiteGloss)"
          stroke={carbonDark}
          strokeWidth="4"
        />

        {/* Rotational Yoke Frame (Hanger) */}
        <path
          d="M130,195 L130,260 C130,285 145,295 160,295 L240,295 C255,295 270,285 270,260 L270,195 Z"
          fill="url(#whiteGloss)"
          stroke={carbonDark}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Central Motorized Camera Orb */}
        <g transform={rotateTransform}>
          {/* Sphere Housing */}
          <circle cx="200" cy="235" r="55" fill="url(#whiteGloss)" stroke={carbonDark} strokeWidth="4" />
          
          {/* Black Center Face Plate */}
          <path
            d="M165,200 C150,215 150,255 165,270 L235,270 C250,255 250,215 235,200 Z"
            fill={carbonDark}
            stroke="#374151"
            strokeWidth="3"
          />

          {/* High Zoom Lens */}
          <circle cx="200" cy="235" r="22" fill="#020617" stroke={accentBlue} strokeWidth="3" />
          <circle cx="200" cy="235" r="12" fill="#090D16" stroke="#10B981" strokeWidth="1.5" />
          {/* Reflection */}
          <ellipse cx="194" cy="229" rx="5" ry="3" fill={polarWhite} opacity="0.8" transform="rotate(-30, 194, 229)" />

          {/* High Power Dual IR Spotlights */}
          <g opacity={isNightVision ? 1 : 0.25}>
            {/* Left IR */}
            <circle cx="172" cy="235" r="6" fill="#1F2937" stroke={isNightVision ? glowRed : "#4B5563"} strokeWidth="1.5" />
            <circle cx="172" cy="235" r="2" fill={isNightVision ? glowRed : "transparent"} />
            
            {/* Right IR */}
            <circle cx="228" cy="235" r="6" fill="#1F2937" stroke={isNightVision ? glowRed : "#4B5563"} strokeWidth="1.5" />
            <circle cx="228" cy="235" r="2" fill={isNightVision ? glowRed : "transparent"} />
          </g>

          {/* Mini active status led */}
          <circle cx="200" cy="208" r="3.5" fill={isRecording ? glowRed : glowBlue} className="animate-pulse" />
        </g>

        {/* Bottom Logo or branding tag on non-rotating arm */}
        <rect x="180" y="280" width="40" height="8" rx="2" fill={carbonDark} opacity="0.2" />
        <line x1="185" y1="284" x2="215" y2="284" stroke={polarWhite} strokeWidth="1.5" opacity="0.5" />
      </svg>
    );
  };

  const renderSet = () => {
    return (
      <svg
        viewBox="0 0 450 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Ambient base shadows */}
        <ellipse cx="180" cy="330" rx="140" ry="12" fill="black" opacity="0.1" />
        <ellipse cx="340" cy="310" rx="60" ry="8" fill="black" opacity="0.08" />

        {/* 1. NVR NETWORK RECORDER UNIT (Left/Back) */}
        <g transform="translate(40, 120)">
          {/* Metallic Case */}
          <path
            d="M10,130 L10,180 C10,185 15,190 20,190 L260,190 C265,190 270,185 270,180 L270,130 Z"
            fill="url(#metalGradient)"
            stroke={carbonDark}
            strokeWidth="4"
          />
          {/* Top cover glossy white/silver */}
          <path
            d="M5,120 C5,115 15,110 30,110 L250,110 C265,110 275,115 275,120 L270,135 L10,135 Z"
            fill="url(#whiteGloss)"
            stroke={carbonDark}
            strokeWidth="4"
          />

          {/* Front Control Panel (Dark Acrylic) */}
          <rect
            x="20"
            y="145"
            width="230"
            height="32"
            rx="4"
            fill={carbonDark}
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* LED Grid & Controls */}
          <g transform="translate(30, 153)">
            {/* Blue Status LEDs */}
            <circle cx="10" cy="8" r="3.5" fill={glowBlue} className="animate-pulse" />
            <circle cx="22" cy="8" r="3.5" fill="#10B981" />
            <circle cx="34" cy="8" r="3.5" fill="#9CA3AF" />
            
            {/* Dynamic UI segment on NVR */}
            <rect x="55" y="4" width="40" height="8" rx="2" fill="#1E2937" />
            <line x1="58" y1="8" x2="82" y2="8" stroke={glowBlue} strokeWidth="2" />

            {/* Circular Jog Wheel control */}
            <circle cx="200" cy="8" r="8" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" />
            
            {/* HDD Indicator */}
            <circle cx="170" cy="8" r="2.5" fill={glowBlue} className="animate-pulse" />
          </g>

          {/* Venting Grills on sides */}
          <g stroke={carbonDark} strokeWidth="2" opacity="0.5">
            <line x1="15" y1="138" x2="15" y2="142" />
            <line x1="265" y1="138" x2="265" y2="142" />
          </g>
        </g>

        {/* 2. PETITE BULLET CAMERA (Right/Front) */}
        <g transform="translate(240, 140) scale(0.85)">
          {/* Bracket */}
          <path d="M70,150 L10,150 L10,210" stroke={carbonDark} strokeWidth="10" strokeLinecap="round" />
          <circle cx="10" cy="210" r="15" fill={spaceGray} stroke={carbonDark} strokeWidth="3" />

          {/* Main camera body */}
          <rect
            x="40"
            y="100"
            width="120"
            height="70"
            rx="8"
            fill="url(#whiteGloss)"
            stroke={carbonDark}
            strokeWidth="4"
          />
          {/* Bezel Ring */}
          <rect x="145" y="95" width="20" height="80" rx="4" fill={spaceGray} stroke={carbonDark} strokeWidth="4" />
          
          {/* Lens */}
          <path d="M165,100 C165,100 172,110 172,135 C172,160 165,170 165,170 Z" fill={carbonDark} stroke={carbonDark} strokeWidth="3" />
          <circle cx="160" cy="135" r="10" fill="#030712" stroke={accentBlue} strokeWidth="2" />
          
          {/* Glow */}
          <circle cx="150" cy="110" r="3" fill={glowBlue} className="animate-pulse" />
        </g>

        {/* 3. INTERACTIVE DATA LINK CONNECTIVITY ILLUSTRATION */}
        <g opacity="0.6">
          {/* Dynamic glowing PoE connection lines */}
          <path
            d="M170,230 Q270,230 300,250"
            stroke={accentBlue}
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse-subtle"
            strokeLinecap="round"
          />
          {/* Small packet dot moving */}
          <circle cx="230" cy="235" r="4" fill={glowBlue} className="animate-bounce" />
        </g>
      </svg>
    );
  };

  const renderSmartHome = () => {
    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.2" />
        <ellipse cx="200" cy="330" rx="90" ry="10" fill="black" opacity="0.1" />

        {/* Smart Hub Base */}
        <rect x="120" y="240" width="160" height="70" rx="16" fill="url(#whiteGloss)" stroke={carbonDark} strokeWidth="4" />
        <rect x="135" y="255" width="130" height="20" rx="4" fill={carbonDark} />
        
        {/* Blinking status LEDs */}
        <circle cx="150" cy="265" r="3" fill={accentBlue} className="animate-pulse" />
        <circle cx="162" cy="265" r="3" fill="#10B981" />
        <circle cx="174" cy="265" r="3" fill="#9CA3AF" />

        {/* Floating Smart Lock icon */}
        <g transform="translate(150, 90)">
          {/* Padlock bracket */}
          <path d="M25,50 L25,30 C25,15 35,5 50,5 C65,5 75,15 75,30 L75,50" stroke={accentBlue} strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Padlock lock-body */}
          <rect x="10" y="45" width="80" height="70" rx="14" fill="url(#whiteGloss)" stroke={carbonDark} strokeWidth="4" />
          {/* Keyhole */}
          <circle cx="50" cy="75" r="8" fill={carbonDark} />
          <path d="M47,80 L53,80 L55,95 L45,95 Z" fill={carbonDark} />
        </g>
      </svg>
    );
  };

  const renderNas = () => {
    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.2" />
        <ellipse cx="200" cy="330" rx="95" ry="12" fill="black" opacity="0.1" />

        {/* Server Tower */}
        <rect x="130" y="100" width="140" height="210" rx="16" fill="url(#whiteGloss)" stroke={carbonDark} strokeWidth="4" />
        
        {/* Disk Bays */}
        {/* Bay 1 */}
        <rect x="145" y="125" width="110" height="35" rx="6" fill={carbonDark} stroke="#374151" strokeWidth="2" />
        <rect x="155" y="140" width="60" height="6" rx="2" fill="#4B5563" />
        <circle cx="235" cy="142.5" r="3.5" fill="#10B981" className="animate-pulse" />
        
        {/* Bay 2 */}
        <rect x="145" y="175" width="110" height="35" rx="6" fill={carbonDark} stroke="#374151" strokeWidth="2" />
        <rect x="155" y="190" width="60" height="6" rx="2" fill="#4B5563" />
        <circle cx="235" cy="192.5" r="3.5" fill="#10B981" />

        {/* Bay 3 */}
        <rect x="145" y="225" width="110" height="35" rx="6" fill={carbonDark} stroke="#374151" strokeWidth="2" />
        <rect x="155" y="240" width="60" height="6" rx="2" fill="#4B5563" />
        <circle cx="235" cy="242.5" r="3.5" fill={accentBlue} className="animate-pulse" />

        {/* Power Button & Main Indicator */}
        <circle cx="200" cy="285" r="8" fill={carbonDark} stroke={accentBlue} strokeWidth="2" />
        <circle cx="200" cy="285" r="3.5" fill={accentBlue} className="animate-ping" />
        <circle cx="200" cy="285" r="3.5" fill={accentBlue} />
      </svg>
    );
  };

  const renderNetzwerk = () => {
    return (
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="200" cy="200" r="160" fill="url(#bgGlow)" opacity="0.2" />
        <ellipse cx="200" cy="320" rx="100" ry="10" fill="black" opacity="0.1" />

        {/* Mesh Wi-Fi waves background */}
        <circle cx="200" cy="150" r="40" stroke={accentBlue} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
        <circle cx="200" cy="150" r="70" stroke={accentBlue} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.2" />

        {/* Network Switch Unit */}
        <rect x="90" y="170" width="220" height="85" rx="12" fill="url(#whiteGloss)" stroke={carbonDark} strokeWidth="4" />
        
        {/* Dark Interface Strip */}
        <rect x="100" y="185" width="200" height="40" rx="6" fill={carbonDark} />

        {/* Ethernet Ports */}
        <rect x="110" y="195" width="20" height="18" rx="2" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="115" cy="191" r="1.5" fill="#10B981" className="animate-pulse" />
        <circle cx="125" cy="191" r="1.5" fill="#10B981" />

        <rect x="140" y="195" width="20" height="18" rx="2" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="145" cy="191" r="1.5" fill="#10B981" />
        <circle cx="155" cy="191" r="1.5" fill="#9CA3AF" />

        <rect x="170" y="195" width="20" height="18" rx="2" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="175" cy="191" r="1.5" fill="#10B981" className="animate-pulse" />
        <circle cx="185" cy="191" r="1.5" fill="#10B981" />

        <rect x="200" y="195" width="20" height="18" rx="2" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="205" cy="191" r="1.5" fill="#9CA3AF" />
        <circle cx="215" cy="191" r="1.5" fill="#9CA3AF" />

        <rect x="240" y="195" width="18" height="18" rx="2" fill="#1F2937" stroke={accentBlue} strokeWidth="1.5" />
        <circle cx="249" cy="191" r="2" fill={accentBlue} className="animate-pulse" />

        <circle cx="285" cy="205" r="4" fill="#10B981" className="animate-pulse" />
        <line x1="281" y1="213" x2="289" y2="213" stroke="#9CA3AF" strokeWidth="1.5" />
      </svg>
    );
  };

  switch (type) {
    case "bullet":
      return renderBullet(false);
    case "interactive":
      return renderBullet(true);
    case "dome":
      return renderDome();
    case "ptz":
      return renderPtz();
    case "set":
      return renderSet();
    case "smarthome":
      return renderSmartHome();
    case "nas":
      return renderNas();
    case "netzwerk":
      return renderNetzwerk();
    default:
      return renderBullet(false);
  }
}

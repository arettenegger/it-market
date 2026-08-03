import React, { useState } from "react";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark"; // "dark" text for light backgrounds, "light" text for dark backgrounds
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  logoImage?: string;
  showText?: boolean;
}

export default function Logo({
  className = "",
  variant = "dark",
  showSubtitle = true,
  size = "md",
  logoImage,
  showText = true
}: LogoProps) {
  const isLightText = variant === "light";
  // Fällt automatisch auf das SVG-Emblem zurück, falls das hinterlegte Logo-Bild nicht lädt.
  const [imgError, setImgError] = useState(false);

  const sizeHeights = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-12 sm:h-16"
  };

  const textSizes = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl"
  };

  const subtitleSizes = {
    sm: "text-[8px]",
    md: "text-[9px] sm:text-[10px]",
    lg: "text-[10px] sm:text-[11px]"
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {logoImage && !imgError ? (
        <img
          src={logoImage}
          alt="Logo"
          className={`${sizeHeights[size]} w-auto object-contain shrink-0 rounded-lg`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        /* IT-MARKET Red Crescent Emblem */
        <svg
          viewBox="0 0 120 100"
          className={`${sizeHeights[size]} w-auto shrink-0 transition-transform group-hover:scale-105 duration-200`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Red Crescent Arc */}
          <path
            d="M 52 92 C 22 92 2 68 4 44 C 6 20 28 2 68 2 C 34 8 18 26 16 46 C 14 66 28 84 52 92 Z"
            fill="url(#redGradientOuter)"
          />
          {/* Inner Red Crescent Arc */}
          <path
            d="M 44 76 C 24 76 12 58 14 40 C 16 22 32 10 60 10 C 34 16 22 28 20 42 C 18 56 28 70 44 76 Z"
            fill="url(#redGradientInner)"
          />

          <defs>
            <linearGradient id="redGradientOuter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="redGradientInner" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* IT-MARKET Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-extrabold font-display tracking-tight ${textSizes[size]} ${
            isLightText ? "text-white" : "text-slate-950"
          }`}>
            IT-MARKET
          </span>
          {showSubtitle && (
            <span className={`font-bold tracking-wider uppercase ${subtitleSizes[size]} ${
              isLightText ? "text-red-400" : "text-red-700"
            } mt-0.5 font-sans`}>
              Hardware & Netzwerke
            </span>
          )}
        </div>
      )}
    </div>
  );
}

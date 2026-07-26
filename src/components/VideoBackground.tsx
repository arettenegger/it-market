import React from "react";

export function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = cleaned.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return null;
}

interface VideoBackgroundProps {
  src: string;
  className?: string;
  onError?: () => void;
  poster?: string;
}

export function VideoBackground({ src, className = "", onError, poster }: VideoBackgroundProps) {
  const ytId = getYouTubeId(src);

  if (ytId) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&aria-hidden=true&tabindex=-1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1`}
          title="YouTube Hintergrundvideo"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320%] h-[320%] max-w-none pointer-events-none object-cover opacity-90 scale-105 border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      onError={onError}
      className={className}
    />
  );
}

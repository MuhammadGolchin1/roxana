import React from 'react';

export default function HeroVideo() {
  return (
    <div className="hero-video" aria-hidden="true">
      <video
        src={import.meta.env.BASE_URL + "roxana-hero-background.mp4"}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
    </div>
  );
}

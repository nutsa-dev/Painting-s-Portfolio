import React from 'react';

export default function Hero({ isDarkMode }) {
  return (
    <section id="home" className="photorealistic-hero-wall">
      {/* Main Base Visual Photo (Edge-to-Edge Full Bleed) */}
      <img
        src="/images/hero_home.jpg"
        alt="Nutsa Fine Art Canvases & Studio Visual"
        className="hero-base-photo"
      />

      {/* Sunlight & Window Tree Shadow Overlay - Placed ON TOP of photo */}
      <div className="photoreal-tree-shadow-layer" />
    </section>
  );
}

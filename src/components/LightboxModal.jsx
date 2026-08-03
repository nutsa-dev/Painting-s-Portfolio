import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { playCurtainSound } from '../utils/audio';
import SocialShare from './SocialShare';

export default function LightboxModal({ artwork, paintings, onClose, onNavigate, isDarkMode, setIsDarkMode }) {
  // Use a single ref object to track latest props without triggering stale closures or excessive effects
  const latestProps = useRef({ artwork, paintings, onNavigate, onClose });

  // Synchronize refs only when props change
  useEffect(() => {
    latestProps.current = { artwork, paintings, onNavigate, onClose };
  }, [artwork, paintings, onNavigate, onClose]);

  // Global Keyboard event listener for infinite smooth navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { artwork: currentArt, paintings: list, onNavigate: nav, onClose: close } = latestProps.current;

      if (!currentArt || !list || list.length === 0) return;

      const idx = list.findIndex(p => p.id === currentArt.id);

      if (e.key === 'Escape') {
        close?.();
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (idx - 1 + list.length) % list.length;
        nav?.(list[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (idx + 1) % list.length;
        nav?.(list[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!artwork) return null;

  const currentIndex = paintings.findIndex(p => p.id === artwork.id);

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + paintings.length) % paintings.length;
    onNavigate(paintings[prevIndex]);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % paintings.length;
    onNavigate(paintings[nextIndex]);
  };

  const toggleTheme = (e) => {
    e.stopPropagation();
    playCurtainSound();
    if (setIsDarkMode) {
      setIsDarkMode(!isDarkMode);
    }
  };

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      {/* Top Controls Header (Dual-Icon Theme Switcher + Close Button) */}
      <div className="lightbox-top-controls" onClick={(e) => e.stopPropagation()}>
        <button
          className={`dual-theme-switch ${isDarkMode ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          <span className="switch-icon sun-icon">
            <Sun size={16} />
          </span>
          <span className="switch-icon moon-icon">
            <Moon size={16} />
          </span>
          <span className="switch-slider-knob" />
        </button>

        <button className="modal-close-btn" onClick={onClose} aria-label="Close Lightbox">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Arrows */}
      {paintings.length > 1 && (
        <>
          <button className="nav-arrow arrow-prev" onClick={handlePrev} aria-label="Previous Artwork">
            <ChevronLeft size={30} />
          </button>

          <button className="nav-arrow arrow-next" onClick={handleNext} aria-label="Next Artwork">
            <ChevronRight size={30} />
          </button>
        </>
      )}

      {/* Main Lightbox Content: Image exact screen center, Sidebar to the RIGHT with bottom aligned to image bottom */}
      <div className="lightbox-center-stage" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-img-wrapper">
          <img src={artwork.imageUrl} alt={artwork.title} />

          {/* Sidebar positioned to the RIGHT, bottom aligned with image bottom line */}
          <div className="lightbox-sidebar">
            <h3 className="sidebar-title">{artwork.title}</h3>
            
            <div className="sidebar-meta">
              {artwork.medium && (
                <div className="meta-item">
                  <span className="meta-val">{artwork.medium}</span>
                </div>
              )}

              {artwork.size && (
                <div className="meta-item">
                  <span className="meta-val">{artwork.size}</span>
                </div>
              )}
            </div>

            {/* Social Media Share Buttons */}
            <SocialShare artwork={artwork} variant="lightbox" />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { playCurtainSound } from '../utils/audio';

export default function Navbar({ isDarkMode, setIsDarkMode, onOpenAdmin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    // Play Web Audio API curtain closing sound
    playCurtainSound();
    setIsDarkMode(!isDarkMode);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileOpen(false);
    let target = targetId;
    if (window.innerWidth <= 768 && targetId === 'home') {
      target = 'gallery';
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL hash for better native sharing/history support without jumping
      window.history.pushState(null, '', `#${target}`);
    }
  };

  return (
    <nav className="navbar">
      {/* Brand logo/name scrolls to top (Home) */}
      <a href="#home" className="nav-brand" onClick={(e) => handleNavClick(e, 'home')}>
        Nutsa
      </a>



      {/* Modern UI/UX: Redundant 'Home' link removed since brand logo serves as Home */}
      <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
        <li>
          <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')}>Gallery</a>
        </li>
        <li>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About Me</a>
        </li>
        <li>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
        </li>
        <li>
          <a href="#shop" onClick={(e) => handleNavClick(e, 'shop')}>Shop</a>
        </li>
      </ul>

      <div className="nav-controls">
        <div className="nav-actions">
          <button
            className={`dual-theme-switch ${isDarkMode ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            <span className="switch-icon sun-icon">
              <Sun size={18} />
            </span>
            <span className="switch-icon moon-icon">
              <Moon size={18} />
            </span>
            <span className="switch-slider-knob" />
          </button>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import LightboxModal from './components/LightboxModal';
import AboutMe from './components/AboutMe';
import Contact from './components/Contact';
import Shop from './components/Shop';
import AdminModal from './components/AdminModal';
import SocialShare from './components/SocialShare';

import { getPaintings, getCategories, getAboutMe } from './utils/storage';
import './styles/main.scss';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [paintings, setPaintings] = useState(() => getPaintings());
  const [categories, setCategories] = useState(() => getCategories());
  const [aboutData, setAboutData] = useState(() => getAboutMe());
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync data from CMS / LocalStorage when returning from Admin panel
  const loadData = () => {
    setPaintings(getPaintings());
    setCategories(getCategories());
    setAboutData(getAboutMe());
  };

  // Support #admin URL hash trigger for Admin CMS
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', checkHash);
    checkHash();

    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);



  // Update data theme attribute on body/html for smooth CSS transitions
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="portfolio-app">
      {/* Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hero Section */}
      <Hero isDarkMode={isDarkMode} />

      {/* Gallery Section */}
      <Gallery
        paintings={paintings}
        categories={categories}
        onSelectArtwork={(art) => setSelectedArtwork(art)}
      />

      {/* About Me Section */}
      <AboutMe aboutData={aboutData} />

      {/* Contact Section */}
      <Contact />

      {/* Shop Section */}
      <Shop />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-share-wrapper">
          <SocialShare variant="main" />
        </div>
        <p>
          &copy; {new Date().getFullYear()} Nutsa — All Rights Reserved. Fine Art & Portfolio.
        </p>
      </footer>

      {/* Lightbox Modal */}
      <LightboxModal
        artwork={selectedArtwork}
        paintings={paintings}
        onClose={() => setSelectedArtwork(null)}
        onNavigate={(art) => setSelectedArtwork(art)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Admin CMS Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        paintings={paintings}
        categories={categories}
        aboutData={aboutData}
        onRefreshData={loadData}
      />
    </div>
  );
}

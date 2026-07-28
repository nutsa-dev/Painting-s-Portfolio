import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

export default function Gallery({ paintings, categories, onSelectArtwork }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadedImages, setLoadedImages] = useState({});

  const filteredPaintings = useMemo(() => {
    return selectedCategory === 'All'
      ? paintings
      : paintings.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [paintings, selectedCategory]);

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleKeyDown = (e, art) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectArtwork(art);
    }
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="section-header">
        {/* Category Pills */}
        <div className="category-filter">
          <button
            className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Works ({paintings.length})
          </button>

          {categories.map((cat) => {
            const count = paintings.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinterest-style Masonry Gallery Layout */}
      <div className="pinterest-masonry">
        {filteredPaintings.map((art) => {
          const isLoaded = loadedImages[art.id];

          return (
            <div
              key={art.id}
              className="masonry-item"
              onClick={() => onSelectArtwork(art)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, art)}
              aria-label={`View ${art.title}`}
            >
              <div className="card-image">
                {!isLoaded && <SkeletonLoader />}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  loading="lazy"
                  onLoad={() => handleImageLoad(art.id)}
                  className={isLoaded ? 'loaded' : 'loading'}
                />
                <div className="card-overlay">
                  <div className="view-icon">
                    <Eye size={22} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

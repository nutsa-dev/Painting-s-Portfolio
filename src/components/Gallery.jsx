import React, { useState, useMemo } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

const INITIAL_LIMIT = 9;

export default function Gallery({ paintings, categories, onSelectArtwork }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadedImages, setLoadedImages] = useState({});
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);

  const filteredPaintings = useMemo(() => {
    return selectedCategory === 'All'
      ? paintings
      : paintings.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [paintings, selectedCategory]);

  const visiblePaintings = useMemo(() => {
    return filteredPaintings.slice(0, displayLimit);
  }, [filteredPaintings, displayLimit]);

  const isExpanded = displayLimit >= filteredPaintings.length && filteredPaintings.length > INITIAL_LIMIT;

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setDisplayLimit(INITIAL_LIMIT);
  };

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
            onClick={() => handleCategorySelect('All')}
          >
            All Works ({paintings.length})
          </button>

          {categories.map((cat) => {
            const count = paintings.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Art Uncropped Aspect Ratio Gallery Layout */}
      <div className="fine-art-gallery-grid">
        {visiblePaintings.map((art) => {
          const isLoaded = loadedImages[art.id];

          return (
            <div
              key={art.id}
              className="gallery-art-card"
              onClick={() => onSelectArtwork(art)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, art)}
              aria-label={`View ${art.title}`}
            >
              <div className="card-canvas-wrapper">
                {!isLoaded && <SkeletonLoader />}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  loading="lazy"
                  onLoad={() => handleImageLoad(art.id)}
                  className={`painting-canvas-img ${isLoaded ? 'loaded' : 'loading'}`}
                />
                <div className="card-overlay">
                  <div className="view-icon">
                    <Eye size={22} />
                  </div>
                </div>
              </div>

              {/* Artwork Title & Specs Box (Clean Fine-Art Framing) */}
              <div className="art-card-info">
                <h4 className="art-title">{art.title}</h4>
                <div className="art-meta-row">
                  {art.medium && <span className="art-medium">{art.medium}</span>}
                  {art.size && <span className="art-size">{art.size}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Works / Show Featured CTA */}
      {filteredPaintings.length > INITIAL_LIMIT && (
        <div className="view-more-btn-wrapper">
          <button
            className="view-more-btn"
            onClick={() => {
              if (isExpanded) {
                setDisplayLimit(INITIAL_LIMIT);
                document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                setDisplayLimit(filteredPaintings.length);
              }
            }}
          >
            {isExpanded ? (
              <>
                Show Featured Only <ChevronUp size={18} />
              </>
            ) : (
              <>
                View All Works ({filteredPaintings.length - INITIAL_LIMIT} More) <ChevronDown size={18} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

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

  const hasMore = filteredPaintings.length > displayLimit;
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

  const getItemClass = (index) => {
    if (index === 0) return 'editorial-item item-featured';
    if (index === 3 || index === 7) return 'editorial-item item-tall';
    if (index === 5 || index === 10) return 'editorial-item item-wide';
    return 'editorial-item';
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

      {/* Asymmetrical Editorial Gallery Layout */}
      <div className="editorial-asymmetrical-grid">
        {visiblePaintings.map((art, index) => {
          const isLoaded = loadedImages[art.id];
          const itemClassName = getItemClass(index);

          return (
            <div
              key={art.id}
              className={itemClassName}
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
                  <div className="overlay-details">
                    <h4 className="overlay-title">{art.title}</h4>
                    {art.medium && <p className="overlay-meta">{art.medium}</p>}
                  </div>
                  <div className="view-icon">
                    <Eye size={22} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Works / Show Less CTA */}
      {filteredPaintings.length > INITIAL_LIMIT && (
        <div className="view-more-btn-wrapper">
          <button
            className="view-more-btn"
            onClick={() => {
              if (isExpanded) {
                setDisplayLimit(INITIAL_LIMIT);
                // Scroll back up to top of gallery smoothly when collapsing
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

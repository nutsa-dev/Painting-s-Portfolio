import React, { useState } from 'react';
import { Share2, Link, Check, Instagram } from 'lucide-react';

export default function SocialShare({ artwork, variant = 'main', customUrl, customTitle }) {
  const [copied, setCopied] = useState(false);

  // Construct URL & Share Details
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  
  let shareUrl = customUrl || baseUrl;
  let title = customTitle || "Nutsa's Artwork Portfolio — Fine Art & Paintings";
  let imageUrl = '';

  if (artwork) {
    shareUrl = `${baseUrl}#artwork-${artwork.id}`;
    title = `"${artwork.title}" by Nutsa | Fine Art & Painting`;
    imageUrl = typeof window !== 'undefined' ? new URL(artwork.imageUrl, window.location.href).href : artwork.imageUrl;
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(imageUrl);

  // Share platform links
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: `https://www.instagram.com/nutsakurdadze/`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  };

  const handleShareClick = (e, platform, url) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check for native mobile share API if platform is 'native'
    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: title,
        url: shareUrl,
      }).catch(() => {});
      return;
    }

    // Open share / profile window
    const width = 600;
    const height = 650;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(
      url,
      `share_${platform}`,
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className={`social-share-container variant-${variant}`}>
      <span className="share-label">
        <Share2 size={15} /> Share {artwork ? 'Artwork' : 'Portfolio'}
      </span>

      <div className="share-buttons-group">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          onClick={(e) => handleShareClick(e, 'facebook', shareLinks.facebook)}
          className="share-btn share-facebook"
          title="Share on Facebook"
          aria-label="Share on Facebook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        {/* Instagram */}
        <a
          href={shareLinks.instagram}
          onClick={(e) => handleShareClick(e, 'instagram', shareLinks.instagram)}
          className="share-btn share-instagram"
          title="Follow / View on Instagram"
          aria-label="Instagram Profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram size={16} />
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          onClick={(e) => handleShareClick(e, 'linkedin', shareLinks.linkedin)}
          className="share-btn share-linkedin"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        {/* Pinterest */}
        <a
          href={shareLinks.pinterest}
          onClick={(e) => handleShareClick(e, 'pinterest', shareLinks.pinterest)}
          className="share-btn share-pinterest"
          title="Pin on Pinterest"
          aria-label="Pin on Pinterest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.02 0 1.513.769 1.513 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/>
          </svg>
        </a>

        {/* Copy Direct Link */}
        <button
          onClick={handleCopyLink}
          className={`share-btn share-copy ${copied ? 'copied' : ''}`}
          title={copied ? 'Copied!' : 'Copy Link'}
          aria-label="Copy Link"
        >
          {copied ? <Check size={16} className="check-icon" /> : <Link size={16} />}
          {copied && <span className="copy-tooltip">Copied!</span>}
        </button>
      </div>
    </div>
  );
}

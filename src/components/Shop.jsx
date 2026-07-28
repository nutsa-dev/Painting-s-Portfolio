import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Shop() {
  return (
    <section id="shop" className="shop-section">
      <span className="shop-badge">
        <ShoppingBag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Art Shop
      </span>
      <p className="shop-desc">
        Coming soon.
      </p>
    </section>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onAddToCart, className }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const priceTag = product.price < 30
    ? { label: 'Budget', className: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30' }
    : product.price < 120
      ? { label: 'Signature', className: 'bg-amber-400/20 text-amber-100 border-amber-300/30' }
      : { label: 'Collector', className: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/30' };

  const stockCount = product.stockQuantity ?? 0;
  const stockTag = product.stockQuantity == null
    ? { label: 'Stock N/A', className: 'bg-white/10 text-slate-200 border-white/20' }
    : stockCount <= 5
      ? { label: 'Low Stock', className: 'bg-orange-400/20 text-orange-100 border-orange-300/30' }
      : { label: 'In Stock', className: 'bg-sky-400/20 text-sky-100 border-sky-300/30' };

  const imageHeightClass = 'h-64';

  return (
    <div
      className={`group rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/0 backdrop-blur-md transition-all duration-300 flex flex-col w-full h-full shadow-[0_12px_40px_rgba(8,47,73,0.25)] hover:shadow-[0_24px_80px_rgba(34,211,238,0.25)] ${className ?? ''}`}
    >
      <div className="relative">
        <Link to={`/product/${product.id}`} className={`relative block overflow-hidden ${imageHeightClass}`} data-cursor="media">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className={`absolute inset-0 skeleton ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Link>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border ${priceTag.className}`}>
            {priceTag.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border ${stockTag.className}`}>
            {stockTag.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest bg-white/20 text-white shadow-sm hover:bg-white/30"
          aria-expanded={expanded}
        >
          {expanded ? 'Close' : 'Details'}
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow text-slate-100">
        <div className="mb-2 flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`} className="hover:text-cyan-200 transition-colors">
            <h3 className="text-lg font-semibold font-sans text-slate-100 leading-tight line-clamp-2">{product.name}</h3>
          </Link>
          <span className="text-2xl font-mono font-bold text-cyan-200 drop-shadow-sm">${product.price.toFixed(2)}</span>
        </div>

        <p className="text-sm text-slate-300 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div
          className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="pt-3 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
              <span>Availability</span>
              <span>{product.stockQuantity == null ? 'Unknown' : `${stockCount} left`}</span>
            </div>
            <p className="leading-relaxed">Tap into the story behind this piece. Clean lines, quiet confidence, and crafted for daily rituals.</p>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${product.name}?`)) {
                    onDelete(product.id);
                  }
                }}
                className="w-full py-2 border border-red-300/40 text-red-200 font-bold rounded-xl hover:bg-red-500/20 transition-colors"
              >
                Delete product
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-6 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => onAddToCart && onAddToCart(product.id)}
            className="flex-1 py-2.5 bg-cyan-300 hover:bg-cyan-200 text-slate-900 text-sm font-bold rounded-xl transition-all transform active:scale-95"
          >
            Add to cart
          </button>
          <Link
            to={`/product/${product.id}`}
            className="flex-1 py-2.5 border border-white/30 text-white text-sm font-bold rounded-xl hover:border-cyan-200 hover:text-cyan-100 transition-all text-center"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

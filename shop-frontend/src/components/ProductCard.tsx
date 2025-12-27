import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
  onAddToCart?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onAddToCart }) => {
  const [expanded, setExpanded] = useState(false);

  const priceTag = product.price < 30
    ? { label: 'Budget', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : product.price < 120
      ? { label: 'Signature', className: 'bg-amber-50 text-amber-700 border-amber-200' }
      : { label: 'Collector', className: 'bg-rose-50 text-rose-700 border-rose-200' };

  const stockCount = product.stockQuantity ?? 0;
  const stockTag = product.stockQuantity == null
    ? { label: 'Stock N/A', className: 'bg-gray-100 text-gray-500 border-gray-200' }
    : stockCount <= 5
      ? { label: 'Low Stock', className: 'bg-orange-50 text-orange-700 border-orange-200' }
      : { label: 'In Stock', className: 'bg-sky-50 text-sky-700 border-sky-200' };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col w-full max-w-[320px]">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="relative block h-52 overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest bg-white/90 text-gray-700 shadow-sm hover:bg-white"
          aria-expanded={expanded}
        >
          {expanded ? 'Close' : 'Details'}
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`} className="hover:text-primary-600 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
          </Link>
          <span className="text-2xl font-meatball text-red-500 drop-shadow-sm">${product.price.toFixed(2)}</span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div
          className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="pt-3 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">
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
                className="w-full py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
              >
                Delete product
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onAddToCart && onAddToCart(product.id)}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all transform active:scale-95"
          >
            Add to cart
          </button>
          <Link
            to={`/product/${product.id}`}
            className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-primary-200 hover:text-primary-700 transition-all text-center"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

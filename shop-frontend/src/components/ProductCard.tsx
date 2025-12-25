import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
  onAddToCart?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col w-72">
      <Link to={`/product/${product.id}`} className="relative block h-48 overflow-hidden">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 flex justify-between items-start">
          <Link to={`/product/${product.id}`} className="hover:text-primary-600 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-black text-red-600">¥{product.price.toFixed(2)}</span>
          {product.stockQuantity && (
            <span className="text-xs font-medium text-gray-400">库存: {product.stockQuantity}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart && onAddToCart(product.id)}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-all transform active:scale-95"
          >
            加入购物车
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`确定要删除「${product.name}」吗？`)) {
                  onDelete(product.id);
                }
              }}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              title="删除商品"
            >
              <span className="text-lg">🗑️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
